<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 flex items-center gap-1.5 text-xs">
    <!-- State indicator -->
    <span
      class="w-2 h-2 rounded-full shrink-0"
      :style="{ backgroundColor: stateColor(scene.state) }"
      :title="scene.state"
    />

    <!-- Name -->
    <UTooltip :text="`${scene.width}x${scene.height} · ${scene.sources?.length || 0} slots`">
      <span class="truncate cursor-help text-sm text-gray-800 dark:text-gray-200 font-medium">
        {{ scene.name }}
      </span>
    </UTooltip>

    <!-- Spacer -->
    <div class="flex-grow" />

    <!-- Actions -->
    <DetailPopover :entity="scene" />
    <button
      v-if="!scene.locked || isUnlocked"
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
const { isUnlocked } = useLocked()

const props = defineProps({
  scene: Object,
});

const { deleting, submitRemove } = useDeleteEntity('scene', () => props.scene);
</script>
