<template>
  <div class="col-span-8 grid grid-cols-8 gap-4">
    <div 
      class="col-span-3"
      v-for="scene in sceneMixers"
      :key="scene.uid"
    >
    
      <SceneMain 
        :scene="scene" 
      />
    </div>
  </div>

  <div class="grid col-span-3"> 
<!--     <MainOutputPlayer preview_uri="http://localhost:88/preview/playlist.m3u8" />-->
  </div>

  <div class="grid col-span-1">
    <OutputMain :outputs="outputs" />
  </div>

  <div class="grid col-span-8 grid-cols-8 gap-4 py-12">
    <div v-for="input in inputs" :key="input.uid" class="col-span-2">

      <InputMain :input="input" />
    </div>
  </div>

</template>

<script setup>

useHead({
  titleTemplate: (title) => `DOVE - Online Video Editor` 
})

const { inputs, sceneMixers, outputs } = useEntities();


</script>

<style scoped>
</style>