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
  let sendInFlight = false;
  watch(source, (s) => {
    if (sendInFlight) return;
    Object.assign(state, fromSource(s));
  });

  const handleChange = (prop, newValue) => {
    state[prop] = newValue;
    sendInFlight = true;
    setTimeout(() => { sendInFlight = false; }, 1000);
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

  const volumeBeforeMute = ref(state.volume || 100);

  const toggleMute = () => {
    if (!state.mute) {
      volumeBeforeMute.value = state.volume || 100;
      handleChange('volume', 0);
      handleChange('mute', true);
    } else {
      handleChange('mute', false);
      handleChange('volume', volumeBeforeMute.value);
    }
  };

  const volumeIcon = computed(() => volumeIconFn(state.volume, state.mute));

  const changeSource = async (raw) => {
    const uid = typeof raw === 'object' ? raw?.uid : raw;
    const isRemove = !uid || uid === 'None';
    if (!isRemove && !inputs.value.some(i => i.uid === uid)) return;
    try {
      await $fetch(isRemove ? '/api/mixer/remove_source' : '/api/mixer/add_source', {
        method: 'POST',
        body: {
          src: isRemove ? 'None' : uid,
          target: scene().uid,
          index: source().index,
        },
      });
    } catch {
      notify.error('Failed to change source');
    }
  };

  const onDrop = (event) => {
    const uid = event.dataTransfer.getData('application/x-dove-input');
    if (uid) changeSource(uid);
  };

  return {
    inputs,
    removeSlot,
    changeSource,
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
