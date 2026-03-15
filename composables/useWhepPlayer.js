import { WebRTCPlayer } from '@eyevinn/webrtc-player';

let autoplayToastShown = false;

export function useWhepPlayer(props, { onError } = {}) {
  const videoPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const { programMixer } = useEntities();
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
        setMutedState(props.uid, true);
        videoPlayer.value.muted = true;
        try { await videoPlayer.value.play(); } catch { /* still blocked */ }
        if (!autoplayToastShown) {
          autoplayToastShown = true;
          const pmUid = programMixer.value?.uid;
          const t = toast.add({
            title: 'Audio blocked by browser',
            description: 'Click anywhere to enable audio',
            color: 'warning',
          });
          document.addEventListener('click', () => {
            if (pmUid) setMutedState(pmUid, false);
            document.querySelectorAll('video').forEach(v => {
              if (v.paused) v.play().catch(() => {});
            });
            toast.remove(t.id);
          }, { once: true });
        }
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
