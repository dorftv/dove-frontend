<template>
  <div v-if="programMixer" class="w-full">
    <VideoPlayerMain :uid="programMixer.uid" class="max-w-full" />
  </div>
</template>

<script setup>

const { programMixer } = useEntities();
</script>

<style scoped>

</style>
