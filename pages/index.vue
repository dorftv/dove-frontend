<template>
  <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500">
    <Icon name="ph:spinner" size="32px" class="animate-spin" />
    <span class="mt-2 text-sm">Loading...</span>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500">
    <DovePoop class="text-amber-800 dark:text-amber-600" />
    <span class="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Failed to load DOVE</span>
    <UButton class="mt-4" color="neutral" variant="outline" @click="retry">Retry</UButton>
  </div>

  <div v-else class="relative">
    <!-- Mobile tabbed layout (< sm) -->
    <div class="sm:hidden pb-14">
      <!-- Tab: Live -->
      <div v-show="mobileTab === 'live'" class="px-2 py-2 space-y-2">
        <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400">
            <span>Scenes</span>
            <span v-if="selectedScene" class="text-gray-800 dark:text-gray-200 font-medium">{{ selectedScene.name }}</span>
          </div>
          <div class="p-2">
            <SceneSelector />
          </div>
        </div>
        <!-- Program video -->
        <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400">
            <span>Program</span>
            <span v-if="activeScene" class="text-red-500 font-semibold">{{ activeScene.name }}</span>
            <span v-else class="italic">None</span>
          </div>
          <div class="aspect-video">
            <ProgramPlayer class="w-full h-full" />
          </div>
        </div>
        <!-- Cut/Fade controls (shared with desktop) -->
        <ProgramSwitch />
        <ProgramOverlays />
      </div>

      <!-- Tab: Inputs -->
      <div v-show="mobileTab === 'inputs'" class="px-2 py-2">
        <InputMain />
        <!-- Inputs without preview -->
        <div v-if="inputsNoPreview.length > 0" class="mt-2">
          <button
            @click="showNoPreview = !showNoPreview"
            class="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon :name="showNoPreview ? 'ph:caret-up' : 'ph:caret-down'" size="12px" />
            {{ inputsNoPreview.length }} without preview
          </button>
          <div v-if="showNoPreview"
               class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden p-2 mt-2">
            <div class="input-grid-compact gap-3">
              <div v-for="input in inputsNoPreview" :key="input.uid" class="flex flex-col rounded-lg overflow-hidden">
                <InputHeader :input="input" />
                <InputControls :state="input.state" :uid="input.uid" :input="input" />
                <InputScenes :input="input" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Scenes (details + slots) -->
      <div v-show="mobileTab === 'scenes'" class="px-2 py-2">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scenes</div>
        <SceneMain />
      </div>

      <!-- Tab: Outputs -->
      <div v-show="mobileTab === 'outputs'" class="px-2 py-2">
        <OutputMain />
      </div>

      <!-- Tab: NodeCG -->
      <div v-if="mobileTab === 'nodecg'" class="px-2 py-2 nodecg-content">
        <InputNodeCG maxHeight="calc(100vh - 120px)" />
      </div>

      <!-- Fixed bottom tab bar -->
      <div class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex sm:hidden">
        <button
          v-for="tab in mobileTabs"
          :key="tab.id"
          @click="mobileTab = tab.id"
          class="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors"
          :class="mobileTab === tab.id
            ? 'text-blue-500 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400'"
        >
          <Icon :name="tab.icon" size="20px" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge" class="absolute top-1 right-1/4 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold leading-none px-0.5">{{ tab.badge }}</span>
        </button>
      </div>
    </div>

    <!-- Desktop grid layout (sm+) -->
    <div class="hidden sm:block">
      <div class="grid grid-cols-12 gap-2 lg:gap-3 px-2 lg:px-4 lg:pr-8 py-2 lg:py-3">
        <div class="col-span-12 sm:col-span-7 lg:col-span-5 sm:order-1">
          <SceneMain />
        </div>

        <div class="hidden lg:block lg:col-span-2 sm:order-2">
          <ProgramSwitch />
        </div>

        <div class="col-span-12 sm:col-span-5 lg:col-span-5 sm:order-3 flex flex-col gap-2 min-w-0" ref="programRef">
          <ProgramMain class="shrink-0" />
          <ProgramSwitch class="lg:hidden flex-grow" />
        </div>

        <!-- NodeCG toggle -->
        <div v-if="inputsNodeCG.length > 0" class="col-span-12 lg:hidden sm:order-4">
          <button
            @click="nodecgOpen = !nodecgOpen"
            class="nodecg-toggle flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-2"
          >
            <Icon :name="nodecgOpen ? 'ph:caret-up' : 'ph:caret-down'" size="12px" />
            NodeCG
            <span class="text-[10px] opacity-60">{{ inputsNodeCG.length }}</span>
          </button>
          <div v-if="nodecgOpen" class="nodecg-content rounded-lg shadow-sm overflow-hidden p-2 mb-4 bg-gray-800 border border-gray-700">
            <InputNodeCG />
          </div>
        </div>

        <div class="col-span-12 relative sm:order-5" ref="inputRef">
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
                 class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden p-2 mt-2">
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
                <Icon name="ph:x" size="12px" />
              </button>
            </div>
            <InputNodeCG />
          </div>
        </div>

        <!-- Tablet: inline outputs -->
        <div class="col-span-12 lg:hidden sm:order-6">
          <OutputMain />
        </div>
      </div>

      <!-- Large screens: output drawer tab handle -->
      <UTooltip
        v-if="!outputOpen && tabTop !== null"
        text="Outputs"
        :popper="{ placement: 'left' }"
      >
        <div
          class="side-tab"
          :style="{ top: tabTop + 'px' }"
          @click="outputOpen = true"
        >
          <span class="output-tab-label">Outputs</span>
          <kbd class="text-[11px] bg-gray-200 dark:bg-gray-600 px-1 rounded font-mono text-gray-600 dark:text-gray-400 hidden md:inline">O</kbd>
          <UTooltip
            v-for="item in statusItems"
            :key="item.uid"
            :text="item.name + ' \u2014 ' + (item.state || 'NULL')"
            :popper="{ placement: 'left' }"
          >
            <span
              class="output-tab-dot"
              :style="{ backgroundColor: stateColor(item.state) }"
            />
          </UTooltip>
        </div>
      </UTooltip>
    </div>

    <!-- Large screens: output drawer -->
    <USlideover v-model:open="outputOpen" side="right" :overlay="false">
      <template #header>
        <span class="font-medium text-sm">Outputs & Encoders</span>
      </template>
      <template #body>
        <OutputMain />
      </template>
    </USlideover>

    <!-- Large screens: NodeCG tab handle -->
    <UTooltip
      v-if="inputsNodeCG.length > 0 && nodecgTabTop !== null"
      text="NodeCG"
      :popper="{ placement: 'left' }"
    >
      <div
        class="side-tab"
        :class="{ active: nodecgOpen }"
        :style="{ top: nodecgTabTop + 'px' }"
        @click="nodecgOpen = !nodecgOpen"
      >
        <span class="output-tab-label">NodeCG</span>
        <kbd class="text-[11px] bg-gray-200 dark:bg-gray-600 px-1 rounded font-mono text-gray-600 dark:text-gray-400 hidden md:inline">N</kbd>
      </div>
    </UTooltip>
  </div>
