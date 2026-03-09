<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden h-full">
    <div class="flex flex-col md:flex-row">
      <div class="md:order-first md:w-28 lg:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <CreateScenePane />
        <div class="flex md:flex-col overflow-x-auto md:overflow-x-visible">
          <button
            v-for="(scene, index) in sceneMixers"
            :key="scene.uid"
            @click="handleSceneClick(index)"
            class="whitespace-nowrap md:w-full text-left py-1.5 px-2 lg:py-2 lg:px-4 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none flex items-center gap-1.5"
            :class="[
              index === activeIndex ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold' : '',
              scene.uid === activeScene?.uid ? 'md:border-l-2 md:border-red-500' : 'md:border-l-2 md:border-transparent'
            ]"
          >
            <span v-if="scene.uid === activeScene?.uid" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span class="truncate">{{ scene.name }}</span>
            <kbd v-if="index < 9" class="ml-auto text-[10px] bg-gray-200 dark:bg-gray-600 px-1 rounded font-mono leading-relaxed hidden md:inline">{{ index + 1 }}</kbd>
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
const { activeIndex, activeScene, handleSceneClick } = useActiveScene();
</script>
