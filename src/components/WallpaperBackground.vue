<script setup lang="ts">
defineProps<{
  mode: "image" | "video";
  src: string;
}>();
</script>

<template>
  <div class="bg-container">
    <img v-if="mode === 'image'" :src="src" class="paper" />
    <video
      v-else
      :src="src"
      class="paper"
      autoplay
      loop
      muted
      playsinline
    />
  </div>
</template>

<style scoped>
.bg-container {
  height: 100%;
  width: 100%;
  position: relative;
}

.paper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
