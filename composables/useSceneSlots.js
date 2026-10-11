export function useSceneSlots(getScene) {
  const notify = useNotify();

  const addingSlot = ref(false);
  const dropOver = ref(false);
  const dragCount = ref(0);

  const addSlot = async (src) => {
    const scene = toValue(getScene);
    addingSlot.value = true;
    try {
      // A new slot may come with its source
      await useApiFetch(`/api/v2/scenes/${scene.uid}/slots`, {
        method: 'POST',
        body: src ? { src } : {},
      });
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
