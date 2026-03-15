export function useDrawerClickOutside(...drawers) {
  let skipNextClick = false;

  for (const drawer of drawers) {
    watch(drawer, (val) => { if (val) skipNextClick = true });
  }

  const onDocumentClick = (e) => {
    if (skipNextClick) { skipNextClick = false; return; }
    if (!drawers.some(d => d.value)) return;
    // Ignore clicks on elements removed from DOM (portal dropdowns clean up before bubbling completes)
    if (!document.body.contains(e.target)) return;
    const overlay = e.target.closest('[role="dialog"], [role="listbox"], .nodecg-panel, .nodecg-tab');
    if (!overlay) {
      drawers.forEach(d => { d.value = false });
    }
  };

  onMounted(() => document.addEventListener('click', onDocumentClick));
  onUnmounted(() => document.removeEventListener('click', onDocumentClick));
}
