export default defineNuxtPlugin((nuxtApp) => {
  let ws = null;
  let reconnectTimer = null;
  let reconnectDelay = 1000;
  let lastMessage = 0;
  let healthInterval = null;

  const status = useState('ws-status', () => 'disconnected');
  const error = useState('entities-error', () => null);

  const inputs = useState('entities-inputs', () => []);
  const mixers = useState('entities-mixers', () => []);
  const outputs = useState('entities-outputs', () => []);
  const encoders = useState('entities-encoders', () => []);
  const audioLevels = useState('audio-levels', () => ({}));
  const serverLoad = useState('server-load', () => null);
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

    // In dev, connect directly to backend on port 5000 using same hostname
    // (works for both localhost and LAN access from mobile)
    if (process.dev) {
      return `ws://${window.location.hostname}:5000/ws`;
    }

    // In production, WS goes through the same host (reverse proxy handles it)
    return `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;
  };

  const config = useState('dove-config');

  const fetchEntities = async () => {
    try {
      const [inputsData, mixersData, outputsData, encodersData, configData, loadData] = await Promise.all([
        $fetch('/api/inputs'),
        $fetch('/api/mixers'),
        $fetch('/api/outputs'),
        $fetch('/api/encoders'),
        $fetch('/api/config'),
        $fetch('/api/load'),
      ]);
      inputs.value = inputsData;
      mixers.value = mixersData;
      outputs.value = outputsData;
      encoders.value = encodersData;
      config.value = configData;
      serverLoad.value = loadData;
      error.value = null;
    } catch (e) {
      if (e?.response?.status === 401 || e?.status === 401 || e?.statusCode === 401) {
        const { login } = useAuth();
        login();
        return;
      }
      error.value = 'Failed to load entities: ' + e.message;
      console.error('Failed to load entities:', e);
    } finally {
      isLoading.value = false;
    }
  };

  const cleanup = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      ws = null;
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) return;
    status.value = 'reconnecting';
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      connect();
    }, reconnectDelay);
  };

  const connect = () => {
    cleanup();

    const wsUrl = getWsUrl();
    status.value = 'reconnecting';

    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      console.error('WebSocket creation failed:', e);
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      console.log('WebSocket connected');
      status.value = 'connected';
      error.value = null;
      reconnectDelay = 1000;
      lastMessage = Date.now();
      fetchEntities();
    };

    ws.onmessage = (event) => {
      lastMessage = Date.now();
      const message = JSON.parse(event.data);

      if (message.channel === 'LEVEL') {
        const levels = Array.isArray(message.data) ? message.data : [message.data];
        for (const l of levels) {
          audioLevels.value[l.uid] = l;
        }
        return;
      }

      if (message.channel === 'TICK') {
        if (serverLoad.value) {
          serverLoad.value = { ...serverLoad.value, uptime: message.data.uptime };
        }
        return;
      }

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
      }
    };

    ws.onerror = () => {
      error.value = 'WebSocket error';
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      ws = null;
      scheduleReconnect();
    };
  };

  const disconnect = () => {
    cleanup();
    status.value = 'disconnected';
  };

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      error.value = 'WebSocket is not open. Cannot send message.';
    }
  };

  // Health check: poll entities and reconnect WS if stale.
  // Works regardless of visibility API / timer throttling reliability.
  const startHealthCheck = () => {
    if (healthInterval) return;
    healthInterval = setInterval(async () => {
      const wsAlive = ws && ws.readyState === WebSocket.OPEN;
      const stale = Date.now() - lastMessage > 10000;

      if (!wsAlive || stale) {
        // Always poll to keep data fresh regardless of WS state
        await fetchEntities();
        // Reconnect WS
        if (!wsAlive) {
          reconnectDelay = 1000;
          connect();
        } else if (stale) {
          // Socket looks open but no messages — force reconnect
          console.log('WebSocket stale, reconnecting');
          reconnectDelay = 1000;
          connect();
        }
      }
    }, 5000);
  };

  // Suppress rendering errors during auth redirect to prevent 500 flash
  let authRedirecting = false;
  nuxtApp.hook('vue:error', (err) => {
    if (authRedirecting) return false; // swallow error during redirect
  });

  nuxtApp.hook('app:mounted', async () => {
    // Check auth state before loading entities
    const { checkAuth, isAuthenticated, login } = useAuth();
    await checkAuth();
    if (!isAuthenticated.value) {
      authRedirecting = true;
      login();
      return;
    }
    await fetchEntities();
    connect();
    startHealthCheck();
  });

  return {
    provide: {
      ws: { sendMessage, status, connect, disconnect },
    },
  };
});
