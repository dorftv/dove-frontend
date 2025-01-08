<template>
  <div v-for="scene in sceneMixers" :key="scene.uid" class="py-1">
      <div v-if="selectedScene.uid === scene.uid">{{ scene.name }} </div>

      <div v-for="source in [...scene.sources].reverse()" :key="source.id">
        <InputSceneSources
          :input="input"
          :scene="scene"
          :source="source"
          v-if="selectedScene.uid === scene.uid"
        />
    </div>
  </div>
</template>

<script setup>

const open = ref(false);

const { sceneMixers } = useEntities();
const { selectedScene } = useActiveScene();

const props = defineProps({
  input: Object,
});
</script>

<style scoped>
</style>
