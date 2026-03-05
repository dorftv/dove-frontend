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

  const groupBySrc = (items, key) => {
    const groups = {};
    for (const item of items) {
      const src = item.src || 'unknown';
      if (!groups[src]) {
        groups[src] = { src, name: resolveEntity(src)?.name || src, [key]: [] };
      }
      groups[src][key].push(item);
    }
    return Object.values(groups);
  };

  const outputGroups = computed(() => groupBySrc(filteredOutputs.value, 'outputs'));

  const encoderGroups = computed(() => {
    const groups = groupBySrc(filteredEncoders.value, 'encoders');
    for (const group of groups) {
      group.encoders.sort((a, b) => (a.type === 'video' ? -1 : 1) - (b.type === 'video' ? -1 : 1));
    }
    return groups;
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
