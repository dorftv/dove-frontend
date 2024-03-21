// composables/useDoveConfig.js
let config = null;
let error = null;

export default function useDoveConfig() {
  if (config !== null) {
    return {
      config,
      error,
      fetchConfig,
      getResolutionOptions,
      defaultResolution,
      getResolutionDimensions,
      getMainConfig,
      getUIConfig,
    };
  }

  config = ref(null);
  error = ref(null);
  const defaultResolution = ref(null); // initial value

  const fetchConfig = async () => {
    try {
      const { data, error: fetchError } = await useFetch('/api/config');
  
      if (fetchError.value) {
        throw new Error('Failed to fetch config');
      }
  
      config.value = data.value;
      defaultResolution.value = config.value.main.default_resolution; // update defaultResolution
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching config:', err);
    }
  };

  const getResolutionOptions = () => {
    if (!config.value || !config.value.resolutions) {
      return [];
    }

    return Object.entries(config.value.resolutions).map(([key, value]) => ({
      label: key + ' (' + value.width + 'x' + value.height + ')',
      key: key,
      width: value.width,
      height: value.height,
    }));
  };

  const getResolutionDimensions = (resolution) => {
    if (!config.value || !config.value.resolutions || !config.value.resolutions[resolution]) {
      return null;
    }

    const { width, height } = config.value.resolutions[resolution];
    return { width, height };
  };

  const getMainConfig = () => {
    if (!config.value || !config.value.main) {
      return {};
    }

    return config.value.main;
  };

  const getUIConfig = () => {
    if (!config.value || !config.value.ui) {
      return {};
    }

    return config.value.ui;
  };

  onMounted(async () => {
    await fetchConfig();
  });

  return {
    config,
    error,
    fetchConfig,
    resolutionOptions: computed(() => getResolutionOptions()),
    defaultResolution,
    getResolutionDimensions,
    getMainConfig,
    getUIConfig,
  };
}