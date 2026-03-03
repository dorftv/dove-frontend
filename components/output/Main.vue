<template>
  <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-2 h-full flex flex-col">
    <div class="flex items-center gap-1 mb-2 text-xs">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        class="flex-1 px-2 py-1 rounded transition-colors text-center"
        :class="activeTab === tab.key
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
      >
        {{ tab.label }}
        <span class="ml-1 text-[10px] opacity-60">{{ tab.count }}</span>
      </button>
      <label class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 cursor-pointer select-none shrink-0 pl-1">
        <input type="checkbox" v-model="showPreview" class="rounded border-gray-300 dark:border-gray-600 w-3 h-3" />
        preview
      </label>
    </div>

    <div class="overflow-y-auto min-h-0 flex-1">
      <template v-if="activeTab === 'outputs'">
        <CreateOutputPane />
        <Output v-for="output in filteredOutputs" :key="output.uid" :output="output" />
      </template>

      <template v-else>
        <div v-for="group in encoderGroups" :key="group.src" class="mb-3">
          <div class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-1">
            {{ group.name }}
          </div>
          <OutputEncoder v-for="encoder in group.encoders" :key="encoder.uid" :encoder="encoder" />
        </div>
        <div v-if="filteredEncoders.length === 0" class="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
          No encoders
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const { outputs, encoders, resolveEntity } = useEntities();
const activeTab = ref('outputs');
const showPreview = ref(false);

const filteredOutputs = computed(() =>
  showPreview.value ? outputs.value : outputs.value.filter(o => !o.is_preview)
);

const filteredEncoders = computed(() =>
  showPreview.value ? encoders.value : encoders.value.filter(e => !e.is_preview)
);

const encoderGroups = computed(() => {
  const groups = {};
  for (const encoder of filteredEncoders.value) {
    const src = encoder.src || 'unknown';
    if (!groups[src]) {
      groups[src] = { src, name: resolveEntity(src)?.name || src, encoders: [] };
    }
    groups[src].encoders.push(encoder);
  }
  for (const group of Object.values(groups)) {
    group.encoders.sort((a, b) => (a.type === 'video' ? -1 : 1) - (b.type === 'video' ? -1 : 1));
  }
  return Object.values(groups);
});

const tabs = computed(() => [
  { key: 'outputs', label: 'Outputs', count: filteredOutputs.value.length },
  { key: 'encoders', label: 'Encoders', count: filteredEncoders.value.length },
]);
</script>
