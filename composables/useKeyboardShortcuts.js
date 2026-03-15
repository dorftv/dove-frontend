export function useKeyboardShortcuts() {
  const { handleSceneClick, cutSceneToProgram } = useActiveScene();
  const { toggle } = useCreateDialog();

  const onKeyDown = (event) => {
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return;

    if (event.key >= '1' && event.key <= '9') {
      handleSceneClick(Number(event.key) - 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      cutSceneToProgram();
      return;
    }

    const createMap = { i: 'input', o: 'output', s: 'scene', e: 'encoder' };
    if (createMap[event.key]) {
      toggle(createMap[event.key]);
      return;
    }

    if (event.key === '?') {
      navigateTo('/help');
    }
  };

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
}
