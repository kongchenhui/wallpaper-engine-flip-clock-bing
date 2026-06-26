# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是 **Wallpaper Engine** 的一个网页壁纸项目，功能为"必应每日壁纸 + 翻页时钟"。发布在 Steam Workshop（ID: 3479714541）。

## 常用命令

```bash
# 开发模式（启动 Vite 开发服务器，端口 3000，自动打开浏览器）
pnpm dev

# 构建生产版本（先 vue-tsc 类型检查，再 vite build）
pnpm build

# 应用 patch-package 补丁
pnpm patch
```

**注意**：本项目没有测试框架和 lint 配置。

## 技术栈

- **Vue 3** (Composition API + `<script setup>`)
- **TypeScript** (ES2020 target, strict mode, `noUnusedLocals`/`noUnusedParameters` 开启)
- **Vite** 打包（base: `"./"`，构建输出到 `dist/`，禁用 sourcemap）
- **Less** CSS 预处理器（scoped 样式）
- **flipclock** 库（v0.10.8，有 patch 补丁修复兼容性问题）
- **pnpm** 包管理器

## 架构概览

项目采用 Vue 3 组件化架构，代码组织遵循关注点分离原则：

```
src/
├── main.ts                          # 入口：创建 Vue 应用，挂载 #app
├── App.vue                          # 根组件：组合 composable 和子组件，无业务逻辑
├── api/index.ts                     # 必应每日壁纸 API 封装
├── utils/request.ts                 # fetch 封装 + AsyncFuncRetry 重试工具
├── hooks/                           # Vue 3 Composables（所有业务逻辑在此）
│   ├── useWallpaperEngine.ts        # Wallpaper Engine 属性监听 → 响应式状态
│   ├── useWallpaper.ts              # 壁纸获取/切换/定时刷新核心逻辑
│   └── useFlipClock.ts              # flipclock 实例化 + 周期性偏差检查 + 页面可见性处理
├── components/                      # 展示型组件（无业务逻辑）
│   ├── WallpaperBackground.vue       # 根据 mode 渲染 <img> 或 <video>
│   ├── FlipClockWidget.vue          # 挂载 flipclock DOM 节点
│   └── DevToolsPanel.vue            # 开发模式调试面板（仅 import.meta.env.DEV 时渲染）
├── styles/global.less               # 全局样式（重置 + flipclock CSS 导入）
└── types/                           # TypeScript 类型声明
    ├── vue-shim.d.ts                 # .vue 文件模块声明
    ├── flipclock.d.ts                # flipclock 模块声明
    └── wallpaper-engine.d.ts         # Window.wallpaperPropertyListener 声明
```

### 数据流

```
Wallpaper Engine 属性变更
  ↓
useWallpaperEngine()  ←  window.wallpaperPropertyListener 事件
  ↓ (positionX, positionY, scale, mode, imagePath, videoPath, isCustomWallpaper)
App.vue 作为协调层
  ├→ useWallpaper({ isCustomWallpaper, mode, imagePath, videoPath })
  │     ↓ (currentSrc, currentMode)
  │  WallpaperBackground.vue  ← 纯渲染（img/video 切换）
  │
  └→ FlipClockWidget.vue(props: positionX, positionY, scale)
        ↓ 内部调用 useFlipClock(clockEl)  ← 操纵 flipclock 实例
        ↓ 周期性偏差检查 + 页面可见性感知（后台暂停/前台恢复）

DevToolsPanel.vue（仅 DEV 模式）
  ↓ 读写 localStorage 持久化调试属性
  ↓ 直接调用 window.wallpaperPropertyListener.applyUserProperties 模拟 WE 属性注入
```

**关键设计决策**：

1. **Composables 持有所有业务逻辑**：`useWallpaper` 管理定时器、重试链、壁纸切换；`useFlipClock` 管理 flipclock 生命周期；`useWallpaperEngine` 桥接 WE 原生 API 到 Vue 响应式系统
2. **组件纯展示**：`WallpaperBackground` 和 `FlipClockWidget` 只接收 props 渲染，不包含副作用；`DevToolsPanel` 仅在开发模式下出现，通过直接调用 `applyUserProperties` 模拟 WE 属性系统
3. **App.vue 作为胶水层**：组合 composable 返回值并向下传递，自身不含业务逻辑
4. **代际计数器（generation）**：`useWallpaper` 中使用 generation 变量防止旧的重试链覆盖新状态（例如用户在重试期间切换到自定义壁纸又切回来）

## Wallpaper Engine 集成

- 入口文件 `index.html` 直接作为 WE 的 `"file"` 配置，`<div id="app">` 作为 Vue 挂载点
- `dist/project.json` 是 WE 项目配置文件（type: "Web"）
- 属性通过 `window.wallpaperPropertyListener.applyUserProperties` 注入
- WE 属性配置（`project.json` → `general.properties`）：
  - `mode`: 自定义壁纸模式（`image` / `video`）
  - `image`: 自定义图片路径（mode == "image" 时显示）
  - `video`: 自定义视频路径（mode == "video" 时显示）
  - `position_x`/`position_y`: 时钟位置（0-100）
  - `scale`: 时钟缩放（0-3，精度 0.01）
- **重要**：自定义壁纸文件路径需加 `file:///` 前缀（在 `useWallpaperEngine.ts` 中处理），**开发模式下除外**（DEV 模式不加前缀，方便使用浏览器可访问的 URL 调试）
- 自定义壁纸模式下停止自动获取必应壁纸；切回默认模式后恢复
- 必应壁纸每小时刷新一次，图片 URL 中的分辨率参数会被替换为 `UHD`

## flipclock patch

`patches/flipclock@0.10.8.patch` 通过 `patch-package` 管理。`pnpm install` 后会自动应用（`package.json` → `pnpm.patchedDependencies`）。

## 路径别名

`@` 映射到 `src/` 目录（`vite.config.ts` + `tsconfig.json` 双配置）。

## 注意事项

- 生产构建前执行 `vue-tsc --noEmit` 类型检查（strict + noUnusedLocals/noUnusedParameters），未使用变量会导致构建失败
- `dist/` 目录下的 `bg.jpg`（默认背景）和 `preview.jpg`（预览图）是手动放置的静态资源，不会由 Vite 构建生成
- `AsyncFuncRetry` 接受可选的 `stop` 回调来中断重试链，在 `useWallpaper.ts` 中用于检测自定义壁纸切换和代际变化
- 本项目仅为 Web 壁纸，不涉及后端服务或数据库
