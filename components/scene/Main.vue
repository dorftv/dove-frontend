<template>
  <div class="col-span-5">
    <div class="flex">
      <div class="w-48 border-r border-gray-200">
        <CreateScenePane />
        <button
          v-for="(scene, index) in sceneMixers"
          :key="scene.uid"
          @click="handleSceneClick(index)"
          class="w-full text-left py-2 px-4 hover:bg-gray-100 focus:outline-none"
          :class="{ 'bg-blue-100': index === activeIndex }"
        >
          {{ scene.name }}
        </button>
      </div>
      <div class="flex-grow">
        <SceneScenes
          v-if="sceneMixers[activeIndex]"
          :scene="sceneMixers[activeIndex]"
          :active="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>


const { sceneMixers } = useEntities();
const { activeIndex, handleSceneClick, selectedScene  } = useActiveScene();
</script>
