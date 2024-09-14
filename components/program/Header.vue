<template>
  <div v-if="programMixer" class="flex items-center w-full">
    <div class="flex-grow mr-2 overflow-hidden">
      <span
        v-tooltip="programMixer.uid"
        :id="'programName_' + programMixer.uid"
        class="truncate inline-block max-w-full cursor-help"
      >
        {{ programMixer.name || 'Program' }}
      </span>
    </div>
    <div class="flex-shrink-0 flex items-center">
      <button
        @click="op.toggle($event)"
        class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 mr-2"
      >
        <i class="pi pi-info-circle text-sm"></i>
      </button>
      <Popover ref="op" appendTo="body">
        <pre>{{ programDetails }}</pre>
      </Popover>
    </div>
  </div>
</template>

<script setup>

const { programMixer } = useEntities();
const { activeScene } = useActiveScene();

const op = ref();
const target = ref(null);


const programDetails = computed(() => JSON.stringify(programMixer.value, null, 2));
</script>

<style scoped>
/* Add any scoped styles if needed */
</style>
