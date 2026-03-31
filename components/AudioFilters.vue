<template>
  <USlideover v-model:open="open" side="right" :overlay="false">
    <template #header>
      <div class="flex items-center gap-2">
        <Icon name="ph:waveform" size="16px" class="text-cyan-400" />
        <span class="font-medium text-sm">Audio Filters</span>
        <span class="text-xs text-gray-500 truncate">{{ headerLabel }}</span>
      </div>
    </template>
    <template #body>
      <div class="space-y-1.5 text-sm">
        <!-- Empty state -->
        <div v-if="filters.length === 0" class="text-center py-8 text-gray-500 text-xs">
          <Icon name="ph:waveform" size="32px" class="mb-2 opacity-30" />
          <p>No filters in chain</p>
        </div>

        <!-- Filter chain -->
        <div
          v-for="(filter, index) in filters"
          :key="index + '-' + filter.type"
          class="filter-card"
          :class="{ 'filter-disabled': !filter.enabled }"
        >
          <!-- Filter header bar -->
          <div class="filter-header">
            <div class="flex items-center gap-1.5 min-w-0">
              <!-- Reorder arrows -->
              <div class="flex flex-col -my-1">
                <button
                  @click="moveFilter(index, index - 1)"
                  :disabled="index === 0"
                  class="reorder-btn"
                  title="Move up"
                ><Icon name="ph:caret-up-bold" size="8px" /></button>
                <button
                  @click="moveFilter(index, index + 1)"
                  :disabled="index === filters.length - 1"
                  class="reorder-btn"
                  title="Move down"
                ><Icon name="ph:caret-down-bold" size="8px" /></button>
              </div>
              <span class="filter-index">{{ index + 1 }}</span>
              <span class="filter-type-label">{{ getFilterLabel(filter.type) }}</span>
              <span class="filter-category-badge">{{ getCategoryLabel(filter.type) }}</span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="toggleFilter(index)"
                class="bypass-btn"
                :class="filter.enabled ? 'bypass-active' : 'bypass-bypassed'"
                :title="filter.enabled ? 'Bypass' : 'Enable'"
              >{{ filter.enabled ? 'ON' : 'BYP' }}</button>
              <button
                @click="removeFilter(index)"
                class="remove-btn"
                title="Remove"
              ><Icon name="ph:x-bold" size="10px" /></button>
            </div>
          </div>

          <!-- Filter params -->
          <div v-if="filter.enabled && hasParams(filter.type)" class="filter-params">
            <template v-for="(spec, paramName) in getFilterParams(filter.type)" :key="paramName">
              <!-- Select param -->
              <div v-if="spec.type === 'select'" class="param-row">
                <span class="param-label">{{ spec.label || paramName }}</span>
                <USelect
                  :model-value="filter.params[paramName] ?? spec.default"
                  @update:model-value="(val) => updateFilterParam(index, paramName, val)"
                  :items="spec.options"
                  class="flex-grow"
                  size="xs"
                />
              </div>

              <!-- Slider param -->
              <div v-else class="param-row">
                <span class="param-label" :class="{ 'w-6': isEq10(filter.type) }">
                  {{ spec.label || getEq10BandLabel(filter.type, paramName) || paramName }}
                </span>
                <USlider
                  :model-value="filter.params[paramName] ?? spec.default"
                  @update:model-value="(val) => updateFilterParam(index, paramName, val)"
                  :min="spec.min"
                  :max="spec.max"
                  :step="spec.step || getDefaultStep(spec)"
                  class="flex-grow"
                  size="xs"
                />
                <span class="param-value">
                  {{ formatValue(filter.params[paramName] ?? spec.default, spec) }}
                </span>
              </div>
            </template>
          </div>

          <!-- Bypassed indicator -->
          <div v-else-if="!filter.enabled" class="px-3 py-1">
            <span class="text-[10px] text-amber-500/70 font-mono uppercase tracking-wider">Bypassed</span>
          </div>
        </div>

        <!-- Signal flow indicator -->
        <div v-if="filters.length > 0" class="flex items-center justify-center py-1">
          <div class="h-px flex-grow bg-gray-700/50"></div>
          <span class="px-2 text-[9px] text-gray-500 font-mono uppercase tracking-widest">Output</span>
          <div class="h-px flex-grow bg-gray-700/50"></div>
        </div>

        <!-- Add filter -->
        <div class="add-section">
          <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-medium">Add Filter</div>
          <div
            v-for="(cat, catKey) in FILTER_CATEGORIES"
            :key="catKey"
            class="mb-1.5"
          >
            <div class="text-[9px] text-gray-600 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Icon :name="cat.icon" size="10px" />
              {{ cat.label }}
            </div>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="(fDef, fKey) in getFiltersForCategory(catKey)"
                :key="fKey"
                @click="addFilter(fKey)"
                class="add-btn"
              >{{ fDef.label }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup>
const props = defineProps({
  input: Object,
  mixer: Object,
  slotIndex: { type: Number, default: undefined },
});

const open = defineModel('open', { type: Boolean, default: false });

const filterOpts = computed(() => {
  if (props.input) return { input: () => props.input };
  if (props.mixer && props.slotIndex !== undefined)
    return { mixer: () => props.mixer, slotIndex: () => props.slotIndex };
  if (props.mixer) return { mixer: () => props.mixer };
  return { input: () => null };
});

const {
  FILTER_TYPES,
  FILTER_CATEGORIES,
  EQ10_BANDS,
  filters,
  updateFilterParam,
  toggleFilter,
  addFilter,
  removeFilter,
  moveFilter,
} = useAudioFilters(filterOpts.value);

const headerLabel = computed(() => {
  if (props.input) return props.input.name;
  if (props.mixer && props.slotIndex !== undefined) {
    const source = props.mixer.sources?.find(s => s.index === props.slotIndex);
    return `${props.mixer.name} / ${source?.name || `Slot ${props.slotIndex}`}`;
  }
  if (props.mixer) return props.mixer.name;
  return '';
});

const getFilterLabel = (type) => FILTER_TYPES[type]?.label || type;
const getCategoryLabel = (type) => FILTER_CATEGORIES[FILTER_TYPES[type]?.category]?.label || '';
const getFilterParams = (type) => FILTER_TYPES[type]?.params || {};
const hasParams = (type) => Object.keys(getFilterParams(type)).length > 0;
const isEq10 = (type) => type === 'eq10';

const getFiltersForCategory = (catKey) => {
  return Object.fromEntries(
    Object.entries(FILTER_TYPES).filter(([, def]) => def.category === catKey)
  );
};

const getEq10BandLabel = (type, paramName) => {
  if (type !== 'eq10') return null;
  const match = paramName.match(/^band(\d+)$/);
  if (!match) return null;
  return EQ10_BANDS[parseInt(match[1])] || paramName;
};

const getDefaultStep = (spec) => {
  const range = spec.max - spec.min;
  if (range <= 1) return 0.01;
  if (range <= 50) return 1;
  return Math.max(1, Math.round(range / 100));
};

const formatValue = (value, spec) => {
  const v = typeof value === 'number' ? value : parseFloat(value) || 0;
  const display = spec.step && spec.step < 1 ? v.toFixed(2) : Math.round(v);
  return spec.unit ? `${display}${spec.unit}` : display;
};
</script>

<style scoped>
@reference "tailwindcss";

.filter-card {
  @apply rounded border border-gray-700/60 overflow-hidden bg-gray-900/60;
}
.filter-disabled {
  @apply opacity-50;
}
.filter-header {
  @apply flex items-center justify-between gap-1 px-2 py-1.5
         bg-gray-800/80 border-b border-gray-700/40;
}
.filter-index {
  @apply text-[10px] font-mono text-gray-500 w-3 text-center;
}
.filter-type-label {
  @apply text-xs font-semibold text-gray-200 truncate;
}
.filter-category-badge {
  @apply text-[9px] text-gray-500 font-mono uppercase tracking-wider;
}
.filter-params {
  @apply px-3 py-2 space-y-1.5;
}
.param-row {
  @apply flex items-center gap-2;
}
.param-label {
  @apply text-[11px] text-gray-400 w-16 shrink-0 text-right font-mono;
}
.param-value {
  @apply text-[10px] text-cyan-400/80 w-14 text-right tabular-nums font-mono;
}
.bypass-btn {
  @apply text-[9px] font-bold px-1.5 py-0.5 rounded font-mono tracking-wider
         cursor-pointer transition-colors;
}
.bypass-active {
  @apply bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50;
}
.bypass-bypassed {
  @apply bg-amber-600/20 text-amber-500 hover:bg-amber-600/40;
}
.remove-btn {
  @apply flex items-center justify-center w-5 h-5 rounded
         text-gray-500 hover:text-red-400 hover:bg-red-900/30
         cursor-pointer transition-colors;
}
.reorder-btn {
  @apply flex items-center justify-center w-4 h-2.5
         text-gray-600 hover:text-gray-300 cursor-pointer
         disabled:opacity-20 disabled:cursor-default
         transition-colors;
}
.add-section {
  @apply pt-2 border-t border-gray-700/40;
}
.add-btn {
  @apply text-[11px] px-2 py-1 rounded
         bg-gray-800 border border-gray-700/50 text-gray-300
         hover:bg-gray-700 hover:text-white hover:border-gray-600
         cursor-pointer transition-colors;
}
</style>
