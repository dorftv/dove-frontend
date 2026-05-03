<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-b-lg px-2 py-1 text-xs flex-grow" role="toolbar" :aria-label="`Controls for ${input.name}`">

    <!-- Progress bar (always reserve space for consistent card height) -->
    <div class="h-3">
      <span v-if="input.is_live" class="flex items-center gap-1 text-red-500 text-[11px] font-mono tabular-nums leading-none">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        LIVE &middot; {{ positionFormatted }}
      </span>
      <USlider
        v-else-if="input.duration && input.show_controls"
        :model-value="position"
        @update:model-value="handlePositionChange"
        :step="1" :min="0" :max="input.duration"
        class="w-full" size="xs"
        aria-label="Playback position"
      />
    </div>

    <!-- Compact row: transport + filter badges + settings gear -->
    <div class="flex items-center gap-1 h-6">
      <!-- Play/Pause -->
      <div class="flex items-center" :class="{ 'invisible': !input.show_controls }">
        <button v-if="input.type === 'playlist'" @click="submitSkip('previous')" class="transport-btn" title="Previous clip"><Icon name="ph:skip-back-fill" size="13px" /></button>
        <button @click="submitPlay" class="transport-btn" :class="{ 'text-green-400': input.state === 'PLAYING' }" title="Play"><Icon name="ph:play-fill" size="13px" /></button>
        <button @click="submitPause" class="transport-btn" :class="{ 'text-orange-400': input.state === 'PAUSED' }" title="Pause"><Icon name="ph:pause-fill" size="13px" /></button>
        <button v-if="input.type === 'playlist'" @click="submitSkip('next')" class="transport-btn" title="Next clip"><Icon name="ph:skip-forward-fill" size="13px" /></button>
      </div>
      <button v-if="input.hasOwnProperty('loop')" @click="submitLoop(!input.loop)" class="transport-btn" :class="input.loop ? 'text-emerald-400' : 'text-gray-500'" title="Loop">
        <Icon name="ph:repeat" size="13px" />
      </button>

      <!-- Timecode -->
      <span v-if="!input.is_live && input.duration && input.show_controls" class="font-mono text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
        {{ positionFormatted }}<span class="text-gray-400 dark:text-gray-600">{{ durationFormatted }}</span>
      </span>

      <div class="flex-grow" />

      <!-- Volume indicator -->
      <button @click="toggleMute" class="transport-btn" :class="{ 'text-orange-400': volume === 0 }" :title="volume === 0 ? 'Unmute' : 'Mute (' + volume + '%)'">
        <Icon :name="volumeIcon(volume)" size="13px" />
      </button>

      <!-- Filter badges (clickable when active) -->
      <button v-if="filterCount > 0 && canEditInput" @click="filtersOpen = true" class="transport-btn relative" title="Audio filters">
        <Icon name="ph:waveform" size="11px" class="text-blue-400" />
        <span class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-blue-500 text-white text-[6px] font-bold leading-none px-0.5">{{ filterCount }}</span>
      </button>
      <button v-if="vfCount > 0 && canEditInput" @click="vfOpen = true" class="transport-btn relative" title="Video filters">
        <Icon name="ph:camera" size="11px" class="text-violet-400" />
        <span class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-violet-500 text-white text-[6px] font-bold leading-none px-0.5">{{ vfCount }}</span>
      </button>

      <!-- Settings gear -->
      <button @click="settingsOpen = !settingsOpen" class="transport-btn" :class="{ 'text-blue-400': settingsOpen }" title="Settings">
        <Icon name="ph:sliders-horizontal" size="13px" />
      </button>
    </div>

    <!-- Expanded settings panel -->
    <div v-if="settingsOpen" class="mt-1 space-y-1">
      <!-- Volume -->
      <div class="flex items-center gap-1">
        <button @click="toggleMute" class="transport-btn" :title="volume === 0 ? 'Unmute' : 'Mute'">
          <Icon :name="volumeIcon(volume)" size="14px" />
        </button>
        <USlider
          :model-value="volume"
          @update:model-value="handleVolumeChange"
          :min="0" :max="100"
          class="flex-grow" size="xs"
          aria-label="Volume"
          :title="volume + '%'"
        />
      </div>
      <!-- Filters -->
      <div v-if="canEditInput" class="flex items-center gap-1">
        <button @click="filtersOpen = true" class="transport-btn relative" title="Audio filters">
          <Icon name="ph:waveform" size="12px" />
          <span v-if="filterCount > 0" class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-blue-500 text-white text-[6px] font-bold leading-none px-0.5">{{ filterCount }}</span>
        </button>
        <span class="text-[10px] text-gray-500">Audio</span>
        <button @click="vfOpen = true" class="transport-btn relative ml-2" title="Video filters">
          <Icon name="ph:camera" size="12px" />
          <span v-if="vfCount > 0" class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-violet-500 text-white text-[6px] font-bold leading-none px-0.5">{{ vfCount }}</span>
        </button>
        <span class="text-[10px] text-gray-500">Video</span>
      </div>
    </div>

    <!-- Filter slideovers (outside settings panel so they work from badges too) -->
    <AudioFilters v-model:open="filtersOpen" :input="input" />
    <VideoFilters v-model:open="vfOpen" :input="input" />

    <!-- WHIP publish controls -->
    <div v-if="input.type === 'whip'" class="flex items-center gap-1 mt-1">
      <template v-if="publishState === 'publishing'">
        <span class="flex items-center gap-1 text-green-500 text-[11px]">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Publishing
        </span>
        <div class="flex-grow" />
        <button @click="stopPublish" class="transport-btn text-red-400" title="Stop sharing">
          <Icon name="ph:stop-fill" size="14px" />
        </button>
      </template>
      <template v-else-if="publishState === 'connecting'">
        <span class="text-[11px] text-yellow-500">Connecting...</span>
      </template>
      <template v-else>
        <button @click="shareScreen" class="transport-btn" title="Share screen"><Icon name="ph:monitor-arrow-up" size="14px" /></button>
        <button @click="shareCamera" class="transport-btn" title="Share camera"><Icon name="ph:video-camera" size="14px" /></button>
        <span class="text-[11px] text-gray-500">Share screen or camera</span>
      </template>
    </div>

    <!-- Playlist details -->
    <div v-if="input.type === 'playlist'" class="h-4 flex items-center text-[11px] text-gray-500 dark:text-gray-400 px-0.5 mt-0.5">
      <span v-if="input.details" class="truncate min-w-0">{{ input.details }}</span>
      <div class="flex-grow" />
      <span v-if="input.total_duration" class="whitespace-nowrap font-mono tabular-nums shrink-0 ml-1">{{ totalPositionFormatted }}/{{ totalDurationFormatted }}</span>
      <span v-if="input.playlist?.length" class="whitespace-nowrap shrink-0 ml-1">({{ (input.index ?? 0) + 1 }}/{{ input.playlist.length }})</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  input: Object,
});

const { canUser, canBypassLock } = useAuth();
const canEditInput = computed(() => canUser.value && (!props.input.locked || canBypassLock.value));
const { volumeIcon } = useStateClass();
const { filterCount } = useAudioFilters(() => props.input);
const { filterCount: vfCount } = useVideoFilters(() => props.input);
const filtersOpen = ref(false);
const vfOpen = ref(false);
const settingsOpen = ref(false);

// WHIP publisher (screencast)
const inputUid = computed(() => props.input.uid);
const { publishState, startScreenShare: shareScreen, startCamera: shareCamera, stop: stopPublish } =
  props.input.type === 'whip' ? useWhipPublisher(inputUid) : { publishState: ref('idle'), startScreenShare: () => {}, startCamera: () => {}, stop: () => {} };

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
  submitLoop,
  submitSkip,
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

@media (pointer: coarse) {
  .transport-btn {
    @apply w-9 h-9;
  }
}
</style>
