<template>
  <div class="bg-gray-900 rounded-lg p-4 text-xs font-mono">
    <!-- Toolbar -->
    <div class="flex items-center gap-2 mb-3">
      <Select
        v-model="filterChannel"
        :options="channelOptions"
        placeholder="All channels"
        showClear
        class="text-xs w-36"
      />
      <Select
        v-model="filterType"
        :options="typeOptions"
        placeholder="All types"
        showClear
        class="text-xs w-36"
      />
      <div class="flex-grow" />
      <span class="text-gray-500">{{ filteredMessages.length }} messages</span>
      <button @click="messages = []" class="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">
        Clear
      </button>
      <button @click="paused = !paused" class="px-2 py-1 rounded transition-colors" :class="paused ? 'text-orange-400 bg-orange-900/30' : 'text-gray-400 hover:text-white hover:bg-gray-700'">
        {{ paused ? 'Resume' : 'Pause' }}
      </button>
    </div>

    <!-- Messages -->
    <div class="space-y-1 max-h-[70vh] overflow-y-auto">
      <div v-if="filteredMessages.length === 0" class="text-gray-500 text-center py-8">
        No messages yet
      </div>
      <div
        v-for="(msg, index) in filteredMessages"
        :key="index"
        class="flex gap-2 px-2 py-1 rounded hover:bg-gray-800 group"
      >
        <span class="text-gray-600 shrink-0">{{ msg.time }}</span>
        <span :class="channelColor(msg.channel)" class="shrink-0 w-14">{{ msg.channel }}</span>
        <span class="text-gray-400 shrink-0 w-14">{{ msg.type }}</span>
        <span class="text-gray-300 truncate cursor-pointer" @click="msg.expanded = !msg.expanded">
          <template v-if="msg.expanded">
            <pre class="whitespace-pre-wrap text-gray-300">{{ JSON.stringify(msg.data, null, 2) }}</pre>
          </template>
          <template v-else>
            {{ msg.summary }}
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const messages = ref([]);
const filterChannel = ref(null);
const filterType = ref(null);
const paused = ref(false);
const MAX_MESSAGES = 500;

let socket = null;

const channelOptions = ['CREATE', 'UPDATE', 'DELETE'];
const typeOptions = ['input', 'mixer', 'output'];

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
</script>
