export default function useActiveScene() {
  const activeIndex = useState('active-scene-index', () => 0);
  const selectedScene = useState('active-scene-selected', () => null);

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

  const cutSceneToProgram = async () => {
    if (!selectedScene.value) return;

    try {
      const data = await $fetch('/api/mixer/cut_program', {
        method: 'POST',
        body: { src: selectedScene.value.uid }
      });
    } catch (err) {
      console.error('Failed to switch scene:', err);
    }
  };

  watch([activeIndex, sceneMixers], ([newIndex, newSceneMixers]) => {
    if (newSceneMixers && newSceneMixers.length > newIndex) {
      selectedScene.value = newSceneMixers[newIndex];
    } else {
      selectedScene.value = null;
    }
  }, { immediate: true });

  return {
    selectedScene,
    activeScene,
    activeIndex,
    handleSceneClick,
    cutSceneToProgram,
  };
}
