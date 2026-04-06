export function useEntities() {
  const inputs = useState('entities-inputs', () => []);
  const mixers = useState('entities-mixers', () => []);
  const outputs = useState('entities-outputs', () => []);
  const encoders = useState('entities-encoders', () => []);
  const error = useState('entities-error', () => null);
  const wsStatus = useState('ws-status', () => 'disconnected');
  const isLoading = useState('entities-loading', () => true);

  const updateEntity = (type, updatedEntity) => {
    const { $ws } = useNuxtApp();
    $ws.sendMessage({
      type: type,
      action: 'UPDATE',
      data: updatedEntity
    });
  };

  const sceneInputs = computed(() => {
    return (inputUid) => {
      const result = [];
      sceneMixers.value.forEach(mixer => {
        mixer.sources.forEach(source => {
          const input = inputs.value.find(input => input.uid === source.src);
          if (input && input.uid === inputUid) {
            result.push({
              ...input,
              mixer
            });
          }
        });
      });
      return result;
    };
  });

  const sceneMixerSource = (uid) => {
    const mixer = sceneMixers.value.find(mixer => mixer.uid === uid);
    if (!mixer) return [];

    return Object.values(mixer.sources || {}).map(source => ({
      name: source.name,
      index: source.index,
      src_locked: source.src_locked
    }));
  };

  const sceneMixers = computed(() => {
    return mixers.value.filter(mixer => mixer.type === 'scene');
  });

  const programMixer = computed(() => {
    return mixers.value.find(mixer => mixer.type === 'program');
  });

  const inputsPreview = computed(() => {
    return inputs.value.filter(input => input.preview === true && input.type !== 'nodecg');
  });

  const inputsNoPreview = computed(() => {
    return inputs.value.filter(input => input.preview === false && input.type !== 'nodecg');
  });

  const previewOutputs = computed(() => {
    return outputs.value.filter(output => output.is_preview === true);
  });

  const entityMap = computed(() => {
    const map = new Map();
    for (const list of [inputs.value, mixers.value, outputs.value, encoders.value]) {
      for (const e of list) map.set(e.uid, e);
    }
    return map;
  });

  const resolveEntity = (uid) => entityMap.value.get(uid) || null;

  const resolveField = (uid, keys) => {
    const resolved = resolveEntity(uid);
    if (!resolved) return uid;
    const obj = { uid };
    for (const k of keys) obj[k] = resolved[k];
    return obj;
  };

  const enrichEntity = (entity) => {
    const data = { ...entity };
    const linkFields = { src: ['name', 'type'], video_encoder: ['element', 'type'], audio_encoder: ['element', 'type'] };
    for (const [field, keys] of Object.entries(linkFields)) {
      if (data[field]) data[field] = resolveField(data[field], keys);
    }
    if (data.sources) {
      data.sources = data.sources.map(s => ({
        ...s,
        src: s.src ? resolveField(s.src, ['name', 'type']) : s.src,
      }));
    }
    return data;
  };

  const inputsNodeCG = computed(() => {
    return inputs.value
      .filter(input => input.type === 'nodecg')
      .sort((a, b) => {
        if (a.index !== undefined && b.index !== undefined) {
          return a.index - b.index;
        }
        if (a.index !== undefined) return -1;
        if (b.index !== undefined) return 1;
        return 0;
      });
  });

  return {
    inputs,
    inputsPreview,
    inputsNoPreview,
    inputsNodeCG,
    previewOutputs,
    mixers,
    outputs,
    encoders,
    entityMap,
    resolveEntity,
    enrichEntity,
    sceneInputs,
    sceneMixerSource,
    sceneMixers,
    programMixer,
    updateEntity,
    error,
    wsStatus,
    isLoading
  };
}
