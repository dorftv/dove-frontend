export function useSceneSelection() {
  const { sceneMixers, sceneInputs } = useEntities();

  const selectedScene = ref({ uid: null, slot: null });
  const selectedSceneProgram = ref(false);

  const currentSources = computed(() => {
    if (!selectedScene.value.uid) return [];
    const scene = sceneMixers.value.find(s => s.uid === selectedScene.value.uid);
    return scene ? scene.sources : [];
  });

  return {
    selectedScene,
    selectedSceneProgram,
    currentSources,
    sceneMixers,
  };
}
