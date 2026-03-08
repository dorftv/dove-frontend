<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden p-3 h-full flex flex-col items-center justify-center gap-3">
    <template v-if="selectedScene">
      <!-- Active indicator -->
      <div class="text-sm text-gray-600 dark:text-gray-400 text-center">
        Active: <span v-if="activeScene" class="text-red-500 dark:text-red-400 font-semibold">{{ activeScene.name }}</span>
        <span v-else class="italic">None</span>
      </div>

      <!-- Transition mode -->
      <UButtonGroup>
        <UButton
          v-for="opt in transitionOptions"
          :key="opt.value"
          :label="opt.label"
          :color="transition === opt.value ? 'primary' : 'neutral'"
          :variant="transition === opt.value ? 'solid' : 'outline'"
          size="sm"
          @click="transition = opt.value"
        />
      </UButtonGroup>

      <!-- Duration -->
      <div v-if="transition === 'fade'" class="w-full max-w-48">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-gray-500 dark:text-gray-400">Duration</span>
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300 tabular-nums">{{ (transitionDuration / 1000).toFixed(1) }}s</span>
        </div>
        <USlider v-model="transitionDuration" :min="100" :max="5000" :step="100" class="w-full" size="xs" aria-label="Crossfade duration" />
      </div>

      <!-- Take button -->
      <UButton @click="cutSceneToProgram" :disabled="cutting || selectedScene.uid === activeScene?.uid" class="!px-8 !py-3" :color="transition === 'fade' ? 'warning' : 'error'">
        <Icon v-if="cutting" name="ph:spinner" size="14px" class="animate-spin mr-2" />
        <span class="font-bold uppercase tracking-wider">{{ transition === 'fade' ? 'Auto' : 'Cut' }}</span>
        <kbd class="ml-3 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Enter</kbd>
      </UButton>

      <!-- Preview label -->
      <div class="text-xs text-gray-500 dark:text-gray-400">
        Next: <span class="text-gray-700 dark:text-gray-200 font-medium">{{ selectedScene.name }}</span>
      </div>
    </template>

    <div v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
      Select a scene
    </div>
  </div>
</template>

<script setup>
const transitionOptions = [
  { label: 'Cut', value: 'cut' },
  { label: 'Crossfade', value: 'fade' },
];

const { activeScene, selectedScene, cutting, transition, transitionDuration, cutSceneToProgram } = useActiveScene();
</script>
