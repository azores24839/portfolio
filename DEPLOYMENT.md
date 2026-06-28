# 新手部署教程：Vercel + Cloudflare R2

网站代码放在 Vercel，图片、影片、PDF 与字体放在 Cloudflare R2。请不要把 Access Key 或 Secret Access Key 发到聊天、GitHub 或截图中。

## 第一部分：开通 Cloudflare R2（需要你操作）

1. 打开 [Cloudflare 控制台](https://dash.cloudflare.com/) 并注册或登录。
2. 左侧选择 **Storage & databases → R2 Object Storage**。
3. 按提示开通 R2。Cloudflare 可能要求付款方式，但当前项目约 1.5GB，低于每月 10GB 的免费储存额度。
4. 点击 **Create bucket**：
   - Bucket name：`sihua-portfolio-media`
   - Location：Automatic
   - Storage class：Standard
5. 创建后打开 Bucket，进入 **Settings**。
6. 找到 **Public Development URL**，点击 **Enable**，输入 `allow` 确认。
7. 复制形如 `https://pub-xxxxxxxx.r2.dev` 的 Public Bucket URL。

`r2.dev` 适合先完成上线测试，但官方将它定义为受限速的开发地址。以后如果拥有自己的域名，再把 `media.你的域名` 绑定为 R2 Custom Domain；代码无需重写，只需更换 `R2_PUBLIC_URL`。

## 第二部分：设置字体与媒体跨域访问（需要你操作）

1. 仍在 Bucket 的 **Settings** 页面找到 **CORS Policy**。
2. 点击添加或编辑 CORS。
3. 将项目根目录 [r2-cors.json](./r2-cors.json) 中的内容完整粘贴并保存。

这个策略只允许浏览器读取公开媒体，不允许匿名上传、修改或删除。

## 第三部分：创建只操作这个 Bucket 的上传密钥（需要你操作）

1. 回到 R2 Overview。
2. 在 **Account Details → API Tokens** 旁点击 **Manage**。
3. 点击 **Create Account API token**（也可以选择 User token）。
4. Permission 选择 **Object Read & Write**。
5. Bucket 范围选择 **Apply to specific buckets only**，只选择 `sihua-portfolio-media`。
6. 创建后立即复制：
   - Access Key ID
   - Secret Access Key
   - Account ID（也可从 R2 Overview 找到）

Secret Access Key 只显示一次，丢失后需要删除 Token 并重新创建。

## 第四部分：在本机填写配置（需要你操作）

打开项目根目录的 `.env.local`，填写五行：

```text
R2_ACCOUNT_ID=你的Account ID
R2_ACCESS_KEY_ID=你的Access Key ID
R2_SECRET_ACCESS_KEY=你的Secret Access Key
R2_BUCKET=sihua-portfolio-media
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

不要加中文引号。`.env.local` 已被 Git 忽略，不会上传到 GitHub。

## 第五部分：同步媒体（Codex 可以替你执行）

配置填好后运行：

```bash
npm run upload:r2
```

第一次需要上传约 1.5GB，时间取决于网络。脚本会显示每个文件的进度；以后再次运行时，未变化的文件会自动跳过。脚本不会删除本地文件，也不会删除 R2 中已有文件。

然后生成 Vercel 版本：

```bash
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev npm run build
```

输出在 `dist/`，当前测试大小约 188KB。

## 第六部分：上传 GitHub（Codex 可以准备本地部分）

1. 注册或登录 [GitHub](https://github.com/)。
2. 创建一个空仓库，例如 `sihua-portfolio`。
3. 不要在 GitHub 页面勾选创建 README、`.gitignore` 或 License。
4. Codex 可以初始化本地 Git、提交代码并连接仓库；GitHub 登录授权需要你完成。

大型媒体和 `.env.local` 已由 `.gitignore` 排除，不会进入 GitHub。

## 第七部分：导入 Vercel（需要你操作）

1. 打开 [Vercel](https://vercel.com/) 并用 GitHub 登录。
2. 点击 **Add New → Project**。
3. 在仓库列表中选择 `sihua-portfolio`，点击 **Import**。
4. Framework Preset 选择 **Other**。
5. Build Command 和 Output Directory 会从 `vercel.json` 自动读取：
   - Build Command：`npm run build`
   - Output Directory：`dist`
6. 展开 **Environment Variables**，添加：
   - Name：`R2_PUBLIC_URL`
   - Value：你的 `https://pub-xxxxxxxx.r2.dev`
7. 点击 **Deploy**。

Vercel 不需要 R2 Access Key 或 Secret Key；只填写公开的 `R2_PUBLIC_URL`。

## 第八部分：以后更新作品

1. 按原有目录规则添加或更换本地媒体。
2. 修改对应的 `project.md`。
3. 运行：

```bash
npm run build:portfolio
npm run upload:r2
```

4. 提交并推送代码。Vercel 会自动重新部署。

## 常见问题

- 图片或影片 404：确认 R2 Public Development URL 已启用，并检查 `R2_PUBLIC_URL` 是否完整。
- 字体没有生效：检查 Bucket 的 CORS Policy 是否已保存。
- Vercel 构建提示缺少 `R2_PUBLIC_URL`：在 Vercel Project Settings → Environment Variables 添加它，然后 Redeploy。
- 上传提示 `AccessDenied`：Token 必须有目标 Bucket 的 Object Read & Write 权限。
- 更换域名：把 Cloudflare R2 Custom Domain 和 Vercel 中的 `R2_PUBLIC_URL` 一起更新，再重新部署。
