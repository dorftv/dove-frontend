<template>
  <div class="aspect-video bg-black relative group">
    <video v-if="uid" ref="mediaPlayer" :muted="mutedState[uid]" autoplay playsinline class="w-full h-full"></video>
    <span class="absolute top-1 left-1 text-[9px] font-mono text-white/50 bg-black/30 px-1 rounded sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">HLS</span>
    <div class="absolute bottom-0 right-0 flex items-center gap-1 p-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <button @click="toggleMute" class="video-btn" :title="mutedState[uid] ? 'Unmute' : 'Mute'">
        <Icon :name="mutedState[uid] ? 'ph:speaker-x' : 'ph:speaker-high'" size="16px" />
      </button>
      <button @click="toggleFullscreen" class="video-btn" title="Fullscreen">
        <Icon name="ph:corners-out" size="16px" />
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  uid: String,
});

const { mediaPlayer, mutedState } = useHlsPlayer(props);
const { setMutedState } = useMutedState();

const toggleMute = () => {
  setMutedState(props.uid, !mutedState.value[props.uid]);
};

const toggleFullscreen = () => {
  mediaPlayer.value?.requestFullscreen();
};
</script>
