import { createHash } from "node:crypto";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { listMediaFiles } from "./media-files.mjs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
const missing = required.filter(name => !process.env[name]);
if (missing.length) {
  console.error(`上传停止：缺少 ${missing.join(", ")}。请复制 .env.example 为 .env.local，并填写 Cloudflare R2 信息。`);
  process.exit(1);
}

const bucket = process.env.R2_BUCKET;
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

const contentTypes = {
  ".gif": "image/gif", ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".mp4": "video/mp4",
  ".pdf": "application/pdf", ".png": "image/png", ".svg": "image/svg+xml", ".webm": "video/webm",
  ".woff": "font/woff", ".woff2": "font/woff2"
};

function extension(key) {
  return key.slice(key.lastIndexOf(".")).toLowerCase();
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(filePath).on("error", reject).on("data", chunk => hash.update(chunk)).on("end", () => resolve(hash.digest("hex")));
  });
}

async function remoteMatches(file, digest) {
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: file.key }));
    return head.ContentLength === file.size && head.Metadata?.sha256 === digest;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound") return false;
    throw error;
  }
}

async function uploadFile(file, index, total) {
  const digest = await sha256(file.filePath);
  if (await remoteMatches(file, digest)) {
    console.log(`[${index + 1}/${total}] 跳过未变更：${file.key}`);
    return "skipped";
  }
  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: file.key,
      Body: createReadStream(file.filePath),
      ContentType: contentTypes[extension(file.key)] || "application/octet-stream",
      CacheControl: "public, max-age=3600",
      Metadata: { sha256: digest }
    },
    queueSize: 3,
    partSize: 10 * 1024 * 1024
  });
  await upload.done();
  console.log(`[${index + 1}/${total}] 已上传：${file.key}`);
  return "uploaded";
}

const files = await listMediaFiles();
console.log(`准备同步 ${files.length} 个媒体文件到 R2 Bucket“${bucket}”…`);
let uploaded = 0;
let skipped = 0;
for (let index = 0; index < files.length; index += 1) {
  const result = await uploadFile(files[index], index, files.length);
  if (result === "uploaded") uploaded += 1;
  else skipped += 1;
}
console.log(`R2 同步完成：上传 ${uploaded} 个，跳过 ${skipped} 个。`);
