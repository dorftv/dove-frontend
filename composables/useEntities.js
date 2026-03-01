let ws = null;
let reconnectTimer = null;
let initialized = false;

export function useEntities() {
  const inputs = useState('entities-inputs', () => []);
  const mixers = useState('entities-mixers', () => []);
  const outputs = useState('entities-outputs', () => []);
  const error = useState('entities-error', () => null);

  const getEntities = (type) => {
    if (type === 'input') return inputs.value;
    else if (type === 'mixer') return mixers.value;
    else if (type === 'output') return outputs.value;
  };

  const addEntityFromWebsocket = (type, entity) => {
    const entities = getEntities(type);
    const exists = entities.some(e => e.uid === entity.uid);
    if (!exists) {
      entities.push(entity);
    }
  };

  const updateEntityFromWebSocket = (type, updatedEntity) => {
    const entities = getEntities(type);
    const index = entities.findIndex((entity) => entity.uid === updatedEntity.uid);
    if (index !== -1) {
      entities.splice(index, 1, { ...entities[index], ...updatedEntity });
    }
  };

  const updateEntity = (type, updatedEntity) => {
    const message = {
      type: type,
      action: 'UPDATE',
      data: updatedEntity
    };
    sendWebSocketMessage(message);
  };

  const deleteEntityFromWebsocket = (type, deletedEntity) => {
    const entities = getEntities(type);
    const index = entities.findIndex((entity) => entity.uid === deletedEntity.uid);
    if (index !== -1) {
      entities.splice(index, 1);
    }
  };

  const fetchEntities = async () => {
    try {
      const [inputsData, mixersData, outputsData] = await Promise.all([
        $fetch('/api/inputs'),
        $fetch('/api/mixers'),
        $fetch('/api/outputs'),
      ]);

      inputs.value = inputsData;
      mixers.value = mixersData;
      outputs.value = outputsData;
    } catch (e) {
      error.value = 'Failed to load entities: ' + e.message;
      console.error(error.value);
    }
  };

  const connectWebSocket = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return;
    }

    let wsUrl;
    if (process.dev) {
      wsUrl = process.env.DOVE_API ? process.env.DOVE_API + '/ws' : 'ws://localhost:5000/ws';
    } else {
      const url = useRequestURL();
      wsUrl = `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/ws`;
    }

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      error.value = null;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const action = {
        CREATE: addEntityFromWebsocket,
        UPDATE: updateEntityFromWebSocket,
        DELETE: deleteEntityFromWebsocket
      }[message.channel];

      if (action) {
        action(message.type, message.data);
      } else {
        console.warn('Unknown Type or Channel:', message.type, message.channel);
      }
    };

    ws.onerror = (wsError) => {
      error.value = 'WebSocket error';
      console.error('WebSocket error:', wsError);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      ws = null;
      // Auto-reconnect after 3 seconds
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(async () => {
          reconnectTimer = null;
          console.log('Attempting WebSocket reconnect...');
          await fetchEntities();
          connectWebSocket();
        }, 3000);
      }
    };
  };

  const disconnectWebSocket = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  const sendWebSocketMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      error.value = 'WebSocket is not open. Cannot send message.';
    }
  };

  // Initialize once on client
  if (import.meta.client && !initialized) {
    initialized = true;
    fetchEntities().then(() => connectWebSocket());
  }

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
    sceneInputs,
    sceneMixerSource,
    sceneMixers,
    programMixer,
    updateEntity,
    sendWebSocketMessage,
    connectWebSocket,
    disconnectWebSocket,
    error
  };
}
