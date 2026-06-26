<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const STORAGE_KEY = "we-devtools-properties";

/** 从 localStorage 读取保存的调试属性 */
function loadFromStorage(): Record<string, any> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* 忽略 JSON 解析错误 */
  }
  return {};
}

const saved = loadFromStorage();

// 面板展开状态
const isExpanded = ref(false);

// 调试属性值（默认值 + localStorage 覆盖）
const positionX = ref(saved.positionX ?? 50);
const positionY = ref(saved.positionY ?? 40);
const scale = ref(saved.scale ?? 1);
const mode = ref<"image" | "video">(saved.mode ?? "image");
const imagePath = ref(saved.imagePath ?? "");
const videoPath = ref(saved.videoPath ?? "");

// 初始化完成标记 — 防止 onMounted 中批量应用时触发 watch 重复调用
let initialized = false;

/** 保存当前属性到 localStorage */
function saveToStorage() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      positionX: positionX.value,
      positionY: positionY.value,
      scale: scale.value,
      mode: mode.value,
      imagePath: imagePath.value,
      videoPath: videoPath.value,
    }),
  );
}

/** 向 Wallpaper Engine 属性系统应用单个属性变更 */
function applyProperty(key: string, value: unknown) {
  if (window.wallpaperPropertyListener) {
    window.wallpaperPropertyListener.applyUserProperties({
      [key]: { value },
    });
  }
  saveToStorage();
}

// 监听各属性变化，实时应用到 WE 属性系统
watch(positionX, (v) => { if (initialized) applyProperty("position_x", v); });
watch(positionY, (v) => { if (initialized) applyProperty("position_y", v); });
watch(scale, (v) => { if (initialized) applyProperty("scale", v); });
watch(mode, (v) => { if (initialized) applyProperty("mode", v); });
watch(imagePath, (v) => { if (initialized) applyProperty("image", v); });
watch(videoPath, (v) => { if (initialized) applyProperty("video", v); });

/** 重置所有属性为默认值 */
function resetToDefaults() {
  positionX.value = 50;
  positionY.value = 40;
  scale.value = 1;
  mode.value = "image";
  imagePath.value = "";
  videoPath.value = "";
  localStorage.removeItem(STORAGE_KEY);
}

/** 初始化时批量应用保存的属性值 */
function applyInitialValues() {
  if (!window.wallpaperPropertyListener) return;

  const props: Record<string, { value: unknown }> = {};
  if (saved.positionX !== undefined) props.position_x = { value: saved.positionX };
  if (saved.positionY !== undefined) props.position_y = { value: saved.positionY };
  if (saved.scale !== undefined) props.scale = { value: saved.scale };
  if (saved.mode !== undefined) props.mode = { value: saved.mode };
  if (saved.imagePath !== undefined) props.image = { value: saved.imagePath };
  if (saved.videoPath !== undefined) props.video = { value: saved.videoPath };

  // 只有当有自定义值时才应用
  if (Object.keys(props).length > 0) {
    window.wallpaperPropertyListener.applyUserProperties(props);
  }
}

// 生命周期：挂载时应用上次保存的值
onMounted(() => {
  applyInitialValues();
  initialized = true;
});
</script>

<template>
  <div class="devtools-wrapper">
    <!-- 折叠/展开按钮 -->
    <button class="devtools-toggle" @click="isExpanded = !isExpanded">
      ⚙ 调试
    </button>

    <!-- 调试面板 -->
    <div v-show="isExpanded" class="devtools-panel">
      <!-- 位置 X -->
      <div class="control-group">
        <label class="control-label">位置 X: <span class="value-text">{{ positionX }}</span></label>
        <input
          v-model.number="positionX"
          type="range"
          min="0"
          max="100"
          class="control-slider"
        />
      </div>

      <!-- 位置 Y -->
      <div class="control-group">
        <label class="control-label">位置 Y: <span class="value-text">{{ positionY }}</span></label>
        <input
          v-model.number="positionY"
          type="range"
          min="0"
          max="100"
          class="control-slider"
        />
      </div>

      <!-- 缩放 -->
      <div class="control-group">
        <label class="control-label">缩放: <span class="value-text">{{ scale.toFixed(2) }}</span></label>
        <input
          v-model.number="scale"
          type="range"
          min="0"
          max="3"
          step="0.01"
          class="control-slider"
        />
      </div>

      <!-- 壁纸模式 -->
      <div class="control-group">
        <label class="control-label">壁纸模式</label>
        <div class="btn-group">
          <button
            :class="['btn-option', { active: mode === 'image' }]"
            @click="mode = 'image'"
          >
            图片
          </button>
          <button
            :class="['btn-option', { active: mode === 'video' }]"
            @click="mode = 'video'"
          >
            视频
          </button>
        </div>
      </div>

      <!-- 图片 URL -->
      <div class="control-group">
        <label class="control-label">图片 URL</label>
        <input
          v-model="imagePath"
          type="text"
          class="control-input"
          placeholder="留空使用必应每日壁纸"
        />
      </div>

      <!-- 视频 URL -->
      <div class="control-group">
        <label class="control-label">视频 URL</label>
        <input
          v-model="videoPath"
          type="text"
          class="control-input"
          placeholder="留空使用必应每日壁纸"
        />
      </div>

      <!-- 重置按钮 -->
      <button class="reset-btn" @click="resetToDefaults">重置默认值</button>
    </div>
  </div>
</template>

<style lang="less" scoped>
// 颜色变量
@panel-bg: rgba(0, 0, 0, 0.8);
@panel-text: #e0e0e0;
@panel-accent: #4fc3f7;
@panel-radius: 6px;

.devtools-wrapper {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 12px;
}

// 折叠按钮
.devtools-toggle {
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: @panel-radius;
  background: @panel-bg;
  color: @panel-text;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

// 控制面板
.devtools-panel {
  width: 260px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: @panel-radius;
  background: @panel-bg;
  display: flex;
  flex-direction: column;
  gap: 10px;
  backdrop-filter: blur(8px);

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

// 控制组
.control-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.control-label {
  color: @panel-text;
  font-size: 11px;
  user-select: none;
}

.value-text {
  color: @panel-accent;
  font-weight: 500;
}

// 滑块
.control-slider {
  width: 100%;
  height: 4px;
  cursor: pointer;
  accent-color: @panel-accent;
}

// 文本输入
.control-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: @panel-text;
  font-size: 11px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  &:focus {
    border-color: @panel-accent;
  }
}

// 按钮组（模式切换）
.btn-group {
  display: flex;
  gap: 4px;
}

.btn-option {
  flex: 1;
  padding: 4px 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
  color: @panel-text;
  font-size: 11px;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &.active {
    background: rgba(79, 195, 247, 0.25);
    border-color: @panel-accent;
    color: @panel-accent;
  }
}

// 重置按钮
.reset-btn {
  width: 100%;
  padding: 5px 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: @panel-radius;
  background: rgba(255, 255, 255, 0.06);
  color: @panel-text;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;

  &:hover {
    background: rgba(255, 100, 100, 0.2);
    border-color: rgba(255, 100, 100, 0.4);
  }
}
</style>
