<template>
  <div class="flex items-center gap-3 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
    <span class="text-xs text-gray-400 dark:text-gray-500 w-8 shrink-0">{{ source.name }}</span>
    <span
      class="truncate flex-grow text-sm"
      :class="isInSceneSources
        ? 'text-blue-600 dark:text-blue-400 font-medium'
        : inputName
          ? 'text-gray-800 dark:text-gray-200'
          : 'text-gray-400 dark:text-gray-500 italic'"
    >
      {{ inputName || 'Empty' }}
    </span>
    <div class="flex items-center gap-0.5 shrink-0">
      <template v-if="!source.src_locked || isUnlocked">
        <button
          v-if="!isInSceneSources"
          @click="submitAddInputToScene"
          class="icon-btn w-8 h-8 md:w-6 md:h-6 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
          title="Assign to slot"
          aria-label="Assign to slot"
        >
          <Icon name="ph:plus-circle" size="14px" />
        </button>
        <button
          v-else
          @click="submitRemoveInputFromScene"
          class="icon-btn w-8 h-8 md:w-6 md:h-6 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
          title="Remove from slot"
          aria-label="Remove from slot"
        >
          <Icon name="ph:minus-circle" size="14px" />
        </button>
      </template>
      <span v-else class="w-7 h-7 md:w-5 md:h-5 flex items-center justify-center opacity-40" title="Locked">
        <Icon name="ph:lock" size="11px" />
      </span>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()

const props = defineProps({
  input: Object,
  scene: Object,
  source: Object
})

const {
  inputName,
  isInSceneSources,
  submitAddInputToScene,
  submitRemoveInputFromScene
} = useInputControls(props);
</script>
