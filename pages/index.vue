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

      <div class="col-span-12 md:order-last">
        <InputMain />
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
</template>

<script setup>
const { isLoading, outputs } = useEntities();
const { stateColor } = useStateClass();
useKeyboardShortcuts();

const outputOpen = ref(false);
const programRef = ref(null);
const tabTop = ref(null);

const statusItems = computed(() =>
  outputs.value.filter(o => !o.is_preview).map(o => ({ uid: o.uid, name: o.name, state: o.state }))
);

function updateTabPosition() {
  const el = programRef.value;
  if (!el) return;
  tabTop.value = el.offsetTop + el.offsetHeight / 2;
}

// Close drawer on outside click, but ignore PrimeVue overlays (popovers, selects, etc.)
let skipNextClick = false;
watch(outputOpen, (val) => { if (val) skipNextClick = true; });
const onDocumentClick = (e) => {
  if (skipNextClick) { skipNextClick = false; return; }
  if (!outputOpen.value) return;
  const overlay = e.target.closest('.p-drawer, .p-popover, .p-select-overlay, .p-dialog, .p-confirmdialog, .p-tooltip');
  if (!overlay) outputOpen.value = false;
};

let ro;
watch(programRef, (el) => {
  ro?.disconnect();
  if (el) {
    ro = new ResizeObserver(updateTabPosition);
    ro.observe(el);
    updateTabPosition();
  }
});

onMounted(() => document.addEventListener('click', onDocumentClick));
onUnmounted(() => {
  ro?.disconnect();
  document.removeEventListener('click', onDocumentClick);
});
</script>

<style scoped>
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
</style>
