<template>
  <div>
    <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden p-2">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <CreateInputPane />
        </div>
      </div>
      <div class="input-grid gap-3">
        <div v-for="input in inputsPreview" :key="input.uid" class="flex flex-col rounded-lg overflow-hidden">
          <InputHeader
            :input="input"
            :inputEnabled="isInputEnabled(input.uid)"
            @enablePreview="toggleInputEnabled(input.uid)"
          />
          <div v-if="shouldShowPreview(input.uid) && input.preview" class="flex">
            <VideoPlayerMain :uid="input.uid" class="flex-grow min-w-0" />
            <AudioMeter v-if="audioMeters" :uid="input.uid" />
          </div>
          <InputControls :input="input" :state="input.state" :uid="input.uid" />
          <InputScenes :input="input" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { inputsPreview } = useEntities();
const {
  isInputEnabled,
  toggleInputEnabled,
  shouldShowPreview
} = usePreviewEnabled();

const { audioMeters } = useUserState();
</script>

<style scoped>
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

@media (min-width: 1024px) {
  .input-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
