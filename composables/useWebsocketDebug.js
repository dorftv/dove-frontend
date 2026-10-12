export function useWebsocketDebug() {
  const messages = ref([]);
  const filterChannel = ref([]);
  const filterType = ref([]);
  const paused = ref(false);
  const showLevels = ref(false);
  const MAX_MESSAGES = 500;

  let socket = null;
  let reconnectTimer = null;
  let leaving = false;

  // API v2: every message has an `event`; entity events also say which `kind`
  const channelOptions = ['snapshot', 'created', 'updated', 'deleted', 'position', 'level', 'tick', 'error'];
  const typeOptions = ['input', 'scene', 'program', 'output', 'encoder'];
  // Sent every second or faster, whatever happens
  const periodic = ['level', 'tick', 'position'];

  const channelColor = (channel) => {
    const colors = {
      snapshot: 'text-purple-400',
      created: 'text-green-400',
      updated: 'text-blue-400',
      deleted: 'text-red-400',
      error: 'text-red-500',
      level: 'text-yellow-400',
      tick: 'text-yellow-600',
      position: 'text-yellow-600',
    };
    return colors[channel] || 'text-gray-400';
  };

  const summarize = (parsed) => {
    if (parsed.event === 'snapshot') {
      const count = (list) => (Array.isArray(parsed[list]) ? parsed[list].length : 0);
      return `${count('inputs')} inputs, ${count('scenes')} scenes, ${count('encoders')} encoders, ${count('outputs')} outputs`;
    }
    if (parsed.event === 'deleted') return parsed.uid || '';
    if (parsed.event === 'error') return parsed.message || '';
    const name = parsed.data?.name || parsed.data?.uid || '';
    const text = JSON.stringify(parsed.data ?? null);
    return name ? `${name} — ${text.slice(0, 120)}` : text.slice(0, 150);
  };

  const filteredMessages = computed(() => {
    return messages.value.filter(msg => {
      if (!showLevels.value && periodic.includes(msg.channel)) return false;
      if (filterChannel.value?.length && !filterChannel.value.includes(msg.channel)) return false;
      if (filterType.value?.length && !filterType.value.includes(msg.type)) return false;
      return true;
    });
  });

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  };

  const setupWebSocket = () => {
    // The same address the app's own connection uses (plugins/websocket.client.js)
    const config = useRuntimeConfig();
    let wsUrl;
    if (config.public.wsUrl) {
      wsUrl = config.public.wsUrl;
    } else if (process.dev) {
      wsUrl = `ws://${window.location.hostname}:5000/api/v2/ws`;
    } else {
      wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/v2/ws`;
    }

    socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      if (paused.value) return;

      try {
        const parsed = JSON.parse(event.data);
        const { event: channel, kind, ...rest } = parsed;
        messages.value.unshift({
          time: formatTime(new Date()),
          channel: channel || '?',
          type: kind || '',
          // An entity event carries the entity; the others are shown whole
          data: 'data' in rest && Object.keys(rest).length === 1 ? rest.data : rest,
          summary: summarize(parsed),
          expanded: false,
        });

        if (messages.value.length > MAX_MESSAGES) {
          messages.value.length = MAX_MESSAGES;
        }
      } catch {
        messages.value.unshift({
          time: formatTime(new Date()),
          channel: '?',
          type: '?',
          data: event.data,
          summary: String(event.data).slice(0, 150),
          expanded: false,
        });
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    // The backend was restarted, or the connection was lost: connect again
    socket.onclose = () => {
      if (!leaving) reconnectTimer = setTimeout(setupWebSocket, 1000);
    };
  };

  onMounted(() => {
    setupWebSocket();
  });

  onUnmounted(() => {
    leaving = true;
    clearTimeout(reconnectTimer);
    if (socket) {
      socket.close();
    }
  });

  const clearMessages = () => {
    messages.value = [];
  };

  return {
    messages,
    filterChannel,
    filterType,
    paused,
    showLevels,
    channelOptions,
    typeOptions,
    channelColor,
    filteredMessages,
    clearMessages,
  };
}
