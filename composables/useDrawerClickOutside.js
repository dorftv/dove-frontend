export function useDrawerClickOutside(...drawers) {
  let skipNextClick = false;
  let clickInProgress = false;

  for (const drawer of drawers) {
    watch(drawer, (val) => { if (val && clickInProgress) skipNextClick = true });
  }

  const onDocumentClick = (e) => {
    clickInProgress = true;
    if (skipNextClick) { skipNextClick = false; clickInProgress = false; return; }
    if (!drawers.some(d => d.value)) { clickInProgress = false; return; }
    // Ignore clicks on elements removed from DOM (portal dropdowns clean up before bubbling completes)
    if (!document.body.contains(e.target)) { clickInProgress = false; return; }
    const overlay = e.target.closest('[role="dialog"], [role="listbox"], .nodecg-panel, .nodecg-tab');
    if (!overlay) {
      drawers.forEach(d => { d.value = false });
    }
    clickInProgress = false;
  };

  onMounted(() => document.addEventListener('click', onDocumentClick));
  onUnmounted(() => document.removeEventListener('click', onDocumentClick));
}
