<template>
  <div class="flex flex-col p-2" v-if="scene">
    <SceneHeader :scene="scene" />
    <div v-if="mixerPreview || mixerEnabled" class="w-full aspect-video">
      <VideoPlayerMain :uid="scene.uid" class="w-full h-full" />
    </div>
    <div class="border-t border-gray-200 dark:border-gray-700">
      <button @click="slotsOpen = !slotsOpen" class="flex items-center gap-1.5 w-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
        <i class="pi text-[10px]" :class="slotsOpen ? 'pi-chevron-down' : 'pi-chevron-right'" />
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
        <div v-if="!scene.src_locked || isUnlocked" class="px-3 py-1.5">
          <button @click="addSlot" :disabled="addingSlot" class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer disabled:opacity-50">
            <i :class="addingSlot ? 'pi pi-spinner pi-spin' : 'pi pi-plus'" class="text-[10px]"></i>
            Add Slot
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

const notify = useNotify();
const { mixerPreview } = useUserState();
const mixerEnabled = ref(false);
const slotsOpen = ref(true);
const addingSlot = ref(false);

const addSlot = async () => {
  addingSlot.value = true;
  try {
    await $fetch('/api/mixer/add_slot', {
      method: 'POST',
      body: { uid: props.scene.uid },
    });
  } catch (error) {
    notify.error('Failed to add slot');
  } finally {
    addingSlot.value = false;
  }
};
</script>
