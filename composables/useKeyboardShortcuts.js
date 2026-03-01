export default function useKeyboardShortcuts() {
  const { handleSceneClick, cutSceneToProgram } = useActiveScene();

  const onKeyDown = (event) => {
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return;

    if (event.key >= '1' && event.key <= '9') {
      handleSceneClick(Number(event.key) - 1);
      return;
    }

    if (event.key === 'Enter') {
      cutSceneToProgram();
      return;
    }

    if (event.key === '?') {
      navigateTo('/help');
    }
  };

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
}
