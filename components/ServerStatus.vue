<template>
  <UPopover v-if="load">
    <button class="flex icon-btn" title="Server Status" aria-label="Server Status">
      <Icon
        name="ph:pulse"
        size="16px"
        :class="{
          'text-green-500': status === 'ok',
          'text-red-500': status === 'critical',
          'text-orange-400': status === 'warning',
          'text-gray-400': status === 'unknown',
        }"
      />
    </button>
    <template #content>
      <div class="p-3 text-xs font-mono tabular-nums space-y-1.5 min-w-[180px]">
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Load</span>
          <span :class="statusColor(load.load_percent)">{{ load.load_percent }}%</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Memory</span>
          <span :class="statusColor(memoryPercent)">{{ memory }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Users</span>
          <span>{{ viewers }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Uptime</span>
          <span>{{ uptime }}</span>
        </div>
        <div v-if="load.fds" class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">File descriptors</span>
          <span>{{ load.fds }}</span>
        </div>
        <div class="pt-1 border-t border-gray-200 dark:border-gray-600 text-[10px] text-gray-400 dark:text-gray-500">
          CPU: {{ load.load1 }} / {{ load.load5 }} / {{ load.load15 }} ({{ load.cpu_count }} cores)
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup>
const { load, uptime, memory, memoryPercent, viewers, status } = useServerLoad();

const statusColor = (percent) => ({
  'text-red-500': percent > 80,
  'text-orange-500': percent > 50 && percent <= 80,
  'text-gray-700 dark:text-gray-300': percent <= 50,
});
</script>
