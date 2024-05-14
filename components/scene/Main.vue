<template>
  <div class="isolate">

      <SceneHeader   :scene="scene" />
      <VideoPlayer v-if="(mixerPreview || mixerEnabled)" :uid="scene.uid" />
      <UButton v-if="!scene.src_locked" color="white"  trailing-icon="i-heroicons-plus-circle" @click="addSlot"/>

      <div v-for="source in scene.sources" :modelValue="source.src" :key="source.sink">
        <SceneInputs :source="source"  :scene="scene" />
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

const addSlot = async () => {
    const { data: responseData } = await useFetch('/api/mixer/add_slot', {
        method: 'post',
        body: {
          uid: props.scene.uid,
 //         slot: {name: 'xxx', mute: true}
        }
    })
}

const { mixerPreview } = useUserState()
const mixerEnabled = ref(false)
const uid = props.scene.uid


</script>

<style>

</style>

