import { useLocalStorage } from '@vueuse/core';

/**
 * Persist and apply a custom display order for entities (scenes, inputs).
 * Order is stored in localStorage per browser — not sent to backend.
 *
 * @param {string} storageKey - localStorage key (e.g. 'dove-scene-order')
 * @param {Ref<Array>} entities - reactive array of entities with `uid` field
 * @returns {{ ordered, saveOrder }}
 */
export function useEntityOrder(storageKey, entities) {
  const savedOrder = useLocalStorage(storageKey, []);

  const ordered = computed(() => {
    const items = [...toValue(entities)];
    const order = savedOrder.value;
    if (!order.length) return items;
    return items.sort((a, b) => {
      const indexA = order.indexOf(a.uid);
      const indexB = order.indexOf(b.uid);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return 1;
      return indexA - indexB;
    });
  });

  const saveOrder = (reorderedItems) => {
    savedOrder.value = reorderedItems.map(item => item.uid);
  };

  /** Resolve visual index to entity (for keyboard shortcuts) */
  const getByVisualIndex = (visualIndex) => {
    return ordered.value[visualIndex] ?? null;
  };

  return { ordered, saveOrder, getByVisualIndex };
}
