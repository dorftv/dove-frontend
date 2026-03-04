<template>
  <div v-if="programMixer" class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 flex items-center gap-1.5 text-xs">
    <span class="text-sm text-gray-800 dark:text-gray-200 font-medium truncate cursor-help" v-tooltip="programMixer.uid">
      {{ programMixer.name || 'Program' }}
    </span>
    <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-400">
      LIVE
    </span>
    <div class="flex-grow" />
    <DetailPopover :entity="programMixer" />
  </div>
</template>

<script setup>
const { programMixer } = useEntities();
</script>
