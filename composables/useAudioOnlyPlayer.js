/**
 * WHEP audio playback via hidden video element.
 * Isolated from useWhepPlayer — no volumechange back-sync.
 * Uses useMutedState for exclusive unmute across all players.
 */
export function useAudioOnlyPlayer(props) {
  const videoEl = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const isMuted = computed(() => mutedState.value[props.uid] ?? true);

  let pc = null;
  let resourceUrl = null;

  const toggleMute = () => {
    setMutedState(props.uid, !isMuted.value);
  };

  const applyMuted = () => {
    if (videoEl.value) videoEl.value.muted = isMuted.value;
  };

  const cleanup = () => {
    if (pc) { pc.close(); pc = null; }
    if (resourceUrl) {
      fetch(resourceUrl, { method: 'DELETE' }).catch(() => {});
      resourceUrl = null;
    }
    if (videoEl.value) videoEl.value.srcObject = null;
  };

  const initPlayer = async () => {
    if (!videoEl.value) return;
    cleanup();

    pc = new RTCPeerConnection();
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    const stream = new MediaStream();
    pc.ontrack = (event) => {
      stream.addTrack(event.track);
      if (videoEl.value) videoEl.value.srcObject = stream;
    };

    pc.oniceconnectionstatechange = () => {
      if (pc?.iceConnectionState === 'failed') {
        setTimeout(initPlayer, 500);
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') resolve();
        else {
          pc.onicecandidate = (event) => {
            if (event.candidate === null) resolve();
          };
          setTimeout(resolve, 5000);
        }
      });

      const resp = await fetch(`/whep/${props.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription.sdp,
      });

      if (!resp.ok) throw new Error(`WHEP POST failed: ${resp.status}`);

      const location = resp.headers.get('Location');
      if (location) {
        resourceUrl = location.startsWith('/') ? location : new URL(location).pathname;
      }

      await pc.setRemoteDescription({ type: 'answer', sdp: await resp.text() });

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
  onUnmounted(cleanup);
  watch(() => props.uid, async (newUid) => {
    if (resourceUrl && pc?.connectionState === 'connected') {
      try {
        const resp = await fetch(resourceUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: newUid }),
        });
        if (resp.ok) return;
      } catch {}
    }
    initPlayer();
  });

  return { videoEl, isMuted, toggleMute };
}
