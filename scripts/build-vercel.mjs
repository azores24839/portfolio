import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { publicAssetUrl, root } from "./media-files.mjs";

const baseUrl = (process.env.R2_PUBLIC_URL || "").trim();
if (baseUrl && !/^https:\/\//.test(baseUrl)) {
  console.error("构建失败：R2_PUBLIC_URL 如有设置，必须以 https:// 开头。");
  process.exit(1);
}
const useR2 = Boolean(baseUrl);

const dist = path.join(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const extensions = "(?:gif|jpe?g|mp4|pdf|png|svg|webm|woff2?)";
const isExternal = value => /^(?:[a-z]+:|#|\/\/)/i.test(value);
const rewrite = value => !useR2 || isExternal(value) ? value : publicAssetUrl(baseUrl, value);

let html = await readFile(path.join(root, "index.html"), "utf8");
html = html.replace(new RegExp(`(src|href)=(['\"])([^'\"]+\\.${extensions})\\2`, "gi"), (_, attribute, quote, value) => {
  return `${attribute}=${quote}${rewrite(value)}${quote}`;
});

let css = await readFile(path.join(root, "styles.css"), "utf8");
css = css.replace(new RegExp(`url\\((['\"]?)([^)'\"]+\\.${extensions})\\1\\)`, "gi"), (_, quote, value) => {
  return `url(${quote}${rewrite(value)}${quote})`;
});

let data = await readFile(path.join(root, "portfolio-data.js"), "utf8");
data = data.replace(/("src":\s*")([^"]+)(")/g, (_, before, value, after) => `${before}${rewrite(value)}${after}`);

await Promise.all([
  writeFile(path.join(dist, "index.html"), html),
  writeFile(path.join(dist, "styles.css"), css),
  writeFile(path.join(dist, "portfolio-data.js"), data),
  cp(path.join(root, "app.js"), path.join(dist, "app.js"))
]);

if (!useR2) {
  await cp(path.join(root, "content"), path.join(dist, "content"), { recursive: true });
  const publicExtensions = new Set([".gif", ".jpeg", ".jpg", ".mp4", ".pdf", ".png", ".svg", ".webm", ".webp"]);
  const rootEntries = await readdir(root, { withFileTypes: true });
  await Promise.all(rootEntries
    .filter(entry => entry.isFile() && publicExtensions.has(path.extname(entry.name).toLowerCase()))
    .map(entry => cp(path.join(root, entry.name), path.join(dist, entry.name))));
}

console.log(`Vercel 构建完成：${path.relative(root, dist)}（媒体模式：${useR2 ? baseUrl.replace(/\/$/, "") : "仓库本地文件"}）`);
