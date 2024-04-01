// composable/useActiveScene.js

const selectedScene = ref(null)

export default function useActiveScene() {
  const { sceneMixers, programMixer } = useEntities()

  const activeScene = computed(() => {
    if (programMixer.value) {
      const activeSource = programMixer.value.sources.find(
        (source) => source.sink === programMixer.value.active
      );
      if (activeSource && sceneMixers.value) {
        return sceneMixers.value.find(
          (sceneMixer) => sceneMixer.uid === activeSource.src
        );
      }
    }
    return null;
  });

  const setSelectedScene = (scene) => {
    selectedScene.value = scene
  }

  const onSceneChange = (index) => {
    const item = sceneMixers.value[index];
    setSelectedScene(item);
  }

  watch(sceneMixers, (newSceneMixers) => {
    if (newSceneMixers.length > 0 && !selectedScene.value) {
      setSelectedScene(newSceneMixers[0])
    }
  }, { immediate: true })

  return {
    selectedScene,
    setSelectedScene,
    activeScene,
    onSceneChange
  }
}