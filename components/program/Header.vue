<template>
  <div v-if="programMixer" class="flex items-center w-full">
    <div class="flex-grow mr-2 overflow-hidden">
      <span
        v-tooltip="programMixer.uid"
        :id="'programName_' + programMixer.uid"
        class="truncate inline-block max-w-full cursor-help text-gray-800 dark:text-gray-200"
      >
        {{ programMixer.name || 'Program' }}
      </span>
    </div>
    <div class="flex-shrink-0 flex items-center">
      <button
        @click="op.toggle($event)"
        class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 mr-2"
      >
        <i class="pi pi-info-circle text-sm"></i>
      </button>
      <Popover ref="op" appendTo="body">
        <pre class="text-xs text-gray-700 dark:text-gray-300">{{ programDetails }}</pre>
      </Popover>
    </div>
  </div>
</template>

<script setup>
const { programMixer } = useEntities();

const op = ref();
const programDetails = computed(() => JSON.stringify(programMixer.value, null, 2));
</script>
