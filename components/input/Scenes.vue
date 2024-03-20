<template>
  <div v-for="scene in sceneMixers" :key="scene.uid" class="py-1">
    <div v-for="source in scene.sources" :key="source.id">
      <InputSceneSources :input="input" :scene="scene" :source="source" v-if="!source.src_locked"/>
    </div>      
  </div>    
</template>


<script setup>
const { sceneMixers } = useEntities();

const props = defineProps({
  input: Object,
})

</script>

<style>
</style>