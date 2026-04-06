import HLS from 'hls.js';

export function useHlsPlayer(props) {
  const mediaPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const { handleAutoplayBlocked } = useAutoplayToast();

  let loadTimeout = null;
  let abortController = null;

  const setup = () => {
    const player = mediaPlayer.value;
    if (!player) return;

    abortController = new AbortController();
    const { signal } = abortController;

    player.addEventListener('media-mute-request', () => {
      setMutedState(props.uid, true);
    }, { signal });

    player.addEventListener('media-unmute-request', () => {
      setMutedState(props.uid, false);
    }, { signal });

    player.addEventListener('auto-play-fail', () => {
      handleAutoplayBlocked(props.uid);
      nextTick(() => player.play());
    }, { signal });

    player.addEventListener('provider-change', (event) => {
      const provider = event.detail;
      if (provider?.type === 'hls') {
        provider.library = HLS;
        provider.config = { maxMaxBufferLength: 3 };
        if (loadTimeout) clearTimeout(loadTimeout);
        loadTimeout = setTimeout(() => {
          player.startLoading();
        }, 2000);
      }
    }, { signal });

    player.addEventListener('hls-error', () => {
      const src = player.src;
      player.src = src;
    }, { signal });
  };

  onMounted(setup);
  onUnmounted(() => {
    abortController?.abort();
    if (loadTimeout) clearTimeout(loadTimeout);
    loadTimeout = null;
    mediaPlayer.value = null;
  });

  // Sync mutedState → player.muted (handles cross-player exclusive unmute)
  watch(() => mutedState.value[props.uid], (isMuted) => {
    if (mediaPlayer.value) {
      mediaPlayer.value.muted = isMuted;
    }
  });

  return { mediaPlayer, mutedState };
}
