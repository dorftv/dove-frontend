// composables/useDoveConfig.js
import { ref, onMounted, computed } from 'vue';
import { useFetch } from 'nuxt/app';

export default function useDoveConfig() {
  const config = ref(null);
  const error = ref(null);
  const defaultResolution = ref(null);
  const proxyTypes = ref(false);
  const addInput = ref(true)
  const addOutput = ref(true)
  const addScene = ref(true)


  const fetchConfig = async () => {
    try {
      const { data, error: fetchError } = await useFetch('/api/config');

      if (fetchError.value) {
        throw new Error('Failed to fetch config');
      }

      config.value = data.value;
      proxyTypes.value = config.value.proxy;
      defaultResolution.value = config.value.main.default_resolution;
      addInput.value = config.value.ui.add_input;
      addOutput.value = config.value.ui.add_output;
      addScene.value = config.value.ui.add_scene;

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
    proxyTypes,
    resolutionOptions: computed(getResolutionOptions),
    defaultResolution,
    getResolutionDimensions,
    getMainConfig,
    getUIConfig,
    addInput,
    addOutput,
    addScene,
  };
}