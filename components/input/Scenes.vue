<template>
  <UButton  color="white"  trailing-icon="i-heroicons-adjustments-horizontal" @click="open = !open"/>

  <div v-for="scene in sceneMixers" v-if="open" :key="scene.uid" class="py-1">
    <div v-for="source in scene.sources" :key="source.id">
      <InputSceneSources :input="input" :scene="scene" :source="source" v-if="!source.src_locked  && selectedScene.uid === scene.uid"/>

    </div>      
  </div>    

</template>


<script setup>

const open = ref(false);

const { sceneMixers } = useEntities();
const { selectedScene  } = useActiveScene()

const props = defineProps({
  input: Object,
})

</script>

<style>
</style>