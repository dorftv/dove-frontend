import { useStorage } from '@vueuse/core';

export function useActiveScene() {
  const activeIndex = useState('active-scene-index', () => 0);
  const selectedScene = useState('active-scene-selected', () => null);
  const notify = useNotify();

  const { scenes, program } = useEntities();

  // The scene that is on air, if what is on air is a scene
  const activeScene = computed(() => {
    const onAir = program.value?.on_air;
    return (onAir && scenes.value.find(scene => scene.uid === onAir)) || null;
  });

  const handleSceneClick = (index) => {
    if (index >= 0 && index < scenes.value.length) {
      activeIndex.value = index;
      selectedScene.value = scenes.value[index];
    }
  };

  const transition = useStorage('transition-mode', 'cut');
  const transitionDuration = useStorage('transition-duration', 1000);
  const savedSceneUid = useStorage('selected-scene-uid', null);

  const cutting = ref(false);

  const cutSceneToProgram = async () => {
    if (!selectedScene.value || cutting.value) return;

    cutting.value = true;
    try {
      const body = { src: selectedScene.value.uid };
      if (transition.value === 'fade') {
        body.transition = 'fade';
        body.duration = transitionDuration.value;
      }
      await useApiFetch('/api/v2/program/cut', {
        method: 'POST',
        body,
      });
    } catch (err) {
      notify.error('Failed to switch scene');
    } finally {
      cutting.value = false;
    }
  };

  // When a scene is added, select it automatically. A new scene is pushed onto the list: its
  // length changes, the list itself does not
  watch(() => scenes.value.length, (count, before) => {
    if (count > before) {
      activeIndex.value = count - 1;
    }
  });

  // Restore selected scene from storage, fall back to first
  const restoreSelection = (scenes) => {
    if (savedSceneUid.value) {
      const idx = scenes.findIndex(s => s.uid === savedSceneUid.value);
      if (idx !== -1) {
        activeIndex.value = idx;
        selectedScene.value = scenes[idx];
        return;
      }
    }
    activeIndex.value = 0;
    selectedScene.value = scenes[0] || null;
  };

  watch(selectedScene, (s) => {
    if (s?.uid) savedSceneUid.value = s.uid;
  });

  // Keep selectedScene in sync with activeIndex, and with the scene itself: an update replaces
  // the scene in the list, and the selection must not keep the old copy. Watched as a copy of
  // the list, which reads every element: replacing one is a change, not only a new list
  let restored = false;
  watch([activeIndex, () => [...scenes.value]], ([newIndex, newScenes]) => {
    if (!newScenes || newScenes.length === 0) {
      selectedScene.value = null;
      return;
    }
    if (!restored) {
      restored = true;
      restoreSelection(newScenes);
      return;
    }
    if (newScenes.length > newIndex) {
      selectedScene.value = newScenes[newIndex];
    } else {
      activeIndex.value = newScenes.length - 1;
      selectedScene.value = newScenes[activeIndex.value];
    }
  }, { immediate: true });

  return {
    selectedScene,
    activeScene,
    activeIndex,
    cutting,
    transition,
    transitionDuration,
    handleSceneClick,
    cutSceneToProgram,
  };
}
