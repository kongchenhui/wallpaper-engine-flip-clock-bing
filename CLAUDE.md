# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是 **Wallpaper Engine** 的一个网页壁纸项目，功能为"必应每日壁纸 + 翻页时钟"。发布在 Steam Workshop（ID: 3479714541）。

## 常用命令

```bash
# 开发模式（启动 Vite 开发服务器，端口 3000）
pnpm dev

# 构建生产版本（先 tsc 类型检查，再 vite build）
pnpm build

# 应用 patch-package 补丁
pnpm patch
```

**注意**：本项目没有测试框架和 lint 配置。

## 技术栈

- **TypeScript** (ES2020 target, strict mode)
- **Vite** 打包（base: `"./"`，构建输出到 `dist/`）
- **Less** CSS 预处理器
- **flipclock** 库（v0.10.8，有 patch 补丁）
- **pnpm** 包管理器

## 架构概览

```
src/
├── main.ts          # 主入口：时钟初始化、壁纸获取、Wallpaper Engine 属性监听
├── api/index.ts     # 必应每日壁纸 API 封装（cn.bing.com/HPImageArchive.aspx）
├── utils/request.ts # 通用 fetch 封装 + AsyncFuncRetry 重试工具
├── style/index.less # 全局样式（导入 flipclock CSS）
├── index.d.ts       # 类型声明（flipclock 模块、Window.wallpaperPropertyListener）
└── vite-env.d.ts    # Vite 客户端类型引用
```

**关键数据流**：

1. `main.ts` 是唯一的入口文件，直接操作 DOM（`.clock` 和 `.bg` 容器）
2. 通过 `wallpaperPropertyListener.applyUserProperties` 接收 Wallpaper Engine 的属性变更（时钟位置/缩放、自定义壁纸）
3. 每小时通过 `setInterval` 调用 `queryImageData()` 获取必应每日壁纸
4. 获取壁纸时有重试机制：`AsyncFuncRetry` 最多重试 30 次，每次间隔 10 秒；若用户在此期间切换到自定义壁纸则停止重试
5. 自定义壁纸支持图片和视频两种模式，设置后停止自动获取必应壁纸；切换回默认模式后恢复自动获取

## Wallpaper Engine 集成

- 入口文件 `index.html` 直接作为 Wallpaper Engine 的 `"file"` 配置
- `dist/project.json` 是 Wallpaper Engine 的项目配置文件（type: "Web"）
- 属性配置（`project.json` → `general.properties`）：
  - `mode`: combo 选择器（image / video），决定自定义壁纸模式
  - `image`: file 选择器（当 mode == "image" 时显示）
  - `video`: file 选择器（当 mode == "video" 时显示）
  - `position_x`: 时钟 X 位置滑块（0-100）
  - `position_y`: 时钟 Y 位置滑块（0-100）
  - `scale`: 时钟缩放滑块（0-3，精度 0.01）
- 自定义壁纸路径需加 `file:///` 前缀才能被 Wallpaper Engine 加载

## 路径别名

`@` 映射到 `src/` 目录（在 `tsconfig.json` 和 `vite.config.ts` 中都配置了）。

## flipclock patch

`patches/flipclock@0.10.8.patch` 使用 `patch-package` 管理。安装依赖后需执行 `pnpm patch` 或配置 postinstall 脚本自动应用。

## 注意事项

- 生产构建前会执行 `tsc` 类型检查（`noUnusedLocals`、`noUnusedParameters` 开启），如有未使用变量会导致构建失败
- `dist/` 目录下包含 `bg.jpg`（默认背景，308KB）和 `preview.jpg`（预览图，443KB），这些是手动放置的静态资源，不会由 Vite 构建过程生成
- `AsyncFuncRetry` 支持外部 `stop` 回调来中断重试链，用于处理自定义壁纸切换场景
