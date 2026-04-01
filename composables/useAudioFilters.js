import { useThrottleFn } from '@vueuse/core';

const FILTER_TYPES = {
  // --- Dynamics ---
  compressor: {
    label: 'Compressor',
    category: 'dynamics',
    params: {
      threshold: { min: 0, max: 1, step: 0.01, default: 1.0 },
      ratio: { min: 1, max: 20, step: 0.1, default: 1.0 },
      characteristics: { type: 'select', options: ['soft-knee', 'hard-knee'], default: 'soft-knee' },
    },
  },
  expander: {
    label: 'Expander/Gate',
    category: 'dynamics',
    params: {
      threshold: { min: 0, max: 1, step: 0.01, default: 1.0 },
      ratio: { min: 1, max: 20, step: 0.1, default: 1.0 },
    },
  },
  limiter: {
    label: 'Limiter',
    category: 'dynamics',
    params: {},
  },
  amplify: {
    label: 'Gain',
    category: 'dynamics',
    params: {
      amplification: { min: 0, max: 4, step: 0.01, default: 1.0, unit: 'x' },
    },
  },
  // --- EQ / Filter ---
  highpass: {
    label: 'High Pass',
    category: 'eq',
    params: {
      cutoff: { min: 20, max: 2000, default: 80, unit: 'Hz' },
      poles: { min: 2, max: 8, step: 2, default: 4 },
    },
  },
  lowpass: {
    label: 'Low Pass',
    category: 'eq',
    params: {
      cutoff: { min: 200, max: 20000, default: 8000, unit: 'Hz' },
      poles: { min: 2, max: 8, step: 2, default: 4 },
    },
  },
  eq3: {
    label: '3-Band EQ',
    category: 'eq',
    params: {
      band0: { min: -24, max: 12, default: 0, unit: 'dB', label: 'Low' },
      band1: { min: -24, max: 12, default: 0, unit: 'dB', label: 'Mid' },
      band2: { min: -24, max: 12, default: 0, unit: 'dB', label: 'High' },
    },
  },
  eq10: {
    label: '10-Band EQ',
    category: 'eq',
    params: {
      band0: { min: -24, max: 12, default: 0 },
      band1: { min: -24, max: 12, default: 0 },
      band2: { min: -24, max: 12, default: 0 },
      band3: { min: -24, max: 12, default: 0 },
      band4: { min: -24, max: 12, default: 0 },
      band5: { min: -24, max: 12, default: 0 },
      band6: { min: -24, max: 12, default: 0 },
      band7: { min: -24, max: 12, default: 0 },
      band8: { min: -24, max: 12, default: 0 },
      band9: { min: -24, max: 12, default: 0 },
    },
  },
  // --- Spatial ---
  pan: {
    label: 'Pan',
    category: 'spatial',
    params: {
      panorama: { min: -1, max: 1, step: 0.01, default: 0.0, label: 'L/R' },
    },
  },
  invert: {
    label: 'Phase Invert',
    category: 'spatial',
    params: {
      degree: { min: 0, max: 1, step: 0.01, default: 1.0 },
    },
  },
  // --- Effects ---
  echo: {
    label: 'Echo/Delay',
    category: 'effects',
    params: {
      delay: { min: 1, max: 1000, step: 1, default: 250, unit: 'ms' },
      intensity: { min: 0, max: 1, step: 0.01, default: 0.5 },
      feedback: { min: 0, max: 0.9, step: 0.01, default: 0.0 },
    },
  },
};

const FILTER_CATEGORIES = {
  dynamics: { label: 'Dynamics', icon: 'ph:chart-bar' },
  eq: { label: 'EQ / Filter', icon: 'ph:equalizer' },
  spatial: { label: 'Spatial', icon: 'ph:arrows-out-line-horizontal' },
  effects: { label: 'Effects', icon: 'ph:sparkle' },
};

const EQ10_BANDS = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

/**
 * Audio filters composable supporting three modes:
 *   - Input mode:  useAudioFilters({ input: () => inputObj })
 *   - Mixer mode:  useAudioFilters({ mixer: () => mixerObj })
 *   - Slot mode:   useAudioFilters({ mixer: () => mixerObj, slotIndex: () => index })
 *
 * Legacy call signature preserved: useAudioFilters(() => inputObj)
 */
export function useAudioFilters(opts) {
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
      return entity?.audio_filters || [];
    }
    if (getMixer) {
      const mixerRef = toValue(getMixer);
      const mixer = mixerRef?.uid ? allMixers.value.find(m => m.uid === mixerRef.uid) : null;
      if (!mixer) return [];
      if (getSlotIndex) {
        const idx = toValue(getSlotIndex);
        const source = mixer.sources?.find(s => s.index === idx);
        return source?.audio_filters || [];
      }
      return mixer.audio_filters || [];
    }
    return [];
  };

  // --- Filters state ---
  // For inputs: entity gets replaced on splice → deep watcher catches it reliably.
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
      updateEntity('input', { uid: inp.uid, audio_filters: updatedFilters });
    } else if (getMixer && getSlotIndex) {
      const mixer = toValue(getMixer);
      updateEntity('mixer', { uid: mixer.uid, index: toValue(getSlotIndex), audio_filters: updatedFilters });
    } else if (getMixer) {
      const mixer = toValue(getMixer);
      updateEntity('mixer', { uid: mixer.uid, audio_filters: updatedFilters });
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
    const def = FILTER_TYPES[type];
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
    FILTER_TYPES,
    FILTER_CATEGORIES,
    EQ10_BANDS,
    filters,
    filterCount,
    updateFilterParam,
    toggleFilter,
    addFilter,
    removeFilter,
    moveFilter,
  };
}
