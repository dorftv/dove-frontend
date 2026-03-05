export function useServerLoad() {
  const load = useState('server-load', () => null);
  let timer = null;

  const fetchLoad = async () => {
    try {
      load.value = await $fetch('/api/load');
    } catch {
      load.value = null;
    }
  };

  onMounted(() => {
    fetchLoad();
    timer = setInterval(fetchLoad, 5000);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  return { load };
}
