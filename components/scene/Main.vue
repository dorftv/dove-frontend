<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden h-full">

    <!-- ── Tab view ── -->
    <div v-if="viewMode === 'tabs'" class="flex flex-col md:flex-row">
      <div class="md:order-first md:w-28 lg:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-2 py-1">
          <CreateScenePane />
          <button @click="viewMode = 'grid'" class="view-toggle-btn" title="Grid view">
            <Icon name="ph:grid-four" size="14px" />
          </button>
        </div>
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
      <div class="flex-grow min-w-0 overflow-y-auto max-h-[50vh]">
        <SceneScenes v-if="selectedScene" :scene="selectedScene" :active="true" />
      </div>
    </div>

    <!-- ── Grid view ── -->
    <div v-else class="flex flex-col">
      <div class="flex items-center gap-2 px-2 py-1 border-b border-gray-200 dark:border-gray-700">
        <CreateScenePane />
        <button @click="viewMode = 'tabs'" class="view-toggle-btn" title="Tab view">
          <Icon name="ph:rows" size="14px" />
        </button>
        <div class="flex-grow" />
        <USlider v-model="previewSize" :min="100" :max="400" :step="10" class="w-20" size="xs" />
      </div>

      <!-- Compact scene preview grid -->
      <div class="scene-grid gap-1 p-1" :style="{ '--preview-size': previewSize + 'px' }">
        <button
          v-for="(scene, index) in orderedScenes"
          :key="scene.uid"
          @click="selectScene(scene)"
          class="relative rounded overflow-hidden cursor-pointer border-2 transition-colors"
          :class="[
            scene.uid === selectedScene?.uid ? 'border-blue-400 border-3' : 'border-transparent hover:border-gray-400 dark:hover:border-gray-600'
          ]"
        >
          <div class="aspect-video bg-black">
            <VideoPlayerMain :uid="scene.uid" class="w-full h-full" />
          </div>
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-0.5">
            <div class="flex items-center gap-1">
              <span v-if="scene.uid === activeScene?.uid" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span class="text-[10px] text-white truncate">{{ scene.name }}</span>
              <kbd v-if="index < 9" class="ml-auto text-[9px] bg-white/20 text-white px-1 rounded font-mono">{{ index + 1 }}</kbd>
            </div>
          </div>
        </button>
      </div>

      <!-- Selected scene expanded below (no preview — already in grid) -->
      <div v-if="selectedScene" class="border-t border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[50vh]">
        <SceneScenes :scene="selectedScene" :active="true" :hidePreview="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sortable from 'sortablejs';
import { useLocalStorage } from '@vueuse/core';

const { sceneMixers } = useEntities();
const { activeScene, handleSceneClick, selectedScene } = useActiveScene();
const { ordered: orderedScenes, saveOrder } = useEntityOrder('dove-scene-order', sceneMixers);

const viewMode = useLocalStorage('dove-scene-view', 'tabs');
const previewSize = useLocalStorage('dove-scene-preview-size', 180);

const selectScene = (scene) => {
  const realIndex = sceneMixers.value.findIndex(s => s.uid === scene.uid);
  if (realIndex >= 0) handleSceneClick(realIndex);
};

// Tab view: drag reorder
const sceneTabsRef = ref(null);
let sortableInstance = null;

function initTabSortable() {
  if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; }
  if (!sceneTabsRef.value) return;
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

onMounted(() => { if (sceneTabsRef.value) initTabSortable(); });
onUnmounted(() => { if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } });
watch(viewMode, (mode) => {
  if (mode === 'tabs') nextTick(() => initTabSortable());
});
</script>

<style scoped>
@reference "tailwindcss";

.scene-drag-ghost {
  opacity: 0.4;
}
.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--preview-size, 180px), 1fr));
}
.view-toggle-btn {
  @apply flex items-center justify-center w-6 h-6 rounded
         text-gray-400 dark:text-gray-500
         hover:bg-gray-200 dark:hover:bg-gray-700
         hover:text-gray-700 dark:hover:text-gray-200
         transition-colors cursor-pointer;
}
</style>
