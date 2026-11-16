<template>
  <div v-if="program" class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 flex items-center gap-1.5 text-xs">
    <UTooltip :text="String(program.uid)">
      <span class="text-sm text-gray-800 dark:text-gray-200 font-medium truncate cursor-help">
        {{ program.name || 'Program' }}
      </span>
    </UTooltip>
    <span
      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none"
      :class="program.state === 'PLAYING'
        ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
    >
      {{ program.state === 'PLAYING' ? 'LIVE' : program.state }}
    </span>
    <!-- What the channel's programme guide says is on, and what is next -->
    <NuxtLink
      v-if="epg?.present"
      to="/guide"
      class="min-w-0 flex items-center gap-1 ml-1 text-[11px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
      :title="`Programme guide: ${epg.present.title}${epg.following ? ' · then ' + epg.following.title : ''}`"
    >
      <Icon name="ph:television-simple" size="12px" class="shrink-0" />
      <span class="truncate"><span class="font-medium text-gray-800 dark:text-gray-200">{{ epg.present.title }}</span><template v-if="epg.present.duration"> until {{ clock(epg.present.start + epg.present.duration) }}</template></span>
      <span v-if="epg.present.live" class="shrink-0 text-[9px] font-semibold uppercase text-white bg-red-600 rounded px-1">live</span>
      <span v-if="epg.following" class="hidden md:inline truncate">· then {{ epg.following.title }} {{ clock(epg.following.start) }}</span>
    </NuxtLink>
    <div class="flex-grow" />
    <template v-if="canSupervisor">
      <button
        @click="filtersOpen = true"
        class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
        title="Audio filters"
      >
        <Icon name="ph:waveform" size="12px" />
        <span
          v-if="programFilterCount > 0"
          class="absolute -top-1 -right-1 min-w-[12px] h-[12px] flex items-center justify-center rounded-full bg-blue-500 text-white text-[7px] font-bold leading-none px-0.5"
        >{{ programFilterCount }}</span>
      </button>
      <AudioFilters v-model:open="filtersOpen" :mixer="program" :ctx="afCtx" />
      <button
        @click="vfOpen = true"
        class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
        title="Video filters"
      >
        <Icon name="ph:camera" size="12px" />
        <span
          v-if="programVfCount > 0"
          class="absolute -top-1 -right-1 min-w-[12px] h-[12px] flex items-center justify-center rounded-full bg-violet-500 text-white text-[7px] font-bold leading-none px-0.5"
        >{{ programVfCount }}</span>
      </button>
      <VideoFilters v-model:open="vfOpen" :mixer="program" :ctx="vfCtx" />
    </template>
    <DetailPopover :entity="program" />
  </div>
</template>

<script setup>
const { program, outputs } = useEntities();
const { canSupervisor } = useAuth();
const filtersOpen = ref(false);
const vfOpen = ref(false);
const afCtx = useAudioFilters({ mixer: () => program.value });
const vfCtx = useVideoFilters({ mixer: () => program.value });
const programFilterCount = afCtx.filterCount;
const programVfCount = vfCtx.filterCount;

// The programme guide of the channel: the first output that names one, asked every ten seconds
const channel = computed(() => outputs.value.find((output) => output.service_name));
const epg = ref(null);
const loadEpg = async () => {
  if (!channel.value) { epg.value = null; return; }
  try {
    epg.value = await useApiFetch(`/api/v2/outputs/${channel.value.uid}/epg`);
  } catch {
    epg.value = null;
  }
};
const clock = (seconds) => new Date(seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
watch(() => channel.value?.uid, loadEpg, { immediate: true });
let epgTimer;
onMounted(() => { epgTimer = setInterval(loadEpg, 10000); });
onBeforeUnmount(() => clearInterval(epgTimer));
</script>
