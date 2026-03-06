<template>
  <div class="bg-gray-900 rounded-lg p-4 text-xs font-mono">
    <!-- Toolbar -->
    <div class="flex items-center gap-2 mb-3">
      <MultiSelect
        v-model="filterChannel"
        :options="channelOptions"
        placeholder="Channels"
        class="text-xs w-48"
      />
      <MultiSelect
        v-model="filterType"
        :options="typeOptions"
        placeholder="Types"
        class="text-xs w-48"
      />
      <label class="flex items-center gap-1.5 text-gray-400 cursor-pointer select-none hover:text-gray-200">
        <input type="checkbox" v-model="showLevels" class="accent-yellow-400" />
        Audio Levels
      </label>
      <div class="flex-grow" />
      <span class="text-gray-500">{{ filteredMessages.length }} messages</span>
      <button @click="clearMessages" class="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">
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
const { filterChannel, filterType, paused, showLevels, channelOptions, typeOptions, channelColor, filteredMessages, clearMessages } = useWebsocketDebug();
</script>
