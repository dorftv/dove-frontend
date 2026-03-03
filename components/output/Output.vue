<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 mb-2 text-xs">
    <div class="flex items-center gap-1.5">
      <!-- State dot -->
      <span
        :title="output.state"
        class="w-2 h-2 rounded-full shrink-0"
        :class="stateDotClass(output.state)"
        role="status"
      />

      <!-- Name -->
      <span
        v-tooltip="output.name + ' (' + output.type + ')'"
        class="truncate cursor-help text-sm text-gray-800 dark:text-gray-300"
      >
        {{ output.name }}
      </span>

      <!-- Type -->
      <span class="text-[10px] text-gray-500 shrink-0">{{ output.type }}</span>

      <!-- Resolved links -->
      <span v-if="linkedInfo" class="text-[10px] text-gray-500 truncate">{{ linkedInfo }}</span>

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
const { resolveEntity, enrichEntity } = useEntities()

const linkedInfo = computed(() => {
  const parts = [];
  const src = resolveEntity(props.output.src);
  if (src) parts.push(src.name);
  const venc = resolveEntity(props.output.video_encoder);
  if (venc) parts.push(venc.element);
  const aenc = resolveEntity(props.output.audio_encoder);
  if (aenc) parts.push(aenc.element);
  return parts.join(' · ');
});

const stateDotClass = (state) => {
  const classes = {
    PLAYING: 'bg-green-500',
    PAUSED: 'bg-orange-400',
    NULL: 'bg-gray-400 dark:bg-gray-500',
    READY: 'bg-gray-400 dark:bg-gray-500',
    EOS: 'bg-red-500',
    ERROR: 'bg-red-500',
    BUFFERING: 'bg-orange-400',
  };
  return classes[state] || 'bg-gray-400';
};

const props = defineProps({
  output: Object,
  mixers: Array,
});

const op = ref();
const outputDetails = computed(() => JSON.stringify(enrichEntity(props.output), null, 2));
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
