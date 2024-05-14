<template>
<div class="isolate grid grid-cols-6">
<div class="col-span-2 px-4">
  <ProgramSwitch />
</div>
<div class="col-span-4">
  Program
{{ activeScene }}

  <ProgramPlayer />
</div>
</div>
</template>

<script setup>
  const { activeScene, onSceneChange } = useActiveScene()
</script>

<style>

</style>