export function useMutedState() {
  const mutedState = useState('muted-state', () => ({}));
  const initialized = useState('muted-initialized', () => ({}));

  const { sceneMixers, inputs, programMixer } = useEntities();

  const hasV4l2Audio = (uid) => {
    const input = inputs.value.find(i => i.uid === uid);
    if (input?.type === 'v4l2src' && input.has_audio !== false) return true;

    const scene = sceneMixers.value.find(s => s.uid === uid);
    if (scene) {
      return scene.sources?.some(src =>
        inputs.value.find(i => i.uid === src.src && i.type === 'v4l2src' && i.has_audio !== false)
      );
    }

    if (programMixer.value?.uid === uid) {
      const activeSource = programMixer.value.sources?.[programMixer.value.active];
      if (activeSource?.src) return hasV4l2Audio(activeSource.src);
    }

    return false;
  };

  const entityUids = computed(() => {
    const uids = [
      ...inputs.value.map(i => i.uid),
      ...sceneMixers.value.map(s => s.uid),
    ];
    if (programMixer.value) uids.push(programMixer.value.uid);
    return uids;
  });

  const setMutedState = (uid, isMuted) => {
    if (isMuted) {
      mutedState.value[uid] = true;
    } else {
      if (hasV4l2Audio(uid)) return;
      // Exclusive unmute: mute everything else
      const updated = {};
      for (const key of Object.keys(mutedState.value)) {
        updated[key] = key !== uid;
      }
      mutedState.value = updated;
    }
  };

  // Watch uid list (not deep entity changes) to register new entities
  watch(entityUids, (uids) => {
    let hasNew = false;
    for (const uid of uids) {
      if (!initialized.value[uid]) {
        initialized.value[uid] = true;
        mutedState.value[uid] = true;
        hasNew = true;
      }
    }
    // Auto-unmute program on first load if nothing else is unmuted
    if (hasNew && programMixer.value) {
      const pmUid = programMixer.value.uid;
      const anyUnmuted = Object.keys(mutedState.value).some(k => !mutedState.value[k]);
      if (!anyUnmuted && !hasV4l2Audio(pmUid)) {
        mutedState.value[pmUid] = false;
      }
    }
  }, { immediate: true });

  return {
    mutedState,
    setMutedState
  };
}
