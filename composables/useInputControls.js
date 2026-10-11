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
  const { inputs, patchEntity } = useEntities();
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
    patchEntity('input', props.input.uid, { volume: val / 100 });
  }, 80);

  const handleVolumeChange = (newVolume) => {
    const val = Array.isArray(newVolume) ? newVolume[0] : newVolume;
    volume.value = val;
    sendVolumeUpdate(val);
  };

  const handlePositionChange = (newPosition) => {
    const val = Array.isArray(newPosition) ? newPosition[0] : newPosition;
    position.value = val;
    command('seek', { position: val }, 'Failed to seek');
  };

  const request = async (method, path, body, errorMsg) => {
    try {
      await useApiFetch(`/api/v2/inputs/${props.input.uid}${path}`, { method, body });
    } catch (error) {
      const detail = error?.data?.detail;
      notify.error(typeof detail === 'string' ? detail : errorMsg);
    }
  };

  // Playback is commanded: `state` is what the pipeline reports
  const command = (name, body, errorMsg) => request('POST', `/${name}`, body, errorMsg);

  const submitPlay = () => command('play', undefined, 'Failed to play input');
  const submitPause = () => command('pause', undefined, 'Failed to pause input');
  const submitStop = () => command('stop', undefined, 'Failed to stop input');
  const submitLoop = (loopState) => request('PATCH', '', { loop: loopState }, 'Failed to toggle loop');
  const submitSkip = (direction) => command('skip', { to: direction }, 'Failed to skip');

  // --- Scene/source context (only meaningful when props.scene & props.source exist) ---

  const inputName = computed(() => {
    const input = inputs.value.find(i => i.uid === props.source?.src);
    return input ? input.name : '';
  });

  const isInSceneSources = computed(() => {
    return props.scene?.slots?.some(
      slot => slot.src === props.input?.uid && slot.id === props.source?.id
    ) ?? false;
  });

  const submitAddInputToScene = async () => {
    if (!props.scene || !props.source) return;
    await useApiFetch(`/api/v2/scenes/${props.scene.uid}/slots/${props.source.id}`, {
      method: 'PATCH',
      body: { src: props.input.uid },
    });
  };

  const submitRemoveInputFromScene = async () => {
    if (!props.scene || !props.source) return;
    await useApiFetch(`/api/v2/scenes/${props.scene.uid}/slots/${props.source.id}`, {
      method: 'PATCH',
      body: { src: null },
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
