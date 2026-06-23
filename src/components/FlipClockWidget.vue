<script setup lang="ts">
import { computed, ref } from "vue";
import { useFlipClock } from "@/hooks/useFlipClock";

const props = defineProps<{
  positionX: number;
  positionY: number;
  scale: number;
}>();

const clockEl = ref<HTMLElement | null>(null);

// 初始化翻页时钟（composable 内部处理 onMounted/onUnmounted）
useFlipClock(clockEl);

// 根据 props 计算时钟样式
const clockStyle = computed(() => ({
  left: `${props.positionX}%`,
  top: `${props.positionY}%`,
  scale: `${props.scale}`,
  transformOrigin: "left top",
}));
</script>

<template>
  <div ref="clockEl" class="clock-container" :style="clockStyle" />
</template>

<style scoped>
.clock-container {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 1;
  text-align: center;
  color: #fff;
}
</style>
