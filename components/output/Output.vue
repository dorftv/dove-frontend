<template>
  <div :class="[stateClass(output.state), 'rounded-lg p-2 mb-2']" v-if="!output.is_preview">
    <div class="flex items-center justify-end mb-1">
      <Popover ref="op" appendTo="body">
        <pre class="text-xs text-gray-700 dark:text-gray-300">{{ outputDetails }}</pre>
      </Popover>
      <button
        @click="op.toggle($event)"
        class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 mr-2"
      >
        <i class="pi pi-info-circle text-sm"></i>
      </button>
      <button
        v-if="!output.locked || isUnlocked"
        @click="submitRemoveOutput"
        class="flex items-center justify-center w-7 h-7 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
      >
        <i class="pi pi-trash text-sm"></i>
      </button>
    </div>
    <div class="flex-grow overflow-hidden">
      <span
        v-tooltip="output.name + ' (' + output.type + ')'"
        :id="'outputName_' + output.uid"
        class="truncate inline-block w-full cursor-help text-sm"
      >
        {{ output.name }}
      </span>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()
const { stateClass } = useStateClass();

const props = defineProps({
  output: Object,
  mixers: Array,
});

const op = ref();
const outputDetails = computed(() => JSON.stringify(props.output, null, 2));

const submitRemoveOutput = async () => {
  try {
    await $fetch('/api/outputs', {
      method: 'DELETE',
      body: { uid: props.output.uid },
    });
  } catch (error) {
    console.error('Failed to remove output:', error);
  }
};
</script>
