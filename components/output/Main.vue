<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-2 h-full">
    <CreateOutputPane />
    <Output v-for="output in outputs" :key="output.uid" :output="output" />
  </div>
</template>

<script setup>
const { outputs } = useEntities();
</script>
