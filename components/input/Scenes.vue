<template>
  <UButton  color="white"  trailing-icon="heroicons-adjustments-horizontal" @click="open = !open"/>

  <div v-for="scene in sceneMixers" :key="scene.uid" class="py-1">
    <div  v-if="open">
      <div v-for="source in scene.sources" :key="source.id">
        <InputSceneSources :input="input" :scene="scene" :source="source" v-if="!source.src_locked  && selectedScene.uid === scene.uid"/>
      </div>
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