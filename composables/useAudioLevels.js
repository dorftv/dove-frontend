/**
 * Audio level meter data from server WebSocket.
 * Returns reactive L/R percentages and dB values for a given UID.
 */
export function useAudioLevels(uid) {
  const audioLevels = useState('audio-levels', () => ({}));

  const left = computed(() => audioLevels.value[toValue(uid)]?.left ?? 0);
  const right = computed(() => audioLevels.value[toValue(uid)]?.right ?? 0);

  const toDb = (pct) => {
    if (pct <= 0) return '';
    const db = 20 * Math.log10(pct / 100);
    return db > -0.5 ? '0.0' : db.toFixed(1);
  };

  const leftDb = computed(() => toDb(left.value));
  const rightDb = computed(() => toDb(right.value));

  return { left, right, leftDb, rightDb };
}
