<template>
  <div class="grid grid-cols-12 gap-2">
    <div class="col-span-8">
      <CreateInputPane />
    </div>
    <div class="col-span-4 flex items-center justify-end">
      <Button
        v-if="inputsNodeCG.length > 0 && inputsNoPreview.length > 0"
        class="p-1 text-xs"
        @click="toggleNodeCG"
      >
        {{ showNodeCG ? 'show Inputs with no preview' : 'show NodeCG Panels' }}
      </Button>
    </div>

    <div :class="[
      inputsNodeCG.length > 0 || inputsNoPreview.length > 0 ? 'col-span-8' : 'col-span-12',
    ]">
      <div class="grid grid-cols-4 gap-2">
        <div v-for="input in inputsPreview" :key="input.uid" class="px-2">
          <InputHeader
            :input="input"
            :inputEnabled="isInputEnabled(input.uid)"
            @enablePreview="toggleInputEnabled(input.uid)"
          />
          <VideoPlayer
            muted="true"
            v-if="shouldShowPreview(input.uid) && input.preview"
            :uid="input.uid"
          />
          <InputControls :input="input" :state="input.state" :uid="input.uid" />
          <InputScenes :input="input" />
        </div>
      </div>
    </div>

    <div v-if="inputsNodeCG.length > 0 || inputsNoPreview.length > 0"
         class="col-span-4">
      <div v-if="inputsNodeCG.length > 0 && showNodeCG">
        <InputNodeCG />
      </div>
      <div v-else class="grid grid-cols-2 gap-2">
        <div v-for="input in inputsNoPreview" :key="input.uid" class="px-2">
          <InputHeader :input="input" />
          <InputControls :state="input.state" :uid="input.uid" :input="input" />
          <InputScenes :input="input" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>


const { inputs, inputsPreview, inputsNoPreview, inputsNodeCG } = useEntities();
const {
  inputPreview,
  isInputEnabled,
  toggleInputEnabled,
  shouldShowPreview
} = usePreviewEnabled();

const showNodeCG = ref(true);

const toggleNodeCG = () => {
  showNodeCG.value = !showNodeCG.value;
};
// Watcher for inputsNoPreview
watch(inputsNoPreview, (newVal) => {
  if (newVal.length === 0) {
    showNodeCG.value = true;
  }
  console.log('Watch triggered for inputsNoPreview:', newVal.length, 'showNodeCG:', showNodeCG.value);
});

</script>

<style scoped>
/* Add any scoped styles here if needed */
</style>
