export default function useInputControls(props) {
  const volume = ref(props.input.volume * 100);
  const { inputs, updateEntity } = useEntities();
  const notify = useNotify();

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

  watchEffect(() => {
    duration.value = props.input.duration;
    position.value = props.input.position;
  });

  const handleVolumeChange = (newVolume) => {
    volume.value = newVolume;
    updateEntity('input', {
      uid: props.input.uid,
      volume: newVolume / 100,
    });
  };

  const handlePositionChange = (newPosition) => {
    position.value = newPosition;
    updateEntity('input', {
      uid: props.input.uid,
      position: newPosition,
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

  const { inputPreview } = useUserState();

  const toggleInputPreview = () => {
    return !props.inputEnabled;
  };

  return {
    volume,
    position,
    durationFormatted,
    positionFormatted,
    handleVolumeChange,
    handlePositionChange,
    submitPlay,
    submitPause,
    submitStop,
    submitLoop,
    inputName,
    isInSceneSources,
    submitAddInputToScene,
    submitRemoveInputFromScene,
    inputPreview,
    toggleInputPreview,
  };
}
