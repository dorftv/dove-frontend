<template>
  <FilterSlideover
    v-model:open="open"
    title="Video Filters"
    icon="ph:camera"
    accentClass="text-violet-400/80"
    iconColorClass="text-violet-400"
    :headerLabel="headerLabel"
    :ctx="ctx"
  />
</template>

<script setup>
const props = defineProps({
  input: Object,
  mixer: Object,
  slotIndex: { type: Number, default: undefined },
  ctx: { type: Object, default: null },
});

const open = defineModel('open', { type: Boolean, default: false });

const { filterOpts, headerLabel } = useFilterOpts(props);
const ctx = props.ctx || useVideoFilters(filterOpts.value);
</script>
