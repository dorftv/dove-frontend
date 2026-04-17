export const useCreateEntity = (entityType) => {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const fetchError = ref(null);
  const formData = reactive({});
  const availSrc = ref([]);
  const types = ref([]);
  const activeTabIndex = ref(0);
  const selectedResolution = ref(null);

  const { mixers } = useEntities();
  const doveConfig = useDoveConfig();
  const notify = useNotify();

  const path = entityType === 'outputs' ? '/api/outputs' : '/api/inputs';

  const resolutionOptions = computed(() => doveConfig.resolutionOptions.value);
  const defaultResolution = computed(() => doveConfig.defaultResolution.value);

  const updateResolutionDimensions = () => {
    if (!selectedResolution.value) return;

    const dimensions = doveConfig.getResolutionDimensions(selectedResolution.value);
    if (!dimensions) return;

    types.value.forEach((type) => {
      if (formData[type.key]) {
        formData[type.key].width = dimensions.width;
        formData[type.key].height = dimensions.height;
      }
    });
  };

  const fetchTypes = async () => {
    isLoading.value = true;
    try {
      if (entityType === 'mixers') {
        types.value = [{
          key: 'scene',
          label: 'Scene',
          fields: [
            { name: 'width', type: 'integer', label: 'Width', required: true },
            { name: 'height', type: 'integer', label: 'Height', required: true }
          ]
        }];
      } else {
        const data = await useApiFetch(`${path}/types`);
        if (typeof data === 'object' && !Array.isArray(data)) {
          types.value = Object.entries(data).map(([key, value]) => ({ key, ...value }));
        } else {
          throw new Error('Unexpected response structure');
        }
      }
      initializeFormData(types.value);
    } catch (error) {
      fetchError.value = error;
    } finally {
      isLoading.value = false;
    }
  };

  const initializeFormData = (typesArray) => {
    typesArray.forEach((type) => {
      if (!(type.key in formData)) {
        formData[type.key] = {};
        if (Array.isArray(type.fields)) {
          type.fields.forEach((field) => {
            if (field.default != null) {
              formData[type.key][field.name] = field.default;
            } else {
              formData[type.key][field.name] = field.type === 'boolean' ? false : '';
            }
          });
        }

        const resolution = selectedResolution.value || defaultResolution.value;
        if (resolution) {
          const dimensions = doveConfig.getResolutionDimensions(resolution);
          if (dimensions) {
            formData[type.key].width = dimensions.width;
            formData[type.key].height = dimensions.height;
          }
        }
      }
    });

    if (entityType === "outputs" && availSrc.value.length > 0) {
      typesArray.forEach((type) => {
        formData[type.key].src = availSrc.value[0].value;
      });
    }

    if (entityType === "inputs") {
      typesArray.forEach((type) => {
        formData[type.key].volume = 0.8;
        formData[type.key].preview = true;
      });
    }
  };

  const submitCreate = async (itemType) => {
    const body = { ...formData[itemType] };
    if (entityType === 'mixers') {
      body.type = 'scene';
    }
    const submitPath = entityType === 'mixers' ? '/api/mixers' : `${path}/${itemType}`;
    isOpen.value = false;
    try {
      return await useApiFetch(submitPath, { method: 'PUT', body });
    } catch (error) {
      const detail = error?.data?.detail;
      notify.error(typeof detail === 'string' ? detail : `Failed to create ${entityType === 'mixers' ? 'scene' : entityType.slice(0, -1)}`);
    }
  };

  const selectedType = computed(() => types.value[activeTabIndex.value] || null);

  const onTabChange = (event) => {
    activeTabIndex.value = event.index;
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  watch(isOpen, (newValue) => {
    if (newValue === false) {
      Object.keys(formData).forEach(key => delete formData[key]);
      initializeFormData(types.value);
      selectedResolution.value = defaultResolution.value;
      activeTabIndex.value = 0;
      // Blur focus so Enter key doesn't re-trigger dialog
      document.activeElement?.blur();
    }
  });

  watchEffect(() => {
    if (mixers.value && mixers.value.length > 0) {
      availSrc.value = mixers.value.map(item => ({
        name: item.name,
        value: item.uid,
      }));
    }
  });

  watch(selectedResolution, updateResolutionDimensions);

  watch(defaultResolution, (newDefault) => {
    if (newDefault && !selectedResolution.value) {
      selectedResolution.value = newDefault;
    }
  }, { immediate: true });

  onMounted(async () => {
    await doveConfig.fetchConfig();
    if (defaultResolution.value) {
      selectedResolution.value = defaultResolution.value;
    }
    await fetchTypes();
  });

  return {
    isOpen,
    toggle,
    isLoading,
    fetchError,
    formData,
    availSrc,
    types,
    resolutionOptions,
    selectedResolution,
    fetchTypes,
    submitCreate,
    activeTabIndex,
    selectedType,
    onTabChange,
    initializeFormData,
  };
};
