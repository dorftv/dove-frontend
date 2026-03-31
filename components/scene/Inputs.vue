<template>
  <div class="w-full flex flex-col text-sm text-gray-700 dark:text-gray-300">
    <div
      class="flex items-center gap-3 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      :class="{ 'ring-2 ring-inset ring-blue-400': dragOver }"
      @dragover.prevent
      @dragenter.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop="handleDrop"
    >
      <span class="text-xs text-gray-400 dark:text-gray-500 w-8 shrink-0">{{ source.name }}</span>
      <span class="truncate flex-grow" :class="inputMatch ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 italic'">
        {{ inputMatch ? inputMatch.name : 'Empty' }}
      </span>
      <div class="flex items-center gap-0.5 shrink-0">
        <!-- Volume: mute icon + slider -->
        <template v-if="canEditVolume">
          <button @click="toggleMute" class="icon-btn w-7 h-7 md:w-5 md:h-5 hover:bg-gray-200 dark:hover:bg-gray-700" :class="{ 'text-orange-500 dark:text-orange-400': mute }" :title="mute ? 'Unmute' : 'Mute'" :aria-label="mute ? 'Unmute' : 'Mute'">
            <Icon :name="volumeIcon" size="14px" />
          </button>
          <span :title="volume + '%'">
            <USlider
              :model-value="volume"
              @update:model-value="handleChange('volume', $event)"
              :min="0"
              :max="150"
              class="w-24"
              size="xs"
              aria-label="Volume"
            />
          </span>
          <button
            @click="slotFiltersOpen = true"
            class="icon-btn w-7 h-7 md:w-5 md:h-5 hover:bg-gray-200 dark:hover:bg-gray-700 relative"
            title="Audio filters"
            aria-label="Audio filters"
          >
            <Icon name="ph:waveform" size="12px" />
            <span
              v-if="slotFilterCount > 0"
              class="absolute -top-1 -right-1 min-w-[12px] h-[12px] flex items-center justify-center rounded-full bg-blue-500 text-white text-[7px] font-bold leading-none px-0.5"
            >{{ slotFilterCount }}</span>
          </button>
          <AudioFilters v-model:open="slotFiltersOpen" :mixer="scene" :slotIndex="source.index" />
        </template>
        <button v-if="canEditSlot" @click="open = !open" class="icon-btn w-7 h-7 md:w-5 md:h-5 hover:bg-gray-200 dark:hover:bg-gray-700" :class="{ 'text-blue-500 dark:text-blue-400': open }" title="Settings" aria-label="Settings">
          <Icon name="ph:gear" size="11px" />
        </button>
        <span v-if="!canEditSlot" class="slot-btn opacity-40" :title="canSupervisor ? 'Locked' : 'No permission'">
          <Icon name="ph:lock" size="11px" />
        </span>
      </div>
    </div>
    <div v-if="open" class="px-3 pb-2 bg-blue-50/50 dark:bg-blue-900/10">
      <div class="flex items-center mb-1 mt-1">
        <span class="w-16 text-xs text-gray-600 dark:text-gray-400">src</span>
        <USelect
          class="flex-grow"
          :items="srcOptions"
          label-key="name"
          value-key="uid"
          :model-value="src"
          @update:model-value="(val) => handleChange('src', val || 'None')"
          placeholder="Select input"
          size="sm"
        />
      </div>
      <button @click="doRemoveSlot" class="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-1 cursor-pointer">
        <Icon name="ph:minus-circle" size="11px" />
        Remove Slot
      </button>
      <div class="flex items-center mb-1">
        <span class="w-16 text-xs text-gray-600 dark:text-gray-400">sizing</span>
        <div class="inline-flex flex-grow">
          <UButton
            label="Fit"
            :color="sizing === 'fit' ? 'primary' : 'neutral'"
            :variant="sizing === 'fit' ? 'solid' : 'outline'"
            size="xs"
            @click="handleChange('sizing', 'fit')"
          />
          <UButton
            label="Stretch"
            :color="sizing === 'stretch' ? 'primary' : 'neutral'"
            :variant="sizing === 'stretch' ? 'solid' : 'outline'"
            size="xs"
            @click="handleChange('sizing', 'stretch')"
          />
        </div>
        <button
          @click="resetAll"
          class="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Reset all"
        >
          <Icon name="ph:arrow-counter-clockwise" size="12px" />
        </button>
      </div>
      <div v-for="(value, key) in { alpha, width, height, xpos, ypos }" :key="key" class="flex items-center mb-1">
        <div v-if="getMax(key)" class="flex w-full items-center">
          <span class="w-16 text-xs text-gray-600 dark:text-gray-400">{{ key }}</span>
          <USlider
            class="flex-grow mx-2"
            :model-value="value"
            @update:model-value="handleChange(key, $event)"
            :step="1"
            :min="getMin(key)"
            :max="getMax(key)"
            size="xs"
          />
          <span class="w-12 text-right text-xs text-gray-600 dark:text-gray-400">{{ value }}</span>
          <button
            v-if="value !== getDefault(key)"
            @click="handleChange(key, getDefault(key))"
            class="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            :title="`Reset to ${getDefault(key)}`"
          >
            <Icon name="ph:arrow-counter-clockwise" size="10px" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { canSupervisor, canBypassLock } = useAuth()

const props = defineProps({
  source: Object,
  scene: Object,
});

const emit = defineEmits(['close']);

const { inputs, removeSlot, handleChange, getMax, getMin, getDefault, resetAll, resetPosition, toggleMute, volumeIcon, onDrop, src, alpha, width, height, xpos, ypos, volume, mute, sizing } = useSceneSources(() => props.scene, () => props.source);

const inputMatch = computed(() => inputs.value.find(input => input.uid === src.value));
const srcOptions = computed(() => [{ name: '— Empty —', uid: 'None' }, ...inputs.value]);
const open = ref(false);
const dragOver = ref(false);
const slotFiltersOpen = ref(false);
const { filterCount: slotFilterCount } = useAudioFilters({ mixer: () => props.scene, slotIndex: () => props.source.index });

const doRemoveSlot = () => {
  open.value = false;
  emit('close');
  removeSlot();
};

const canEditVolume = computed(() =>
  canSupervisor.value && ((!props.scene.src_locked && !props.scene.locked) || canBypassLock.value)
);

const canEditSlot = computed(() =>
  canSupervisor.value && ((!props.source.locked && !props.scene.src_locked && !props.scene.locked) || canBypassLock.value)
);

const handleDrop = (event) => {
  dragOver.value = false;
  if (!canEditSlot.value) return;
  onDrop(event);
};

</script>
