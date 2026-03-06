import { WebRTCPlayer } from '@eyevinn/webrtc-player';

let autoplayToastShown = false;

export function useWhepPlayer(props, { onError } = {}) {
  const videoPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const toast = useToast();

  let player = null;
  let failCount = 0;
  const MAX_RETRIES = 3;

  const cleanupPlayer = async () => {
    if (!player) return;
    try {
      await player.unload();
    } catch {
      // unload may fail if connection was never established
    }
    player.removeAllListeners();
    player = null;
  };

  const initializePlayer = async () => {
    if (!videoPlayer.value) return;

    await cleanupPlayer();

    player = new WebRTCPlayer({
      video: videoPlayer.value,
      type: 'whep',
      statsTypeFilter: '^candidate-*|^inbound-rtp',
    });

    try {
      const url = new URL(`/whep/${props.uid}`, window.location.origin);
      await player.load(url);
      failCount = 0;
      player.on('initial-connection-failed', handleConnectionFailed);
      player.on('no-media', handleConnectionFailed);

      try {
        await videoPlayer.value.play();
      } catch {
        mutedState.value[props.uid] = true;
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
          setMutedState(props.uid, false);
          toast.removeAllGroups();
        }, { once: true });
      }
    } catch (error) {
      console.error('Error loading player:', error);
      failCount++;
      if (failCount >= MAX_RETRIES && onError) {
        onError();
      }
    }
  };

  const handleConnectionFailed = () => {
    failCount++;
    if (failCount >= MAX_RETRIES && onError) {
      onError();
      return;
    }
    setTimeout(initializePlayer, 100);
  };

  onMounted(() => {
    videoPlayer.value?.addEventListener('volumechange', () => {
      const isMuted = videoPlayer.value?.muted;
      if (isMuted !== mutedState.value[props.uid]) {
        setMutedState(props.uid, isMuted);
      }
    });
    initializePlayer();
  });

  onUnmounted(() => {
    cleanupPlayer();
  });

  watch(() => props.uid, initializePlayer);

  // Sync mutedState → video.muted (handles cross-player exclusive unmute)
  watch(() => mutedState.value[props.uid], (isMuted) => {
    if (videoPlayer.value && videoPlayer.value.muted !== isMuted) {
      videoPlayer.value.muted = isMuted;
    }
  });

  return { videoPlayer, mutedState };
}
