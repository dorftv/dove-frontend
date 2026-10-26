/**
 * Minimal WHEP client — no library dependency.
 * Direct control over RTCPeerConnection, resource URL, and source switching.
 */

export function useWhepPlayer(props, { onError, onRecover } = {}) {
  const videoPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const { handleAutoplayBlocked } = useAutoplayToast();
  const { resolveEntity } = useEntities();

  let pc = null;           // RTCPeerConnection
  let resourceUrl = null;  // WHEP resource URL (from POST Location header)
  let failCount = 0;       // attempts in a row that brought no media
  let retryTimer = null;
  let volumeHandler = null;
  let statsInterval = null;
  let lastBytesReceived = 0;
  let stalledSince = 0;
  let readyStopHandle = null; // watcher that gates initial POST on PLAYING state
  const MAX_RETRIES = 3;        // failed attempts before "No signal"; retrying goes on
  const STALL_THRESHOLD = 8000; // ms with no new bytes, whatever the connection's state → reconnect
  const MAX_RETRY_DELAY = 10000;

  // A new connection after a wait that grows with each failed attempt, never giving up
  const reconnect = (reason) => {
    if (retryTimer) return;
    stopStatsMonitor();
    failCount++;
    if (failCount === MAX_RETRIES && onError) onError();
    const delay = Math.min(500 * 2 ** (failCount - 1), MAX_RETRY_DELAY);
    console.warn(`WHEP: ${reason}, reconnecting in ${delay} ms`);
    retryTimer = setTimeout(() => { retryTimer = null; initializePlayer(); }, delay);
  };

  const stopStatsMonitor = () => {
    if (statsInterval) { clearInterval(statsInterval); statsInterval = null; }
    lastBytesReceived = 0;
    stalledSince = 0;
  };

  // What arrives over UDP is what counts, not the state the browser reports: a connection can
  // hang in "disconnected" or "checking" without ever failing
  const startStatsMonitor = () => {
    stopStatsMonitor();
    stalledSince = Date.now();
    statsInterval = setInterval(async () => {
      if (!pc) return;
      try {
        const stats = await pc.getStats();
        let totalBytes = 0;
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp') totalBytes += report.bytesReceived || 0;
        });
        if (totalBytes > lastBytesReceived) {
          lastBytesReceived = totalBytes;
          stalledSince = 0;
          if (failCount >= MAX_RETRIES && onRecover) onRecover();
          failCount = 0;
        } else {
          if (!stalledSince) stalledSince = Date.now();
          else if (Date.now() - stalledSince > STALL_THRESHOLD) reconnect('no media');
        }
      } catch {}
    }, 2000);
  };

  const cleanup = () => {
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    stopStatsMonitor();
    if (volumeHandler && videoPlayer.value) {
      videoPlayer.value.removeEventListener('volumechange', volumeHandler);
    }
    if (pc) {
      pc.close();
      pc = null;
    }
    // DELETE the WHEP resource so the server cleans up
    if (resourceUrl) {
      deleteWebRTCResource(resourceUrl);
      resourceUrl = null;
    }
    if (videoPlayer.value) {
      videoPlayer.value.srcObject = null;
    }
  };

  const initializePlayer = async () => {
    if (!videoPlayer.value) return;
    cleanup();

    pc = new RTCPeerConnection({
      // No STUN/TURN needed — announced_ip handles server-side
    });

    // Receive-only transceivers
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    // Attach incoming tracks to video element
    const stream = new MediaStream();

    pc.ontrack = (event) => {
      stream.addTrack(event.track);
      if (videoPlayer.value) {
        videoPlayer.value.srcObject = stream;
        // Re-attach volumechange listener — cleanup() removes it each init cycle
        volumeHandler = () => {
          const isMuted = videoPlayer.value?.muted;
          if (isMuted !== mutedState.value[props.uid]) {
            setMutedState(props.uid, isMuted);
          }
        };
        videoPlayer.value.addEventListener('volumechange', volumeHandler);
      }
    };

    // A failed connection is not waited out; everything else is left to the stats monitor
    const currentPc = pc;
    pc.oniceconnectionstatechange = () => {
      if (pc === currentPc && pc.iceConnectionState === 'failed') reconnect('connection failed');
    };

    try {
      const url = await negotiateWebRTC(pc, `/whep/${props.uid}`);
      // A newer attempt has replaced this one meanwhile: the session it got is not needed
      if (pc !== currentPc) {
        if (url) deleteWebRTCResource(url);
        return;
      }
      resourceUrl = url;
      startStatsMonitor();

      // Autoplay
      try {
        await videoPlayer.value.play();
      } catch {
        handleAutoplayBlocked(props.uid);
        videoPlayer.value.muted = true;
        try { await videoPlayer.value.play(); } catch {}
      }
    } catch (error) {
      // Replaced by a newer attempt, which closed this connection: nothing to reconnect
      if (pc !== currentPc) return;
      console.error('WHEP player error:', error);
      reconnect('negotiation failed');
    }
  };

  /**
   * Switch source without tearing down WebRTC.
   * Backend swaps encoder tee pads. Same RTCPeerConnection, same ICE.
   */
  const switchSource = async (newUid) => {
    if (!resourceUrl || !pc || pc.connectionState !== 'connected') {
      await initializePlayer();
      return;
    }

    // Stream switches on backend — same connection, new frames arrive; fallback: full reconnect
    if (!(await switchWebRTCSource(resourceUrl, newUid))) {
      await initializePlayer();
    }
  };

  // defer first POST until backend entity is PLAYING — avoids webrtcbin orphans during warm-up
  const gateOnReady = () => {
    if (readyStopHandle) { readyStopHandle(); readyStopHandle = null; }
    const entity = resolveEntity(props.uid);
    if (!entity) return;
    if (entity.state === 'PLAYING') {
      initializePlayer();
      return;
    }
    readyStopHandle = watch(
      () => resolveEntity(props.uid)?.state,
      (state) => {
        if (state === 'PLAYING') {
          readyStopHandle?.();
          readyStopHandle = null;
          initializePlayer();
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

  // The backend is back (after a restart): a preview that had a connection and lost it starts
  // again, instead of waiting for the browser to give the old one up
  watch(useState('ws-status'), (status, before) => {
    if (status === 'connected' && before !== 'connected' && pc && pc.connectionState !== 'connected') {
      failCount = 0;
      gateOnReady();
    }
  });

  // On uid change: try seamless switch, fallback to reconnect (gated on readiness)
  watch(() => props.uid, (newUid, oldUid) => {
    if (oldUid && resourceUrl && pc?.connectionState === 'connected') {
      switchSource(newUid);
    } else {
      gateOnReady();
    }
  });

  // Sync mutedState → video.muted
  watch(() => mutedState.value[props.uid], (isMuted) => {
    if (videoPlayer.value && videoPlayer.value.muted !== isMuted) {
      videoPlayer.value.muted = isMuted;
    }
  });

  return { videoPlayer, mutedState };
}
