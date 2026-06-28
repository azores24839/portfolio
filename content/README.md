# 作品集内容维护说明

你不需要修改 `app.js` 或 `portfolio-data.js`。以后添加项目时，只操作 `content/projects`。

## 添加新项目

1. 复制 `content/project-template` 文件夹。
2. 把它放进对应分类：`game`、`ai`、`video` 或 `product`。
3. 文件夹改成 `01-project-name` 格式。开头数字决定显示顺序；英文名称使用小写和连字符。
4. 修改里面的 `project.md`。
5. 把照片或视频放进项目的 `media` 文件夹。
6. 在项目根目录运行：

```bash
npm run build:portfolio
```

看到“生成完成”后刷新网页。

## 媒体命名

媒体名称必须使用两位数字开头，例如：

```text
01-cover.jpg
02-ui-flow.png
03-demo-video.mp4
```

数字决定展示顺序。支持 JPG、JPEG、PNG、WebP、GIF、MP4 和 WebM。不要使用中文、空格或括号。

图片和视频会自动使用详情栏的完整宽度，高度保持原比例。项目没有媒体时，网页会自动显示项目名 Mockup。

## 四个分类

- `game`：游戏视觉与内容设计
- `ai`：AI作品
- `video`：视频与动态内容
- `product`：产品设计

## 常见问题

- 网页文字没有变化：重新运行 `npm run build:portfolio`。
- 生成失败：终端会指出具体项目和文件，按提示修改名称或内容。
- 想调整项目顺序：修改项目文件夹开头的两位数字。
- 想调整媒体顺序：修改媒体文件开头的两位数字。
