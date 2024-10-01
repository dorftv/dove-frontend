<template>
{{ mutedState[uid] }}
  <div :id="`videocontainer-${props.uid}`" class="video-container aspect-video">
    <video
      ref="videoPlayer"
      autoplay
      :muted="mutedState[uid]"
      controls
      playsinline
    ></video>
  </div>
</template>

<script setup>
import { WebRTCPlayer } from '@eyevinn/webrtc-player';

const props = defineProps({
  uid: String,
  muted: String,
});

const { mutedState, setMutedState } = useMutedState();

const videoPlayer = ref(null);
let player = null;

const initializePlayer = async () => {
  if (!videoPlayer.value) return;

  if (player) {
    player.destroy();
  }

  player = new WebRTCPlayer({
    video: videoPlayer.value,
    type: 'whep',
    statsTypeFilter: '^candidate-*|^inbound-rtp',
  });


  try {
    const url = new URL(`/whep/${props.uid}/whep`, window.location.origin);
    await player.load(url);
    player.on('initial-connection-failed', handleConnectionFailed);
    player.on('player-muted', () => setMutedState(props.uid, true));
    player.on('player-unmuted', () => setMutedState(props.uid, false));
  } catch (error) {
    console.error('Error loading player:', error);
  }
};

const handleConnectionFailed = () => {
  setTimeout(() => {
    initializePlayer();
  }, 100);
};

onMounted(() => initializePlayer());

onUnmounted(() => {
  if (player) {
    player.off('connectionfailed', handleConnectionFailed);
    player.destroy();
  }
});


</script>

<style scoped>
.video-container {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

video {
  width: 100%;
  height: auto;
}
</style>
