export function useMutedState() {
  const mutedState = useState('muted-state', () => ({}));
  const initializedEntities = useState('muted-initialized', () => new Set());

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
      if (!initializedEntities.value.has(entity.uid)) {
        initializedEntities.value.add(entity.uid);
        mutedState.value[entity.uid] = true;
      }
    });
    if (programMixer.value) {
      mutedState.value[programMixer.value.uid] = false;
    }
  };

  const setMutedState = (uid, isMuted) => {
    if (isMuted) {
      mutedState.value[uid] = true;
    } else {
      Object.keys(mutedState.value).forEach(key => {
        mutedState.value[key] = key === uid ? false : true;
      });
    }
  };

  initializeMutedState();

  watch(allEntities, (newEntities) => {
    newEntities.forEach(entity => {
      if (!initializedEntities.value.has(entity.uid)) {
        initializedEntities.value.add(entity.uid);
        mutedState.value[entity.uid] = true;
      }
    });
  }, { deep: true });

  return {
    mutedState,
    setMutedState
  };
}
