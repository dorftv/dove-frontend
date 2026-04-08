/**
 * Shared filter options + header label computation.
 * Used by AudioFilters.vue and VideoFilters.vue.
 */
export function useFilterOpts(props) {
  const filterOpts = computed(() => {
    if (props.input) return { input: () => props.input };
    if (props.mixer && props.slotIndex !== undefined)
      return { mixer: () => props.mixer, slotIndex: () => props.slotIndex };
    if (props.mixer) return { mixer: () => props.mixer };
    if (props.encoder) return { encoder: () => props.encoder };
    return { input: () => null };
  });

  const headerLabel = computed(() => {
    if (props.input) return props.input.name;
    if (props.mixer && props.slotIndex !== undefined) {
      const source = props.mixer.sources?.find(s => s.index === props.slotIndex);
      return `${props.mixer.name} / ${source?.name || `Slot ${props.slotIndex + 1}`}`;
    }
    if (props.mixer) return props.mixer.name;
    if (props.encoder) return props.encoder.name || 'Encoder';
    return '';
  });

  return { filterOpts, headerLabel };
}
