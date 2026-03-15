<template>
  <div>
    <div v-if="allPanels.length > 1" class="flex gap-1 mb-2 flex-wrap">
      <button
        v-for="(panel, index) in allPanels" :key="panel.key"
        @click="activeTab = index"
        class="px-2 py-0.5 rounded text-xs transition-colors"
        :class="activeTab === index
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
      >
        {{ panel.label }}
      </button>
    </div>
    <iframe
      v-if="allPanels[activeTab]"
      :src="iframeSrc"
      class="w-full border-0 rounded"
      :style="{ height: iframeHeight }"
      allowfullscreen
    />
  </div>
</template>

<script setup>
const { inputsNodeCG } = useEntities();
const { config } = useDoveConfig();
const activeTab = ref(0);

const props = defineProps({
  maxHeight: { type: String, default: null },
});

const iframeHeight = computed(() => props.maxHeight || '300px');

// Flatten all panels across all NodeCG inputs into a single tab list
const allPanels = computed(() => {
  const panels = [];
  for (const input of inputsNodeCG.value) {
    const paths = Array.isArray(input.panels) ? input.panels : [input.panels];
    for (const path of paths) {
      // Derive label from path: "bundles/lower-third/dashboard/index.html" → "lower-third"
      const parts = path.split('/');
      const bundleIdx = parts.indexOf('bundles');
      const label = bundleIdx >= 0 && parts[bundleIdx + 1]
        ? parts[bundleIdx + 1]
        : input.name;
      panels.push({
        key: `${input.uid}-${path}`,
        label,
        path,
        baseurl: input.nodecg_baseurl,
      });
    }
  }
  return panels;
});

const iframeSrc = computed(() => {
  const panel = allPanels.value[activeTab.value];
  if (!panel) return '';
  if (config.value?.proxy?.nodecg?.url) {
    return `/${panel.path}?standalone=true`;
  }
  return `${panel.baseurl}/${panel.path}?standalone=true`;
});
</script>
