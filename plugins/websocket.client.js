export default defineNuxtPlugin((nuxtApp) => {
  let ws = null;
  let reconnectTimer = null;
  let reconnectDelay = 1000;
  let lastMessage = 0;
  let healthInterval = null;

  // Toasts from WS callbacks run outside the Nuxt context
  const notifyError = (msg) => nuxtApp.runWithContext(() => useNotify().error(msg));

  const status = useState('ws-status', () => 'disconnected');
  const error = useState('entities-error', () => null);

  const inputs = useState('entities-inputs', () => []);
  const scenes = useState('entities-scenes', () => []);
  const program = useState('entities-program', () => null);
  const outputs = useState('entities-outputs', () => []);
  const encoders = useState('entities-encoders', () => []);
  const audioLevels = useState('audio-levels', () => ({}));
  const serverLoad = useState('server-load', () => null);
  const isLoading = useState('entities-loading', () => true);

  const getEntitiesArray = (kind) => {
    if (kind === 'input') return inputs;
    if (kind === 'scene') return scenes;
    if (kind === 'output') return outputs;
    if (kind === 'encoder') return encoders;
  };

  const getWsUrl = () => {
    const config = useRuntimeConfig();
    let url;
    if (config.public.wsUrl) {
      url = config.public.wsUrl;
    } else if (process.dev) {
      // In dev, connect directly to backend on port 5000 using same hostname
      url = `ws://${window.location.hostname}:5000/api/v2/ws`;
    } else {
      // In production, WS goes through the same host (reverse proxy handles it)
      url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/v2/ws`;
    }
    return url;
  };

  const config = useState('dove-config');

  // Config and load figures. The entities themselves arrive as the first WebSocket message.
  const fetchStatic = async () => {
    try {
      const [configData, loadData] = await Promise.all([
        $fetch('/api/v2/config'),
        $fetch('/api/v2/load'),
      ]);
      config.value = configData;
      serverLoad.value = loadData;
      error.value = null;
    } catch (e) {
      if (e?.response?.status === 401 || e?.status === 401 || e?.statusCode === 401) {
        const { login } = useAuth();
        login();
        return;
      }
      error.value = 'Failed to load config: ' + e.message;
      console.error('Failed to load config:', e);
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
      // At most 3 s apart: after a backend restart the UI is back within seconds
      reconnectDelay = Math.min(reconnectDelay * 2, 3000);
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

      const type = message.event;

      // Everything there is, sent on connect and again whenever the server had to drop messages
      if (type === 'snapshot') {
        inputs.value = message.inputs;
        scenes.value = message.scenes;
        program.value = message.program;
        encoders.value = message.encoders;
        outputs.value = message.outputs;
        error.value = null;
        isLoading.value = false;
        return;
      }

      if (type === 'level') {
        for (const l of message.data) {
          audioLevels.value[l.uid] = l;
        }
        return;
      }

      if (type === 'position') {
        for (const p of message.data) {
          const index = inputs.value.findIndex(e => e.uid === p.uid);
          if (index !== -1) {
            const moved = { ...inputs.value[index], position: p.position, duration: p.duration };
            // A playlist also says how far it is through all of its clips
            if (p.total_position != null) moved.total_position = p.total_position;
            inputs.value.splice(index, 1, moved);
          }
        }
        return;
      }

      // Server rejected or failed one of our changes (REST calls get an HTTP error instead)
      if (type === 'error') {
        notifyError(message.message || 'Update failed');
        return;
      }

      if (type === 'tick') {
        if (serverLoad.value) {
          const updates = { uptime: message.data.uptime };
          if (message.data.load1 != null) updates.load1 = message.data.load1;
          if (message.data.load_percent != null) updates.load_percent = message.data.load_percent;
          if (message.data.rss_mb && serverLoad.value.memory) {
            updates.memory = { ...serverLoad.value.memory, rss_mb: message.data.rss_mb };
          }
          if (message.data.viewers != null) updates.viewers = message.data.viewers;
          if (message.data.fds != null) updates.fds = message.data.fds;
          if (message.data.net_in_kbps != null) updates.net_in_kbps = message.data.net_in_kbps;
          if (message.data.net_out_kbps != null) updates.net_out_kbps = message.data.net_out_kbps;
          if ('gpu_usage' in message.data) updates.gpu_usage = message.data.gpu_usage;
          serverLoad.value = { ...serverLoad.value, ...updates };
        }
        return;
      }

      // There is one program, and it is never created or deleted
      if (message.kind === 'program') {
        program.value = message.data;
        return;
      }

      const entities = getEntitiesArray(message.kind);
      if (!entities) {
        console.warn('Unknown kind:', message.kind);
        return;
      }

      // created and updated carry the whole entity
      if (type === 'created' || type === 'updated') {
        const index = entities.value.findIndex(e => e.uid === message.data.uid);
        if (index === -1) {
          entities.value.push(message.data);
        } else {
          entities.value.splice(index, 1, message.data);
        }
      } else if (type === 'deleted') {
        const index = entities.value.findIndex(e => e.uid === message.uid);
        if (index !== -1) {
          entities.value.splice(index, 1);
        }
        // prune per-uid level state so map doesn't grow unbounded over long sessions
        delete audioLevels.value[message.uid];
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

  // Health check: reconnect the WebSocket if it is closed or silent. A new connection starts
  // with a snapshot, so nothing has to be fetched again.
  // Works regardless of visibility API / timer throttling reliability.
  const startHealthCheck = () => {
    if (healthInterval) return;
    healthInterval = setInterval(() => {
      const wsAlive = ws && ws.readyState === WebSocket.OPEN;
      const stale = Date.now() - lastMessage > 10000;
      if ((!wsAlive || stale) && !reconnectTimer) {
        if (wsAlive) console.log('WebSocket stale, reconnecting');
        // Respects the exponential backoff
        scheduleReconnect();
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
    await fetchStatic();
    connect();
    startHealthCheck();
  });

  return {
    provide: {
      ws: { sendMessage, status, connect, disconnect },
    },
  };
});
