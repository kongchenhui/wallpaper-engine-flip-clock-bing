<script setup lang="ts">
import { useWallpaperEngine } from "@/hooks/useWallpaperEngine";
import { useWallpaper } from "@/hooks/useWallpaper";
import WallpaperBackground from "@/components/WallpaperBackground.vue";
import FlipClockWidget from "@/components/FlipClockWidget.vue";
import DevToolsPanel from "@/components/DevToolsPanel.vue";

// 是否为开发模式（仅浏览器调试时启用）
const isDev = import.meta.env.DEV;

// Wallpaper Engine 属性监听
const { positionX, positionY, scale, mode, imagePath, videoPath, isCustomWallpaper } =
  useWallpaperEngine();

// 壁纸状态管理
const { currentSrc, currentMode } = useWallpaper({
  isCustomWallpaper,
  customMode: mode,
  customImagePath: imagePath,
  customVideoPath: videoPath,
});
</script>

<template>
  <main class="app-main">
    <WallpaperBackground :mode="currentMode" :src="currentSrc" />
    <FlipClockWidget
      :position-x="positionX"
      :position-y="positionY"
      :scale="scale"
    />
    <!-- 开发模式下的浏览器调试面板 -->
    <DevToolsPanel v-if="isDev" />
  </main>
</template>

<style scoped>
.app-main {
  height: 100%;
  width: 100%;
}
</style>
