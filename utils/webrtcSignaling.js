/**
 * WHEP/WHIP signaling shared by the WHEP players and the WHIP publisher.
 * Non-trickle: waits for ICE gathering, then POSTs the complete offer.
 */

const ICE_GATHER_TIMEOUT_MS = 5000;

/** Send the local offer to `endpoint`, apply the answer. Returns the resource URL (for PATCH/DELETE). */
export async function negotiateWebRTC(pc, endpoint) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Wait for ICE gathering — null candidate = all candidates gathered
  await new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const timer = setTimeout(resolve, ICE_GATHER_TIMEOUT_MS);
    pc.onicecandidate = (event) => {
      if (event.candidate === null) {
        clearTimeout(timer);
        pc.onicecandidate = null;
        resolve();
      }
    };
  });

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: pc.localDescription.sdp,
  });
  if (!resp.ok) throw new Error(`POST ${endpoint} failed: ${resp.status}`);

  const location = resp.headers.get('Location');
  const resourceUrl = location ? (location.startsWith('/') ? location : new URL(location).pathname) : null;
  await pc.setRemoteDescription({ type: 'answer', sdp: await resp.text() });
  return resourceUrl;
}

/** End a WHEP/WHIP session. keepalive: also delivered during page unload. */
export function deleteWebRTCResource(resourceUrl) {
  fetch(resourceUrl, { method: 'DELETE', keepalive: true }).catch(() => {});
}

/** Switch a running WHEP session to another source (backend swaps tee pads). Returns true on success. */
export async function switchWebRTCSource(resourceUrl, sourceUid) {
  try {
    const resp = await fetch(resourceUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: sourceUid }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}
