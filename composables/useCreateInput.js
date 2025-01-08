export const useCreateInput = () => {
  const baseCreate = useCreateEntity('inputs');
  const { sceneMixerSource, sceneMixers } = useEntities();
  const { addInput, proxyTypes } = useDoveConfig();

  const selectedSceneProgram = ref(false);
  const proxyItems = ref({});

  const selectedScene = reactive({
    uid: null,
    slot: null
  });

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
        // @TODO Add Toast
      } catch (error) {
        // @TODO Add Toast
      }
    }
  };

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
        // @TODO Add Toast
      } catch (error) {
        // @TODO Add Toast
      }
    }
  };

  const handleProxyNameChange = (itemLabel, field, proxyType, value) => {
    const selectedItem = proxyItems.value[proxyType]?.find(item => item.url === value);
    if (selectedItem) {
      baseCreate.formData[itemLabel][field] = value;
      baseCreate.formData[itemLabel]['name'] = selectedItem.name;
    }
  };

  const fetchItems = async (proxyType) => {
    const { data, error } = await useFetch(() => `/proxy/${proxyType}`);
    if (error.value) {
      proxyItems.value[proxyType] = [];
      console.error('Failed to fetch items from proxy:', error.value);
    } else {
      proxyItems.value[proxyType] = data.value;
    }
  };

  const currentSources = computed(() => {
    if (!selectedScene.uid) return [];
    return sceneMixerSource(selectedScene.uid);
  });
  
  const filteredSources = computed(() => {
    return currentSources.value.filter(source => !source.src_locked);
  });

  watch(() => selectedScene.uid, (newUid) => {
    if (newUid) {
      const sources = sceneMixerSource(newUid);
      const firstAvailableSlot = sources.find(source => !source.id);
      if (firstAvailableSlot) {
        selectedScene.slot = firstAvailableSlot.index;
      }
    } else {
      selectedScene.slot = null;
    }
  });

  const resetInputForm = () => {
    selectedScene.uid = null;
    selectedScene.slot = null;
    selectedSceneProgram.value = false;
    proxyItems.value = {};
  };

  watch(() => baseCreate.isOpen, (isOpen) => {
    if (!isOpen) {
      resetInputForm();
    }
  });

  const initializeInputFormData = () => {
    baseCreate.initializeFormData(baseCreate.types.value);
    resetInputForm();
  };

  const submitCreateInput = async (itemType) => {
    const responseJson = await baseCreate.submitCreate(itemType);
    if (responseJson) {
      await submitAddToScene(responseJson);
      resetInputForm();
    }
    return responseJson;
  };

  onMounted(() => {
    baseCreate.fetchTypes();
    initializeInputFormData();
  });

  return {
    ...baseCreate,
    selectedSceneProgram,
    proxyItems,
    selectedScene,
    currentSources: filteredSources,
    submitCreateInput,
    handleProxyNameChange,
    fetchItems,
    addInput,
    proxyTypes,
    sceneMixers,
  };
};
