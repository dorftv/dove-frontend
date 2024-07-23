let globalMutedState = null;
let initializedEntities = null;

export function useMutedState() {
  if (!globalMutedState) {
    globalMutedState = reactive({});
    initializedEntities = new Set();
  }

  const { sceneMixers, inputs, programMixer } = useEntities();

  const allEntities = computed(() => {
    const entitySet = [...sceneMixers.value, ...inputs.value];
    if (programMixer.value) {
      entitySet.push(programMixer.value);
    }
    return entitySet;
  });

  const initializeMutedState = () => {

    allEntities.value.forEach(entity => {
      if (!initializedEntities.has(entity.uid)) {
        initializedEntities.add(entity.uid);
        globalMutedState[entity.uid] = true;
      }
      globalMutedState[programMixer.value.uid] = false;

    });

  };

  const setMutedState = (uid, isMuted) => {
    Object.keys(globalMutedState).forEach(key => {
      globalMutedState[key] = key === uid ? isMuted : true;
    });

  };

  initializeMutedState();

  watch(allEntities, (newEntities) => {
    newEntities.forEach(entity => {
      if (!initializedEntities.has(entity.uid)) {
        initializedEntities.add(entity.uid);
        globalMutedState[entity.uid] = false;
      }
    });

  }, { deep: true });

  return {
    mutedState: globalMutedState,
    setMutedState
  };
}