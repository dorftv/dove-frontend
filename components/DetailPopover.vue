<template>
  <UPopover :content="{ collisionPadding: 8 }">
    <button class="icon-btn" title="Details" aria-label="Show details">
      <Icon name="ph:info" size="11px" />
    </button>
    <template #content>
      <pre class="text-xs text-gray-700 dark:text-gray-300 p-3 max-w-lg max-h-[min(60vh,400px)] overflow-auto">{{ details }}</pre>
    </template>
  </UPopover>
</template>

<script setup>
const props = defineProps({
  entity: Object,
});

const { enrichEntity } = useEntities();
const details = computed(() => JSON.stringify(enrichEntity(props.entity), null, 2));
</script>
