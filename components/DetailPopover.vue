<template>
  <Popover ref="op" appendTo="body">
    <pre class="text-xs text-gray-700 dark:text-gray-300">{{ details }}</pre>
  </Popover>
  <button @click="op.toggle($event)" class="icon-btn" title="Details" aria-label="Show details">
    <i class="pi pi-info-circle text-[11px]"></i>
  </button>
</template>

<script setup>
const props = defineProps({
  entity: Object,
});

const { enrichEntity } = useEntities();
const op = ref();
const details = computed(() => JSON.stringify(enrichEntity(props.entity), null, 2));
</script>
