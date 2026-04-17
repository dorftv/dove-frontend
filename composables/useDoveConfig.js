export default function useDoveConfig() {
  const config = useState('dove-config', () => null);
  const error = useState('dove-config-error', () => null);
  const isLoading = useState('dove-config-loading', () => false);

  const defaultResolution = computed(() => config.value?.main?.default_resolution ?? null);
  const proxyTypes = computed(() => config.value?.proxy || false);
  const addInput = computed(() => config.value?.ui?.add_input ?? true);
  const addOutput = computed(() => config.value?.ui?.add_output ?? true);
  const addScene = computed(() => config.value?.ui?.add_scene ?? true);

  let configPromise = null;

  const fetchConfig = async () => {
    if (configPromise) return configPromise;
    if (isLoading.value || config.value) return config.value;

    isLoading.value = true;
    error.value = null;

    configPromise = (async () => {
      try {
        const data = await useApiFetch('/api/config');
        config.value = data;
        return config.value;
      } catch (err) {
        error.value = err.message;
        const notify = useNotify();
        notify.error('Failed to load configuration');
        throw err;
      } finally {
        isLoading.value = false;
        configPromise = null;
      }
    })();

    return configPromise;
  };

  const resolutionOptions = computed(() => {
    if (!config.value?.resolutions) return [];
    return Object.entries(config.value.resolutions).map(([key, value]) => ({
      label: `${key} (${value.width}x${value.height})`,
      key: key,
      width: value.width,
      height: value.height,
    }));
  });

  const getResolutionDimensions = (resolution) => {
    if (!config.value?.resolutions?.[resolution]) return null;
    const { width, height } = config.value.resolutions[resolution];
    return { width, height };
  };

  const getMainConfig = () => config.value?.main || {};
  const getUIConfig = () => config.value?.ui || {};

  // Auto-fetch on client
  if (import.meta.client && !config.value) {
    fetchConfig();
  }

  return {
    config: readonly(config),
    error: readonly(error),
    isLoading: readonly(isLoading),
    fetchConfig,
    proxyTypes,
    resolutionOptions,
    defaultResolution,
    getResolutionDimensions,
    getMainConfig,
    getUIConfig,
    addInput,
    addOutput,
    addScene,
  };
}
