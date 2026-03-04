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
      <DetailPopover :entity="output" />
      <button
        v-if="!output.locked || isUnlocked"
        @click="submitRemove"
        :disabled="deleting"
        class="icon-btn text-red-400 hover:text-red-300 disabled:opacity-50"
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
const { resolveEntity } = useEntities()
const { stateDotClass } = useStateClass()

const props = defineProps({
  output: Object,
  mixers: Array,
});

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

const { deleting, submitRemove } = useDeleteEntity('output', () => props.output);
</script>
