<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-3 h-full flex flex-col items-center justify-center gap-3">
    <template v-if="selectedScene">
      <!-- Active indicator -->
      <div class="text-sm text-gray-600 dark:text-gray-400 text-center">
        Active: <span v-if="activeScene" class="text-red-500 dark:text-red-400 font-semibold">{{ activeScene.name }}</span>
        <span v-else class="italic">None</span>
      </div>

      <!-- Transition mode -->
      <SelectButton v-model="transition" :options="transitionOptions" optionLabel="label" optionValue="value" />

      <!-- Duration -->
      <div v-if="transition === 'fade'" class="w-full max-w-48">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-gray-500 dark:text-gray-400">Duration</span>
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300 tabular-nums">{{ (transitionDuration / 1000).toFixed(1) }}s</span>
        </div>
        <Slider v-model="transitionDuration" :min="100" :max="5000" :step="100" class="w-full slim-slider-accent" aria-label="Crossfade duration" />
      </div>

      <!-- Take button -->
      <Button @click="cutSceneToProgram" :disabled="cutting || selectedScene.uid === activeScene?.uid" class="!px-8 !py-3" :severity="transition === 'fade' ? 'warn' : 'danger'">
        <i v-if="cutting" class="pi pi-spinner pi-spin mr-2 text-sm" />
        <span class="font-bold uppercase tracking-wider">{{ transition === 'fade' ? 'Auto' : 'Cut' }}</span>
        <kbd class="ml-3 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Enter</kbd>
      </Button>

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
