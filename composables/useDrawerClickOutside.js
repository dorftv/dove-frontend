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
    // Skip clicks on teleported elements (modals, select dropdowns, etc.)
    if (!e.target.closest('#__nuxt')) { clickInProgress = false; return; }
    const excluded = e.target.closest('.nodecg-panel, .side-tab');
    if (!excluded) {
      drawers.forEach(d => { d.value = false });
    }
    clickInProgress = false;
  };

  onMounted(() => document.addEventListener('click', onDocumentClick));
  onUnmounted(() => document.removeEventListener('click', onDocumentClick));
}
