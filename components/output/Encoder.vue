<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 mb-1 text-xs">
    <div class="flex items-center gap-1.5">
      <!-- State dot -->
      <span
        :title="encoder.state"
        class="w-2 h-2 rounded-full shrink-0"
        :class="stateDotClass(encoder.state)"
        role="status"
      />

      <!-- Type icon + element -->
      <Icon :name="encoder.type === 'video' ? 'ph:video-camera' : 'ph:speaker-high'" size="12px" class="text-gray-400 shrink-0" :title="encoder.type" />
      <span class="truncate text-gray-800 dark:text-gray-200">{{ encoder.element }}</span>

      <!-- Options -->
      <span v-if="encoder.options" class="truncate text-[10px] text-gray-500 dark:text-gray-400" :title="encoder.options">
        {{ encoder.options }}
      </span>

      <!-- Spacer -->
      <div class="flex-grow" />

      <!-- Action buttons -->
      <Popover ref="op" appendTo="body">
        <pre class="text-xs text-gray-700 dark:text-gray-300">{{ encoderDetails }}</pre>
      </Popover>
      <button @click="op.toggle($event)" class="encoder-btn ml-auto" title="Details" aria-label="Show details">
        <i class="pi pi-info-circle text-[11px]"></i>
      </button>
      <button
        v-if="!encoder.locked || isUnlocked"
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
const { isUnlocked } = useLocked()

const stateDotClass = (state) => {
  const classes = {
    PLAYING: 'bg-green-500',
    PAUSED: 'bg-orange-400',
    NULL: 'bg-gray-400 dark:bg-gray-500',
    READY: 'bg-gray-400 dark:bg-gray-500',
    EOS: 'bg-red-500',
    ERROR: 'bg-red-500',
  };
  return classes[state] || 'bg-gray-400';
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
