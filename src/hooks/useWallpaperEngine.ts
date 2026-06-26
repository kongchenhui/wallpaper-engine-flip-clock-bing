import { ref, computed } from "vue";


/**
 * Wallpaper Engine 属性监听 composable
 * 注册 window.wallpaperPropertyListener 并将 WE 属性同步到 Vue 响应式状态
 */
export function useWallpaperEngine() {
  // 响应式状态
  const positionX = ref(50);
  const positionY = ref(40);
  const scale = ref(1);
  const mode = ref<"image" | "video">("image");
  const imagePath = ref("");
  const videoPath = ref("");

  // 是否为自定义壁纸模式
  const isCustomWallpaper = computed(() => {
    if (mode.value === "image" && imagePath.value) return true;
    if (mode.value === "video" && videoPath.value) return true;
    return false;
  });

  // 所有属性处理器（位置 + 壁纸）
  const handlers: Record<string, (value: any) => void> = {
    position_x: (value) => { positionX.value = value; },
    position_y: (value) => { positionY.value = value; },
    scale: (value) => { scale.value = value; },
    mode: (value) => { mode.value = value as "image" | "video"; },
    // 开发模式下不添加 file:/// 前缀，方便使用浏览器 URL 调试
    image: (value) => { imagePath.value = value ? (import.meta.env.DEV ? value : "file:///" + value) : ""; },
    video: (value) => { videoPath.value = value ? (import.meta.env.DEV ? value : "file:///" + value) : ""; },
  };

  // 注册 WE 属性监听器（仅首次调用时执行）
  if (!window.wallpaperPropertyListener) {
    window.wallpaperPropertyListener = {
      applyUserProperties(properties: Record<string, any>) {
        for (const key of Object.keys(handlers)) {
          if (properties[key] !== undefined) {
            handlers[key](properties[key].value);
          }
        }
      },
    };
  }

  return {
    positionX,
    positionY,
    scale,
    mode,
    imagePath,
    videoPath,
    isCustomWallpaper,
  };
}
