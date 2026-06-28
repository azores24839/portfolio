import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content", "projects");
const campusPhotosRoot = path.join(root, "content", "campus", "photos");
const outputPath = path.join(root, "portfolio-data.js");
const checkOnly = process.argv.includes("--check");
const categories = ["game", "ai", "video", "product"];
const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".pdf"]);
const campusPhotoExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const projectNamePattern = /^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function markdownToHtml(source) {
  const lines = source.trim().split(/\r?\n/);
  const output = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    output.push(`<ul>${list.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    const item = line.match(/^[-*]\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(4, heading[1].length + 1);
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
    } else if (item) {
      flushParagraph();
      list.push(item[1]);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return output.join("\n");
}

function parseProject(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filePath}: 缺少正确的 Markdown 头部（---）`);
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(":");
    if (separator < 1) throw new Error(`${filePath}: 无法识别头部字段“${line}”`);
    metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  for (const field of ["title", "category"]) {
    if (!metadata[field]) throw new Error(`${filePath}: 缺少必填字段 ${field}`);
  }
  if (!match[2].trim()) throw new Error(`${filePath}: 项目正文不能为空`);
  return { metadata, bodyHtml: markdownToHtml(match[2]) };
}

async function validateMedia(filePath, extension) {
  const info = await stat(filePath);
  if (!info.size) throw new Error(`${filePath}: 媒体文件为空`);
  const bytes = await readFile(filePath);
  const ascii = bytes.subarray(0, 16).toString("ascii");
  const valid = {
    ".jpg": bytes[0] === 0xff && bytes[1] === 0xd8,
    ".jpeg": bytes[0] === 0xff && bytes[1] === 0xd8,
    ".png": bytes.subarray(1, 4).toString("ascii") === "PNG",
    ".gif": ascii.startsWith("GIF8"),
    ".webp": ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP",
    ".mp4": ascii.slice(4, 8) === "ftyp",
    ".webm": bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3,
    ".pdf": ascii.startsWith("%PDF-")
  }[extension];
  if (!valid) throw new Error(`${filePath}: 文件内容不像有效的 ${extension} 媒体`);
}

async function readProject(category, directoryName) {
  if (!projectNamePattern.test(directoryName)) {
    throw new Error(`${category}/${directoryName}: 项目目录应使用“01-lowercase-name”格式`);
  }
  const directory = path.join(contentRoot, category, directoryName);
  const markdownPath = path.join(directory, "project.md");
  const parsed = parseProject(await readFile(markdownPath, "utf8"), path.relative(root, markdownPath));

  const mediaDirectory = path.join(directory, "media");
  const entries = await readdir(mediaDirectory, { withFileTypes: true });
  const media = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))) {
    if (entry.name.startsWith(".")) continue;
    if (!entry.isFile()) throw new Error(`${path.relative(root, path.join(mediaDirectory, entry.name))}: media 内只允许放文件`);
    const extension = path.extname(entry.name).toLowerCase();
    if (!mediaExtensions.has(extension)) {
      throw new Error(`${path.relative(root, path.join(mediaDirectory, entry.name))}: 不支持 ${extension || "无扩展名"} 媒体类型`);
    }
    await validateMedia(path.join(mediaDirectory, entry.name), extension);
    media.push({
      type: extension === ".pdf" ? "pdf" : [".mp4", ".webm"].includes(extension) ? "video" : "image",
      src: path.relative(root, path.join(mediaDirectory, entry.name)).split(path.sep).join("/"),
      alt: parsed.metadata.title,
      name: entry.name
    });
  }

  return {
    id: directoryName.replace(/^\d{2}-/, ""),
    title: parsed.metadata.title,
    category: parsed.metadata.category,
    type: parsed.metadata.type || "",
    role: parsed.metadata.role || "",
    labels: parsed.metadata.labels || "",
    tools: parsed.metadata.tools || "",
    keywords: parsed.metadata.keywords || "",
    bodyHtml: parsed.bodyHtml,
    media
  };
}

async function build() {
  const data = {};
  for (const category of categories) {
    const categoryDirectory = path.join(contentRoot, category);
    const entries = await readdir(categoryDirectory, { withFileTypes: true });
    data[category] = [];
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))) {
      if (entry.name.startsWith(".")) continue;
      if (!entry.isDirectory()) throw new Error(`${category}/${entry.name}: 分类目录内只能放项目文件夹`);
      data[category].push(await readProject(category, entry.name));
    }
  }
  const campusEntries = await readdir(campusPhotosRoot, { withFileTypes: true });
  const campusImages = [];
  for (const entry of campusEntries.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))) {
    if (entry.name.startsWith(".")) continue;
    const filePath = path.join(campusPhotosRoot, entry.name);
    if (!entry.isFile()) throw new Error(`${path.relative(root, filePath)}: 校园照片目录内只允许放图片文件`);
    const extension = path.extname(entry.name).toLowerCase();
    if (!campusPhotoExtensions.has(extension)) {
      throw new Error(`${path.relative(root, filePath)}: 校园照片不支持 ${extension || "无扩展名"} 格式`);
    }
    await validateMedia(filePath, extension);
    campusImages.push({
      src: path.relative(root, filePath).split(path.sep).join("/"),
      name: entry.name
    });
  }
  const output = `/* 此文件由 npm run build:portfolio 自动生成，请勿手动修改。 */\nwindow.PORTFOLIO_DATA = ${JSON.stringify(data, null, 2)};\nwindow.CAMPUS_IMAGES = ${JSON.stringify(campusImages, null, 2)};\n`;
  if (!checkOnly) await writeFile(outputPath, output, "utf8");
  console.log(`${checkOnly ? "检查完成" : "生成完成"}：${Object.values(data).flat().length} 个项目，${campusImages.length} 张校园照片`);
}

build().catch(error => {
  console.error(`作品集生成失败：${error.message}`);
  process.exitCode = 1;
});
