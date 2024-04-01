// composables/useDoveConfig.js
import { ref, onMounted, computed } from 'vue';
import { useFetch } from 'nuxt/app';

export default function useDoveConfig() {
  const config = ref(null);
  const error = ref(null);
  const defaultResolution = ref(null);

  const fetchConfig = async () => {
    try {
      const { data, error: fetchError } = await useFetch('/api/config');

      if (fetchError.value) {
        throw new Error('Failed to fetch config');
      }

      config.value = data.value;
      defaultResolution.value = config.value.main.default_resolution;
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
    return config.value?.main || {};
  };

  const getUIConfig = () => {
    return config.value?.ui || {};
  };

  onMounted(fetchConfig);

  return {
    config,
    error,
    fetchConfig,
    resolutionOptions: computed(getResolutionOptions),
    defaultResolution,
    getResolutionDimensions,
    getMainConfig,
    getUIConfig,
  };
}