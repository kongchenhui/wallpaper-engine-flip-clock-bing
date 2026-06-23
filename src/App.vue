<script setup lang="ts">
import { useWallpaperEngine } from "@/hooks/useWallpaperEngine";
import { useWallpaper } from "@/hooks/useWallpaper";
import WallpaperBackground from "@/components/WallpaperBackground.vue";
import FlipClockWidget from "@/components/FlipClockWidget.vue";

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
  </main>
</template>

<style scoped>
.app-main {
  height: 100%;
  width: 100%;
}
</style>
