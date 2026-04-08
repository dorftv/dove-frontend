<template>
  <div class="space-y-1.5 text-sm">
    <!-- Empty state -->
    <div v-if="filters.length === 0" class="text-center py-6 text-gray-500 text-xs">
      <Icon :name="icon" size="24px" class="mb-1 opacity-30" />
      <p>No filters in chain</p>
    </div>

    <!-- Filter chain -->
    <div ref="filterListRef" class="filter-chain-list">
      <div
        v-for="(filter, index) in filters"
        :key="index + '-' + filter.type"
        class="filter-card"
        :class="{ 'filter-disabled': !filter.enabled }"
      >
        <!-- Filter header bar (entire header is drag handle) -->
        <div class="filter-header filter-drag-handle cursor-grab">
          <div class="flex items-center gap-1.5 min-w-0">
            <Icon name="ph:dots-six-vertical" size="12px" class="text-gray-600 hover:text-gray-300 shrink-0" />
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
              <span class="param-value" :class="accentClass">
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

<script setup>
const props = defineProps({
  ctx: { type: Object, required: true },
  icon: { type: String, default: 'ph:waveform' },
  accentClass: { type: String, default: 'text-cyan-400/80' },
  // When true, init SortableJS immediately on mount (inline usage).
  // When false, caller triggers init via watch on slideover open state.
  autoInit: { type: Boolean, default: true },
});

const { FILTER_TYPES, FILTER_CATEGORIES, filters, updateFilterParam, toggleFilter, addFilter, removeFilter, moveFilter } = toRaw(props.ctx);
const { getFilterLabel, getCategoryLabel, getFilterParams, hasParams, isEq10, getFiltersForCategory, getEq10BandLabel, getDefaultStep, formatValue } = useFilterPresentation(FILTER_TYPES, FILTER_CATEGORIES);

const filterListRef = ref(null);
let sortableInstance = null;

const initSortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
  const el = filterListRef.value;
  if (!el) return;
  import('sortablejs').then(({ default: Sortable }) => {
    sortableInstance = new Sortable(el, {
      handle: '.filter-drag-handle',
      animation: 150,
      ghostClass: 'filter-drag-ghost',
      forceFallback: true,
      fallbackTolerance: 3,
      onEnd: (evt) => {
        if (evt.oldIndex === evt.newIndex) return;
        moveFilter(evt.oldIndex, evt.newIndex);
      },
    });
  });
};

defineExpose({ initSortable });

onMounted(() => {
  if (props.autoInit) nextTick(initSortable);
});
onUnmounted(() => {
  if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; }
});
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
  @apply text-[11px] text-gray-400 w-12 sm:w-16 shrink-0 text-right font-mono;
}
.param-value {
  @apply text-[10px] w-14 text-right tabular-nums font-mono;
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
.filter-drag-ghost {
  @apply opacity-40;
}
.filter-chain-list {
  @apply space-y-1.5;
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
