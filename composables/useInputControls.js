import { useDebounceFn } from '@vueuse/core';

/**
 * Input controls composable — used in two contexts:
 *
 *   1. input/Controls.vue — props: { input }
 *      Uses: volume, position, playback controls, toggleMute
 *
 *   2. input/SceneSources.vue — props: { input, source, scene }
 *      Uses: inputName, isInSceneSources, submitAddInputToScene, submitRemoveInputFromScene
 *
 * Scene/source-specific members are guarded with optional chaining
 * and return safe defaults when those props are absent.
 */
export function useInputControls(props) {
  const volume = ref(props.input.volume * 100);
  const { inputs, updateEntity } = useEntities();
  const notify = useNotify();
  const previousVolume = ref(80);

  watch(
    () => props.input.volume,
    () => {
      volume.value = props.input.volume * 100;
    }
  );

  const duration = ref(props.input.duration);
  const position = ref(props.input.position);

  const durationFormatted = computed(() => {
    return !props.input.duration || props.input.duration == '00'
      ? ''
      : `/${useTimeFormatter(duration).value}`;
  });

  const positionFormatted = useTimeFormatter(position);

  const totalPosition = ref(0);
  const totalDuration = ref(0);
  watchEffect(() => {
    totalPosition.value = props.input.total_position || 0;
    totalDuration.value = props.input.total_duration || 0;
  });
  const totalPositionFormatted = computed(() => {
    if (!props.input.total_duration) return '';
    return useTimeFormatter(totalPosition).value;
  });
  const totalDurationFormatted = computed(() => {
    if (!props.input.total_duration) return '';
    return useTimeFormatter(totalDuration).value;
  });

  watchEffect(() => {
    duration.value = props.input.duration;
    position.value = props.input.position;
  });

  const sendVolumeUpdate = useDebounceFn((val) => {
    updateEntity('input', {
      uid: props.input.uid,
      volume: val / 100,
    });
  }, 80);

  const handleVolumeChange = (newVolume) => {
    const val = Array.isArray(newVolume) ? newVolume[0] : newVolume;
    volume.value = val;
    sendVolumeUpdate(val);
  };

  const handlePositionChange = (newPosition) => {
    const val = Array.isArray(newPosition) ? newPosition[0] : newPosition;
    position.value = val;
    updateEntity('input', {
      uid: props.input.uid,
      position: val,
    });
  };

  const submitInputUpdate = async (fields, errorMsg) => {
    try {
      await $fetch('/api/inputs', {
        method: 'PUT',
        body: { uid: props.input.uid, type: 'update', ...fields },
      });
    } catch {
      notify.error(errorMsg);
    }
  };

  const submitPlay = () => submitInputUpdate({ state: 'PLAYING' }, 'Failed to play input');
  const submitPause = () => submitInputUpdate({ state: 'PAUSED' }, 'Failed to pause input');
  const submitStop = () => submitInputUpdate({ state: 'NULL' }, 'Failed to stop input');
  const submitLoop = (loopState) => submitInputUpdate({ loop: loopState }, 'Failed to toggle loop');
  const submitSkip = (direction) => submitInputUpdate({ skip: direction }, 'Failed to skip');

  // --- Scene/source context (only meaningful when props.scene & props.source exist) ---

  const inputName = computed(() => {
    const input = inputs.value.find(i => i.uid === props.source?.src);
    return input ? input.name : '';
  });

  const isInSceneSources = computed(() => {
    return props.scene?.sources?.some(
      source => source.src === props.input?.uid && source.sink === props.source?.sink
    ) ?? false;
  });

  const submitAddInputToScene = async () => {
    if (!props.scene || !props.source) return;
    await $fetch('/api/mixer/add_source', {
      method: 'POST',
      body: {
        src: props.input.uid,
        target: props.scene.uid,
        index: props.source.index
      }
    });
  };

  const submitRemoveInputFromScene = async () => {
    if (!props.scene || !props.source) return;
    await $fetch('/api/mixer/remove_source', {
      method: 'POST',
      body: {
        src: "None",
        target: props.scene.uid,
        index: props.source.index
      }
    });
  };

  const toggleMute = () => {
    if (volume.value === 0) {
      handleVolumeChange(previousVolume.value);
    } else {
      previousVolume.value = volume.value;
      handleVolumeChange(0);
    }
  };

  return {
    volume,
    toggleMute,
    position,
    durationFormatted,
    positionFormatted,
    totalPositionFormatted,
    totalDurationFormatted,
    handleVolumeChange,
    handlePositionChange,
    submitPlay,
    submitPause,
    submitStop,
    submitLoop,
    submitSkip,
    inputName,
    isInSceneSources,
    submitAddInputToScene,
    submitRemoveInputFromScene,
  };
}
