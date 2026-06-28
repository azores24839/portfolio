import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const mediaExtensions = new Set([
  ".gif", ".jpeg", ".jpg", ".mp4", ".pdf", ".png", ".svg", ".webm", ".woff", ".woff2"
]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile() && mediaExtensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return files;
}

export async function listMediaFiles() {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || ["dist", "docs", "node_modules", "scripts"].includes(entry.name)) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory() && ["content", "CJK TC"].includes(entry.name)) files.push(...await walk(fullPath));
    else if (entry.isFile() && mediaExtensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return Promise.all(files.sort().map(async filePath => ({
    filePath,
    key: path.relative(root, filePath).split(path.sep).join("/"),
    size: (await stat(filePath)).size
  })));
}

export function publicAssetUrl(baseUrl, key) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl.replace(/\/$/, "")}/${encodedKey}`;
}
