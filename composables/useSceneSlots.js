export function useSceneSlots(getScene) {
  const notify = useNotify();
  const { updateEntity } = useEntities();

  const addingSlot = ref(false);
  const dropOver = ref(false);
  const dragCount = ref(0);

  const addSlot = async (src) => {
    const scene = toValue(getScene);
    addingSlot.value = true;
    try {
      const result = await useApiFetch('/api/mixer/add_slot', {
        method: 'POST',
        body: { uid: scene.uid },
      });
      if (src && result?.index !== undefined) {
        await useApiFetch('/api/mixer/add_source', {
          method: 'POST',
          body: { src, target: scene.uid, index: result.index },
        });
      }
    } catch (error) {
      notify.error('Failed to add slot');
    } finally {
      addingSlot.value = false;
    }
  };

  const onDropAdd = (event) => {
    dropOver.value = false;
    dragCount.value = 0;
    const uid = event.dataTransfer.getData('application/x-dove-input');
    if (uid) addSlot(uid);
  };

  return {
    addingSlot,
    dropOver,
    dragCount,
    addSlot,
    onDropAdd,
  };
}
