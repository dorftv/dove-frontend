import Hls from 'hls.js';

export function useHlsPlayer(props) {
  const mediaPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const { handleAutoplayBlocked } = useAutoplayToast();

  let hls = null;

  const teardown = () => {
    hls?.destroy();
    hls = null;
  };

  const loadSource = () => {
    if (!mediaPlayer.value || !props.uid) return;
    const src = `/preview/hls/${props.uid}/index.m3u8`;
    teardown();
    if (Hls.isSupported()) {
      hls = new Hls({ maxMaxBufferLength: 3 });
      hls.loadSource(src);
      hls.attachMedia(mediaPlayer.value);
      mediaPlayer.value.muted = mutedState.value[props.uid] ?? true;
    } else if (mediaPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
      mediaPlayer.value.src = src;
    }
    mediaPlayer.value.play().catch(() => handleAutoplayBlocked(props.uid));
  };

  onMounted(loadSource);
  onUnmounted(teardown);
  watch(() => props.uid, loadSource);

  watch(() => mutedState.value[props.uid], (isMuted) => {
    if (mediaPlayer.value && mediaPlayer.value.muted !== isMuted) {
      mediaPlayer.value.muted = isMuted;
    }
  });

  return { mediaPlayer, mutedState };
}
