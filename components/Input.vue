<template>
  <div class="">
      <InputHeader   :input="input" />
      <VideoPlayer muted="true"  v-if="inputPreview || inputEnabled" :uid="input.uid" />
      <InputControls :state="input.state" :uid="input.uid"  :input="input" :inputEnabled="inputEnabled" @enablePreview="(preview) => inputEnabled = preview" />
      <InputMixer :input="input" :mixers="mixers" />
</div>
</template>

<script setup>

import { computed } from "@vue/reactivity"
//<CreateInputUri :isOpen="isOpen" @close="(closing) => isOpen = closing" /> 

const props = defineProps({
  input: Object,
  mixers: Object,
})

//const { mixers } = useEntities();

const { inputPreview } = useUserState()

const inputEnabled = ref(false)

//const mixer_type = ref(['mixer', 'dynamic', 'scene'])
const isMixerType = (mixer, type) => {
  return mixer.type === type
}



</script>

<style>

</style>

