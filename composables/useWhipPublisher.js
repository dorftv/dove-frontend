/**
 * WHIP publisher composable — sends screen share or camera to DOVE via WebRTC.
 * Mirror of useWhepPlayer (which receives). Uses the same ICE/SDP patterns.
 */

const ICE_GATHER_TIMEOUT_MS = 5000;
const DISCONNECT_GRACE_MS = 5000;

export function useWhipPublisher(inputUid) {
  const publishState = ref('idle'); // idle | connecting | publishing | error

  let peerConnection = null;
  let resourceUrl = null;
  let localStream = null;

  const cleanup = (targetState = 'idle') => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
    }
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (resourceUrl) {
      fetch(resourceUrl, { method: 'DELETE', headers: useAuthHeaders() }).catch((e) => console.warn('WHIP DELETE failed:', e));
      resourceUrl = null;
    }
    publishState.value = targetState;
  };

  const publish = async (stream) => {
    cleanup();
    publishState.value = 'connecting';
    localStream = stream;

    peerConnection = new RTCPeerConnection();

    const currentPc = peerConnection; // capture for stale closure detection
    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection !== currentPc) return;
      const state = peerConnection?.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        publishState.value = 'publishing';
      } else if (state === 'failed') {
        cleanup('error');
      } else if (state === 'disconnected') {
        setTimeout(() => {
          if (peerConnection !== currentPc) return;
          if (peerConnection?.iceConnectionState === 'disconnected') cleanup();
        }, DISCONNECT_GRACE_MS);
      }
    };

    for (const track of stream.getTracks()) {
      peerConnection.addTrack(track, stream);
      track.onended = () => stop();
    }

    for (const transceiver of peerConnection.getTransceivers()) {
      transceiver.direction = 'sendonly';
    }

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Wait for ICE candidates to be gathered
      await new Promise((resolve) => {
        if (peerConnection.iceGatheringState === 'complete') {
          resolve();
        } else {
          // clear timeout + handler when candidate-null fires so closure doesn't leak
          const timer = setTimeout(resolve, ICE_GATHER_TIMEOUT_MS);
          peerConnection.onicecandidate = (event) => {
            if (event.candidate === null) {
              clearTimeout(timer);
              peerConnection.onicecandidate = null;
              resolve();
            }
          };
        }
      });

      const uid = unref(inputUid);
      const response = await fetch(`/whip/ingest/${uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp', ...useAuthHeaders() },
        body: peerConnection.localDescription.sdp,
      });

      if (!response.ok) {
        throw new Error(`WHIP POST failed: ${response.status}`);
      }

      const location = response.headers.get('Location');
      if (location) {
        resourceUrl = location.startsWith('/') ? location : new URL(location).pathname;
      }

      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
        publishState.value = 'publishing';
      }
    } catch (error) {
      console.error('WHIP publish error:', error);
      cleanup('error');
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      await publish(stream);
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') return;
      console.error('WHIP: getDisplayMedia failed:', error);
      publishState.value = 'error';
    }
  };

  const startCamera = async () => {
    try {
      // Video-only — backend handles video only, audio from audiotestsrc fallback
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      await publish(stream);
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') return;
      console.error('WHIP: getUserMedia failed:', error);
      publishState.value = 'error';
    }
  };

  const stop = () => cleanup();

  onUnmounted(cleanup);

  return { publishState, startScreenShare, startCamera, stop };
}
