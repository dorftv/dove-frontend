export function useEntities() {
  const inputs = useState('entities-inputs', () => []);
  const scenes = useState('entities-scenes', () => []);
  const program = useState('entities-program', () => null);
  const outputs = useState('entities-outputs', () => []);
  const encoders = useState('entities-encoders', () => []);
  const error = useState('entities-error', () => null);
  const wsStatus = useState('ws-status', () => 'disconnected');
  const isLoading = useState('entities-loading', () => true);

  // Changes sent over the WebSocket instead of a PATCH with the same body,
  // for controls that move fast (faders, dragging)
  const patchEntity = (kind, uid, patch) => {
    const { $ws } = useNuxtApp();
    $ws.sendMessage({ kind, uid, patch });
  };

  const patchSlot = (sceneUid, id, patch) => {
    const { $ws } = useNuxtApp();
    $ws.sendMessage({ kind: 'slot', scene: sceneUid, id, patch });
  };

  const sceneInputs = computed(() => {
    return (inputUid) => {
      const result = [];
      scenes.value.forEach(scene => {
        scene.slots.forEach(slot => {
          const input = inputs.value.find(input => input.uid === slot.src);
          if (input && input.uid === inputUid) {
            result.push({
              ...input,
              scene
            });
          }
        });
      });
      return result;
    };
  });

  const sceneSlots = (uid) => {
    const scene = scenes.value.find(scene => scene.uid === uid);
    if (!scene) return [];
    return (scene.slots || []).map(slot => ({
      name: slot.name,
      id: slot.id,
      src_locked: slot.src_locked
    }));
  };

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
    for (const list of [inputs.value, scenes.value, outputs.value, encoders.value]) {
      for (const e of list) map.set(e.uid, e);
    }
    if (program.value) map.set(program.value.uid, program.value);
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
    if (data.slots) {
      data.slots = data.slots.map(s => ({
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
    scenes,
    program,
    outputs,
    encoders,
    entityMap,
    resolveEntity,
    enrichEntity,
    sceneInputs,
    sceneSlots,
    patchEntity,
    patchSlot,
    error,
    wsStatus,
    isLoading
  };
}
