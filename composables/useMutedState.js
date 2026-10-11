export function useMutedState() {
  const mutedState = useState('muted-state', () => ({}));
  const initialized = useState('muted-initialized', () => ({}));

  const { scenes, inputs, program } = useEntities();

  const hasV4l2Audio = (uid) => {
    const input = inputs.value.find(i => i.uid === uid);
    if (input?.type === 'v4l2src' && input.has_audio !== false) return true;

    const scene = scenes.value.find(s => s.uid === uid);
    if (scene) {
      return scene.slots?.some(slot =>
        inputs.value.find(i => i.uid === slot.src && i.type === 'v4l2src' && i.has_audio !== false)
      );
    }

    if (program.value?.uid === uid && program.value.on_air) {
      return hasV4l2Audio(program.value.on_air);
    }

    return false;
  };

  const entityUids = computed(() => {
    const uids = [
      ...inputs.value.map(i => i.uid),
      ...scenes.value.map(s => s.uid),
    ];
    if (program.value) uids.push(program.value.uid);
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

  // Watch uid list (not deep entity changes) to register new entities and prune deleted ones
  watch(entityUids, (uids) => {
    let hasNew = false;
    for (const uid of uids) {
      if (!initialized.value[uid]) {
        initialized.value[uid] = true;
        mutedState.value[uid] = true;
        hasNew = true;
      }
    }
    // prune entries for entities that no longer exist so maps don't grow unbounded
    const set = new Set(uids);
    for (const k of Object.keys(mutedState.value)) {
      if (!set.has(k)) {
        delete mutedState.value[k];
        delete initialized.value[k];
      }
    }
    // Auto-unmute program on first load if nothing else is unmuted
    if (hasNew && program.value) {
      const pmUid = program.value.uid;
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
