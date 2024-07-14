<template>
  <div v-if="selectedScene" class="box-border p-4 border-4">
Active Scene <div v-if="activeScene" class="red">  {{ activeScene.name }}</div>


    <USelect v-model="switchmode" :options="switchemodes" class="px-4 py-24" />
    <div class="justify-center px-4 py-2">
      <div v-if="switchmode === 'Crossfade'">
        Nothing to see yet. Use Cut
        <!--
        <UButton color="white" trailing-icon="i-heroicons-minus" @click="duration.value--" />
        <UInput :modelValue="duration.value" color="white" variant="outline" class="max-w-24" />
        <UButton color="white" trailing-icon="i-heroicons-plus" @click="duration.value++" />
        -->
      </div>
      <UButton color="white" variant="solid" @click="cut">
        Switch to {{ selectedScene.name }}
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const switchemodes = ['Cut', 'Crossfade']
const switchmode = ref(switchemodes[0])
const duration = ref(2)

const { activeSceneUid, activeScene, selectedScene } = useActiveScene()

const cut = async () => {
  if (!selectedScene.value) {
    return
  }

  try {
    const response = await $fetch('/api/mixer/cut_program', {
      method: 'POST',
      body: JSON.stringify({
        src: selectedScene.value.uid
      })
    });

    if (response && response.src) {
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
</script>

<style scoped>
.red {
  color: red;
}
</style>
