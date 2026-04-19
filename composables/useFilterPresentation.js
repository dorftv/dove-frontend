/**
 * Filter presentation helpers — formatting, label lookups, category grouping.
 * Used by both AudioFilters.vue and VideoFilters.vue.
 */
export function useFilterPresentation(FILTER_TYPES, FILTER_CATEGORIES) {
  const EQ10_BANDS = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

  const getFilterLabel = (type) => FILTER_TYPES[type]?.label || type;

  const getCategoryLabel = (type) =>
    FILTER_CATEGORIES[FILTER_TYPES[type]?.category]?.label || '';

  const getFilterParams = (type) => FILTER_TYPES[type]?.params || {};

  const hasParams = (type) => Object.keys(getFilterParams(type)).length > 0;

  const isEq10 = (type) => type === 'eq10';

  const getFiltersForCategory = (catKey) =>
    Object.fromEntries(
      Object.entries(FILTER_TYPES).filter(([, def]) => def.category === catKey)
    );

  const getEq10BandLabel = (type, paramName) => {
    if (type !== 'eq10') return null;
    const match = paramName.match(/^band(\d+)$/);
    if (!match) return null;
    return EQ10_BANDS[parseInt(match[1])] || paramName;
  };

  const getDefaultStep = (spec) => {
    const range = spec.max - spec.min;
    if (range <= 1) return 0.01;
    if (range <= 50) return 1;
    return Math.max(1, Math.round(range / 100));
  };

  const formatValue = (value, spec) => {
    const v = typeof value === 'number' ? value : parseFloat(value) || 0;
    const display = spec.step && spec.step < 1 ? v.toFixed(2) : Math.round(v);
    return spec.unit ? `${display}${spec.unit}` : display;
  };

  return {
    getFilterLabel,
    getCategoryLabel,
    getFilterParams,
    hasParams,
    isEq10,
    getFiltersForCategory,
    getEq10BandLabel,
    getDefaultStep,
    formatValue,
  };
}
