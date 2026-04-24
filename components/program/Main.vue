<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden p-2 min-w-0">
    <ProgramHeader />
    <ProgramPlayer class="program-cap w-full" />
    <ProgramOverlays />
  </div>
</template>

<script setup>
</script>

<style scoped>
/* Cap program player height on 2xl+ screens so aspect-video doesn't balloon on ultrawide / 4K. */
@media (min-width: 1536px) {
  .program-cap :deep(.aspect-video) {
    max-height: 50vh;
    width: auto;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
