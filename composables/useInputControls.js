export default function useInputControls(props) {
    const volume = ref(props.input.volume * 100);
  
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
    };
  }