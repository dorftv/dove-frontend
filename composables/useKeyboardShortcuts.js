export function useKeyboardShortcuts() {
  const { handleSceneClick, cutSceneToProgram, transition } = useActiveScene();
  const { toggle } = useCreateDialog();
  const outputOpen = useState('output-drawer-open');
  const nodecgOpen = useState('nodecg-panel-open');

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

    if (event.key === 't') {
      transition.value = transition.value === 'cut' ? 'fade' : 'cut';
      return;
    }

    if (event.key === 'o') {
      outputOpen.value = !outputOpen.value;
      return;
    }

    if (event.key === 'n') {
      nodecgOpen.value = !nodecgOpen.value;
      return;
    }

    const createMap = { i: 'input', s: 'scene' };
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
