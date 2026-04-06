import { useThrottleFn } from '@vueuse/core';

/**
 * Generic filter composable factory.
 * Shared logic for both audio and video filter chains.
 *
 * @param {string} fieldName - Entity field name ('audio_filters' or 'video_filters')
 * @param {Object} filterTypes - Filter type definitions (params, labels, categories)
 * @param {Object} filterCategories - Category definitions (label, icon)
 * @param {Object} opts - Composable options: { input, mixer, slotIndex }
 *   Legacy call signature: a plain function is treated as { input: fn }
 */
export function useFilters(fieldName, filterTypes, filterCategories, opts) {
  const { updateEntity } = useEntities();
  const options = typeof opts === 'function' ? { input: opts } : opts;

  const getInput = options.input;
  const getMixer = options.mixer;
  const getSlotIndex = options.slotIndex;

  const { inputs: allInputs, mixers: allMixers } = useEntities();

  // --- Read filters from entity store ---
  const readFromStore = () => {
    if (getInput) {
      const inp = toValue(getInput);
      const entity = inp?.uid ? allInputs.value.find(i => i.uid === inp.uid) : inp;
      return entity?.[fieldName] || [];
    }
    if (getMixer) {
      const mixerRef = toValue(getMixer);
      const mixer = mixerRef?.uid ? allMixers.value.find(m => m.uid === mixerRef.uid) : null;
      if (!mixer) return [];
      if (getSlotIndex) {
        const idx = toValue(getSlotIndex);
        const source = mixer.sources?.find(s => s.index === idx);
        return source?.[fieldName] || [];
      }
      return mixer[fieldName] || [];
    }
    return [];
  };

  // --- Filters state ---
  // For inputs: entity gets replaced on splice -> deep watcher catches it reliably.
  // For mixers/slots: shallow merge in WebSocket handler means stale broadcasts
  // can overwrite local state. Guard with sendInFlight flag.
  const filters = ref(readFromStore());
  let sendInFlight = false;

  const entitySource = getInput ? allInputs : getMixer ? allMixers : null;
  if (entitySource) {
    watch(entitySource, () => {
      if (sendInFlight) return;
      filters.value = readFromStore();
    }, { deep: true, immediate: false });
  }

  const filterCount = computed(() => filters.value.length);

  // --- Send to server ---
  const _send = (updatedFilters) => {
    // Update local state + guard watcher against stale broadcasts
    filters.value = updatedFilters;
    sendInFlight = true;
    setTimeout(() => { sendInFlight = false; }, 1000);

    if (getInput) {
      const inp = toValue(getInput);
      if (!inp) return;
      updateEntity('input', { uid: inp.uid, [fieldName]: updatedFilters });
    } else if (getMixer && getSlotIndex) {
      const mixer = toValue(getMixer);
      updateEntity('mixer', { uid: mixer.uid, index: toValue(getSlotIndex), [fieldName]: updatedFilters });
    } else if (getMixer) {
      const mixer = toValue(getMixer);
      updateEntity('mixer', { uid: mixer.uid, [fieldName]: updatedFilters });
    }
  };

  const sendParamUpdate = useThrottleFn(_send, 150);

  const updateFilterParam = (index, paramName, value) => {
    const current = [...filters.value];
    current[index] = {
      ...current[index],
      params: { ...current[index].params, [paramName]: value },
    };
    sendParamUpdate(current);
  };

  const toggleFilter = (index) => {
    const current = [...filters.value];
    current[index] = { ...current[index], enabled: !current[index].enabled };
    _send(current);
  };

  const addFilter = (type) => {
    const def = filterTypes[type];
    if (!def) return;
    const params = {};
    for (const [key, spec] of Object.entries(def.params)) {
      params[key] = spec.default;
    }
    _send([...filters.value, { type, enabled: true, params }]);
  };

  const removeFilter = (index) => {
    _send(filters.value.filter((_, i) => i !== index));
  };

  const moveFilter = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= filters.value.length) return;
    const current = [...filters.value];
    const [item] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, item);
    _send(current);
  };

  return {
    FILTER_TYPES: filterTypes,
    FILTER_CATEGORIES: filterCategories,
    filters,
    filterCount,
    updateFilterParam,
    toggleFilter,
    addFilter,
    removeFilter,
    moveFilter,
  };
}
