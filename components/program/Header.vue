<template>
  <div v-if="programMixer" class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 flex items-center gap-1.5 text-xs">
    <span class="text-sm text-gray-800 dark:text-gray-200 font-medium truncate cursor-help" v-tooltip="programMixer.uid">
      {{ programMixer.name || 'Program' }}
    </span>
    <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-400">
      LIVE
    </span>
    <div class="flex-grow" />
    <Popover ref="op" appendTo="body">
      <pre class="text-xs text-gray-700 dark:text-gray-300">{{ programDetails }}</pre>
    </Popover>
    <button @click="op.toggle($event)" class="program-btn" title="Details" aria-label="Show details">
      <i class="pi pi-info-circle text-[11px]"></i>
    </button>
  </div>
</template>

<script setup>
const { programMixer } = useEntities();

const op = ref();
const programDetails = computed(() => JSON.stringify(programMixer.value, null, 2));
</script>

<style scoped>
.program-btn {
  @apply flex items-center justify-center w-5 h-5 rounded
         text-gray-500 dark:text-gray-400
         hover:bg-gray-300 dark:hover:bg-gray-700
         hover:text-gray-900 dark:hover:text-white
         transition-colors duration-100 cursor-pointer;
}
</style>
