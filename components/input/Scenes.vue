<template>
  <div v-if="selectedScene" class="border-t border-gray-200 dark:border-gray-700">
    <!-- Scene name label -->
    <div class="px-2 py-0.5 text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
      <Icon name="ph:stack" size="10px" />
      <span class="truncate">{{ selectedScene.name }}</span>
    </div>
    <div
      v-for="(source, i) in sortedSources"
      :key="source.index"
      :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-800/30'"
      class="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
    >
      <InputSceneSources :input="input" :scene="selectedScene" :source="source" />
    </div>
  </div>
</template>

<script setup>
defineProps({ input: Object });

const { selectedScene } = useActiveScene();

// Sort by z-order descending to match scene slot display order
const sortedSources = computed(() =>
  [...(selectedScene.value?.sources || [])].sort((a, b) => (b.zorder ?? 0) - (a.zorder ?? 0))
);
</script>
