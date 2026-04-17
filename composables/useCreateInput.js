export const useCreateInput = () => {
  const baseCreate = useCreateEntity('inputs');
  const { sceneMixerSource, sceneMixers } = useEntities();
  const { addInput, proxyTypes } = useDoveConfig();
  const { proxyItems, fetchItems, handleProxyName } = useProxyItems();
  const notify = useNotify();

  const selectedSceneProgram = ref(false);

  const selectedScene = reactive({
    uid: null,
    slot: null
  });

  const submitCutProgram = async () => {
    if (selectedSceneProgram.value) {
      try {
        await useApiFetch('/api/mixer/cut_program', {
          method: 'POST',
          body: { src: selectedScene.uid },
        });
      } catch (error) {
        console.error('Failed to cut program:', error);
        notify.error('Failed to cut program');
      }
    }
  };

  const submitAddToScene = async (responseJson) => {
    if (selectedScene.uid && selectedScene.slot !== null) {
      try {
        await useApiFetch('/api/mixer/add_source', {
          method: 'POST',
          body: {
            src: responseJson.uid,
            target: selectedScene.uid,
            index: selectedScene.slot
          },
        });
        await submitCutProgram();
      } catch (error) {
        console.error('Failed to add to scene:', error);
        notify.error('Failed to add input to scene');
      }
    }
  };

  const handleProxyNameChange = (itemLabel, field, proxyType, value) => {
    handleProxyName(itemLabel, field, proxyType, value, baseCreate.formData);
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
