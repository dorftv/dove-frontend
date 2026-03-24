import { useDebounceFn } from '@vueuse/core';

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

  const submitPlay = async () => {
    try {
      await $fetch('/api/inputs', {
        method: 'PUT',
        body: { uid: props.input.uid, type: 'update', state: 'PLAYING' },
      });
    } catch (error) {
      notify.error('Failed to play input');
    }
  };

  const submitPause = async () => {
    try {
      await $fetch('/api/inputs', {
        method: 'PUT',
        body: { uid: props.input.uid, type: 'update', state: 'PAUSED' },
      });
    } catch (error) {
      notify.error('Failed to pause input');
    }
  };

  const submitStop = async () => {
    try {
      await $fetch('/api/inputs', {
        method: 'PUT',
        body: { uid: props.input.uid, type: 'update', state: 'NULL' },
      });
    } catch (error) {
      notify.error('Failed to stop input');
    }
  };

  const submitLoop = async (loopState) => {
    try {
      await $fetch('/api/inputs', {
        method: 'PUT',
        body: { uid: props.input.uid, type: 'update', loop: loopState },
      });
    } catch (error) {
      notify.error('Failed to toggle loop');
    }
  };

  const submitSkip = async (direction) => {
    try {
      await $fetch('/api/inputs', {
        method: 'PUT',
        body: { uid: props.input.uid, type: 'update', skip: direction },
      });
    } catch (error) {
      notify.error('Failed to skip');
    }
  };

  const inputName = computed(() => {
    const input = inputs.value.find(input => input.uid === props.source?.src);
    return input ? input.name : '';
  });

  const isInSceneSources = computed(() => {
    return props.scene?.sources.some(source => source.src === props.input?.uid && source.sink === props.source?.sink);
  });

  const submitAddInputToScene = async () => {
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
