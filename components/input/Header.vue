<template>
  <div
    class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-t-lg px-2 py-1.5 flex items-center gap-1.5 text-xs"
    draggable="true"
    @dragstart="onDragStart"
  >
    <!-- State indicator -->
    <span
      class="w-2.5 h-2.5 rounded-full shrink-0"
      :class="{ 'animate-pulse': ['BUFFERING', 'CONNECTING', 'ERROR'].includes(input.state) }"
      :style="{ backgroundColor: stateColor(input.state) }"
      :title="input.state"
    />

    <!-- Name (double-click to rename) -->
    <InlineEdit
      :modelValue="input.name"
      @update:modelValue="updateName"
      displayClass="truncate text-sm text-gray-800 dark:text-gray-200 font-medium"
      inputClass="text-sm text-gray-800 dark:text-gray-200 font-medium w-20"
    />
    <!-- The list that plays, as its source names it; else the input's type -->
    <span
      class="text-[11px] truncate min-w-0"
      :class="input.list_name ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'"
      :title="input.list_name ? `${input.type}: list ${input.list_name}` : input.type"
    >{{ input.list_name || input.type }}</span>

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
const { patchEntity } = useEntities();

const updateName = (newName) => {
  patchEntity('input', props.input.uid, { name: newName });
};

const onDragStart = (event) => {
  event.dataTransfer.setData('application/x-dove-input', props.input.uid);
  event.dataTransfer.effectAllowed = 'link';
};
</script>
