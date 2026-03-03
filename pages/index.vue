<template>
  <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500">
    <Icon name="ph:spinner" size="32px" class="animate-spin" />
    <span class="mt-2 text-sm">Loading...</span>
  </div>

  <div v-else class="grid grid-cols-12 gap-4 px-4 py-4">
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <SceneMain />
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-2">
      <ProgramSwitch />
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-4" ref="programRef">
      <ProgramMain />
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-2 self-start" :style="rowHeight ? { height: rowHeight + 'px' } : {}">
      <OutputMain />
    </div>

    <div class="col-span-12">
      <InputMain />
    </div>
  </div>
</template>

<script setup>
const { isLoading } = useEntities();
useKeyboardShortcuts();

const programRef = ref(null);
const rowHeight = ref(0);

let ro;
watch(programRef, (el) => {
  ro?.disconnect();
  if (el) {
    ro = new ResizeObserver(() => {
      rowHeight.value = el.offsetHeight || 0;
    });
    ro.observe(el);
  }
});
onUnmounted(() => ro?.disconnect());
</script>
