<template>
  <div class="w-full flex flex-col text-sm text-gray-700 dark:text-gray-300">
    <!-- Slot header row -->
    <div
      class="flex items-center gap-1 px-1.5 py-1 md:py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      :class="{ 'ring-2 ring-inset ring-blue-400': dragOver, 'bg-blue-50 dark:bg-blue-900/20': open }"
      @dragover.prevent
      @dragenter.prevent="dragCount++; dragOver = true"
      @dragleave="dragCount--; if (dragCount <= 0) { dragOver = false; dragCount = 0 }"
      @drop="handleDrop"
    >
      <!-- Slot name -->
      <InlineEdit
        :modelValue="source.name"
        @update:modelValue="updateSlotName"
        displayClass="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0"
        inputClass="text-xs text-gray-400 dark:text-gray-500 w-14"
      />

      <!-- Source selector (pointer-events disabled during drag to let drop through) -->
      <div v-if="canEditSlot" class="flex-grow min-w-0" :class="{ 'pointer-events-none': dragOver }">
        <USelect
          class="w-full"
          :items="srcOptions"
          label-key="name"
          value-key="uid"
          :model-value="src"
          @update:model-value="onSourceSelect"
          placeholder="Select input"
          size="xs"
        />
      </div>
      <span v-else class="truncate flex-grow" :class="inputMatch ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 italic'">
        {{ inputMatch ? inputMatch.name : 'Empty' }}
      </span>

      <!-- Controls -->
      <div class="flex items-center gap-0.5 shrink-0">
        <template v-if="canEditVolume">
          <button @click="toggleMute" class="icon-btn w-6 h-6" :class="{ 'text-orange-500 dark:text-orange-400': mute }" :title="mute ? 'Unmute' : 'Mute'">
            <Icon :name="volumeIcon" size="12px" />
          </button>
          <USlider
            :model-value="volume"
            @update:model-value="handleChange('volume', $event)"
            :min="0" :max="150"
            class="w-24 md:w-16"
            size="xs"
          />
          <!-- Filter buttons: inline on large screens, moved to settings panel on small -->
          <button @click="slotFiltersOpen = true" class="icon-btn w-6 h-6 relative hidden lg:flex" title="Audio filters">
            <Icon name="ph:waveform" size="11px" />
            <span v-if="slotFilterCount > 0" class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-blue-500 text-white text-[6px] font-bold leading-none px-0.5">{{ slotFilterCount }}</span>
          </button>
          <button @click="slotVfOpen = true" class="icon-btn w-6 h-6 relative hidden lg:flex" title="Video filters">
            <Icon name="ph:camera" size="11px" />
            <span v-if="slotVfCount > 0" class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-violet-500 text-white text-[6px] font-bold leading-none px-0.5">{{ slotVfCount }}</span>
          </button>
          <AudioFilters v-model:open="slotFiltersOpen" :mixer="scene" :slotIndex="source.index" :ctx="slotAf" />
          <VideoFilters v-model:open="slotVfOpen" :mixer="scene" :slotIndex="source.index" :ctx="slotVf" />
        </template>
        <button v-if="canEditSlot" @click="open = !open" class="icon-btn w-6 h-6" :class="{ 'text-blue-500 dark:text-blue-400': open }" title="Position & sizing">
          <Icon name="ph:sliders-horizontal" size="11px" />
        </button>
        <span v-if="!canEditSlot" class="icon-btn w-6 h-6 opacity-40" :title="canSupervisor ? 'Locked' : 'No permission'">
          <Icon name="ph:lock" size="11px" />
        </span>
      </div>
    </div>

    <!-- Position & sizing panel (collapsible) -->
    <div v-if="open && canEditSlot" class="px-3 pb-2 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400/50">
      <!-- Filter buttons (visible here on narrow screens, hidden on lg where they're inline) -->
      <div class="flex items-center gap-1 mb-1 mt-1 lg:hidden">
        <button @click="slotFiltersOpen = true" class="icon-btn w-6 h-6 relative" title="Audio filters">
          <Icon name="ph:waveform" size="11px" />
          <span v-if="slotFilterCount > 0" class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-blue-500 text-white text-[6px] font-bold leading-none px-0.5">{{ slotFilterCount }}</span>
        </button>
        <span class="text-xs text-gray-500">Audio</span>
        <button @click="slotVfOpen = true" class="icon-btn w-6 h-6 relative ml-2" title="Video filters">
          <Icon name="ph:camera" size="11px" />
          <span v-if="slotVfCount > 0" class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-violet-500 text-white text-[6px] font-bold leading-none px-0.5">{{ slotVfCount }}</span>
        </button>
        <span class="text-xs text-gray-500">Video</span>
      </div>
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
        <button @click="resetAll" class="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Reset all">
          <Icon name="ph:arrow-counter-clockwise" size="12px" />
        </button>
        <button @click="doRemoveSlot" class="text-red-400 hover:text-red-300 ml-1" title="Remove slot">
          <Icon name="ph:trash" size="12px" />
        </button>
      </div>
      <div v-for="(value, key) in { alpha, width, height, xpos, ypos }" :key="key" class="flex items-center mb-1">
        <div v-if="getMax(key)" class="flex w-full items-center">
          <span class="w-16 text-xs text-gray-600 dark:text-gray-400">{{ key }}</span>
          <USlider
            class="flex-grow mx-2"
            :model-value="value"
            @update:model-value="handleChange(key, $event)"
            :step="1" :min="getMin(key)" :max="getMax(key)"
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

const { inputs, removeSlot, changeSource, handleChange, getMax, getMin, getDefault, resetAll, resetPosition, toggleMute, volumeIcon, onDrop, src, alpha, width, height, xpos, ypos, volume, mute, sizing } = useSceneSources(() => props.scene, () => props.source);

const updateSlotName = (newName) => handleChange('name', newName);

const inputMatch = computed(() => inputs.value.find(input => input.uid === src.value));
const srcOptions = computed(() => [
  { name: '— Empty —', uid: 'None' },
  ...inputs.value.map(i => ({ name: i.name, uid: i.uid })),
]);

const onSourceSelect = (val) => {
  const uid = typeof val === 'object' ? val?.uid : val;
  changeSource(uid || 'None');
};
const open = ref(false);
const dragOver = ref(false);
const dragCount = ref(0);
const slotFiltersOpen = ref(false);
const slotVfOpen = ref(false);
const slotAf = useAudioFilters({ mixer: () => props.scene, slotIndex: () => props.source.index });
const slotVf = useVideoFilters({ mixer: () => props.scene, slotIndex: () => props.source.index });
const slotFilterCount = slotAf.filterCount;
const slotVfCount = slotVf.filterCount;

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
  dragCount.value = 0;
  if (!canEditSlot.value) return;
  onDrop(event);
};
</script>
