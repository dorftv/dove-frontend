<template>
  <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500">
    <Icon name="ph:spinner" size="32px" class="animate-spin" />
    <span class="mt-2 text-sm">Loading...</span>
  </div>

  <div v-else class="grid grid-cols-12 gap-4 px-4 py-4">
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <SceneMain />
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-2">
      <ProgramSwitch />
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <ProgramMain />
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-2">
      <OutputMain />
    </div>

    <div class="col-span-12">
      <InputMain />
    </div>
  </div>
</template>

<script setup>
const { isLoading } = useEntities();
useKeyboardShortcuts();
</script>
