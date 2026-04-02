<template>
  <div v-if="programMixer" class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 flex items-center gap-1.5 text-xs">
    <UTooltip :text="String(programMixer.uid)">
      <span class="text-sm text-gray-800 dark:text-gray-200 font-medium truncate cursor-help">
        {{ programMixer.name || 'Program' }}
      </span>
    </UTooltip>
    <span
      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none"
      :class="programMixer.state === 'PLAYING'
        ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
    >
      {{ programMixer.state === 'PLAYING' ? 'LIVE' : programMixer.state }}
    </span>
    <div class="flex-grow" />
    <button
      @click="filtersOpen = true"
      class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
      title="Audio filters"
    >
      <Icon name="ph:waveform" size="12px" />
      <span
        v-if="programFilterCount > 0"
        class="absolute -top-1 -right-1 min-w-[12px] h-[12px] flex items-center justify-center rounded-full bg-blue-500 text-white text-[7px] font-bold leading-none px-0.5"
      >{{ programFilterCount }}</span>
    </button>
    <AudioFilters v-model:open="filtersOpen" :mixer="programMixer" />
    <button
      @click="vfOpen = true"
      class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
      title="Video filters"
    >
      <Icon name="ph:camera" size="12px" />
      <span
        v-if="programVfCount > 0"
        class="absolute -top-1 -right-1 min-w-[12px] h-[12px] flex items-center justify-center rounded-full bg-violet-500 text-white text-[7px] font-bold leading-none px-0.5"
      >{{ programVfCount }}</span>
    </button>
    <VideoFilters v-model:open="vfOpen" :mixer="programMixer" />
    <DetailPopover :entity="programMixer" />
  </div>
</template>

<script setup>
const { programMixer } = useEntities();
const filtersOpen = ref(false);
const vfOpen = ref(false);
const { filterCount: programFilterCount } = useAudioFilters({ mixer: () => programMixer.value });
const { filterCount: programVfCount } = useVideoFilters({ mixer: () => programMixer.value });
</script>
