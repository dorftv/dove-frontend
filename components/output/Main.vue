<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-4 h-full">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Outputs</h3>
    <CreateOutputPane />
    <Output v-for="output in outputs" :key="output.uid" :output="output" />
  </div>
</template>

<script setup>
const { outputs } = useEntities();
</script>
