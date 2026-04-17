import { useStorage } from '@vueuse/core';

export function useActiveScene() {
  const activeIndex = useState('active-scene-index', () => 0);
  const selectedScene = useState('active-scene-selected', () => null);
  const notify = useNotify();

  const { sceneMixers, programMixer } = useEntities();

  const activeScene = computed(() => {
    if (programMixer.value &&
        programMixer.value.active !== undefined &&
        programMixer.value.sources &&
        sceneMixers.value) {
      const activeSourceIndex = programMixer.value.active;
      const activeSource = programMixer.value.sources[activeSourceIndex];
      if (activeSource && activeSource.src) {
        return sceneMixers.value.find(sceneMixer => sceneMixer.uid === activeSource.src);
      }
    }
    return null;
  });

  const handleSceneClick = (index) => {
    if (index >= 0 && index < sceneMixers.value.length) {
      activeIndex.value = index;
      selectedScene.value = sceneMixers.value[index];
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
      await useApiFetch('/api/mixer/cut_program', {
        method: 'POST',
        body,
      });
    } catch (err) {
      notify.error('Failed to switch scene');
    } finally {
      cutting.value = false;
    }
  };

  // When a scene is added, select it automatically
  watch(sceneMixers, (newSceneMixers, oldSceneMixers) => {
    if (newSceneMixers && oldSceneMixers && newSceneMixers.length > oldSceneMixers.length) {
      activeIndex.value = newSceneMixers.length - 1;
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

  // Keep selectedScene in sync with activeIndex
  let restored = false;
  watch([activeIndex, sceneMixers], ([newIndex, newSceneMixers]) => {
    if (!newSceneMixers || newSceneMixers.length === 0) {
      selectedScene.value = null;
      return;
    }
    if (!restored) {
      restored = true;
      restoreSelection(newSceneMixers);
      return;
    }
    if (newSceneMixers.length > newIndex) {
      selectedScene.value = newSceneMixers[newIndex];
    } else {
      activeIndex.value = newSceneMixers.length - 1;
      selectedScene.value = newSceneMixers[activeIndex.value];
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
