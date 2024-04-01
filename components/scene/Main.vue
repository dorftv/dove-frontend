<template>
  <div class="isolate">
    
      <SceneHeader   :scene="scene" />
      <VideoPlayer v-if="(mixerPreview || mixerEnabled) && active" :uid="scene.uid" />
      <UButton color="white"  trailing-icon="i-heroicons-plus-circle" @click="addPad"/>
      
      <div v-for="source in scene.sources" :modelValue="source.src" :key="source.sink">
        <SceneInputs :source="source"  :scene="scene" v-if="!source.src_locked"/>
      </div>
  </div>
</template> 

<script setup>

import { computed } from "@vue/reactivity"


const props = defineProps({
  scene: Object,
  inputs: Object,
  active: Boolean
})

const addPad = async () => {
    const { data: responseData } = await useFetch('/api/mixer/add_pad', {
        method: 'post',
        body: { 
          uid: props.scene.uid,
        }
    })
}

const { mixerPreview } = useUserState()
const mixerEnabled = ref(false)
const uid = props.scene.uid


</script>

<style>

</style>

