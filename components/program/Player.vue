<template>
  <div v-if="programMixer">
    <div v-if="activeScene">
    {{ activeScene.name }}
    </div>
    <VideoPlayer :uid=" programMixer.uid" />
  </div>


</template>

<script setup>


const { programMixer } = useEntities()
const { activeScene } = useActiveScene()
</script>

<style scoped>

</style>
