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
    <DetailPopover :entity="programMixer" />
  </div>
</template>

<script setup>
const { programMixer } = useEntities();
</script>
