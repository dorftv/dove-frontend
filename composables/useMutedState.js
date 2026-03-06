export function useMutedState() {
  const mutedState = useState('muted-state', () => ({}));
  const initializedEntities = useState('muted-initialized', () => new Set());

  const { sceneMixers, inputs, programMixer } = useEntities();

  // Check if a uid has v4l2 audio anywhere in its chain
  const hasV4l2Audio = (uid) => {
    // Direct v4l2 input
    const input = inputs.value.find(i => i.uid === uid);
    if (input?.type === 'v4l2src') return true;

    // Scene containing a v4l2 input
    const scene = sceneMixers.value.find(s => s.uid === uid);
    if (scene) {
      return scene.sources?.some(src =>
        inputs.value.find(i => i.uid === src.src && i.type === 'v4l2src')
      );
    }

    // Program mixer — check active scene
    if (programMixer.value?.uid === uid) {
      const activeSource = programMixer.value.sources?.[programMixer.value.active];
      if (activeSource?.src) return hasV4l2Audio(activeSource.src);
    }

    return false;
  };

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
    if (programMixer.value && !hasV4l2Audio(programMixer.value.uid)) {
      mutedState.value[programMixer.value.uid] = false;
    }
  };

  const setMutedState = (uid, isMuted) => {
    if (isMuted) {
      mutedState.value[uid] = true;
    } else {
      // Block unmute if v4l2 audio would cause feedback
      if (hasV4l2Audio(uid)) return;

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

    // Force-mute any unmuted entity that now has v4l2 in its chain
    Object.keys(mutedState.value).forEach(uid => {
      if (!mutedState.value[uid] && hasV4l2Audio(uid)) {
        mutedState.value[uid] = true;
      }
    });
  }, { deep: true });

  return {
    mutedState,
    setMutedState
  };
}
