<template>
  <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500">
    <Icon name="ph:spinner" size="32px" class="animate-spin" />
    <span class="mt-2 text-sm">Loading...</span>
  </div>

  <div v-else class="relative">
    <div class="grid grid-cols-12 gap-4 px-4 lg:pl-4 lg:pr-8 py-4">
      <div class="col-span-12 md:col-span-6 lg:col-span-5">
        <SceneMain />
      </div>

      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <ProgramSwitch />
      </div>

      <div class="col-span-12 md:col-span-6 lg:col-span-5" ref="programRef">
        <ProgramMain />
      </div>

      <!-- Mobile/tablet: inline outputs -->
      <div class="col-span-12 lg:hidden order-last">
        <OutputMain />
      </div>

      <!-- Mobile: inline NodeCG toggle -->
      <div v-if="inputsNodeCG.length > 0" class="col-span-12 lg:hidden order-last">
        <button
          @click="nodecgOpen = !nodecgOpen"
          class="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-2"
        >
          <Icon :name="nodecgOpen ? 'ph:caret-up' : 'ph:caret-down'" size="12px" />
          NodeCG
          <span class="text-[10px] opacity-60">{{ inputsNodeCG.length }}</span>
        </button>
        <div v-if="nodecgOpen" class="rounded-lg shadow-sm overflow-hidden p-2 mb-4" style="background: #2f3a4f; border: 1px solid #3a4660;">
          <InputNodeCG />
        </div>
      </div>

      <div class="col-span-12 md:order-last relative" ref="inputRef">
        <InputMain />

        <!-- Inputs without preview -->
        <div v-if="inputsNoPreview.length > 0" class="mt-2">
          <button
            @click="showNoPreview = !showNoPreview"
            class="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon :name="showNoPreview ? 'ph:caret-up' : 'ph:caret-down'" size="12px" />
            {{ inputsNoPreview.length }} without preview
          </button>
          <div v-if="showNoPreview"
               class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-2 mt-2">
            <div class="input-grid-compact gap-3">
              <div v-for="input in inputsNoPreview" :key="input.uid" class="flex flex-col rounded-lg overflow-hidden">
                <InputHeader :input="input" />
                <InputControls :state="input.state" :uid="input.uid" :input="input" />
                <InputScenes :input="input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: floating NodeCG panel over inputs -->
        <div
          v-if="nodecgOpen && inputsNodeCG.length > 0"
          class="nodecg-panel hidden lg:block"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-sm text-gray-200">NodeCG</span>
            <button @click="nodecgOpen = false" class="text-gray-400 hover:text-gray-200">
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
          <InputNodeCG />
        </div>
      </div>
    </div>

    <!-- Large screens: output drawer tab handle -->
    <div
      v-if="!outputOpen && tabTop !== null"
      class="output-tab"
      :style="{ top: tabTop + 'px' }"
      @click="outputOpen = true"
      v-tooltip.left="'Outputs'"
    >
      <span class="output-tab-label">Outputs</span>
      <span
        v-for="item in statusItems"
        :key="item.uid"
        class="output-tab-dot"
        :style="{ backgroundColor: stateColor(item.state) }"
        v-tooltip.left="item.name + ' \u2014 ' + (item.state || 'NULL')"
      />
    </div>
  </div>

  <!-- Large screens: output drawer -->
  <Drawer v-model:visible="outputOpen" position="right" :modal="false" :dismissable="false" class="output-drawer">
    <template #header>
      <span class="font-medium text-sm">Outputs & Encoders</span>
    </template>
    <OutputMain />
  </Drawer>

  <!-- Large screens: NodeCG tab handle -->
  <div
    v-if="inputsNodeCG.length > 0 && nodecgTabTop !== null"
    class="nodecg-tab"
    :class="{ active: nodecgOpen }"
    :style="{ top: nodecgTabTop + 'px' }"
    @click="nodecgOpen = !nodecgOpen"
    v-tooltip.left="'NodeCG'"
  >
    <span class="output-tab-label">NodeCG</span>
  </div>
