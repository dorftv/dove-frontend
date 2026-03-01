<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-4 h-full flex flex-col">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mixer</h3>

    <template v-if="selectedScene">
      <div class="mb-3 text-sm text-gray-600 dark:text-gray-400">
        Active: <span v-if="activeScene" class="text-red-500 dark:text-red-400 font-semibold">{{ activeScene.name }}</span>
        <span v-else class="italic">None</span>
      </div>

      <Select v-model="switchmode" :options="switchemodes" optionLabel="name" class="w-full mb-3" />

      <div v-if="switchmode?.value === 'Crossfade'" class="mb-3 text-xs text-gray-500 dark:text-gray-400 italic">
        Not available yet. Use Cut.
      </div>

      <div class="mt-auto">
        <Button @click="cutSceneToProgram" class="w-full" severity="success">
          <Icon name="ph:arrow-right" size="14px" class="mr-1" />
          {{ selectedScene.name }}
        </Button>
      </div>
    </template>

    <div v-else class="flex-grow flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 italic">
      Select a scene
    </div>
  </div>
</template>

<script setup>
const switchemodes = [
  { name: 'Cut', value: 'Cut' },
  { name: 'Crossfade', value: 'Crossfade' }
];
const switchmode = ref(switchemodes[0]);

const { activeScene, selectedScene, cutSceneToProgram } = useActiveScene()
</script>
