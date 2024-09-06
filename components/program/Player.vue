<template>
  <div v-if="programMixer">
    <div v-if="activeScene">
    </div>
    <UPopover :popper="{ arrow: true }">
    <UButton color="white" label="Details" trailing-icon="heroicons-information-circle-20-solid" />
    <template #panel>
      <div class="p-4">
        {{ programMixer}}
      </div>
    </template>
  </UPopover>
    <VideoPlayer :uid=" programMixer.uid" />
  </div>


</template>

<script setup>



const { programMixer } = useEntities()
const { activeScene } = useActiveScene()

</script>

<style scoped>

</style>
