/**
 * Minimal WHEP client — no library dependency.
 * Direct control over RTCPeerConnection, resource URL, and source switching.
 */

export function useWhepPlayer(props, { onError } = {}) {
  const videoPlayer = ref(null);
  const { mutedState, setMutedState } = useMutedState();
  const { programMixer } = useEntities();
  const toast = useToast();

  let pc = null;           // RTCPeerConnection
  let resourceUrl = null;  // WHEP resource URL (from POST Location header)
  let failCount = 0;
  let autoplayToastShown = false;
  let volumeHandler = null;
  let statsInterval = null;
  let lastBytesReceived = 0;
  let stalledSince = 0;
  const MAX_RETRIES = 3;
  const STALL_THRESHOLD = 8000; // ms with no new bytes → reconnect

  const stopStatsMonitor = () => {
    if (statsInterval) { clearInterval(statsInterval); statsInterval = null; }
    lastBytesReceived = 0;
    stalledSince = 0;
  };

  const startStatsMonitor = () => {
    stopStatsMonitor();
    statsInterval = setInterval(async () => {
      if (!pc || pc.connectionState !== 'connected') return;
      try {
        const stats = await pc.getStats();
        let totalBytes = 0;
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp') totalBytes += report.bytesReceived || 0;
        });
        if (totalBytes > lastBytesReceived) {
          lastBytesReceived = totalBytes;
          stalledSince = 0;
        } else {
          if (!stalledSince) stalledSince = Date.now();
          else if (Date.now() - stalledSince > STALL_THRESHOLD) {
            console.warn('WHEP: media stalled, reconnecting');
            stopStatsMonitor();
            initializePlayer();
          }
        }
      } catch {}
    }, 3000);
  };

  const cleanup = () => {
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
      fetch(resourceUrl, { method: 'DELETE' }).catch(() => {});
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
    let mediaReceived = false;
    let mediaTimeout = null;
    const stream = new MediaStream();

    pc.ontrack = (event) => {
      stream.addTrack(event.track);
      if (videoPlayer.value) {
        videoPlayer.value.srcObject = stream;
        mediaReceived = true;
        if (mediaTimeout) { clearTimeout(mediaTimeout); mediaTimeout = null; }
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc?.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        // Start media timeout — if no track arrives within 5s, reconnect
        if (!mediaReceived) {
          mediaTimeout = setTimeout(() => {
            if (!mediaReceived && pc) {
              console.warn('WHEP: connected but no media, reconnecting');
              setTimeout(initializePlayer, 100);
            }
          }, 5000);
        }
      } else if (state === 'failed') {
        failCount++;
        if (failCount >= MAX_RETRIES && onError) {
          onError();
        } else {
          setTimeout(initializePlayer, 500);
        }
      } else if (state === 'disconnected') {
        // Brief disconnection — wait before reconnecting (might recover)
        setTimeout(() => {
          if (pc?.iceConnectionState === 'disconnected') {
            failCount++;
            if (failCount < MAX_RETRIES) setTimeout(initializePlayer, 500);
            else if (onError) onError();
          }
        }, 3000);
      }
    };

    try {
      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering — null candidate = all candidates gathered
      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          pc.onicecandidate = (event) => {
            if (event.candidate === null) resolve();
          };
          setTimeout(resolve, 5000);
        }
      });

      // POST offer to WHEP endpoint
      const resp = await fetch(`/whep/${props.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription.sdp,
      });

      if (!resp.ok) {
        throw new Error(`WHEP POST failed: ${resp.status}`);
      }

      // Extract resource URL from Location header
      const location = resp.headers.get('Location');
      if (location) {
        resourceUrl = location.startsWith('/') ? location : new URL(location).pathname;
      }

      // Set remote answer
      const answerSdp = await resp.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      failCount = 0;
      startStatsMonitor();

      // Autoplay
      try {
        await videoPlayer.value.play();
      } catch {
        setMutedState(props.uid, true);
        videoPlayer.value.muted = true;
        try { await videoPlayer.value.play(); } catch {}
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
      console.error('WHEP player error:', error);
      failCount++;
      if (failCount >= MAX_RETRIES && onError) {
        onError();
      }
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

    try {
      const resp = await fetch(resourceUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: newUid }),
      });
      if (!resp.ok) throw new Error(`Switch failed: ${resp.status}`);
      // Stream switches on backend — same connection, new frames arrive
    } catch {
      // Fallback: full reconnect
      await initializePlayer();
    }
  };

  onMounted(() => {
    volumeHandler = () => {
      const isMuted = videoPlayer.value?.muted;
      if (isMuted !== mutedState.value[props.uid]) {
        setMutedState(props.uid, isMuted);
      }
    };
    videoPlayer.value?.addEventListener('volumechange', volumeHandler);
    initializePlayer();
  });

  onUnmounted(cleanup);

  // On uid change: try seamless switch, fallback to reconnect
  watch(() => props.uid, (newUid, oldUid) => {
    if (oldUid && resourceUrl && pc?.connectionState === 'connected') {
      switchSource(newUid);
    } else {
      initializePlayer();
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
