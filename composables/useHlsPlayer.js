import HLS from 'hls.js';

export function useHlsPlayer(props) {
  const mediaPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const toast = useToast();

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
    });

    player.addEventListener('provider-change', (event) => {
      const provider = event.detail;
      if (provider?.type === 'hls') {
        provider.library = HLS;
        provider.config = { maxMaxBufferLength: 3 };
        setTimeout(() => {
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

  return { mediaPlayer, mutedState };
}
