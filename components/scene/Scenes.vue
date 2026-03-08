<template>
  <div class="flex flex-col p-2" v-if="scene">
    <SceneHeader :scene="scene" />
    <div v-if="mixerPreview || mixerEnabled" class="flex">
      <div class="flex-grow min-w-0 aspect-video">
        <VideoPlayerMain :uid="scene.uid" class="w-full h-full" />
      </div>
      <AudioMeter v-if="audioMeters" :uid="scene.uid" />
    </div>
    <div class="border-t border-gray-200 dark:border-gray-700">
      <button @click="slotsOpen = !slotsOpen" class="flex items-center gap-1.5 w-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
        <Icon :name="slotsOpen ? 'ph:caret-down' : 'ph:caret-right'" size="10px" />
        <span>Slots</span>
        <span class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] px-1.5 rounded-full font-mono">{{ scene.sources?.length || 0 }}</span>
      </button>
      <div v-show="slotsOpen">
        <div
          v-for="(source, i) in [...scene.sources].reverse()"
          :key="source.index"
          :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-800/30'"
          class="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
        >
          <SceneInputs :source="source" :scene="scene" />
        </div>
        <div
          v-if="!scene.src_locked || isUnlocked"
          class="px-3 py-1.5 transition-colors duration-100"
          :class="{ 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-inset ring-blue-400': dropOver }"
          @dragover.prevent
          @dragenter.prevent="dragCount++; dropOver = true"
          @dragleave="dragCount--; if (dragCount <= 0) { dropOver = false; dragCount = 0 }"
          @drop="onDropAdd"
        >
          <button @click="addSlot()" :disabled="addingSlot" class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer disabled:opacity-50">
            <Icon :name="addingSlot ? 'ph:spinner' : 'ph:plus'" size="10px" :class="{ 'animate-spin': addingSlot }" />
            {{ dropOver ? 'Drop to add slot' : 'Add Slot' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()

const props = defineProps({
  scene: Object,
  inputs: Object,
  active: Boolean
});

const { mixerPreview, audioMeters } = useUserState();
const mixerEnabled = ref(false);
const slotsOpen = ref(true);
const { addingSlot, dropOver, dragCount, addSlot, onDropAdd } = useSceneSlots(() => props.scene);
</script>
