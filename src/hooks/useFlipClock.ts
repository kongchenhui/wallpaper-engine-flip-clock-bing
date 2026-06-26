import { onMounted, onUnmounted, type Ref } from "vue";
import FlipClock from "flipclock";

/**
 * FlipClock 翻页时钟 composable
 * 在 onMounted 时初始化 flipclock 实例，onUnmounted 时清理
 * @param elementRef 挂载时钟的 DOM 元素模板引用
 */
export function useFlipClock(elementRef: Ref<HTMLElement | null>) {
  let clockInstance: any = null;
  let resetTimer: ReturnType<typeof setInterval> | null = null;

  /** 启动周期性偏差检查定时器 */
  function startResetChecker() {
    if (resetTimer) return;
    resetTimer = setInterval(() => {
      if (!clockInstance) return;
      const displayedTime: Date = clockInstance.value?.value;
      if (!displayedTime) return;
      const diff = Math.abs(displayedTime.getTime() - Date.now());
      console.log("🚀 ~ startResetChecker ~ diff:", diff);
      if (diff > 3_000) {
        clockInstance.reset();
      }
    }, 5_000);
  }

  /** 停止周期性偏差检查定时器 */
  function stopResetChecker() {
    if (resetTimer) {
      clearInterval(resetTimer);
      resetTimer = null;
    }
  }

  /** 页面可见性变化：后台暂停计时器避免 rAF 停摆导致漂移，前台恢复并同步时间 */
  function handleVisibilityChange() {
    if (!clockInstance) return;
    if (document.hidden) {
      stopResetChecker();
    } else {
      clockInstance.reset();
      startResetChecker();
    }
  }

  onMounted(() => {
    if (!elementRef.value) return;

    clockInstance = new FlipClock(elementRef.value, {
      face: "TwentyFourHourClock",
    });

    startResetChecker();
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onUnmounted(() => {
    stopResetChecker();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    clockInstance = null;
  });
}
