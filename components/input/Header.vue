<template>
  <div
    class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-t-lg px-2 py-1.5 flex items-center gap-1.5 text-xs"
    draggable="true"
    @dragstart="onDragStart"
  >
    <!-- State indicator -->
    <span
      class="w-2.5 h-2.5 rounded-full shrink-0"
      :class="{ 'animate-pulse': input.state === 'BUFFERING' || input.state === 'ERROR' }"
      :style="{ backgroundColor: stateColor(input.state) }"
      :title="input.state"
    />

    <!-- Name -->
    <UTooltip :text="input.name + ' (' + input.type + ')'">
      <span class="truncate cursor-help text-sm text-gray-800 dark:text-gray-200 font-medium">
        {{ input.name }}
      </span>
    </UTooltip>
    <span class="text-[10px] text-gray-500">{{ input.type }}</span>

    <!-- Spacer -->
    <div class="flex-grow" />

    <!-- Actions -->
    <DetailPopover :entity="input" />
    <button
      v-if="canUser && (!input.locked || canBypassLock)"
      @click="submitRemove"
      :disabled="deleting"
      class="icon-btn text-red-400 hover:text-red-300 disabled:opacity-50"
      title="Delete"
      aria-label="Delete input"
    >
      <Icon :name="deleting ? 'ph:spinner' : 'ph:trash'" size="11px" :class="{ 'animate-spin': deleting }" />
    </button>
    <button
      v-if="!inputPreview"
      @click="$emit('enablePreview')"
      class="icon-btn"
      :title="inputEnabled ? 'Disable preview' : 'Enable preview'"
      :aria-label="inputEnabled ? 'Disable preview' : 'Enable preview'"
    >
      <Icon :name="inputEnabled ? 'ph:video-camera-slash' : 'ph:video-camera'" size="14px" />
    </button>
  </div>
</template>

<script setup>
const { stateColor } = useStateClass()
const { canUser, canBypassLock } = useAuth()

const props = defineProps({
  input: Object,
  inputEnabled: Boolean
});

defineEmits(['enablePreview']);

const { inputPreview } = useUserState();

const { deleting, submitRemove } = useDeleteEntity('input', () => props.input);

const onDragStart = (event) => {
  event.dataTransfer.setData('text/plain', props.input.uid);
  event.dataTransfer.effectAllowed = 'link';
};
</script>
