<template>
  <div class="w-full flex flex-col text-sm text-gray-700 dark:text-gray-300">
    <div
      class="flex items-center gap-3 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      :class="{ 'ring-2 ring-inset ring-blue-400': dragOver }"
      @dragover.prevent
      @dragenter.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop="onDrop"
    >
      <span class="text-xs text-gray-400 dark:text-gray-500 w-8 shrink-0">{{ source.name }}</span>
      <span class="truncate flex-grow" :class="inputMatch ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 italic'">
        {{ inputMatch ? inputMatch.name : 'Empty' }}
      </span>
      <div class="flex items-center gap-0.5 shrink-0">
        <!-- Volume: mute icon + slider -->
        <template v-if="!scene.src_locked || isUnlocked">
          <button @click="toggleMute" class="slot-btn" :class="{ 'text-orange-500 dark:text-orange-400': mute }" :title="mute ? 'Unmute' : 'Mute'" :aria-label="mute ? 'Unmute' : 'Mute'">
            <Icon :name="volumeIcon" size="14px" />
          </button>
          <span :title="volume + '%'">
            <Slider
              :modelValue="volume"
              @update:modelValue="handleChange('volume', $event)"
              :min="0"
              :max="150"
              class="w-24 slot-volume-slider"
              aria-label="Volume"
            />
          </span>
        </template>
        <button v-if="(!source.locked && !scene.src_locked) || isUnlocked" @click="open = !open" class="slot-btn" :class="{ 'text-blue-500 dark:text-blue-400': open }" title="Settings" aria-label="Settings">
          <i class="pi pi-cog text-[11px]"></i>
        </button>
        <span v-if="(source.locked || scene.src_locked) && !isUnlocked" class="slot-btn opacity-40" title="Locked">
          <i class="pi pi-lock text-[11px]"></i>
        </span>
      </div>
    </div>
    <div v-if="open" class="px-3 pb-2 bg-blue-50/50 dark:bg-blue-900/10">
      <div class="flex items-center mb-1 mt-1">
        <span class="w-16 text-xs text-gray-600 dark:text-gray-400">src</span>
        <Select
          class="flex-grow"
          :options="inputs"
          optionLabel="name"
          optionValue="uid"
          :modelValue="src"
          @update:modelValue="(val) => handleChange('src', val)"
          placeholder="Select input"
          size="small"
        />
      </div>
      <button @click="doRemoveSlot" class="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-1 cursor-pointer">
        <i class="pi pi-minus-circle text-[11px]"></i>
        Remove Slot
      </button>
      <div v-for="(value, key) in { alpha, width, height, xpos, ypos }" :key="key" class="flex items-center mb-1">
        <div v-if="getMax(key)" class="flex w-full">
          <span class="w-16 text-xs text-gray-600 dark:text-gray-400">{{ key }}</span>
          <Slider
            class="flex-grow mx-2"
            :modelValue="value"
            @update:modelValue="handleChange(key, $event)"
            :step="1"
            :min="0"
            :max="getMax(key)"
          />
          <span class="w-16 text-right text-xs text-gray-600 dark:text-gray-400">{{ value }}/{{ getMax(key) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()

const props = defineProps({
  source: Object,
  scene: Object,
});

const emit = defineEmits(['close']);

const { inputs, removeSlot, handleChange, getMax, src, alpha, width, height, xpos, ypos, volume, mute } = useSceneSources(props.scene, props.source);

const inputMatch = computed(() => inputs.value.find(input => input.uid === src.value));
const open = ref(false);
const dragOver = ref(false);
const previousVolume = ref(volume.value || 100);

const toggleMute = () => {
  if (mute.value) {
    handleChange('mute', false);
  } else {
    handleChange('mute', true);
  }
};

const volumeIcon = computed(() => {
  if (mute.value || volume.value === 0) return 'ph:speaker-x';
  if (volume.value < 75) return 'ph:speaker-low';
  return 'ph:speaker-high';
});

const doRemoveSlot = () => {
  open.value = false;
  emit('close');
  removeSlot();
};

const onDrop = (event) => {
  dragOver.value = false;
  const uid = event.dataTransfer.getData('text/plain');
  if (uid) handleChange('src', uid);
};

watch(() => props.source.src, (newSrc) => {
  if (newSrc !== src.value) {
    src.value = newSrc;
  }
});
</script>

<style scoped>
.slot-btn {
  @apply flex items-center justify-center w-7 h-7 md:w-5 md:h-5 rounded
         text-gray-500 dark:text-gray-400
         hover:bg-gray-200 dark:hover:bg-gray-700
         hover:text-gray-900 dark:hover:text-white
         transition-colors duration-100 cursor-pointer;
}

:deep(.slot-volume-slider .p-slider) {
  @apply bg-gray-300 dark:bg-gray-700;
  height: 3px;
}

:deep(.slot-volume-slider .p-slider-range) {
  @apply bg-gray-500 dark:bg-gray-400;
}

:deep(.slot-volume-slider .p-slider-handle) {
  @apply bg-gray-600 dark:bg-gray-300 border-none;
  width: 8px;
  height: 8px;
  margin-top: -2.5px;
}
</style>
