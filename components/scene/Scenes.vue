<template>
  <div class="flex flex-col p-2" v-if="scene">
    <SceneHeader :scene="scene" />
    <div v-if="!hidePreview" class="flex">
      <div class="flex-grow min-w-0 aspect-video">
        <VideoPlayerMain :uid="scene.uid" class="w-full h-full" />
      </div>
      <AudioMeter v-if="audioMeters" :uid="scene.uid" />
    </div>
    <div class="border-t border-gray-200 dark:border-gray-700">
      <div ref="slotsContainer">
        <div
          v-for="(source, i) in reversedSources"
          :key="`${scene.uid}:${source.index}`"
          :data-index="source.index"
          :class="i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800'"
          class="border-b border-gray-200 dark:border-gray-600 last:border-b-0 flex items-center"
        >
          <div
            v-if="canReorderSlots"
            class="slot-drag-handle flex items-center justify-center px-1 self-stretch cursor-grab text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <Icon name="ph:dots-six-vertical" size="12px" />
          </div>
          <div class="flex-grow min-w-0">
            <SceneInputs :source="source" :scene="scene" />
          </div>
        </div>
      </div>
      <div
        v-if="canSupervisor && ((!scene.src_locked && !scene.locked) || canBypassLock)"
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
</template>

<script setup>
import { useSortable } from '@vueuse/integrations/useSortable'

const { canSupervisor, canBypassLock } = useAuth()

const props = defineProps({
  scene: Object,
  inputs: Object,
  active: Boolean,
  hidePreview: Boolean,
});

const { audioMeters } = useUserState();
const { updateEntity } = useEntities();
const { addingSlot, dropOver, dragCount, addSlot, onDropAdd } = useSceneSlots(() => props.scene);

const canReorderSlots = computed(() =>
  canSupervisor.value && ((!props.scene?.src_locked && !props.scene?.locked) || canBypassLock.value)
);

// Sorted by z-order descending: highest z-order first (visual top = highest layer)
const reversedSources = computed(() =>
  [...(props.scene?.sources || [])].sort((a, b) => (b.zorder ?? 0) - (a.zorder ?? 0))
);

const slotsContainer = ref(null);

useSortable(slotsContainer, [], {
  handle: '.slot-drag-handle',
  animation: 150,
  ghostClass: 'slot-drag-ghost',
  dragClass: 'slot-drag-active',
  onEnd: (evt) => {
    if (evt.oldIndex === evt.newIndex) return;
    // reversedSources is displayed highest-zorder-first.
    // After drag, recalculate zorder so that visual position 0 = highest zorder.
    const displayOrder = [...(props.scene?.sources || [])].sort((a, b) => (b.zorder ?? 0) - (a.zorder ?? 0));
    const [moved] = displayOrder.splice(evt.oldIndex, 1);
    displayOrder.splice(evt.newIndex, 0, moved);
    // Assign zorder: first in display = highest zorder, last = lowest
    const count = displayOrder.length;
    displayOrder.forEach((source, displayIdx) => {
      const newZorder = count - displayIdx + 1; // +1 to keep zorder >= 2
      if (source.zorder !== newZorder) {
        updateEntity('mixer', {
          uid: props.scene.uid,
          index: source.index,
          zorder: newZorder,
        });
      }
    });
  },
});
</script>

<style scoped>
.slot-drag-ghost {
  opacity: 0.4;
}
.slot-drag-active {
  opacity: 0.8;
}
</style>
