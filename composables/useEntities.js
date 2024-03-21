import { ref, onMounted, onUnmounted, computed } from 'vue';

export function useEntities() {
  const inputs = ref([]);
  const mixers = ref([]);
  const outputs = ref([]);
  const webSocket = ref(null);
  const error = ref(null);

  let wsUrl;
  if (process.dev) {
    wsUrl = process.env.DOVE_API ? process.env.DOVE_API + '/ws' : 'ws://localhost:5000/ws';
  } else {
    const url = useRequestURL();
    wsUrl = `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/ws`;
  }

  const getEntities = (type) => {
    if (type === 'input') return inputs.value;
    else if (type === 'mixer') return mixers.value;
    else if (type === 'output') return outputs.value;
  };

  const addEntityFromWebsocket = (type, entity) => {
    getEntities(type).push(entity);
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
      const { data: inputsData, error: inputsError } = await useFetch('/api/inputs');
      const { data: mixersData, error: mixersError } = await useFetch('/api/mixers');
      const { data: outputsData, error: outputsError } = await useFetch('/api/outputs');

      if (inputsError.value || mixersError.value || outputsError.value) {
        throw new Error('Failed to fetch entities');
      }

      inputs.value = inputsData.value;
      mixers.value = mixersData.value;
      outputs.value = outputsData.value;
    } catch (e) {
      error.value = 'Failed to load entities: ' + e.message;
      console.error(error.value);
    }
  };

  const connectWebSocket = () => {
    if (webSocket.value) return; // Don't establish a new connection if one already exists

    webSocket.value = new WebSocket(wsUrl);
    webSocket.value.onmessage = (event) => {
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

    webSocket.value.onerror = (wsError) => {
      error.value = 'WebSocket error: ' + wsError.message;
      console.error(error.value);
    };
  };

  const disconnectWebSocket = () => {
    if (webSocket.value) {
      webSocket.value.close();
      webSocket.value = null;
    }
  };

  onMounted(async () => {
    await fetchEntities();
    connectWebSocket();
  });

  onUnmounted(() => {
    disconnectWebSocket();
  });

  const sendWebSocketMessage = (message) => {
    if (webSocket.value && webSocket.value.readyState === WebSocket.OPEN) {
      webSocket.value.send(JSON.stringify(message));
    } else {
      error.value = 'WebSocket is not open. Cannot send message.';
    }
  };

  const sceneInputs = computed(() => {
    return (inputUid) => {
      const sceneInputs = [];
      sceneMixers.value.forEach(mixer => {
        mixer.sources.forEach(source => {
          const input = inputs.value.find(input => input.uid === source.src);
          if (input && input.uid === inputUid) {
            sceneInputs.push({
              ...input,
              mixer
            });
          }
        });
      });
      return sceneInputs;
    };
  });

  const sceneMixers = computed(() => {
    return mixers.value.filter(mixer => mixer.type === 'scene');
  });

  return {
    inputs,
    mixers,
    outputs,
    sceneInputs,
    sceneMixers,
    updateEntity,
    sendWebSocketMessage,
    error
  };
}