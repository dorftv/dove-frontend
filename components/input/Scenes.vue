<template>
  <div v-if="selectedScene" class="border-t border-gray-200 dark:border-gray-700">
    <button @click="slotsOpen = !slotsOpen" class="flex items-center gap-1.5 w-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
      <i class="pi text-[10px]" :class="slotsOpen ? 'pi-chevron-down' : 'pi-chevron-right'" />
      <span>Slots</span>
      <span class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] px-1.5 rounded-full font-mono">{{ selectedScene.sources?.length || 0 }}</span>
    </button>
    <div v-show="slotsOpen">
      <div
        v-for="(source, i) in [...selectedScene.sources].reverse()"
        :key="source.index"
        :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-800/30'"
        class="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
      >
        <InputSceneSources :input="input" :scene="selectedScene" :source="source" />
      </div>
    </div>
  </div>
</template>

<script setup>
const { selectedScene } = useActiveScene();

const props = defineProps({
  input: Object,
});

const slotsOpen = ref(true);
</script>
