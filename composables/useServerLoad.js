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

  const memory = computed(() => {
    const m = load.value?.memory;
    if (!m?.rss_mb) return '';
    if (m.total_mb) return `${m.rss_mb}/${m.total_mb}MB`;
    return `${m.rss_mb}MB`;
  });

  const memoryPercent = computed(() => {
    const m = load.value?.memory;
    if (!m?.rss_mb || !m?.total_mb) return 0;
    return Math.round(m.rss_mb / m.total_mb * 100);
  });

  const viewers = computed(() => load.value?.viewers ?? 0);

  // worst-case status across all metrics
  const status = computed(() => {
    if (!load.value) return 'unknown';
    const lp = load.value.load_percent ?? 0;
    const mp = memoryPercent.value;
    if (lp > 80 || mp > 80) return 'critical';
    if (lp > 50 || mp > 50) return 'warning';
    return 'ok';
  });

  return { load, uptime, memory, memoryPercent, viewers, status };
}
