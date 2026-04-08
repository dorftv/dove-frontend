<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg mb-1 text-xs overflow-hidden">
    <!-- Header row (click to expand) -->
    <div
      class="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors"
      @click="canExpand && (expanded = !expanded)"
      :class="{ 'cursor-default': !canExpand }"
    >
      <!-- State dot -->
      <span
        :title="encoder.state"
        class="w-2 h-2 rounded-full shrink-0"
        :style="{ backgroundColor: stateColor(encoder.state) }"
        role="status"
      />

      <!-- Type icon + element -->
      <Icon :name="encoder.type === 'video' ? 'ph:video-camera' : 'ph:speaker-high'" size="12px" class="text-gray-400 shrink-0" :title="encoder.type" />
      <span class="shrink-0 text-gray-800 dark:text-gray-200">{{ encoder.element }}</span>

      <!-- Resolution (video only) -->
      <span v-if="encoder.type === 'video' && encoder.width && encoder.height" class="text-[10px] text-gray-400 shrink-0">
        {{ encoder.width }}x{{ encoder.height }}
      </span>

      <!-- Video delay badge (auto-synced from audio filter latency) -->
      <span
        v-if="encoder.type === 'video' && encoder.video_delay_ms > 0"
        class="text-[10px] text-amber-500 dark:text-amber-400 font-mono shrink-0"
        :title="`Auto-synced video delay: ${encoder.video_delay_ms}ms`"
      >
        +{{ (encoder.video_delay_ms / 1000).toFixed(1) }}s
      </span>

      <!-- Options -->
      <span v-if="encoder.options" class="truncate text-[10px] text-gray-500 dark:text-gray-400" :title="encoder.options">
        {{ encoder.options }}
      </span>

      <!-- Spacer -->
      <div class="flex-grow" />

      <!-- Filter badge: audio encoders only (non-preview), shows count + triggers expand -->
      <button
        v-if="showFilterBadge"
        @click.stop="expanded = true"
        class="relative flex items-center justify-center w-5 h-5 rounded hover:bg-gray-400/30 dark:hover:bg-gray-700 text-cyan-500 dark:text-cyan-400"
        :title="filterCount > 0 ? `${filterCount} audio filter(s)` : 'Add audio filters'"
      >
        <Icon name="ph:waveform" size="12px" />
        <span
          v-if="filterCount > 0"
          class="absolute -top-1 -right-1 min-w-[10px] h-[10px] flex items-center justify-center rounded-full bg-cyan-500 text-white text-[7px] font-bold leading-none px-0.5"
        >{{ filterCount }}</span>
      </button>

      <!-- Action buttons -->
      <DetailPopover :entity="encoder" />
      <button
        v-if="canOutputs && (!encoder.locked || canBypassLock)"
        @click.stop="submitRemove"
        :disabled="deleting"
        class="icon-btn text-red-400 hover:text-red-300 disabled:opacity-50"
        title="Delete"
        aria-label="Delete encoder"
      >
        <Icon :name="deleting ? 'ph:spinner' : 'ph:trash'" size="11px" :class="{ 'animate-spin': deleting }" />
      </button>

      <!-- Expand indicator -->
      <Icon
        v-if="canExpand"
        :name="expanded ? 'ph:caret-up' : 'ph:caret-down'"
        size="10px"
        class="text-gray-400 shrink-0"
      />
    </div>

    <!-- Expanded body: inline filter editor (audio encoders only) -->
    <div v-if="expanded && showFilterBadge" class="border-t border-gray-300 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-900/50 p-2">
      <FilterPanel
        :ctx="audioCtx"
        icon="ph:waveform"
        accent-class="text-cyan-400/80"
      />
    </div>
  </div>
</template>

<script setup>
const { canOutputs, canBypassLock } = useAuth()
const { stateColor } = useStateClass()

const props = defineProps({
  encoder: Object,
});

const { deleting, submitRemove } = useDeleteEntity('encoder', () => props.encoder);

const expanded = ref(false);

// Audio filters are only available on non-preview audio encoders
const showFilterBadge = computed(() =>
  props.encoder?.type === 'audio' && !props.encoder?.is_preview && canOutputs.value
);
const canExpand = computed(() => showFilterBadge.value);

// Build the audio filter context once per encoder — reactivity flows through useEntities store
const audioCtx = useAudioFilters({ encoder: () => props.encoder });
const filterCount = audioCtx.filterCount;
</script>
