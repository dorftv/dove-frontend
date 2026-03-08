<template>
  <div class="aspect-video bg-black relative group">
    <media-player v-if="uid" ref="mediaPlayer" :muted="mutedState[uid]" viewType="video" autoplay stream-type="live" load="custom" :title="`${uid}`" :src="`/preview/hls/${uid}/index.m3u8`" class="w-full h-full">
      <media-provider></media-provider>
    </media-player>
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
import 'vidstack/player';
import 'vidstack/player/styles/default/theme.css';

const props = defineProps({
  uid: String,
  muted: String,
  entity: Object,
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

<style scoped>
@reference "tailwindcss";

.video-btn {
  @apply flex items-center justify-center w-7 h-7 rounded
         text-white/80 hover:text-white bg-black/50 hover:bg-black/70
         transition-all cursor-pointer backdrop-blur-sm;
}
</style>
