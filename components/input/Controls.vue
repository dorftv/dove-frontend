<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-b-lg px-2 py-1.5 text-xs" role="toolbar" :aria-label="`Controls for ${input.name}`">
    <!-- Progress bar -->
    <Slider
      v-if="input.duration && input.show_controls"
      :model-value="position"
      @update:model-value="handlePositionChange"
      :step="1"
      :min="0"
      :max="input.duration"
      class="w-full slim-slider-accent"
      aria-label="Playback position"
    />

    <!-- Transport controls row -->
    <div class="flex items-center gap-1 mt-1">
      <!-- Playback buttons -->
      <div v-if="input.show_controls" class="flex items-center">
        <button @click="submitStop" class="transport-btn" title="Stop" aria-label="Stop">
          <Icon name="ph:stop-fill" size="14px" />
        </button>
        <button @click="submitPlay" class="transport-btn" :class="{ 'text-green-400': input.state === 'PLAYING' }" title="Play" aria-label="Play">
          <Icon name="ph:play-fill" size="14px" />
        </button>
        <button @click="submitPause" class="transport-btn" :class="{ 'text-orange-400': input.state === 'PAUSED' }" title="Pause" aria-label="Pause">
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
        :aria-label="input.loop ? 'Disable loop' : 'Enable loop'"
        :aria-pressed="input.loop"
      >
        <Icon name="ph:repeat" size="14px" />
      </button>

      <!-- State badge -->
      <span :class="stateBadgeClass(input.state)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none" role="status">
        <Icon :name="stateIcon(input.state)" size="10px" />
        {{ input.state }}
      </span>

      <!-- Spacer -->
      <div class="flex-grow" />

      <!-- Timecode -->
      <span v-if="input.duration && input.show_controls" class="font-mono text-[11px] text-gray-500 dark:text-gray-400 tabular-nums">
        {{ positionFormatted }}<span class="text-gray-400 dark:text-gray-600">{{ durationFormatted }}</span>
      </span>

      <!-- Volume -->
      <div class="flex items-center gap-1 ml-1">
        <button @click="toggleMute" class="transport-btn" :title="volume === 0 ? 'Unmute' : 'Mute'" :aria-label="volume === 0 ? 'Unmute' : 'Mute'">
          <Icon :name="volumeIcon(volume)" size="14px" />
        </button>
        <span :title="volume + '%'">
          <Slider
            :model-value="volume"
            @update:model-value="handleVolumeChange"
            :min="0"
            :max="100"
            class="w-16 slim-slider"
            aria-label="Volume"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  input: Object,
});

const { stateIcon, stateBadgeClass, volumeIcon } = useStateClass();

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
</script>

<style scoped>
.transport-btn {
  @apply flex items-center justify-center w-6 h-6 rounded
         hover:bg-gray-300 dark:hover:bg-gray-700
         hover:text-gray-900 dark:hover:text-white
         transition-colors duration-100 cursor-pointer;
}
</style>
