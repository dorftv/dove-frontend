<template>
  <div>
    <UTabs
      v-if="allPanels.length > 1"
      v-model="activeTab"
      :items="allPanels"
      :content="false"
      size="xs"
      class="mb-2"
    />
    <iframe
      v-if="currentPanel"
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
      // Derive label from filename: "bundles/broadcast-graphics/dashboard/lower-third.html" → "lower-third"
      const filename = path.split('/').pop()?.replace(/\.html$/, '');
      const label = filename && filename !== 'index' ? filename : input.name;
      panels.push({
        value: `${input.uid}-${path}`,
        label,
        path,
        baseurl: input.nodecg_baseurl,
      });
    }
  }
  return panels;
});

const activeTab = ref(null);

// Select first tab when panels load, reset if active panel disappears
watchEffect(() => {
  if (allPanels.value.length && !allPanels.value.find(p => p.value === activeTab.value)) {
    activeTab.value = allPanels.value[0].value;
  }
});

const currentPanel = computed(() => allPanels.value.find(p => p.value === activeTab.value));

const iframeSrc = computed(() => {
  if (!currentPanel.value) return '';
  if (config.value?.proxy?.nodecg?.url) {
    return `/${currentPanel.value.path}?standalone=true`;
  }
  return `${currentPanel.value.baseurl}/${currentPanel.value.path}?standalone=true`;
});
</script>
