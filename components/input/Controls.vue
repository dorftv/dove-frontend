<template>
  <div class="bg-gray-900 text-gray-300 rounded-b-lg px-2 py-1.5 text-xs">
    <!-- Progress bar -->
    <Slider
      v-if="input.duration && input.show_controls"
      :model-value="position"
      @update:model-value="handlePositionChange"
      :step="1"
      :min="0"
      :max="input.duration"
      class="w-full transport-slider"
    />

    <!-- Transport controls row -->
    <div class="flex items-center gap-1 mt-1">
      <!-- Playback buttons -->
      <div v-if="input.show_controls" class="flex items-center">
        <button @click="submitStop" class="transport-btn" title="Stop">
          <Icon name="ph:stop-fill" size="14px" />
        </button>
        <button @click="submitPlay" class="transport-btn" :class="{ 'text-green-400': input.state === 'PLAYING' }" title="Play">
          <Icon name="ph:play-fill" size="14px" />
        </button>
        <button @click="submitPause" class="transport-btn" :class="{ 'text-orange-400': input.state === 'PAUSED' }" title="Pause">
          <Icon name="ph:pause-fill" size="14px" />
        </button>
      </div>

      <!-- Loop toggle -->
      <button
        v-if="input.hasOwnProperty('loop')"
        @click="submitLoop(!input.loop)"
        class="transport-btn"
        :class="input.loop ? 'text-emerald-400' : 'text-gray-500'"
        title="Loop"
      >
        <Icon name="ph:repeat" size="14px" />
      </button>

      <!-- State badge -->
      <span :class="stateBadgeClass(input.state)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none">
        <Icon :name="stateIcon(input.state)" size="10px" />
        {{ input.state }}
      </span>

      <!-- Spacer -->
      <div class="flex-grow" />

      <!-- Timecode -->
      <span v-if="input.duration && input.show_controls" class="font-mono text-[11px] text-gray-400 tabular-nums">
        {{ positionFormatted }}<span class="text-gray-600">{{ durationFormatted }}</span>
      </span>

      <!-- Volume -->
      <div class="flex items-center gap-1 ml-1">
        <button @click="toggleMute" class="transport-btn" :title="volume === 0 ? 'Unmute' : 'Mute'">
          <Icon :name="volumeIcon" size="14px" />
        </button>
        <Slider
          :model-value="volume"
          @update:model-value="handleVolumeChange"
          :min="0"
          :max="100"
          class="w-16 volume-slider"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  input: Object,
});

const { stateClass } = useStateClass();

const stateIcon = (state) => {
  const icons = {
    PLAYING: 'ph:play-circle',
    PAUSED: 'ph:pause-circle',
    NULL: 'ph:stop-circle',
    READY: 'ph:circle-dashed',
    EOS: 'ph:stop',
    ERROR: 'ph:warning-circle',
    BUFFERING: 'ph:spinner',
  };
  return icons[state] || 'ph:circle';
};

const stateBadgeClass = (state) => {
  const classes = {
    PLAYING: 'bg-green-900/60 text-green-400',
    PAUSED: 'bg-orange-900/60 text-orange-400',
    NULL: 'bg-gray-700 text-gray-400',
    READY: 'bg-gray-700 text-gray-400',
    EOS: 'bg-red-900/60 text-red-400',
    ERROR: 'bg-red-900/60 text-red-400',
    BUFFERING: 'bg-orange-900/60 text-orange-400',
  };
  return classes[state] || 'bg-gray-700 text-gray-400';
};

const {
  volume,
  position,
  durationFormatted,
  positionFormatted,
  handleVolumeChange,
  handlePositionChange,
  submitPlay,
  submitPause,
  submitStop,
  submitLoop,
} = useInputControls(props);

const previousVolume = ref(80);

const toggleMute = () => {
  if (volume.value === 0) {
    handleVolumeChange(previousVolume.value);
  } else {
    previousVolume.value = volume.value;
    handleVolumeChange(0);
  }
};

const volumeIcon = computed(() => {
  if (volume.value === 0) return 'ph:speaker-x';
  if (volume.value < 50) return 'ph:speaker-low';
  return 'ph:speaker-high';
});
</script>

<style scoped>
.transport-btn {
  @apply flex items-center justify-center w-6 h-6 rounded
         hover:bg-gray-700 hover:text-white
         transition-colors duration-100 cursor-pointer;
}

:deep(.transport-slider .p-slider) {
  @apply bg-gray-700;
  height: 4px;
}

:deep(.transport-slider .p-slider-range) {
  @apply bg-emerald-500;
}

:deep(.transport-slider .p-slider-handle) {
  @apply bg-emerald-400 border-none;
  width: 10px;
  height: 10px;
  margin-top: -3px;
}

:deep(.volume-slider .p-slider) {
  @apply bg-gray-700;
  height: 3px;
}

:deep(.volume-slider .p-slider-range) {
  @apply bg-gray-400;
}

:deep(.volume-slider .p-slider-handle) {
  @apply bg-gray-300 border-none;
  width: 8px;
  height: 8px;
  margin-top: -2.5px;
}
</style>
