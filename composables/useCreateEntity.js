

export const useCreateEntity = (entityType) => {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const fetchError = ref(null);
  const formData = reactive({});
  const availSrc = ref([]);
  const types = ref([]);


  const { mixers } = useEntities();

  const { resolutionOptions, defaultResolution, getResolutionDimensions } = useDoveConfig();

  const selectedResolution = ref(defaultResolution);
  const path = entityType === 'outputs' ? '/api/outputs' : '/api/inputs';

  const fetchTypes = async () => {
    isLoading.value = true;
    try {
      const response = await fetch(`${path}/types`);
      const data = await response.json();
      if (typeof data === 'object' && !Array.isArray(data)) {
        types.value = Object.entries(data).map(([key, value]) => ({ key, ...value }));
      } else {
        throw new Error('Unexpected response structure');
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
        formData[type.key] = {

        };
        if (Array.isArray(type.fields)) {
          type.fields.forEach((field) => {
            formData[type.key][field.name] = field.type === 'boolean' ? false : '';
          });
        }
      }
    });
  };

  const submitCreate = async (itemType) => {
    try {
      const response = await fetch(`${path}/${itemType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData[itemType]),
      });
      const responseJson = await response.json();
      isOpen.value = false;
    } catch (error) {
      console.error(`Failed to create ${entityType}:`, error);
    }
  };
  // Watcher for isOpen
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

  watchEffect(() => {
    types.value.forEach(type => {
      if(formData[type.key].resolution) {
        const { selectedResolution } = formData[type.key].resolution;

        const dimensions = getResolutionDimensions(selectedResolution);
        if (dimensions) {
          formData[type.key].resolution.width = dimensions.width;
          formData[type.key].resolution.height = dimensions.height;
        }
      }
    });
  });

const resolutionWatcher = () => {
    watch(selectedResolution, (newResolutionKey) => {
      const resolvedOptions = resolutionOptions.value;
      if (Array.isArray(resolvedOptions)) {
        const selectedResolutionObj = resolvedOptions.find(option => option.key === newResolutionKey);

        if (selectedResolutionObj) {
          const currentTypes = types.value;
          if (Array.isArray(currentTypes)) {
            currentTypes.forEach((type) => {
              if (formData[type.label]) {
                formData[type.label].width = selectedResolutionObj.width;
                formData[type.label].height = selectedResolutionObj.height;
              }
            });
          }
        }
      }
    });
  };

  onMounted(() => {
    fetchTypes();
    resolutionWatcher();
    selectedResolution.value = defaultResolution.value
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
    resolutionWatcher,
  };
};
