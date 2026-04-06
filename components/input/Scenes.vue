<template>
  <div v-if="selectedScene" class="border-t border-gray-200 dark:border-gray-700">
    <div
      v-for="(source, i) in [...selectedScene.sources].reverse()"
      :key="source.index"
      :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-800/30'"
      class="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
    >
      <InputSceneSources :input="input" :scene="selectedScene" :source="source" />
    </div>
  </div>
</template>

<script setup>
const { selectedScene } = useActiveScene();

const props = defineProps({
  input: Object,
});
</script>
