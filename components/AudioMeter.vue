<template>
  <div class="flex gap-px w-2 shrink-0 opacity-70">
    <div class="flex-1 h-full relative meter-bg">
      <div class="absolute top-0 w-full bg-gray-800 dark:bg-gray-900 transition-[height] duration-150" :style="{ height: (100 - left) + '%' }" />
    </div>
    <div class="flex-1 h-full relative meter-bg">
      <div class="absolute top-0 w-full bg-gray-800 dark:bg-gray-900 transition-[height] duration-150" :style="{ height: (100 - right) + '%' }" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  uid: String,
});

const audioLevels = useState('audio-levels', () => ({}));

const left = computed(() => audioLevels.value[props.uid]?.left ?? 0);
const right = computed(() => audioLevels.value[props.uid]?.right ?? 0);
</script>

<style scoped>
.meter-bg {
  background: linear-gradient(to top, #22c55e 0%, #22c55e 65%, #eab308 65%, #eab308 85%, #ef4444 85%, #ef4444 100%);
}
</style>
