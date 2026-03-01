<template>
  <div v-if="!output.is_preview" class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 mb-2 text-xs">
    <div class="flex items-center gap-1.5">
      <!-- State badge -->
      <span :class="stateBadgeClass(output.state)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none shrink-0" role="status">
        <Icon :name="stateIcon(output.state)" size="10px" />
        {{ output.state }}
      </span>

      <!-- Name -->
      <span
        v-tooltip="output.name + ' (' + output.type + ')'"
        class="truncate cursor-help text-sm text-gray-800 dark:text-gray-300"
      >
        {{ output.name }}
      </span>

      <!-- Type -->
      <span class="text-[10px] text-gray-500 shrink-0">{{ output.type }}</span>

      <!-- Spacer -->
      <div class="flex-grow" />

      <!-- Action buttons -->
      <Popover ref="op" appendTo="body">
        <pre class="text-xs text-gray-700 dark:text-gray-300">{{ outputDetails }}</pre>
      </Popover>
      <button @click="op.toggle($event)" class="output-btn" title="Details" aria-label="Show details">
        <i class="pi pi-info-circle text-[11px]"></i>
      </button>
      <button
        v-if="!output.locked || isUnlocked"
        @click="submitRemoveOutput"
        :disabled="deleting"
        class="output-btn text-red-400 hover:text-red-300 disabled:opacity-50"
        title="Delete"
        aria-label="Delete output"
      >
        <i :class="deleting ? 'pi pi-spinner pi-spin' : 'pi pi-trash'" class="text-[11px]"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()

const stateIcon = (state) => {
  const icons = {
    PLAYING: 'ph:play-circle',
    PAUSED: 'ph:pause-circle',
    NULL: 'ph:stop-circle',
    READY: 'ph:circle-dashed',
    EOS: 'ph:stop',
    ERROR: 'ph:warning-circle',
    BUFFERING: 'ph:spinner',
  };
  return icons[state] || 'ph:circle';
};

const stateBadgeClass = (state) => {
  const classes = {
    PLAYING: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-400',
    PAUSED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-400',
    NULL: 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    READY: 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    EOS: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-400',
    ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-400',
    BUFFERING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-400',
  };
  return classes[state] || 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
};

const props = defineProps({
  output: Object,
  mixers: Array,
});

const op = ref();
const outputDetails = computed(() => JSON.stringify(props.output, null, 2));
const confirm = useConfirm();
const notify = useNotify();
const deleting = ref(false);

const doRemoveOutput = async () => {
  deleting.value = true;
  try {
    await $fetch('/api/outputs', {
      method: 'DELETE',
      body: { uid: props.output.uid },
    });
  } catch (error) {
    notify.error('Failed to remove output');
  } finally {
    deleting.value = false;
  }
};

const submitRemoveOutput = () => {
  const state = props.output.state;
  if (state === 'EOS' || state === 'ERROR' || state === 'NULL') {
    doRemoveOutput();
  } else {
    confirm.require({
      message: `Delete output "${props.output.name}"?`,
      header: 'Confirm',
      acceptClass: 'p-button-danger',
      accept: doRemoveOutput,
    });
  }
};
</script>

<style scoped>
.output-btn {
  @apply flex items-center justify-center w-5 h-5 rounded
         text-gray-500 dark:text-gray-400
         hover:bg-gray-300 dark:hover:bg-gray-700
         hover:text-gray-900 dark:hover:text-white
         transition-colors duration-100 cursor-pointer;
}
</style>
