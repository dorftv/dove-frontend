export default function useInputControls(props) {
  const volume = ref(props.input.volume * 100);
  const { inputs, updateEntity } = useEntities();

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
    await $fetch('/api/inputs', {
      method: 'PUT',
      body: {
        uid: props.input.uid,
        type: 'update',
        state: 'PLAYING',
      },
    });
  };

  const submitPause = async () => {
    await $fetch('/api/inputs', {
      method: 'PUT',
      body: {
        uid: props.input.uid,
        type: 'update',
        state: 'PAUSED',
      },
    });
  };

  const submitStop = async () => {
    await $fetch('/api/inputs', {
      method: 'PUT',
      body: {
        uid: props.input.uid,
        type: 'update',
        state: 'NULL',
      },
    });
  };

  const submitLoop = async (loopState) => {
    await $fetch('/api/inputs', {
      method: 'PUT',
      body: {
        uid: props.input.uid,
        type: 'update',
        loop: loopState,
      },
    });
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

  const inputInfoPopover = ref();
  const inputDetails = computed(() => JSON.stringify(props.input, null, 2));
  const { inputPreview } = useUserState();

  const confirm = useConfirm();
  const notify = useNotify();
  const deleting = ref(false);

  const doRemoveInput = async () => {
    deleting.value = true;
    try {
      await $fetch('/api/inputs', {
        method: 'DELETE',
        body: { uid: props.input.uid },
      });
    } catch (error) {
      notify.error('Failed to remove input');
    } finally {
      deleting.value = false;
    }
  };

  const submitRemoveInput = () => {
    const state = props.input.state;
    if (state === 'EOS' || state === 'ERROR' || state === 'NULL') {
      doRemoveInput();
    } else {
      confirm.require({
        message: `Delete input "${props.input.name}"?`,
        header: 'Confirm',
        acceptClass: 'p-button-danger',
        accept: doRemoveInput,
      });
    }
  };

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
    inputInfoPopover,
    inputDetails,
    inputPreview,
    submitRemoveInput,
    deleting,
    toggleInputPreview,
  };
}
