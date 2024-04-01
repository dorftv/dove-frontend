<template>
<div v-if="selectedScene" class="box-border  p-4 border-4">

<USelect v-model="switchmode" :options="switchemodes" class="px-4 py-24" />

<div class="justify-center px-4 py-2 ">
  <div v-if="switchmode === 'Crossfade'">
  <UButton  color="white"  trailing-icon="i-heroicons-minus" @click="duration = duration - 1"/>

  <UInput :modelValue="duration" color="white" variant="outline" class="max-w-24" />

  <UButton  color="white"  trailing-icon="i-heroicons-plus" @click="duration = duration + 1"/>
  </div>

  <UButton color="white" variant="solid" @click="cut">Switch to {{ selectedScene.name }}</UButton>

</div>

</div>
</template>

<script setup>
const { programMixer } = useEntities()

const switchemodes = ['Cut', 'Crossfade']
const switchmode = ref(switchemodes[0])

const duration = ref(2)
const { selectedScene  } = useActiveScene()

const cut = async () => {
  try {
    const responseData = await $fetch('/api/mixer/cut_program', {
      method: 'POST',
      body: JSON.stringify({
        src: selectedScene.value.uid
      })
    })

  } catch (error) {

    console.error('Error:', error)
  }
}

</script>

<style>

</style>