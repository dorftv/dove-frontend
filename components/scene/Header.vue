<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 flex items-center gap-1.5 text-xs">
    <!-- State indicator -->
    <span
      class="w-2 h-2 rounded-full shrink-0"
      :style="{ backgroundColor: stateColor(scene.state) }"
      :title="scene.state"
    />

    <!-- Name (double-click to rename) -->
    <InlineEdit
      :modelValue="scene.name"
      @update:modelValue="updateName"
      displayClass="truncate text-sm text-gray-800 dark:text-gray-200 font-medium"
      inputClass="text-sm text-gray-800 dark:text-gray-200 font-medium w-24"
    />

    <!-- Spacer -->
    <div class="flex-grow" />

    <!-- Actions -->
    <button
      @click="slotOverlay = !slotOverlay"
      class="icon-btn"
      :class="{ 'text-blue-500 dark:text-blue-400': slotOverlay }"
      :title="slotOverlay ? 'Hide slot layout' : 'Show slot layout'"
      aria-label="Toggle slot layout"
    >
      <Icon name="ph:frame-corners" size="11px" />
    </button>
    <DetailPopover :entity="scene" />
    <button
      v-if="canSupervisor && (!scene.locked || canBypassLock)"
      @click="submitRemove"
      :disabled="deleting"
      class="icon-btn text-red-400 hover:text-red-300 disabled:opacity-50"
      title="Delete"
      aria-label="Delete scene"
    >
      <Icon :name="deleting ? 'ph:spinner' : 'ph:trash'" size="11px" :class="{ 'animate-spin': deleting }" />
    </button>
  </div>
</template>

<script setup>
const { stateColor } = useStateClass()
const { canSupervisor, canBypassLock } = useAuth()
const { slotOverlay } = useUserState()

const props = defineProps({
  scene: Object,
});

const { deleting, submitRemove } = useDeleteEntity('scene', () => props.scene);
const { patchEntity } = useEntities();

const updateName = (newName) => {
  patchEntity('scene', props.scene.uid, { name: newName });
};
</script>
