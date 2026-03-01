<template>
  <div class="flex flex-col p-2" v-if="scene">
    <SceneHeader :scene="scene" />
    <div v-if="mixerPreview || mixerEnabled" class="w-full aspect-video">
      <VideoPlayerMain :uid="scene.uid" class="w-full h-full" />
    </div>
    <div class="border-t border-gray-200 dark:border-gray-700">
      <div
        v-for="(source, i) in [...scene.sources].reverse()"
        :key="source.sink"
        :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-800/30'"
        class="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
      >
        <SceneInputs :source="source" :scene="scene" />
      </div>
      <div v-if="!scene.src_locked || isUnlocked" class="px-3 py-1.5">
        <button @click="addSlot" class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
          <i class="pi pi-plus text-[10px]"></i>
          Add Slot
        </button>
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

const { mixerPreview } = useUserState();
const mixerEnabled = ref(false);

const addSlot = async () => {
  try {
    await $fetch('/api/mixer/add_slot', {
      method: 'POST',
      body: { uid: props.scene.uid },
    });
  } catch (error) {
    console.error('Failed to add slot:', error);
  }
};
</script>
