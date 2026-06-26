import { ref, watch, onMounted, onUnmounted, type ComputedRef, type Ref } from "vue";
import { getBingPaperData } from "@/api";
import { AsyncFuncRetry } from "@/utils/request";

export interface UseWallpaperOptions {
  /** 是否为自定义壁纸模式 */
  isCustomWallpaper: ComputedRef<boolean>;
  /** 自定义壁纸模式 */
  customMode: Ref<"image" | "video">;
  /** 自定义图片路径 */
  customImagePath: Ref<string>;
  /** 自定义视频路径 */
  customVideoPath: Ref<string>;
}

/**
 * 必应每日壁纸获取 + 壁纸状态管理 composable
 * 处理自动获取必应壁纸的定时器、重试逻辑，以及自定义壁纸切换
 */
export function useWallpaper(options: UseWallpaperOptions) {
  const { isCustomWallpaper, customMode, customImagePath, customVideoPath } = options;

  // 当前壁纸 URL
  const currentSrc = ref("./bg.jpg");
  // 当前壁纸模式
  const currentMode = ref<"image" | "video">("image");

  // 定时器引用
  let timer: ReturnType<typeof setInterval> | null = null;
  // 代际计数器 — 防止旧的重试链覆盖新状态
  let generation = 0;
  // 上次请求时间戳 — 用于确保至少间隔一小时才真正请求
  let lastRequestTime = 0;

  /**
   * 查询必应每日壁纸
   */
  function queryImageData() {
    // 如果已切换到自定义壁纸，跳过
    if (isCustomWallpaper.value) {
      stopInterval();
      return;
    }

    const currentGeneration = generation;

    AsyncFuncRetry(getBingPaperData, [], {
      delay: 10 * 1000,
      retries: 30,
      stop: () => {
        // 如果已切换壁纸或代际不匹配，停止重试
        return isCustomWallpaper.value || currentGeneration !== generation;
      },
    })
      .then((images) => {
        const image = images[0];
        const url = `https://cn.bing.com${image.url}`.replace(/1920x1080/g, "UHD");

        // 检查是否在请求期间切换到了自定义壁纸或发生了代际变化
        if (isCustomWallpaper.value || currentGeneration !== generation) {
          return;
        }

        currentSrc.value = url;
        currentMode.value = "image";
      })
      .catch(() => {
        // 重试耗尽，静默处理
        if (isCustomWallpaper.value) {
          stopInterval();
        }
      });
  }

  /**
   * 启动定时获取壁纸（每分钟检查一次，距离上次请求超过一小时才真正请求）
   */
  function startInterval() {
    stopInterval();
    generation++;
    // 立即获取一次
    lastRequestTime = Date.now();
    queryImageData();
    timer = setInterval(() => {
      const now = Date.now();
      // 距离上次请求超过一小时才真正发起请求
      if (now - lastRequestTime >= 60 * 60 * 1000) {
        lastRequestTime = now;
        queryImageData();
      }
    }, 60 * 1000);
  }

  /**
   * 停止定时器
   */
  function stopInterval() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // 监听自定义壁纸切换
  watch(
    [isCustomWallpaper, customMode, customImagePath, customVideoPath],
    () => {
      if (isCustomWallpaper.value) {
        // 切换到自定义壁纸模式
        stopInterval();
        currentMode.value = customMode.value;
        if (customMode.value === "image" && customImagePath.value) {
          currentSrc.value = customImagePath.value;
        } else if (customMode.value === "video" && customVideoPath.value) {
          currentSrc.value = customVideoPath.value;
        }
      } else {
        // 切换回默认模式，恢复自动获取壁纸
        startInterval();
      }
    },
  );

  // 生命周期：组件挂载时启动定时器
  onMounted(() => {
    // 只有当不是自定义壁纸模式时才启动定时器
    if (!isCustomWallpaper.value) {
      startInterval();
    }
  });

  // 生命周期：组件卸载时清理定时器
  onUnmounted(() => {
    stopInterval();
  });

  return {
    currentSrc,
    currentMode,
  };
}
