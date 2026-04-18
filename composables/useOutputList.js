export function useOutputList() {
  const { outputs, encoders, resolveEntity } = useEntities();
  const activeTab = ref('outputs');
  const showPreview = ref(false);

  const filteredOutputs = computed(() =>
    showPreview.value ? outputs.value : outputs.value.filter(o => !o.is_preview)
  );

  const filteredEncoders = computed(() =>
    showPreview.value ? encoders.value : encoders.value.filter(e => !e.is_preview)
  );

  const outputGroups = computed(() => {
    const groups = {};
    for (const item of filteredOutputs.value) {
      const src = item.src || 'unknown';
      if (!groups[src]) {
        groups[src] = { src, name: resolveEntity(src)?.name || src, outputs: [] };
      }
      groups[src].outputs.push(item);
    }
    return Object.values(groups);
  });

  const encoderGroups = computed(() => {
    const groups = {};
    for (const item of filteredEncoders.value) {
      const src = item.src || 'unknown';
      if (!groups[src]) {
        groups[src] = { src, name: resolveEntity(src)?.name || src, encoders: [] };
      }
      groups[src].encoders.push(item);
    }
    const result = Object.values(groups);
    for (const group of result) {
      group.encoders.sort((a, b) => (a.type === 'video' ? -1 : 1) - (b.type === 'video' ? -1 : 1));
    }
    return result;
  });

  const tabs = computed(() => [
    { key: 'outputs', label: 'Outputs', count: filteredOutputs.value.length },
    { key: 'encoders', label: 'Encoders', count: filteredEncoders.value.length },
  ]);

  return {
    activeTab,
    showPreview,
    filteredOutputs,
    filteredEncoders,
    outputGroups,
    encoderGroups,
    tabs,
  };
}
