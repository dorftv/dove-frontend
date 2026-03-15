export function useSceneSources(getScene, getSource) {
  const { inputs, updateEntity: updateEntityInEntities } = useEntities();
  const { volumeIcon: volumeIconFn } = useStateClass();
  const notify = useNotify();

  const scene = () => toValue(getScene);
  const source = () => toValue(getSource);

  const fromSource = (s) => ({
    src: s.src,
    alpha: s.alpha * 100,
    width: s.width,
    height: s.height,
    xpos: s.xpos,
    ypos: s.ypos,
    volume: s.volume * 100,
    mute: s.mute,
    sizing: s.sizing || 'fit',
  });

  // Props that need conversion from display value → API value
  const toApi = { alpha: v => v / 100, volume: v => v / 100 };

  const state = reactive(fromSource(source()));
  watch(source, (s) => Object.assign(state, fromSource(s)));

  const handleChange = (prop, newValue) => {
    state[prop] = newValue;
    const apiValue = toApi[prop] ? toApi[prop](newValue) : newValue;
    updateEntityInEntities('mixer', {
      uid: scene().uid,
      index: source().index,
      [prop]: apiValue
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

  let _volumeBeforeMute = state.volume || 100;

  const toggleMute = () => {
    if (!state.mute) {
      _volumeBeforeMute = state.volume || 100;
      handleChange('volume', 0);
      handleChange('mute', true);
    } else {
      handleChange('mute', false);
      handleChange('volume', _volumeBeforeMute);
    }
  };

  const volumeIcon = computed(() => volumeIconFn(state.volume, state.mute));

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
    ...toRefs(state),
  };
}
