export default defineNuxtPlugin((nuxtApp) => {
  let ws = null;
  let reconnectTimer = null;
  let reconnectDelay = 1000;

  const status = useState('ws-status', () => 'disconnected');
  const error = useState('entities-error', () => null);

  // Access entity state directly to avoid useNotify/useToast during plugin init
  const inputs = useState('entities-inputs', () => []);
  const mixers = useState('entities-mixers', () => []);
  const outputs = useState('entities-outputs', () => []);
  const encoders = useState('entities-encoders', () => []);
  const isLoading = useState('entities-loading', () => true);

  const getEntitiesArray = (type) => {
    if (type === 'input') return inputs;
    if (type === 'mixer') return mixers;
    if (type === 'output') return outputs;
    if (type === 'encoder') return encoders;
  };

  const getWsUrl = () => {
    const config = useRuntimeConfig();
    if (config.public.wsUrl) return config.public.wsUrl;

    if (process.dev) {
      return process.env.DOVE_API ? process.env.DOVE_API + '/ws' : 'ws://localhost:5000/ws';
    }

    const url = useRequestURL();
    return `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/ws`;
  };

  const fetchEntities = async () => {
    try {
      const [inputsData, mixersData, outputsData, encodersData] = await Promise.all([
        $fetch('/api/inputs'),
        $fetch('/api/mixers'),
        $fetch('/api/outputs'),
        $fetch('/api/encoders'),
      ]);
      inputs.value = inputsData;
      mixers.value = mixersData;
      outputs.value = outputsData;
      encoders.value = encodersData;
    } catch (e) {
      error.value = 'Failed to load entities: ' + e.message;
      console.error('Failed to load entities:', e);
    } finally {
      isLoading.value = false;
    }
  };

  const connect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    const wsUrl = getWsUrl();
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      status.value = 'connected';
      error.value = null;
      reconnectDelay = 1000;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const entities = getEntitiesArray(message.type);
      if (!entities) {
        console.warn('Unknown type:', message.type);
        return;
      }

      if (message.channel === 'CREATE') {
        if (!entities.value.some(e => e.uid === message.data.uid)) {
          entities.value.push(message.data);
        }
      } else if (message.channel === 'UPDATE') {
        const index = entities.value.findIndex(e => e.uid === message.data.uid);
        if (index !== -1) {
          entities.value.splice(index, 1, { ...entities.value[index], ...message.data });
        }
      } else if (message.channel === 'DELETE') {
        const index = entities.value.findIndex(e => e.uid === message.data.uid);
        if (index !== -1) {
          entities.value.splice(index, 1);
        }
      } else {
        console.warn('Unknown channel:', message.channel);
      }
    };

    ws.onerror = () => {
      error.value = 'WebSocket error';
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      status.value = 'reconnecting';
      ws = null;
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(async () => {
          reconnectTimer = null;
          console.log(`Reconnecting in ${reconnectDelay}ms...`);
          await fetchEntities();
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
          connect();
        }, reconnectDelay);
      }
    };
  };

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      error.value = 'WebSocket is not open. Cannot send message.';
    }
  };

  // Wait for app mount so all PrimeVue services are ready, then fetch + connect
  nuxtApp.hook('app:mounted', () => {
    fetchEntities().then(() => connect());
  });

  return {
    provide: {
      ws: { sendMessage, status, connect, disconnect },
    },
  };
});
