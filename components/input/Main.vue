<template>
  <div class="space-y-4">
    <!-- Inputs with preview -->
    <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Inputs</h3>
          <CreateInputPane />
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="inputsNoPreview.length > 0"
            @click="showNoPreview = !showNoPreview"
            class="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon :name="showNoPreview ? 'ph:caret-up' : 'ph:caret-down'" size="12px" />
            {{ inputsNoPreview.length }} without preview
          </button>
          <button
            v-if="inputsNodeCG.length > 0"
            @click="showNodeCG = !showNodeCG"
            class="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon :name="showNodeCG ? 'ph:caret-up' : 'ph:caret-down'" size="12px" />
            {{ inputsNodeCG.length }} NodeCG
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        <div v-for="input in inputsPreview" :key="input.uid" class="rounded-lg overflow-hidden">
          <InputHeader
            :input="input"
            :inputEnabled="isInputEnabled(input.uid)"
            @enablePreview="toggleInputEnabled(input.uid)"
          />
          <VideoPlayerMain
            muted="true"
            v-if="shouldShowPreview(input.uid) && input.preview"
            :uid="input.uid"
          />
          <InputControls :input="input" :state="input.state" :uid="input.uid" />
          <InputScenes :input="input" />
        </div>
      </div>
    </div>

    <!-- Inputs without preview (collapsible) -->
    <div v-if="inputsNoPreview.length > 0 && showNoPreview"
         class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-4">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Inputs without preview</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
        <div v-for="input in inputsNoPreview" :key="input.uid" class="rounded-lg overflow-hidden">
          <InputHeader :input="input" />
          <InputControls :state="input.state" :uid="input.uid" :input="input" />
          <InputScenes :input="input" />
        </div>
      </div>
    </div>

    <!-- NodeCG panels (collapsible, full width) -->
    <div v-if="inputsNodeCG.length > 0 && showNodeCG"
         class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden p-4">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">NodeCG Panels</h3>
      <InputNodeCG />
    </div>
  </div>
</template>

<script setup>
const { inputsPreview, inputsNoPreview, inputsNodeCG } = useEntities();
const {
  isInputEnabled,
  toggleInputEnabled,
  shouldShowPreview
} = usePreviewEnabled();

const showNodeCG = ref(true);
const showNoPreview = ref(true);
</script>
