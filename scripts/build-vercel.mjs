import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { publicAssetUrl, root } from "./media-files.mjs";

const baseUrl = (process.env.R2_PUBLIC_URL || "").trim();
if (!baseUrl || !/^https:\/\//.test(baseUrl)) {
  console.error("构建失败：请设置以 https:// 开头的 R2_PUBLIC_URL。参考 .env.example。\n例如：R2_PUBLIC_URL=https://pub-xxxx.r2.dev npm run build");
  process.exit(1);
}

const dist = path.join(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const extensions = "(?:gif|jpe?g|mp4|pdf|png|svg|webm|woff2?)";
const isExternal = value => /^(?:[a-z]+:|#|\/\/)/i.test(value);
const rewrite = value => isExternal(value) ? value : publicAssetUrl(baseUrl, value);

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

console.log(`Vercel 构建完成：${path.relative(root, dist)}（媒体地址：${baseUrl.replace(/\/$/, "")}）`);
