# Finder Portfolio Content System

## Goal

Turn the Finder project area into a maintainable portfolio browser. Four folders open a scrollable right-hand detail panel. Portfolio copy is maintained in one Markdown file per project, while numbered media files are discovered automatically by a generation command.

## Folder categories

Replace the current five project folders with four folders. Preserve the indicated existing folder artwork and color:

| Order | Folder label | Internal key | Existing visual |
| --- | --- | --- | --- |
| 1 | 游戏视觉与内容设计 | `game` | blue `work` folder |
| 2 | AI作品 | `ai` | yellow `ai` folder |
| 3 | 视频与动态内容 | `video` | red `lens` folder |
| 4 | 产品设计 | `product` | purple `merch` folder |

Remove the green `community` folder. The former “从草图到商品” label and project are removed; only its purple folder visual is reused for “产品设计”.

## Content architecture

Each project has an independent directory:

```text
content/projects/
├── game/
│   ├── 01-netease-after-tomorrow/
│   │   ├── project.md
│   │   └── media/
│   │       ├── 01-cover.jpg
│   │       └── 02-demo.mp4
│   ├── 02-flash-party/
│   ├── 03-endorgene/
│   └── 04-cat-vs-slime/
├── ai/
├── video/
└── product/
```

Directory and media names use lowercase ASCII words separated by hyphens. Two-digit prefixes control display order and are not displayed in the interface.

Each `project.md` contains simple front matter for stable metadata followed by ordinary Markdown for the project description and optional showcase list. A reusable blank project template and a Chinese maintenance guide are included.

## Initial content mapping

The supplied portfolio copy is normalized without removing substantive information:

- `game`: 网易互动娱乐《明日之后》, 心动互动娱乐《Flash Party》, Endorgene, Cat VS Slime.
- `video`: 网易互动娱乐即梦 AI 视频实验, LINK-RPG 项目宣传 / 演示视频, 视频规范, 《直到风吹醒我》.
- `product`: 长信宫灯 IP 多感官文创产品设计, Star-ter, AFTERGLOW, 森灵.
- `ai`: TinyBu, Sci-Viz Case Hub, 云聊 Yunlico Interview, LINK-RPG.

Where the source copy omits a field such as role or showcase items, that field is omitted from the rendered page rather than filled with invented content.

## Generation workflow

`npm run build:portfolio` runs a local Node script that:

1. Scans the four category directories and their project directories.
2. Parses and validates every `project.md`.
3. Discovers and numerically sorts media from each project's `media/` directory.
4. Accepts `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.mp4`, and `.webm` files.
5. Reports the exact project and file when required metadata is missing, a name is invalid, or a media extension is unsupported.
6. Writes a generated JavaScript data file consumed by the static portfolio page.

The generated file is not manually edited. Editing Markdown or media requires rerunning the generation command.

## Detail-panel interaction

- Clicking a folder opens a fixed-width detail panel on the right while the folder area remains on the left.
- The detail panel has its own vertical scrollbar and does not scroll the entire Finder window.
- Switching folders resets the detail panel scroll position to the top.
- All projects in the selected category appear in one continuous detail page with subtle separators.
- The close button remains available while scrolling.
- Empty or invalid categories fail safely without breaking Finder navigation.

## Project presentation order

Each project renders in this order:

1. Project title.
2. Project type, role, labels/tools, and keywords when provided.
3. Project description.
4. “可展示内容” list when provided.
5. Project images and videos.

Text always appears above media.

## Media behavior

- Images and videos use the full available content width.
- Height remains automatic so the original aspect ratio is preserved; media is not cropped.
- Media is displayed in numeric filename order.
- When a project has no media, an abstract mockup matching the existing detail-scene style is shown below the text. Its color is derived from the category folder color and its center label is the project title.
- Adding valid media and rebuilding automatically removes the placeholder.
- A broken or unsupported media file is reported as an error rather than treated as missing media.

Videos loop with sound when visible inside the detail panel and pause when scrolled outside the visible area. Playback is controlled with an `IntersectionObserver` whose root is the detail panel. If browser autoplay policy blocks sound, the video shows a centered “点击播放并开启声音” fallback. After user activation, visibility-based play and pause behavior resumes.

## Responsive behavior

Desktop retains the two-column folder/detail layout. On narrow screens, the open detail view occupies the available Finder viewport while preserving its own scrolling, readable content width, natural media ratios, visible close control, and touch-safe playback fallback.

## Verification

- Run the content generator successfully against all initial projects.
- Check that all four folder labels, colors, icons, and mappings are correct and the green folder is absent.
- Open, switch, scroll, and close every category.
- Confirm project ordering and text-before-media ordering.
- Confirm image and video aspect ratios at desktop and mobile widths.
- Confirm missing-media placeholders use the correct category color and project name.
- Confirm videos loop while visible, pause when outside the detail viewport, and expose the playback fallback when autoplay is blocked.
- Confirm malformed Markdown and unsupported media produce actionable generation errors.
- Confirm existing Finder navigation and non-project views remain functional.
