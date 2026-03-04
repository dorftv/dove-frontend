<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 flex items-center gap-1.5 text-xs">
    <!-- Name -->
    <span
      v-tooltip="`${scene.width}x${scene.height} · ${scene.sources?.length || 0} slots`"
      class="truncate cursor-help text-sm text-gray-800 dark:text-gray-200 font-medium"
    >
      {{ scene.name }}
    </span>

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
      <i :class="deleting ? 'pi pi-spinner pi-spin' : 'pi pi-trash'" class="text-[11px]"></i>
    </button>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()

const props = defineProps({
  scene: Object,
});

const { deleting, submitRemove } = useDeleteEntity('scene', () => props.scene);
</script>
