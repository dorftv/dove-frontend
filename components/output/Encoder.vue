<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 mb-2 text-xs">
    <div class="flex items-center gap-1.5">
      <!-- State badge -->
      <span :class="stateBadgeClass(encoder.state)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none shrink-0" role="status">
        <Icon :name="stateIcon(encoder.state)" size="10px" />
        {{ encoder.state }}
      </span>

      <!-- Name -->
      <span
        v-tooltip="encoder.name + ' (' + encoder.element + ')'"
        class="truncate cursor-help text-sm text-gray-800 dark:text-gray-300"
      >
        {{ encoder.name }}
      </span>

      <!-- Type + element -->
      <span class="text-[10px] text-gray-500 shrink-0">{{ encoder.type }} · {{ encoder.element }}</span>

      <!-- Spacer -->
      <div class="flex-grow" />

      <!-- Action buttons -->
      <Popover ref="op" appendTo="body">
        <pre class="text-xs text-gray-700 dark:text-gray-300">{{ encoderDetails }}</pre>
      </Popover>
      <button @click="op.toggle($event)" class="encoder-btn" title="Details" aria-label="Show details">
        <i class="pi pi-info-circle text-[11px]"></i>
      </button>
      <button
        @click="submitRemoveEncoder"
        :disabled="deleting"
        class="encoder-btn text-red-400 hover:text-red-300 disabled:opacity-50"
        title="Delete"
        aria-label="Delete encoder"
      >
        <i :class="deleting ? 'pi pi-spinner pi-spin' : 'pi pi-trash'" class="text-[11px]"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
const stateIcon = (state) => {
  const icons = {
    PLAYING: 'ph:play-circle',
    PAUSED: 'ph:pause-circle',
    NULL: 'ph:stop-circle',
    READY: 'ph:circle-dashed',
    EOS: 'ph:stop',
    ERROR: 'ph:warning-circle',
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
  };
  return classes[state] || 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
};

const props = defineProps({
  encoder: Object,
});

const op = ref();
const encoderDetails = computed(() => JSON.stringify(props.encoder, null, 2));
const confirm = useConfirm();
const notify = useNotify();
const deleting = ref(false);

const doRemoveEncoder = async () => {
  deleting.value = true;
  try {
    await $fetch(`/api/encoders/${props.encoder.uid}`, {
      method: 'DELETE',
    });
  } catch (error) {
    notify.error('Failed to remove encoder');
  } finally {
    deleting.value = false;
  }
};

const submitRemoveEncoder = () => {
  const state = props.encoder.state;
  if (state === 'EOS' || state === 'ERROR' || state === 'NULL') {
    doRemoveEncoder();
  } else {
    confirm.require({
      message: `Delete encoder "${props.encoder.name}"?`,
      header: 'Confirm',
      acceptClass: 'p-button-danger',
      accept: doRemoveEncoder,
    });
  }
};
</script>

<style scoped>
.encoder-btn {
  @apply flex items-center justify-center w-5 h-5 rounded
         text-gray-500 dark:text-gray-400
         hover:bg-gray-300 dark:hover:bg-gray-700
         hover:text-gray-900 dark:hover:text-white
         transition-colors duration-100 cursor-pointer;
}
</style>
