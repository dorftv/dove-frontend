export default defineNuxtPlugin((nuxtApp) => {
  let ws = null;
  let reconnectTimer = null;
  let reconnectDelay = 1000;
  let lastMessage = 0;
  let healthInterval = null;
  let lastFetchEntities = 0;

  const authHeaders = () => {
    const token = localStorage.getItem('dove-api-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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
    let url;
    if (config.public.wsUrl) {
      url = config.public.wsUrl;
    } else if (process.dev) {
      // In dev, connect directly to backend on port 5000 using same hostname
      url = `ws://${window.location.hostname}:5000/ws`;
    } else {
      // In production, WS goes through the same host (reverse proxy handles it)
      url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;
    }

    const token = localStorage.getItem('dove-api-token');
    if (token) url += `${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
    return url;
  };

  const config = useState('dove-config');

  const fetchEntities = async () => {
    try {
      const headers = authHeaders();
      const [inputsData, mixersData, outputsData, encodersData, configData, loadData] = await Promise.all([
        $fetch('/api/inputs', { headers }),
        $fetch('/api/mixers', { headers }),
        $fetch('/api/outputs', { headers }),
        $fetch('/api/encoders', { headers }),
        $fetch('/api/config', { headers }),
        $fetch('/api/load', { headers }),
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
      reconnectDelay = Math.min(reconnectDelay * 2, 10000);
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
      lastFetchEntities = 0;
      fetchEntities();
    };

    ws.onmessage = (event) => {
      lastMessage = Date.now();
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (e) {
        console.warn('Invalid WebSocket message:', event.data);
        return;
      }

      if (message.channel === 'LEVEL') {
        const levels = Array.isArray(message.data) ? message.data : [message.data];
        for (const l of levels) {
          audioLevels.value[l.uid] = l;
        }
        return;
      }

      if (message.channel === 'TICK') {
        if (serverLoad.value) {
          const updates = { uptime: message.data.uptime };
          if (message.data.load1 != null) updates.load1 = message.data.load1;
          if (message.data.load_percent != null) updates.load_percent = message.data.load_percent;
          if (message.data.rss_mb && serverLoad.value.memory) {
            updates.memory = { ...serverLoad.value.memory, rss_mb: message.data.rss_mb };
          }
          if (message.data.viewers != null) updates.viewers = message.data.viewers;
          if (message.data.fds != null) updates.fds = message.data.fds;
          serverLoad.value = { ...serverLoad.value, ...updates };
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
        // Throttled poll to keep data fresh regardless of WS state
        if (Date.now() - lastFetchEntities > 30000) {
          lastFetchEntities = Date.now();
          await fetchEntities();
        }
        // Respect exponential backoff from scheduleReconnect()
        if (!wsAlive) {
          if (!reconnectTimer) {
            scheduleReconnect();
          }
        } else if (stale) {
          // Socket looks open but no messages — force reconnect
          console.log('WebSocket stale, reconnecting');
          if (!reconnectTimer) {
            scheduleReconnect();
          }
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
      ws: { sendMessage, status, connect, disconnect, fetchEntities },
    },
  };
});
