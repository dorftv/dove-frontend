<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 mb-1 text-xs">
    <!-- Top row: output name, type, resolution, actions -->
    <div class="flex items-center gap-1.5">
      <span
        :title="output.state"
        class="w-2 h-2 rounded-full shrink-0"
        :class="stateDotClass(output.state)"
        role="status"
      />
      <span
        v-tooltip="output.name + ' (' + output.type + ')'"
        class="truncate cursor-help text-sm text-gray-800 dark:text-gray-300"
      >
        {{ output.name }}
      </span>
      <span class="text-[10px] text-gray-500 shrink-0">{{ output.type }}</span>
      <div class="flex-grow" />
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
    <!-- Encoder rows below -->
    <div v-if="videoEncoder || audioEncoder" class="flex flex-col gap-0.5 ml-3.5 mt-0.5">
      <div v-if="videoEncoder" v-tooltip="videoEncoder.element + ' (' + videoEncoder.name + ')'" class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="stateDotClass(videoEncoder.state)" />
        <Icon name="ph:video-camera" size="11px" class="text-gray-400" />
        <span class="text-[10px] text-gray-500 dark:text-gray-400">{{ videoEncoder.element }}</span>
        <span v-if="videoEncoder.width && videoEncoder.height" class="text-[10px] text-gray-400">{{ videoEncoder.width }}x{{ videoEncoder.height }}</span>
        <span v-if="videoEncoder.details" class="text-[10px] text-red-400 truncate max-w-[8rem]">{{ videoEncoder.details }}</span>
      </div>
      <div v-if="audioEncoder" v-tooltip="audioEncoder.element + ' (' + audioEncoder.name + ')'" class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="stateDotClass(audioEncoder.state)" />
        <Icon name="ph:speaker-high" size="11px" class="text-gray-400" />
        <span class="text-[10px] text-gray-500 dark:text-gray-400">{{ audioEncoder.element }}</span>
        <span v-if="audioEncoder.details" class="text-[10px] text-red-400 truncate max-w-[8rem]">{{ audioEncoder.details }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()
const { resolveEntity } = useEntities()
const { stateDotClass } = useStateClass()

const props = defineProps({
  output: Object,
});

const videoEncoder = computed(() => resolveEntity(props.output.video_encoder));
const audioEncoder = computed(() => resolveEntity(props.output.audio_encoder));

const { deleting, submitRemove } = useDeleteEntity('output', () => props.output);
</script>
