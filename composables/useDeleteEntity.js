export function useDeleteEntity(entityType, getEntity) {
  const { sceneMixers, programMixer } = useEntities();
  const confirm = useConfirm();
  const notify = useNotify();
  const deleting = ref(false);

  const doDelete = async (entity) => {
    deleting.value = true;
    try {
      if (entityType === 'encoder') {
        await $fetch(`/api/encoders/${entity.uid}`, { method: 'DELETE' });
      } else {
        const path = { input: '/api/inputs', output: '/api/outputs', scene: '/api/mixers' }[entityType];
        await $fetch(path, { method: 'DELETE', body: { uid: entity.uid } });
      }
    } catch (error) {
      notify.error(`Failed to remove ${entityType}`);
    } finally {
      deleting.value = false;
    }
  };

  const unlinkAndDelete = async (entity, sceneSlots) => {
    deleting.value = true;
    try {
      for (const { sceneUid, index } of sceneSlots) {
        await $fetch('/api/mixer/remove_source', {
          method: 'POST',
          body: { src: 'None', target: sceneUid, index },
        });
      }
      await doDelete(entity);
    } catch (error) {
      notify.error(`Failed to remove ${entityType}`);
    } finally {
      deleting.value = false;
    }
  };

  const getInputSceneSlots = (uid) => {
    const slots = [];
    for (const mixer of sceneMixers.value) {
      for (const source of mixer.sources) {
        if (source.src === uid) {
          slots.push({ sceneUid: mixer.uid, sceneName: mixer.name, index: source.index });
        }
      }
    }
    return slots;
  };

  const needsConfirmInput = (entity) => {
    const slots = getInputSceneSlots(entity.uid);
    if (slots.length > 0) {
      const names = [...new Set(slots.map(s => s.sceneName))].join(', ');
      return { message: `Delete input "${entity.name}"? It is used in: ${names}`, slots };
    }
    return null;
  };

  const needsConfirmScene = (entity) => {
    const hasInputs = entity.sources?.some(s => s.src && s.src !== 'None');
    const pm = programMixer.value;
    const isLive = pm?.sources?.some(s => s.src && s.src !== 'None' && s.src === entity.uid);
    if (isLive) return { message: `Delete scene "${entity.name}"? It is live on program.` };
    if (hasInputs) return { message: `Delete scene "${entity.name}"? It has inputs assigned.` };
    return null;
  };

  const needsConfirmOutputEncoder = (entity) => {
    const state = entity.state;
    if (state === 'EOS' || state === 'ERROR' || state === 'NULL') return null;
    return { message: `Delete ${entityType} "${entity.name || entity.element}"?` };
  };

  const submitRemove = () => {
    const entity = getEntity();
    if (!entity) return;

    let confirmation;
    if (entityType === 'input') {
      confirmation = needsConfirmInput(entity);
      if (confirmation) {
        confirm.require({
          message: confirmation.message,
          header: 'Confirm',
          acceptClass: 'p-button-danger',
          accept: () => unlinkAndDelete(entity, confirmation.slots),
        });
        return;
      }
    } else if (entityType === 'scene') {
      confirmation = needsConfirmScene(entity);
    } else {
      confirmation = needsConfirmOutputEncoder(entity);
    }

    if (confirmation) {
      confirm.require({
        message: confirmation.message,
        header: 'Confirm',
        acceptClass: 'p-button-danger',
        accept: () => doDelete(entity),
      });
    } else {
      doDelete(entity);
    }
  };

  return { deleting, submitRemove };
}
