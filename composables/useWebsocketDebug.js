export function useWebsocketDebug() {
  const messages = ref([]);
  const filterChannel = ref(null);
  const filterType = ref(null);
  const paused = ref(false);
  const MAX_MESSAGES = 500;

  let socket = null;

  const channelOptions = ['CREATE', 'UPDATE', 'DELETE'];
  const typeOptions = ['input', 'mixer', 'output', 'encoder'];

  const channelColor = (channel) => {
    const colors = {
      CREATE: 'text-green-400',
      UPDATE: 'text-blue-400',
      DELETE: 'text-red-400',
    };
    return colors[channel] || 'text-gray-400';
  };

  const filteredMessages = computed(() => {
    return messages.value.filter(msg => {
      if (filterChannel.value && msg.channel !== filterChannel.value) return false;
      if (filterType.value && msg.type !== filterType.value) return false;
      return true;
    });
  });

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  };

  const setupWebSocket = () => {
    let wsUrl;
    if (process.dev) {
      wsUrl = process.env.DOVE_API ? process.env.DOVE_API + '/ws' : 'ws://localhost:5000/ws';
    } else {
      const url = useRequestURL();
      wsUrl = `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/ws`;
    }

    socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      if (paused.value) return;

      try {
        const parsed = JSON.parse(event.data);
        const name = parsed.data?.name || parsed.data?.uid || '';
        messages.value.unshift({
          time: formatTime(new Date()),
          channel: parsed.channel || '?',
          type: parsed.type || '?',
          data: parsed.data,
          summary: name ? `${name} — ${JSON.stringify(parsed.data).slice(0, 120)}` : JSON.stringify(parsed.data).slice(0, 150),
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
  };

  onMounted(() => {
    setupWebSocket();
  });

  onUnmounted(() => {
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
    channelOptions,
    typeOptions,
    channelColor,
    filteredMessages,
    clearMessages,
  };
}
