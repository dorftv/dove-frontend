import { useThrottleFn } from '@vueuse/core';

const FILTER_TYPES = {
  balance: {
    label: 'Color Balance', category: 'color',
    params: {
      brightness: { min: -1, max: 1, step: 0.01, default: 0 },
      contrast: { min: 0, max: 2, step: 0.01, default: 1 },
      saturation: { min: 0, max: 2, step: 0.01, default: 1 },
      hue: { min: -1, max: 1, step: 0.01, default: 0 },
    },
  },
  flip: {
    label: 'Flip / Rotate', category: 'transform',
    params: {
      direction: { type: 'select', options: [
        { label: 'None', value: 0 },
        { label: 'Clockwise 90', value: 1 },
        { label: 'Rotate 180', value: 2 },
        { label: 'Counter-Clockwise 90', value: 3 },
        { label: 'Horizontal Flip', value: 4 },
        { label: 'Vertical Flip', value: 5 },
      ], default: 0 },
    },
  },
  crop: {
    label: 'Crop', category: 'transform',
    params: {
      top: { min: 0, max: 500, step: 1, default: 0, unit: 'px' },
      bottom: { min: 0, max: 500, step: 1, default: 0, unit: 'px' },
      left: { min: 0, max: 500, step: 1, default: 0, unit: 'px' },
      right: { min: 0, max: 500, step: 1, default: 0, unit: 'px' },
    },
  },
  coloreffects: {
    label: 'Color Effect', category: 'color',
    params: {
      preset: { type: 'select', options: [
        { label: 'None', value: 0 },
        { label: 'Heat', value: 1 },
        { label: 'Sepia', value: 2 },
        { label: 'Xray', value: 3 },
        { label: 'X-Pro', value: 4 },
        { label: 'Yellowblue', value: 5 },
      ], default: 0 },
    },
  },
  blur: {
    label: 'Blur', category: 'effects',
    params: { sigma: { min: 0.1, max: 10, step: 0.1, default: 1.2 } },
  },
};

const FILTER_CATEGORIES = Object.freeze({
  color: { label: 'Color', icon: 'ph:palette' },
  transform: { label: 'Transform', icon: 'ph:arrows-out-cardinal' },
  effects: { label: 'Effects', icon: 'ph:sparkle' },
});

/**
 * Video filters composable — identical pattern to useAudioFilters,
 * reads/writes video_filters field instead of audio_filters.
 */
export function useVideoFilters(opts) {
  const { updateEntity } = useEntities();
  const options = typeof opts === 'function' ? { input: opts } : opts;

  const getInput = options.input;
  const getMixer = options.mixer;
  const getSlotIndex = options.slotIndex;

  const { inputs: allInputs, mixers: allMixers } = useEntities();

  const readFromStore = () => {
    if (getInput) {
      const inp = toValue(getInput);
      const entity = inp?.uid ? allInputs.value.find(i => i.uid === inp.uid) : inp;
      return entity?.video_filters || [];
    }
    if (getMixer) {
      const mixerRef = toValue(getMixer);
      const mixer = mixerRef?.uid ? allMixers.value.find(m => m.uid === mixerRef.uid) : null;
      if (!mixer) return [];
      if (getSlotIndex) {
        const idx = toValue(getSlotIndex);
        const source = mixer.sources?.find(s => s.index === idx);
        return source?.video_filters || [];
      }
      return mixer.video_filters || [];
    }
    return [];
  };

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

  const _send = (updatedFilters) => {
    filters.value = updatedFilters;
    sendInFlight = true;
    setTimeout(() => { sendInFlight = false; }, 1000);

    if (getInput) {
      const inp = toValue(getInput);
      if (!inp) return;
      updateEntity('input', { uid: inp.uid, video_filters: updatedFilters });
    } else if (getMixer && getSlotIndex) {
      const mixer = toValue(getMixer);
      updateEntity('mixer', { uid: mixer.uid, index: toValue(getSlotIndex), video_filters: updatedFilters });
    } else if (getMixer) {
      const mixer = toValue(getMixer);
      updateEntity('mixer', { uid: mixer.uid, video_filters: updatedFilters });
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
    filters,
    filterCount,
    updateFilterParam,
    toggleFilter,
    addFilter,
    removeFilter,
    moveFilter,
  };
}
