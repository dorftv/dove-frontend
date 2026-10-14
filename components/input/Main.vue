<template>
  <div>
    <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden p-2">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <CreateInputPane />
        </div>
        <USlider v-model="inputSize" :min="160" :max="800" :step="10" class="w-20" size="xs" />
      </div>
      <div ref="inputGridRef" class="input-grid gap-3" :style="{ '--input-size': inputSize + 'px' }">
        <div v-for="input in orderedInputs" :key="input.uid" class="flex flex-col rounded-lg overflow-hidden h-full">
          <InputHeader
            :input="input"
            :inputEnabled="isInputEnabled(input.uid)"
            @enablePreview="toggleInputEnabled(input.uid)"
          />
          <!-- v-if (not v-show): a hidden preview must not keep a WHEP session open -->
          <div v-if="shouldShowPreview(input.uid) && input.preview" class="flex">
            <!-- A live input whose stream is away: say so, instead of an empty picture or meters -->
            <div v-if="input.is_live && input.state === 'CONNECTING'" class="stream-away flex-grow min-w-0">
              <Icon name="ph:plugs" size="22px" class="text-orange-400 animate-pulse" />
              <span class="text-orange-400 text-xs font-medium animate-pulse">{{ input.stats?.dropouts ? 'Stream lost, reconnecting…' : 'Waiting for the stream…' }}</span>
            </div>
            <VideoPlayerMain v-else-if="input.has_video !== false" :uid="input.uid" class="flex-grow min-w-0" />
            <AudioOnlyPlayer v-else :uid="input.uid" class="flex-grow min-w-0" />
            <AudioMeter v-if="audioMeters && input.has_audio !== false && !(input.is_live && input.state === 'CONNECTING')" :uid="input.uid" />
          </div>
          <InputControls :input="input" :state="input.state" :uid="input.uid" />
          <InputScenes :input="input" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sortable from 'sortablejs';
import { useLocalStorage } from '@vueuse/core';

const { inputsPreview } = useEntities();
const inputSize = useLocalStorage('dove-input-size', 320);
const {
  isInputEnabled,
  toggleInputEnabled,
  shouldShowPreview
} = usePreviewEnabled();
const { audioMeters } = useUserState();
const { ordered: orderedInputs, saveOrder } = useEntityOrder('dove-input-order', inputsPreview);

const inputGridRef = ref(null);
let sortableInstance = null;

onMounted(() => {
  if (inputGridRef.value) {
    sortableInstance = new Sortable(inputGridRef.value, {
      animation: 150,
      ghostClass: 'input-drag-ghost',
      onEnd: (evt) => {
        if (evt.oldIndex === evt.newIndex) return;
        const items = [...orderedInputs.value];
        const [moved] = items.splice(evt.oldIndex, 1);
        items.splice(evt.newIndex, 0, moved);
        saveOrder(items);
      },
    });
  }
});
onUnmounted(() => { if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } });
</script>

<style scoped>
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--input-size, 320px), 1fr));
}

.input-drag-ghost {
  opacity: 0.4;
}

.stream-away {
  aspect-ratio: 16/9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgb(17 24 39 / 0.8);
}
</style>
