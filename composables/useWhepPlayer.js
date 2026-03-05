import { WebRTCPlayer } from '@eyevinn/webrtc-player';

export function useWhepPlayer(props) {
  const videoPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const toast = useToast();

  let player = null;
  let autoplayToastShown = false;

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
    }
  };

  const handleConnectionFailed = () => {
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
    if (player) {
      player.off('connectionfailed', handleConnectionFailed);
      player.destroy();
    }
  });

  watch(() => props.uid, initializePlayer);

  return { videoPlayer, mutedState };
}
