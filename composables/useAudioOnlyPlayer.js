/**
 * WHEP audio playback via hidden video element.
 * Isolated from useWhepPlayer — no volumechange back-sync.
 * Uses useMutedState for exclusive unmute across all players.
 */
export function useAudioOnlyPlayer(props) {
  const videoEl = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const { resolveEntity } = useEntities();
  const isMuted = computed(() => mutedState.value[props.uid] ?? true);

  let pc = null;
  let resourceUrl = null;
  let failCount = 0;
  let readyStopHandle = null; // watcher that gates initial POST on PLAYING state
  const MAX_RETRIES = 3;

  const toggleMute = () => {
    setMutedState(props.uid, !isMuted.value);
  };

  const applyMuted = () => {
    if (videoEl.value) videoEl.value.muted = isMuted.value;
  };

  const cleanup = () => {
    if (pc) { pc.close(); pc = null; }
    if (resourceUrl) {
      deleteWebRTCResource(resourceUrl);
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

    const currentPc = pc; // stale-pc guard
    pc.oniceconnectionstatechange = () => {
      if (pc !== currentPc) return;
      const state = pc?.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        failCount = 0;
      } else if (state === 'failed') {
        failCount++;
        if (failCount < MAX_RETRIES) {
          setTimeout(initPlayer, 2000);
        } else {
          console.warn('AudioOnlyPlayer: max retries reached, stopping');
        }
      }
    };

    try {
      resourceUrl = await negotiateWebRTC(pc, `/whep/${props.uid}`);

      videoEl.value.muted = true;
      try { await videoEl.value.play(); } catch {}
      applyMuted();
    } catch (e) {
      console.error('AudioOnlyPlayer WHEP error:', e);
    }
  };

  // The backend is back (after a restart): a preview that had a connection and lost it starts
  // again, instead of waiting for the browser to give the old one up
  watch(useState('ws-status'), (status, before) => {
    if (status === 'connected' && before !== 'connected' && pc && pc.connectionState !== 'connected') {
      failCount = 0;
      gateOnReady();
    }
  });

  // Forward sync only: mutedState → video.muted
  watch(isMuted, applyMuted);

  // defer first POST until backend entity is PLAYING — avoids webrtcbin orphans during warm-up
  const gateOnReady = () => {
    if (readyStopHandle) { readyStopHandle(); readyStopHandle = null; }
    const entity = resolveEntity(props.uid);
    if (!entity) return;
    if (entity.state === 'PLAYING') {
      initPlayer();
      return;
    }
    readyStopHandle = watch(
      () => resolveEntity(props.uid)?.state,
      (state) => {
        if (state === 'PLAYING') {
          readyStopHandle?.();
          readyStopHandle = null;
          initPlayer();
        }
      }
    );
  };

  onMounted(() => {
    // onUnmounted doesn't run on reload/tab close — end the WHEP session there too
    window.addEventListener('pagehide', cleanup);
    gateOnReady();
  });
  onUnmounted(() => {
    window.removeEventListener('pagehide', cleanup);
    if (readyStopHandle) { readyStopHandle(); readyStopHandle = null; }
    cleanup();
  });
  watch(() => props.uid, async (newUid) => {
    if (resourceUrl && pc?.connectionState === 'connected' && await switchWebRTCSource(resourceUrl, newUid)) {
      return;
    }
    gateOnReady();
  });

  return { videoEl, isMuted, toggleMute };
}
