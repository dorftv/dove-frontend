<template>
  <div class="aspect-video bg-black relative group">
    <video
      ref="videoPlayer"
      autoplay
      :muted="mutedState[uid]"
      playsinline
    ></video>
    <div v-if="failed" class="absolute inset-0 flex items-center justify-center">
      <span class="text-[11px] text-white/40 font-mono">No signal</span>
    </div>
    <span class="absolute top-1 left-1 text-[9px] font-mono text-white/50 bg-black/30 px-1 rounded sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">WebRTC</span>
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

const emit = defineEmits(['error']);
const failed = ref(false);

const { videoPlayer, mutedState } = useWhepPlayer(props, {
  onError: () => { failed.value = true; emit('error'); },
});

watch(() => props.uid, () => { failed.value = false; });

const { setMutedState } = useMutedState();

const toggleMute = () => {
  setMutedState(props.uid, !mutedState.value[props.uid]);
};

const toggleFullscreen = () => {
  videoPlayer.value?.requestFullscreen();
};
</script>

<style scoped>
@reference "tailwindcss";

video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
