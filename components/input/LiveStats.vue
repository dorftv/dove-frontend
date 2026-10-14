<template>
  <UPopover :content="{ collisionPadding: 8 }">
    <button class="stats-btn" :class="warn ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'" title="Stream stats" aria-label="Show stream stats">
      <Icon name="ph:chart-bar" size="11px" />
    </button>
    <template #content>
      <div class="p-3 text-xs min-w-52">
        <div class="font-medium text-gray-800 dark:text-gray-200 mb-2">{{ protocol }} stream</div>
        <dl v-if="rows.length" class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <template v-for="row in rows" :key="row.label">
            <dt class="text-gray-500 dark:text-gray-400">{{ row.label }}</dt>
            <dd class="font-mono tabular-nums text-right" :class="row.warn ? 'text-amber-500' : 'text-gray-800 dark:text-gray-200'">{{ row.value }}</dd>
          </template>
        </dl>
        <div v-else class="text-gray-500">No stream yet</div>
      </div>
    </template>
  </UPopover>
</template>

<script setup>
const props = defineProps({ input: Object });

const stats = computed(() => props.input.stats || {});
const protocol = computed(() => (props.input.uri || '').split(':')[0].toUpperCase() || 'Live');

// Losses and dropouts are worth a look: the icon turns amber
const warn = computed(() => (stats.value.packets_lost || 0) > 0 || (stats.value.packets_late || 0) > 0 || (stats.value.dropouts || 0) > 0);

const rows = computed(() => {
  const s = stats.value;
  const out = [];
  if (s.bitrate_mbps != null) out.push({ label: 'Bitrate', value: `${s.bitrate_mbps.toFixed(1)} Mbps` });
  if (s.width && s.height) out.push({ label: 'Picture', value: `${s.width}×${s.height}` });
  if (s.framerate) out.push({ label: 'Frame rate', value: `${s.framerate} fps` });
  if (s.video_codec) out.push({ label: 'Video', value: s.video_codec });
  if (s.audio_codec) out.push({ label: 'Audio', value: s.audio_codec });
  if (s.rtt_ms != null) out.push({ label: 'Round trip', value: `${Math.round(s.rtt_ms)} ms` });
  if (s.latency_ms) out.push({ label: 'SRT latency', value: `${s.latency_ms} ms` });
  if (s.packets_lost != null) out.push({ label: 'Lost packets', value: s.packets_lost, warn: s.packets_lost > 0 });
  if (s.packets_late != null) out.push({ label: 'Late packets', value: s.packets_late, warn: s.packets_late > 0 });
  if (s.dropouts != null) out.push({ label: 'Dropouts', value: s.dropouts, warn: s.dropouts > 0 });
  return out;
});
</script>

<style scoped>
@reference "tailwindcss";

.stats-btn {
  @apply flex items-center justify-center w-4 h-3 cursor-pointer;
}
</style>
