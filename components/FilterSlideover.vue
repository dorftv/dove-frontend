<template>
  <USlideover v-model:open="open" side="right" :overlay="false" :title="headerLabel ? `${title} — ${headerLabel}` : title" :description="title" :ui="{ description: 'sr-only' }">
    <template #body>
      <FilterPanel
        ref="panelRef"
        :ctx="ctx"
        :icon="icon"
        :accent-class="accentClass"
        :auto-init="false"
      />
    </template>
  </USlideover>
</template>

<script setup>
const props = defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  accentClass: { type: String, default: 'text-cyan-400/80' },
  iconColorClass: { type: String, default: 'text-cyan-400' },
  headerLabel: { type: String, default: '' },
  ctx: { type: Object, required: true },
});

const open = defineModel('open', { type: Boolean, default: false });
const panelRef = ref(null);

// Init SortableJS each time the slideover opens (DOM is recreated by USlideover)
watch(open, (isOpen) => {
  if (isOpen) nextTick(() => panelRef.value?.initSortable?.());
});
</script>
