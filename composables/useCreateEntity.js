

export const useCreateEntity = (entityType) => {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const fetchError = ref(null);
  const formData = reactive({});
  const availSrc = ref([]);
  const types = ref([]);
  const selectedSceneActive = ref(false);
  const selectedSceneProgram = ref(false);


  const { mixers, sceneMixerSource } = useEntities();

  const { getUIConfig, resolutionOptions, defaultResolution, getResolutionDimensions } = useDoveConfig();

  const selectedResolution = ref(defaultResolution);
  const path = entityType === 'outputs' ? '/api/outputs' : '/api/inputs';

  const selectedScene = reactive({
    uid: null,
    slot: null
 });

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
        if (entityType === "inputs") {
          formData[type.key] = {
            volume: 0.8,
          };
        }
        if (entityType === "outputs") {
          formData[type.key] = {

          };
        }
        if (Array.isArray(type.fields)) {
          type.fields.forEach((field) => {
            formData[type.key][field.name] = field.type === 'boolean' ? false : '';
          });
        }
      }
    });
  };


  const submitCutProgram = async () => {
    if (selectedSceneProgram.value) {
      try {
        const cutProgramResponse = await fetch(`/api/mixer/cut_program`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            src: selectedScene.uid
          }),
        });
        const cutProgramResponseJson = await cutProgramResponse.json();


        console.log('Cut Scene to Program response:', cutProgramResponseJson);
      } catch (error) {
        console.error('Error cut Program:', error);
        }
    }
  }

  const submitAddToScene = async (responseJson) => {
    if (selectedScene.uid && selectedScene.slot !== null) {

    try {
      const cutSceneResponse = await fetch(`/api/mixer/add_source`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          src: responseJson.uid,
          target: selectedScene.uid,
          index: selectedScene.slot
        }),
      });
      const cutSceneResponseJson = await cutSceneResponse.json();

      await submitCutProgram();
      console.log('Cut Scene to Source response:', cutSceneResponseJson);
    } catch (error) {
      console.error('Error in cut Input to Scene:', error);
      }
    }
  }


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
      await submitAddToScene(responseJson);

      isOpen.value = false;
    } catch (error) {
      isOpen.value = false;
    }
  };

  watch(isOpen, (newValue) => {
    if (newValue === false) {
      Object.keys(formData).forEach(key => delete formData[key]);
      initializeFormData(types.value);
      // @TODO: resetting is not working as expected
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

  const currentSources = computed(() => {
    if (!selectedScene.uid) return []
    return sceneMixerSource(selectedScene.uid)
  })

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
    selectedScene,
    currentSources,
    selectedSceneProgram,
    fetchTypes,
    submitCreate,
    resolutionWatcher,
  };
};
