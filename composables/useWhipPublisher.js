/**
 * WHIP publisher composable — sends screen share or camera to DOVE via WebRTC.
 * Mirror of useWhepPlayer (which receives). Uses the same ICE/SDP patterns.
 */

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
      deleteWebRTCResource(resourceUrl);
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
      resourceUrl = await negotiateWebRTC(peerConnection, `/whip/ingest/${unref(inputUid)}`);

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