</template>

<script setup>
const { isLoading, outputs, inputsNodeCG, inputsNoPreview } = useEntities();
const showNoPreview = ref(false);
const { stateColor } = useStateClass();
useKeyboardShortcuts();

const outputOpen = ref(false);
const nodecgOpen = ref(false);
const programRef = ref(null);
const inputRef = ref(null);
const tabTop = ref(null);
const nodecgTabTop = ref(null);

const statusItems = computed(() =>
  outputs.value.filter(o => !o.is_preview).map(o => ({ uid: o.uid, name: o.name, state: o.state }))
);

function updateTabPosition() {
  const el = programRef.value;
  if (!el) return;
  tabTop.value = el.offsetTop + el.offsetHeight / 2;

  const inputEl = inputRef.value;
  if (!inputEl) return;
  nodecgTabTop.value = inputEl.offsetTop + inputEl.offsetHeight / 2;
}

// Close drawers on outside click, but ignore PrimeVue overlays (popovers, selects, etc.)
let skipNextClick = false;
watch(outputOpen, (val) => { if (val) skipNextClick = true; });
watch(nodecgOpen, (val) => { if (val) skipNextClick = true; });
const onDocumentClick = (e) => {
  if (skipNextClick) { skipNextClick = false; return; }
  if (!outputOpen.value && !nodecgOpen.value) return;
  const overlay = e.target.closest('.p-drawer, .p-popover, .p-select-overlay, .p-dialog, .p-confirmdialog, .p-tooltip, .nodecg-panel, .nodecg-tab');
  if (!overlay) {
    outputOpen.value = false;
    nodecgOpen.value = false;
  }
};

let ro;
watch([programRef, inputRef], ([progEl, inEl]) => {
  ro?.disconnect();
  ro = new ResizeObserver(updateTabPosition);
  if (progEl) ro.observe(progEl);
  if (inEl) ro.observe(inEl);
  updateTabPosition();
});

onMounted(() => document.addEventListener('click', onDocumentClick));
onUnmounted(() => {
  ro?.disconnect();
  document.removeEventListener('click', onDocumentClick);
});
</script>

<style scoped>
.input-grid-compact {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.output-tab {
  position: absolute;
  right: 0;
  transform: translateY(-50%);
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 6px;
  border-radius: 6px 0 0 6px;
  cursor: pointer;
  z-index: 100;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-right: none;
  transition: background 0.15s;
}

@media (min-width: 1024px) {
  .output-tab {
    display: flex;
  }
}

:root.p-dark .output-tab {
  background: var(--p-surface-800);
  border-color: var(--p-surface-700);
}

.output-tab:hover {
  background: var(--p-surface-50);
}

:root.p-dark .output-tab:hover {
  background: var(--p-surface-700);
}

.output-tab-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 11px;
  font-weight: 500;
  color: var(--p-surface-600);
  letter-spacing: 0.5px;
}

:root.p-dark .output-tab-label {
  color: var(--p-surface-400);
}

.output-tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.output-drawer {
  width: 22rem !important;
}

.nodecg-tab {
  position: absolute;
  right: 0;
  transform: translateY(-50%);
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 6px;
  border-radius: 6px 0 0 6px;
  cursor: pointer;
  z-index: 100;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-right: none;
  transition: background 0.15s;
}

@media (min-width: 1024px) {
  .nodecg-tab {
    display: flex;
  }
}

:root.p-dark .nodecg-tab {
  background: var(--p-surface-800);
  border-color: var(--p-surface-700);
}

.nodecg-tab:hover,
.nodecg-tab.active {
  background: var(--p-surface-50);
}

:root.p-dark .nodecg-tab:hover,
:root.p-dark .nodecg-tab.active {
  background: var(--p-surface-700);
}

.nodecg-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 28rem;
  max-width: 50%;
  max-height: 100%;
  overflow-y: auto;
  z-index: 50;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  background: #2f3a4f;
  border: 1px solid #3a4660;
}
</style>
