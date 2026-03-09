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

  return { load, uptime };
}
