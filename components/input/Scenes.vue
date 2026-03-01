<template>
  <div v-for="scene in sceneMixers" :key="scene.uid" class="py-1">
    <div v-if="selectedScene.uid === scene.uid" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ scene.name }}</div>

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
const { sceneMixers } = useEntities();
const { selectedScene } = useActiveScene();

const props = defineProps({
  input: Object,
});
</script>
