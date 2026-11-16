export function useKeyboardShortcuts() {
  const { handleSceneClick, cutSceneToProgram, transition } = useActiveScene();
  const { scenes } = useEntities();
  const { toggle } = useCreateDialog();
  const outputOpen = useState('output-drawer-open');
  const nodecgOpen = useState('nodecg-panel-open');
  const shortcutsOpen = useState('shortcuts-modal-open', () => false);

  const { getByVisualIndex } = useEntityOrder('dove-scene-order', scenes);

  // A dialog with an overlay (add input, shortcuts, a confirmation) has the keys, not the
  // program. The outputs drawer has no overlay and leaves cutting to the keys.
  const modalOpen = () => !!document.querySelector('[data-slot="overlay"]');

  const onKeyDown = (event) => {
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return;
    if (event.defaultPrevented) return;

    // What goes on air: never while a dialog is open
    const onAir = event.key === 'Enter' || event.key === 't' || (event.key >= '1' && event.key <= '9');
    if (onAir && modalOpen()) return;

    if (event.key >= '1' && event.key <= '9') {
      const scene = getByVisualIndex(Number(event.key) - 1);
      if (scene) {
        const realIndex = scenes.value.findIndex(s => s.uid === scene.uid);
        if (realIndex >= 0) handleSceneClick(realIndex);
      }
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

    if (event.key === 'Escape') {
      if (shortcutsOpen.value) { shortcutsOpen.value = false; return; }
      if (outputOpen.value) { outputOpen.value = false; return; }
      if (nodecgOpen.value) { nodecgOpen.value = false; return; }
      return;
    }

    if (event.key === '?') {
      shortcutsOpen.value = !shortcutsOpen.value;
    }
  };

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
}
