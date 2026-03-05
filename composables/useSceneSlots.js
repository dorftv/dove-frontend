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
      const result = await $fetch('/api/mixer/add_slot', {
        method: 'POST',
        body: { uid: scene.uid },
      });
      if (src && result?.index !== undefined) {
        updateEntity('mixer', {
          uid: scene.uid,
          index: result.index,
          src,
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
    const uid = event.dataTransfer.getData('text/plain');
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
