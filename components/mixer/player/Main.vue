<template>
  <div class="isolate">
    
      <MixerPlayerHeader   :mixer="mixer" />
      <VideoPlayer   v-if="mixerPreview || mixerEnabled" :uid="mixer.uid" />
      <UButton color="white"  trailing-icon="i-heroicons-plus-circle" @click="addPad"/>
      <div v-for="source in mixer.sources" :modelValue="source.src" :key="source.sink">
        <MixerPlayerInputs :source="source" :inputs="inputs" :mixer="mixer" v-if="!source.src_locked"/>
      </div>
  </div>
</template> 

<script setup>

import { computed } from "@vue/reactivity"


const props = defineProps({
  mixer: Object,
  inputs: Object
})

const addPad = async () => {
    const { data: responseData } = await useFetch('/api/mixer/add_pad', {
        method: 'post',
        body: { 
          uid: props.mixer.uid,
        }
    })
}

const mixer_type = ref(['mixer', 'dynamic', 'scene']); 


console.log(props.mixer)
const { mixerPreview } = useUserState()
const mixerEnabled = ref(false)
const uid = props.mixer.uid


</script>

<style>

</style>

