<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden h-full">
    <div class="flex flex-col md:flex-row">
      <div class="order-2 md:order-first md:w-48 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700">
        <CreateScenePane />
        <div class="flex md:flex-col overflow-x-auto md:overflow-x-visible">
          <button
            v-for="(scene, index) in sceneMixers"
            :key="scene.uid"
            @click="handleSceneClick(index)"
            class="whitespace-nowrap md:w-full text-left py-2 px-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none flex items-center gap-1.5"
            :class="[
              index === activeIndex ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold' : '',
              scene.uid === activeScene?.uid ? 'border-l-2 border-red-500' : 'border-l-2 border-transparent'
            ]"
          >
            <span v-if="scene.uid === activeScene?.uid" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span class="truncate">{{ scene.name }}</span>
            <kbd v-if="index < 9" class="ml-auto text-[10px] bg-gray-200 dark:bg-gray-600 px-1 rounded font-mono leading-relaxed">{{ index + 1 }}</kbd>
          </button>
        </div>
      </div>
      <div class="flex-grow min-w-0 order-1 md:order-last">
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
