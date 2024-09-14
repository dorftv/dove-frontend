<template>
<div>
  <CreateOutputPane />

  <Output v-for="output in outputs" :key="output.uid" :output="output"/>
</div>
</template>

<script setup>
const { outputs } = useEntities();

</script>

<style>

</style>