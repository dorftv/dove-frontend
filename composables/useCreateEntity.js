export const useCreateEntity = (entityType) => {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const fetchError = ref(null);
  const formData = reactive({});
  const availSrc = ref([]);
  const types = ref([]);
  const activeTabIndex = ref(0);

  const { mixers } = useEntities();
  const { resolutionOptions, defaultResolution, getResolutionDimensions } = useDoveConfig();

  const selectedResolution = ref(defaultResolution);
  const path = entityType === 'outputs' ? '/api/outputs' : '/api/inputs';

  const updateResolutionDimensions = () => {
    const dimensions = getResolutionDimensions(selectedResolution.value);
    if (dimensions) {
      types.value.forEach((type) => {
        if (formData[type.key]) {
          formData[type.key].width = dimensions.width;
          formData[type.key].height = dimensions.height;
        }
      });
    }
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
        const response = await fetch(`${path}/types`);
        const data = await response.json();
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

  const initializeFormData = (types) => {
    types.forEach((type) => {
      if (!(type.key in formData)) {
        formData[type.key] = {};
        if (Array.isArray(type.fields)) {
          type.fields.forEach((field) => {
            formData[type.key][field.name] = field.type === 'boolean' ? false : '';
          });
        }

        const dimensions = getResolutionDimensions(defaultResolution.value);
        if (dimensions) {
          formData[type.key].width = dimensions.width;
          formData[type.key].height = dimensions.height;
        }
      }
    });

    if (entityType === "outputs" && availSrc.value.length > 0) {
      types.forEach((type) => {
        formData[type.key].src = availSrc.value[0].value;
      });
    }
  };

  const submitCreate = async (itemType) => {
    try {
      const body = { ...formData[itemType] };
      if (entityType === 'mixers') {
        body.type = 'scene';
      }
      const submitPath = entityType === 'mixers' ? '/api/mixers' : `${path}/${itemType}`;
      const response = await fetch(submitPath, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const responseJson = await response.json();
      isOpen.value = false;
      return responseJson;
    } catch (error) {
      // @TODO Add Toast
      isOpen.value = false;
    }
  };

  const onTabChange = (event) => {
    activeTabIndex.value = event.index;
  };

  watch(isOpen, (newValue) => {
    if (newValue === false) {
      Object.keys(formData).forEach(key => delete formData[key]);
      initializeFormData(types.value);
      selectedResolution.value = defaultResolution.value;
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

  onMounted(() => {
    fetchTypes();
    selectedResolution.value = defaultResolution.value;
  });

  return {
    isOpen,
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
    onTabChange,
    initializeFormData,
  };
};
