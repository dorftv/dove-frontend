export default function useInputControls(props) {
    const volume = ref(props.input.volume * 100);
    const { inputs } = useEntities();

    watch(
      () => props.input.volume,
      (newValue) => {
        volume.value = props.input.volume * 100;
      }
    );

    const { updateEntity } = useEntities();

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
      const vol = newVolume / 100;

      updateEntity('input', {
        uid: props.input.uid,
        volume: vol,
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
      const { data: responseData } = await useFetch('/api/inputs', {
        method: 'put',
        body: {
          uid: props.input.uid,
          type: 'update',
          state: 'PLAYING',
        },
      });
    };

    const submitPause = async () => {
      const { data: responseData } = await useFetch('/api/inputs', {
        method: 'put',
        body: {
          uid: props.input.uid,
          type: 'update',
          state: 'PAUSED',
        },
      });
    };

    const submitStop = async () => {
      const { data: responseData } = await useFetch('/api/input/delete', {
        method: 'post',
        body: {
          uid: props.input.uid,
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
      const { data: responseData } = await useFetch('/api/mixer/add_source', {
        method: 'post',
        body: {
          src: props.input.uid,
          target: props.scene.uid,
          index: props.source.index
        }
      });
    };

    const submitRemoveInputFromScene = async () => {
      const { data: responseData } = await useFetch('/api/mixer/remove_source', {
        method: 'post',
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

    const submitRemoveInput = async () => {
      try {
        const response = await fetch('/api/inputs', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: props.input.uid,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove input');
        }
        // @TODO: add Toast Later
      } catch (error) {
        // @TODO: add Toast Later
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
      inputName,
      isInSceneSources,
      submitAddInputToScene,
      submitRemoveInputFromScene,
      inputInfoPopover,
      inputDetails,
      inputPreview,
      submitRemoveInput,
      toggleInputPreview,

    };
  }