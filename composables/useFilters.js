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
  const { patchEntity, patchSlot } = useEntities();
  const options = typeof opts === 'function' ? { input: opts } : opts;

  const getInput = options.input;
  const getMixer = options.mixer;
  const getSlotIndex = options.slotIndex;
  const getEncoder = options.encoder;

  const { inputs: allInputs, scenes: allScenes, program, encoders: allEncoders } = useEntities();
  // A "mixer" here is a scene or the program
  const findMixer = (uid) => (program.value?.uid === uid ? program.value : allScenes.value.find(m => m.uid === uid));

  // --- Read filters from entity store ---
  const readFromStore = () => {
    if (getInput) {
      const inp = toValue(getInput);
      const entity = inp?.uid ? allInputs.value.find(i => i.uid === inp.uid) : inp;
      return entity?.[fieldName] || [];
    }
    if (getMixer) {
      const mixerRef = toValue(getMixer);
      const mixer = mixerRef?.uid ? findMixer(mixerRef.uid) : null;
      if (!mixer) return [];
      if (getSlotIndex) {
        const idx = toValue(getSlotIndex);
        const source = mixer.slots?.find(s => s.id === idx);
        return source?.[fieldName] || [];
      }
      return mixer[fieldName] || [];
    }
    if (getEncoder) {
      const encRef = toValue(getEncoder);
      const entity = encRef?.uid ? allEncoders.value.find(e => e.uid === encRef.uid) : encRef;
      return entity?.[fieldName] || [];
    }
    return [];
  };

  // --- Filters state ---
  // For inputs: entity gets replaced on splice -> deep watcher catches it reliably.
  // For mixers/slots: shallow merge in WebSocket handler means stale broadcasts
  // can overwrite local state. Guard with sendInFlight flag.
  const filters = ref(readFromStore());
  let sendInFlight = false;

  // Watch only this chain's filter list — a deep watch on the whole store re-ran for every
  // entity update (e.g. per-second position ticks) in every filter instance.
  watch(readFromStore, (stored) => {
    if (sendInFlight) return;
    filters.value = stored;
  }, { deep: true });

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
      patchEntity('input', inp.uid, { [fieldName]: updatedFilters });
    } else if (getMixer && getSlotIndex) {
      const mixer = toValue(getMixer);
      patchSlot(mixer.uid, toValue(getSlotIndex), { [fieldName]: updatedFilters });
    } else if (getMixer) {
      const mixer = toValue(getMixer);
      const kind = program.value?.uid === mixer.uid ? 'program' : 'scene';
      patchEntity(kind, mixer.uid, { [fieldName]: updatedFilters });
    } else if (getEncoder) {
      const enc = toValue(getEncoder);
      if (!enc) return;
      patchEntity('encoder', enc.uid, { [fieldName]: updatedFilters });
    }
  };

  // trailing: always send the final slider value (VueUse default drops it)
  const sendParamUpdate = useThrottleFn(_send, 150, true);

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
