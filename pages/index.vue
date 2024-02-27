<template>
  <div class="col-span-8 grid grid-cols-8 gap-4">
    <div 
      class="col-span-3"
      v-for="mixer in filteredMixers"
      :key="mixer.uid"
    >
    
      <MixerPlayerMain 
        :mixer="mixer" 
        :inputs="inputs"
      />
    </div>
  </div>

  <div class="grid col-span-3"> 
<!--     <MainOutputPlayer preview_uri="http://localhost:88/preview/playlist.m3u8" />-->
  </div>

  <div class="grid col-span-1">
    <OutputMain :outputs="outputs" :mixers="mixers" />
  </div>

  <div class="grid col-span-8 grid-cols-8 gap-4 py-12">
    <div v-for="input in inputs" :key="input.uid" class="col-span-2">

      <Input :input="input" :mixers="filteredMixers"/>
    </div>
  </div>

</template>

<script setup>


const { inputs, mixers, outputs } = useEntities();

// split mixers 
const filteredMixers = computed(() => {
  return mixers.value.filter(mixer => mixer.type !== 'preview' && mixer.type !== 'program')
})

const outputMixers = computed(() => {
  return mixers.value.filter(mixer => mixer.type === 'preview' || mixer.type === 'program')
})


</script>

<style scoped>
</style>