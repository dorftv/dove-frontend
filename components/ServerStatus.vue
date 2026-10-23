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
        <div class="flex justify-between" title="How busy the whole machine is (1-minute average over all its cores); other programs on it count too">
          <span class="text-gray-500 dark:text-gray-400">Machine load</span>
          <span :class="statusColor(load.load_percent)">{{ load.load_percent }}%</span>
        </div>
        <div class="flex justify-between" :title="memoryParts">
          <span class="text-gray-500 dark:text-gray-400">Memory</span>
          <span :class="statusColor(memoryPercent)">{{ memory }}</span>
        </div>
        <div v-if="load.video" class="flex justify-between" :title="load.video === 'gl' ? `Pictures are scaled and mixed on the GPU${load.gpu ? ` (${load.gpu})` : ''}` : 'Pictures are scaled and mixed on the CPU; [main] gl moves this to the GPU'">
          <span class="text-gray-500 dark:text-gray-400">Mixing on</span>
          <span>{{ load.video === 'gl' ? 'GPU' : 'CPU' }}</span>
        </div>
        <div v-if="load.cpu_percent != null" class="flex justify-between" :title="`CPU time of the backend and its web pages; 100% is one core, this machine has ${load.cpu_count} cores`">
          <span class="text-gray-500 dark:text-gray-400">CPU</span>
          <span :class="statusColor(load.cpu_percent / (load.cpu_count || 1))">{{ load.cpu_percent }}%</span>
        </div>
        <div v-if="load.gpu_usage" class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">GPU</span>
          <span :class="statusColor(load.gpu_usage.percent)" :title="gpuEngines">{{ load.gpu_usage.percent }}%</span>
        </div>
        <div v-if="load.gpu_usage" class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">GPU memory</span>
          <span>{{ load.gpu_usage.vram_mb }}MB</span>
        </div>
        <div v-if="load.net_in_kbps != null" class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Network in</span>
          <span>{{ rate(load.net_in_kbps) }}</span>
        </div>
        <div v-if="load.net_out_kbps != null" class="flex justify-between">
          <span class="text-gray-500 dark:text-gray-400">Network out</span>
          <span>{{ rate(load.net_out_kbps) }}</span>
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
        <div v-if="canAdmin && localFps != null" class="flex justify-between items-center gap-2 pt-1">
          <span class="text-gray-500 dark:text-gray-400 shrink-0">Preview FPS</span>
          <input
            type="range"
            min="1"
            max="60"
            v-model.number="localFps"
            @change="setPreviewFps(localFps)"
            class="flex-1 min-w-[80px]"
          >
          <NumberField :value="localFps" :min="1" :max="60" @set="(fps) => { localFps = fps; setPreviewFps(fps) }" class="w-12" />
        </div>
        <div class="pt-1 border-t border-gray-200 dark:border-gray-600 text-[10px] text-gray-400 dark:text-gray-500">
          Load average: {{ load.load1 }} / {{ load.load5 }} / {{ load.load15 }} ({{ load.cpu_count }} cores)
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup>
const { load, uptime, memory, memoryPercent, memoryParts, viewers, status, previewFps, setPreviewFps } = useServerLoad();
const { canAdmin } = useAuth();

// Local copy so the slider feels responsive while dragging; commits on @change.
const localFps = ref(previewFps.value);
watch(previewFps, v => { if (v != null) localFps.value = v });

// Each GPU engine this backend uses (graphics, video decode/encode, ...), for the tooltip
const gpuEngines = computed(() => Object.entries(load.value?.gpu_usage?.engines || {})
  .map(([name, percent]) => `${name}: ${percent}%`).join('\n'));

// kbit/s from the server, shown as kbit/s or Mbit/s
const rate = (kbps) => (kbps >= 1000 ? `${(kbps / 1000).toFixed(1)} Mbit/s` : `${kbps} kbit/s`);

const statusColor = (percent) => ({
  'text-red-500': percent > 80,
  'text-orange-500': percent > 50 && percent <= 80,
  'text-gray-700 dark:text-gray-300': percent <= 50,
});
</script>
