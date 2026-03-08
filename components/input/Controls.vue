<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-b-lg px-2 py-1.5 text-xs" role="toolbar" :aria-label="`Controls for ${input.name}`">
    <!-- Progress bar (always reserve space) -->
    <div class="h-3">
      <USlider
        v-if="input.duration && input.show_controls"
        :model-value="position"
        @update:model-value="handlePositionChange"
        :step="1"
        :min="0"
        :max="input.duration"
        class="w-full"
        size="xs"
        aria-label="Playback position"
      />
    </div>

    <!-- Transport controls row -->
    <div class="flex items-center gap-1 mt-1 h-6">
      <!-- Playback buttons (always reserve space) -->
      <div class="flex items-center" :class="{ 'invisible': !input.show_controls }">
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
          <USlider
            :model-value="volume"
            @update:model-value="handleVolumeChange"
            :min="0"
            :max="100"
            class="w-16"
            size="xs"
            aria-label="Volume"
          />
        </span>
      </div>
    </div>

    <!-- Playlist details / spacer for equal height -->
    <div class="h-4 flex items-center text-[10px] text-gray-500 dark:text-gray-400 px-0.5 mt-0.5">
      <template v-if="input.type === 'playlist'">
        <span v-if="input.details" class="truncate min-w-0">{{ input.details }}</span>
        <div class="flex-grow" />
        <span v-if="input.total_duration" class="whitespace-nowrap font-mono tabular-nums shrink-0 ml-1">{{ totalPositionFormatted }}/{{ totalDurationFormatted }}</span>
        <span v-if="input.playlist?.length" class="whitespace-nowrap shrink-0 ml-1">({{ (input.index ?? 0) + 1 }}/{{ input.playlist.length }})</span>
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  input: Object,
});

const { volumeIcon } = useStateClass();

const {
  volume,
  position,
  durationFormatted,
  positionFormatted,
  totalPositionFormatted,
  totalDurationFormatted,
  handleVolumeChange,
  handlePositionChange,
  submitPlay,
  submitPause,
  submitStop,
  submitLoop,
  toggleMute,
} = useInputControls(props);
</script>

<style scoped>
@reference "tailwindcss";

.transport-btn {
  @apply flex items-center justify-center w-6 h-6 rounded
         hover:bg-gray-300 dark:hover:bg-gray-700
         hover:text-gray-900 dark:hover:text-white
         transition-colors duration-100 cursor-pointer;
}
</style>
