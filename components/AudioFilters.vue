<template>
  <FilterSlideover
    v-model:open="open"
    title="Audio Filters"
    icon="ph:waveform"
    accentClass="text-cyan-400/80"
    iconColorClass="text-cyan-400"
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
const ctx = props.ctx || useAudioFilters(filterOpts.value);
</script>