</template>

<script setup>
const { isLoading, error, outputs, inputsNodeCG, inputsNoPreview } = useEntities();
const { $ws } = useNuxtApp();

const retry = async () => {
  error.value = null;
  isLoading.value = true;
  await $ws.fetchEntities();
};
const showNoPreview = ref(false);
const { stateColor } = useStateClass();
useKeyboardShortcuts();

// Mobile tabs
const mobileTab = ref('live');
const mobileTabs = computed(() => {
  const tabs = [
    { id: 'live', label: 'Live', icon: 'ph:broadcast' },
    { id: 'inputs', label: 'Inputs', icon: 'ph:monitor-play' },
    { id: 'scenes', label: 'Scenes', icon: 'ph:stack' },
    { id: 'outputs', label: 'Outputs', icon: 'ph:plugs-connected' },
  ];
  if (inputsNodeCG.value.length > 0) {
    tabs.push({ id: 'nodecg', label: 'NodeCG', icon: 'ph:layout' });
  }
  return tabs;
});

// Scene state for mobile tab header labels (ProgramSwitch handles cut/fade internally)
const { activeScene, selectedScene } = useActiveScene();

// Desktop state
const outputOpen = useState('output-drawer-open', () => false);
const nodecgOpen = useState('nodecg-panel-open', () => false);
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

useDrawerClickOutside(outputOpen, nodecgOpen);

let ro;
watch([programRef, inputRef], ([progEl, inEl]) => {
  ro?.disconnect();
  ro = new ResizeObserver(updateTabPosition);
  if (progEl) ro.observe(progEl);
  if (inEl) ro.observe(inEl);
  updateTabPosition();
});

onUnmounted(() => ro?.disconnect());
</script>

<style scoped>
@reference "tailwindcss";

.input-grid-compact {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.side-tab {
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
  @apply bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-r-0;
  transition: background 0.15s;
}

@media (min-width: 1024px) {
  .side-tab {
    display: flex;
  }
}

.side-tab:hover,
.side-tab.active {
  @apply bg-gray-100 dark:bg-gray-700;
}

.output-tab-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 11px;
  font-weight: 500;
  @apply text-gray-600 dark:text-gray-400;
  letter-spacing: 0.5px;
}

.output-tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.nodecg-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 28rem;
  max-width: 80%;
  max-height: 100%;
  overflow-y: auto;
  z-index: 50;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  @apply bg-gray-800 border border-gray-700;
}
</style>
