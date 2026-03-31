import { WebRTCPlayer } from '@eyevinn/webrtc-player';

/**
 * WHEP audio playback via hidden video element.
 * Isolated from useWhepPlayer — no volumechange back-sync.
 * Uses useMutedState for exclusive unmute across all players.
 */
export function useAudioOnlyPlayer(props) {
  const videoEl = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const isMuted = computed(() => mutedState.value[props.uid] ?? true);

  let player = null;

  const toggleMute = () => {
    setMutedState(props.uid, !isMuted.value);
  };

  const applyMuted = () => {
    if (videoEl.value) videoEl.value.muted = isMuted.value;
  };

  const initPlayer = async () => {
    if (!videoEl.value) return;
    if (player) { try { await player.unload(); } catch {} player = null; }

    player = new WebRTCPlayer({
      video: videoEl.value,
      type: 'whep',
      statsTypeFilter: '^candidate-*|^inbound-rtp',
    });

    try {
      const url = new URL(`/whep/${props.uid}`, window.location.origin);
      await player.load(url);
      videoEl.value.muted = true;
      try { await videoEl.value.play(); } catch {}
      applyMuted();
    } catch (e) {
      console.error('AudioOnlyPlayer WHEP error:', e);
    }
  };

  // Forward sync only: mutedState → video.muted
  watch(isMuted, applyMuted);

  onMounted(initPlayer);
  onUnmounted(() => {
    if (player) { try { player.unload(); } catch {} player = null; }
  });
  watch(() => props.uid, initPlayer);

  return { videoEl, isMuted, toggleMute };
}
