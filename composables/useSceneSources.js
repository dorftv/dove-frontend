export function useSceneSources(getScene, getSource) {
  const { inputs, updateEntity: updateEntityInEntities } = useEntities();
  const { volumeIcon: volumeIconFn } = useStateClass();
  const notify = useNotify();

  const scene = () => toValue(getScene);
  const source = () => toValue(getSource);

  const src = ref(source().src);
  const alpha = ref(source().alpha * 100);
  const width = ref(source().width);
  const height = ref(source().height);
  const xpos = ref(source().xpos);
  const ypos = ref(source().ypos);
  const volume = ref(source().volume * 100);
  const mute = ref(source().mute);

  watch(source, (s) => {
    src.value = s.src;
    alpha.value = s.alpha * 100;
    width.value = s.width;
    height.value = s.height;
    xpos.value = s.xpos;
    ypos.value = s.ypos;
    volume.value = s.volume * 100;
    mute.value = s.mute;
  });

  const handleChange = (prop, newValue) => {
    switch (prop) {
      case 'src': src.value = newValue; break;
      case 'alpha': alpha.value = newValue; newValue = newValue / 100; break;
      case 'width': width.value = newValue; break;
      case 'height': height.value = newValue; break;
      case 'xpos': xpos.value = newValue; break;
      case 'ypos': ypos.value = newValue; break;
      case 'volume': volume.value = newValue; newValue = newValue / 100; break;
      case 'mute': mute.value = newValue; break;
    }

    updateEntityInEntities('mixer', {
      uid: scene().uid,
      index: source().index,
      [prop]: newValue
    });
  };

  const getMax = (type) => {
    const s = scene();
    const typeMaxMap = {
      'src': false,
      'alpha': 100,
      'width': s.width,
      'xpos': s.width,
      'height': s.height,
      'ypos': s.height,
      'volume': 150,
    };
    return typeMaxMap[type];
  };

  const removeSlot = async () => {
    try {
      await $fetch('/api/mixer/remove_slot', {
        method: 'POST',
        body: {
          uid: scene().uid,
          index: source().index
        }
      });
    } catch (error) {
      notify.error('Failed to remove slot');
    }
  };

  const toggleMute = () => {
    handleChange('mute', !mute.value);
  };

  const volumeIcon = computed(() => volumeIconFn(volume.value, mute.value));

  const onDrop = (event) => {
    const uid = event.dataTransfer.getData('text/plain');
    if (uid) handleChange('src', uid);
  };

  return {
    inputs,
    updateEntity: handleChange,
    removeSlot,
    handleChange,
    getMax,
    toggleMute,
    volumeIcon,
    onDrop,
    src,
    alpha,
    width,
    height,
    xpos,
    ypos,
    volume,
    mute
  };
}
