<template>
  <div class="flex flex-col gap-2">
    <!-- Selected scene preview -->
    <div v-if="selectedScene" class="aspect-video bg-black rounded-lg overflow-hidden">
      <VideoPlayerMain :uid="selectedScene.uid" class="w-full h-full" />
    </div>

    <!-- Horizontal scene strip -->
    <div class="flex gap-1.5 overflow-x-auto py-1 px-0.5 -mx-0.5">
      <button
        v-for="scene in orderedScenes"
        :key="scene.uid"
        @click="selectScene(scene)"
        class="relative shrink-0 rounded-lg overflow-hidden border-2 transition-colors"
        :class="scene.uid === selectedScene?.uid
          ? 'border-blue-400'
          : 'border-gray-600 hover:border-gray-500'"
        style="width: 100px"
      >
        <div class="aspect-video bg-black">
          <VideoPlayerMain :uid="scene.uid" class="w-full h-full" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end px-1.5 py-0.5">
          <div class="flex items-center gap-1 min-w-0">
            <span v-if="scene.uid === activeScene?.uid" class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
            <span class="text-[10px] text-white truncate">{{ scene.name }}</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
const { sceneMixers } = useEntities();
const { activeScene, handleSceneClick, selectedScene } = useActiveScene();
const { ordered: orderedScenes } = useEntityOrder('dove-scene-order', sceneMixers);

const selectScene = (scene) => {
  const realIndex = sceneMixers.value.findIndex(s => s.uid === scene.uid);
  if (realIndex >= 0) handleSceneClick(realIndex);
};
</script>
