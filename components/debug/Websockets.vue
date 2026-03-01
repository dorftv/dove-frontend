<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 mt-5 bg-white dark:bg-gray-800">
    <h2 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">WebSocket Messages</h2>
    <ul class="list-none p-0">
      <li v-for="(message, index) in messages" :key="index" class="mb-1 text-sm text-gray-700 dark:text-gray-300 font-mono">
        {{ message }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const messages = ref([]);
let socket = null;

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
    messages.value.unshift(event.data);
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
