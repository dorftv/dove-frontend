<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden h-full">
    <div class="flex flex-col md:flex-row">
      <div class="md:order-first md:w-28 lg:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <CreateScenePane />
        <div ref="sceneTabsRef" class="flex md:flex-col overflow-x-auto md:overflow-x-visible">
          <button
            v-for="(scene, index) in orderedScenes"
            :key="scene.uid"
            @click="selectScene(scene)"
            class="whitespace-nowrap md:w-full text-left py-1.5 px-2 lg:py-2 lg:px-4 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none flex items-center gap-1.5"
            :class="[
              scene.uid === selectedScene?.uid ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold' : '',
              scene.uid === activeScene?.uid ? 'md:border-l-2 md:border-red-500' : 'md:border-l-2 md:border-transparent'
            ]"
          >
            <Icon name="ph:dots-six-vertical" size="12px" class="scene-drag-handle cursor-grab text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shrink-0" />
            <span v-if="scene.uid === activeScene?.uid" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span class="truncate">{{ scene.name }}</span>
            <kbd v-if="index < 9" class="ml-auto text-[10px] bg-gray-200 dark:bg-gray-600 px-1 rounded font-mono leading-relaxed hidden md:inline">{{ index + 1 }}</kbd>
          </button>
        </div>
      </div>
      <div class="flex-grow min-w-0">
        <SceneScenes
          v-if="selectedScene"
          :scene="selectedScene"
          :active="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sortable from 'sortablejs';

const { sceneMixers } = useEntities();
const { activeScene, handleSceneClick, selectedScene } = useActiveScene();
const { ordered: orderedScenes, saveOrder } = useEntityOrder('dove-scene-order', sceneMixers);

const selectScene = (scene) => {
  const realIndex = sceneMixers.value.indexOf(scene);
  if (realIndex >= 0) handleSceneClick(realIndex);
};

const sceneTabsRef = ref(null);
let sortableInstance = null;

onMounted(() => {
  if (sceneTabsRef.value) {
    sortableInstance = new Sortable(sceneTabsRef.value, {
      handle: '.scene-drag-handle',
      animation: 150,
      forceFallback: true,
      fallbackTolerance: 3,
      ghostClass: 'scene-drag-ghost',
      onEnd: (evt) => {
        if (evt.oldIndex === evt.newIndex) return;
        const scenes = [...orderedScenes.value];
        const [moved] = scenes.splice(evt.oldIndex, 1);
        scenes.splice(evt.newIndex, 0, moved);
        saveOrder(scenes);
      },
    });
  }
});
</script>

<style scoped>
.scene-drag-ghost {
  opacity: 0.4;
}
</style>
