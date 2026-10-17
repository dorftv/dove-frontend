export function useServerLoad() {
  const load = useState('server-load', () => null);

  const uptime = computed(() => {
    const s = load.value?.uptime;
    if (s == null) return '';
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  });

  // What the backend uses with the processes it started (the web pages' WebKit), against the
  // machine's memory; older backends only say what the backend itself uses
  const memoryUsed = computed(() => load.value?.memory?.used_mb ?? load.value?.memory?.rss_mb);

  const memory = computed(() => {
    const m = load.value?.memory;
    if (!memoryUsed.value) return '';
    if (m.total_mb) return `${memoryUsed.value}/${m.total_mb}MB`;
    return `${memoryUsed.value}MB`;
  });

  const memoryPercent = computed(() => {
    const m = load.value?.memory;
    if (!memoryUsed.value || !m?.total_mb) return 0;
    return Math.round(memoryUsed.value / m.total_mb * 100);
  });

  const memoryParts = computed(() => {
    const m = load.value?.memory;
    if (m?.pages_mb == null) return '';
    return `Backend ${m.used_mb - m.pages_mb} MB (GStreamer included), web pages ${m.pages_mb} MB; program code not counted`;
  });

  const viewers = computed(() => load.value?.viewers ?? 0);

  const previewFps = computed(() => load.value?.preview_fps ?? null);

  // PUT new preview fps; backend broadcasts updated value via /api/v2/load.
  const setPreviewFps = (n) => useApiFetch('/api/v2/load/preview_fps', {
    method: 'PUT',
    body: { fps: n },
  });

  // worst-case status across all metrics
  const status = computed(() => {
    if (!load.value) return 'unknown';
    const lp = load.value.load_percent ?? 0;
    const mp = memoryPercent.value;
    if (lp > 80 || mp > 80) return 'critical';
    if (lp > 50 || mp > 50) return 'warning';
    return 'ok';
  });

  return { load, uptime, memory, memoryPercent, memoryParts, viewers, status, previewFps, setPreviewFps };
}
