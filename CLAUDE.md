# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

轻证照 — 在线制作标准证件照的纯前端工具。支持 1寸/2寸/小二寸三种国标规格，红白蓝三色背景替换。所有处理在浏览器本地完成（Canvas），图片不上传服务器。

## 常用命令

```bash
npm run dev       # 启动开发服务器（--host 0.0.0.0）
npm run build     # tsc -b && vite build
npm run preview   # 预览生产构建（--host 0.0.0.0）
```

没有配置测试框架和 linter。

## 技术栈

React 19 + TypeScript + Vite，动画使用 framer-motion，图标使用 lucide-react，文件拖拽上传使用 react-dropzone。

## 架构

单页应用，4 步流程（welcome → upload → processing → result），状态机由 `App.tsx` 中的 `step` 变量驱动。

- **`src/photoSpecs.ts`** — 证件照规格定义。三种尺寸（1寸 295×413、2寸 413×579、小二寸 390×567 px），包含 label/title/description/pixelSize/fileSlug。通过 `PhotoSpecId` 类型和 `getPhotoSpec()` 查询。
- **`src/photoMock.ts`** — 前端 mock 的照片处理逻辑。Canvas 2D 实现：加载图片 → 填充背景色 → 按规格缩放居中绘制人像 → 圆角裁剪 → 输出 PNG dataURL。无真实 AI 参与。
- **`src/App.tsx`** — 全部 UI 逻辑。包括文件上传校验（类型+大小 10MB 限制）、规格/背景色选择、处理状态展示、结果对比与下载。子组件 `Screen`/`StepHeader`/`PhotoCompare` 为文件内小组件。
- **`src/styles.css`** — 全部样式，采用「印刷店/编辑」设计语言（暖纸色背景、纸张纹理 SVG、红色强调色）。CSS 变量集中管理色彩和阴影。
- **`src/main.tsx`** — ReactDOM 入口。

## 设计约束

- 所有处理必须在浏览器本地完成（隐私优先），不调用外部 AI API
- 证件照规格以「寸」为单位（1寸/2寸/小二寸），不强调像素尺寸
- 界面语言为中文
- 无路由 — 所有导航通过 `step` 状态切换
