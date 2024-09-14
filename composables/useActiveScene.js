
const activeIndex = ref(0);
const selectedScene = ref(null);

export default function useActiveScene() {
  const { sceneMixers, programMixer } = useEntities();

  const activeScene = computed(() => {
    if (programMixer.value &&
        programMixer.value.active !== undefined &&
        programMixer.value.sources &&
        sceneMixers.value) {
      const activeSourceIndex = programMixer.value.active;
      const activeSource = programMixer.value.sources[activeSourceIndex];
      if (activeSource && activeSource.src) {
        const scene = sceneMixers.value.find(sceneMixer => sceneMixer.uid === activeSource.src);
        return scene;
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
    if (!selectedScene.value) {
      return;
    }

    try {
      const response = await fetch('/api/mixer/cut_program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ src: selectedScene.value.uid })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      if (data && data.src) {
        // @TODO: Add Toast later for success
      } else {
        // @TODO: Add Toast later for failure
      }
    } catch (error) {
      console.error('Failed to switch scene:', error);
      // @TODO: Add Toast later for error
    }
  };

  // Watch for changes to activeIndex and sceneMixers and update selectedScene
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
