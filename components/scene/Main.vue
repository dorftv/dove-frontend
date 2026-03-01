<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden h-full">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <CreateScenePane />
        <div class="flex md:flex-col overflow-x-auto md:overflow-x-visible">
          <button
            v-for="(scene, index) in sceneMixers"
            :key="scene.uid"
            @click="handleSceneClick(index)"
            class="whitespace-nowrap md:w-full text-left py-2 px-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium': index === activeIndex }"
          >
            {{ scene.name }}
          </button>
        </div>
      </div>
      <div class="flex-grow min-w-0">
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
const { activeIndex, handleSceneClick } = useActiveScene();
</script>
