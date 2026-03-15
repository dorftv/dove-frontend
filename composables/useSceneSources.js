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
  const sizing = ref(source().sizing || 'fit');

  watch(source, (s) => {
    src.value = s.src;
    alpha.value = s.alpha * 100;
    width.value = s.width;
    height.value = s.height;
    xpos.value = s.xpos;
    ypos.value = s.ypos;
    volume.value = s.volume * 100;
    mute.value = s.mute;
    sizing.value = s.sizing || 'fit';
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
      case 'sizing': sizing.value = newValue; break;
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

  const getMin = (type) => {
    const s = scene();
    if (type === 'xpos') return -s.width;
    if (type === 'ypos') return -s.height;
    return 0;
  };

  const getDefault = (type) => {
    const s = scene();
    const defaults = {
      'alpha': 100,
      'width': s.width,
      'height': s.height,
      'xpos': 0,
      'ypos': 0,
    };
    return defaults[type] ?? 0;
  };

  const resetAll = () => {
    for (const key of ['alpha', 'width', 'height', 'xpos', 'ypos']) {
      handleChange(key, getDefault(key));
    }
    handleChange('sizing', 'fit');
  };

  const resetPosition = () => {
    handleChange('xpos', 0);
    handleChange('ypos', 0);
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

  let _volumeBeforeMute = volume.value || 100;

  const toggleMute = () => {
    if (!mute.value) {
      _volumeBeforeMute = volume.value || 100;
      handleChange('volume', 0);
      handleChange('mute', true);
    } else {
      handleChange('mute', false);
      handleChange('volume', _volumeBeforeMute);
    }
  };

  const volumeIcon = computed(() => volumeIconFn(volume.value, mute.value));

  const onDrop = (event) => {
    const uid = event.dataTransfer.getData('text/plain');
    if (uid) handleChange('src', uid);
  };

  return {
    inputs,
    removeSlot,
    handleChange,
    getMax,
    getMin,
    getDefault,
    resetAll,
    resetPosition,
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
    mute,
    sizing
  };
}
