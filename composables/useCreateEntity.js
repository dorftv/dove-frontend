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
        if (entityType === "inputs") {
          formData[type.key] = {
            volume: 0.8,
          };
        } else if (entityType === "outputs" || entityType === "mixers") {
          formData[type.key] = {};
        }
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
      if (entityType !== 'mixers') {
        await submitAddToScene(responseJson);
      }
      isOpen.value = false;
    } catch (error) {
      console.error('Error creating entity:', error);
      isOpen.value = false;
    }
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

  // For inputs: Set selectedScene.slot when selectedScene.uid changes
  watch(() => selectedScene.uid, (newUid) => {
    if (newUid && entityType === 'inputs') {
      const sources = sceneMixerSource(newUid);
      const firstAvailableSlot = sources.find(source => !source.id);
      if (firstAvailableSlot) {
        selectedScene.slot = firstAvailableSlot.index;
      }
    }
  });

  const currentSources = computed(() => {
    if (!selectedScene.uid) return []
    return sceneMixerSource(selectedScene.uid)
  })

  onMounted(() => {
    fetchTypes();
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
  };
};
