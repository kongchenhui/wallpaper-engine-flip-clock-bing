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

  onMounted(() => {
    if (!elementRef.value) return;

    clockInstance = new FlipClock(elementRef.value, {
      face: "TwentyFourHourClock",
    });

    // 每隔一分钟重置，防止时钟不准
    resetTimer = setInterval(() => {
      clockInstance?.reset();
    }, 60 * 1000);
  });

  onUnmounted(() => {
    if (resetTimer) {
      clearInterval(resetTimer);
      resetTimer = null;
    }
    clockInstance = null;
  });
}
