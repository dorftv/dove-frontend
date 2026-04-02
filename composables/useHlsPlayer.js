import HLS from 'hls.js';

export function useHlsPlayer(props) {
  const mediaPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const { programMixer } = useEntities();
  const toast = useToast();

  let loadTimeout = null;

  const setup = () => {
    const player = mediaPlayer.value;
    if (!player) return;

    player.addEventListener('media-mute-request', () => {
      setMutedState(props.uid, true);
    });

    player.addEventListener('media-unmute-request', () => {
      setMutedState(props.uid, false);
    });

    let autoplayToastShown = false;

    player.addEventListener('auto-play-fail', () => {
      setMutedState(props.uid, true);
      nextTick(() => player.play());
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
          document.querySelectorAll('video, media-player').forEach(v => {
            if (v.paused) v.play().catch(() => {});
          });
          toast.remove(t.id);
        }, { once: true });
      }
    });

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
    });

    player.addEventListener('hls-error', () => {
      const src = player.src;
      player.src = src;
    });
  };

  onMounted(setup);
  onUnmounted(() => {
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
