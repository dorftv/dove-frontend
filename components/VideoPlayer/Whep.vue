<template>
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
const toast = useToast();

const videoPlayer = ref(null);
let player = null;

let autoplayToastShown = false;

const handleAutoplayBlocked = (uid) => {
  setMutedState(uid, true);
  videoPlayer.value.muted = true;
  videoPlayer.value.play();
  if (!autoplayToastShown) {
    autoplayToastShown = true;
    toast.add({
      severity: 'warn',
      summary: 'Audio blocked by browser',
      detail: 'Click anywhere to enable audio',
    });
  }
  document.addEventListener('click', () => {
    setMutedState(uid, false);
    toast.removeAllGroups();
  }, { once: true });
};

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
    const url = new URL(`/whep/${props.uid}`, window.location.origin);
    await player.load(url);
    player.on('initial-connection-failed', handleConnectionFailed);
    player.on('player-muted', () => setMutedState(props.uid, true));
    player.on('player-unmuted', () => setMutedState(props.uid, false));

    try {
      await videoPlayer.value.play();
    } catch {
      handleAutoplayBlocked(props.uid);
    }
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

watch(() => props.uid, initializePlayer);
</script>

<style scoped>
.video-container {
  width: 100%;
}

video {
  width: 100%;
  height: auto;
}
</style>
