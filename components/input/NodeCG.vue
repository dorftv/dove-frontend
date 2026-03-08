<template>
  <div>
    <div v-if="inputsNodeCG.length > 1" class="flex gap-1 mb-2 flex-wrap">
      <button
        v-for="(input, index) in inputsNodeCG" :key="input.uid"
        @click="activeTab = index"
        class="px-2 py-0.5 rounded text-xs transition-colors"
        :class="activeTab === index
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
      >
        {{ input.name }}
      </button>
    </div>
    <iframe
      v-if="inputsNodeCG[activeTab]"
      :src="`${inputsNodeCG[activeTab].nodecg_baseurl}/${inputsNodeCG[activeTab].panels}?standalone=true`"
      class="w-full border-0 rounded"
      :style="{ height: iframeHeight }"
      allowfullscreen
    />
  </div>
</template>

<script setup>
const { inputsNodeCG } = useEntities();
const activeTab = ref(0);

const props = defineProps({
  maxHeight: { type: String, default: null },
});

const iframeHeight = computed(() => props.maxHeight || '300px');
</script>
