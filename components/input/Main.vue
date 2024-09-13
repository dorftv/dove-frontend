<template>
  <div class="col-span-12 p-2">Inputs <CreateInputPane /></div>

<div v-for="input in inputsPreview" :key="input.uid" class="col-span-2 px-4">
      <InputHeader :input="input" />
      <VideoPlayer muted="true"  v-if="(inputPreview || inputEnabled) && input.preview" :uid="input.uid" />
      <InputControls :state="input.state" :uid="input.uid"  :input="input" :inputEnabled="inputEnabled" @enablePreview="(preview) => inputEnabled = preview" />
      <InputScenes :input="input" />
</div>

<div v-for="input in inputsNoPreview" :key="input.uid" class="col-span-2 px-4">
      <InputHeader :input="input" />
      <InputControls :state="input.state" :uid="input.uid"  :input="input" :inputEnabled="inputEnabled" @enablePreview="(preview) => inputEnabled = preview" />
      <InputScenes :input="input" />
</div>

<div v-for="input in inputsNodecg" :key="input.uid" class="col-span-2 px-4">
      <div class="iframe-container">
    <iframe
      :src="`${input.nodecg_baseurl}/${input.panels}`"
      width="100%"
      height="1500"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</div>

</template>

<script setup>


const { inputs, inputsPreview, inputsNoPreview, inputsNodecg } = useEntities();

const { inputPreview } = useUserState()
const inputEnabled = ref(false)


const container = ref(null);
const iframeHeight = ref('600px'); // Start with a larger default height

const adjustHeight = () => {
  if (container.value) {
    const windowHeight = window.innerHeight;
    const containerTop = container.value.getBoundingClientRect().top;
    const newHeight = windowHeight - containerTop - 20; // 20px for some bottom margin
    iframeHeight.value = `${newHeight}px`;
  }
};

onMounted(() => {
  adjustHeight();
  window.addEventListener('resize', adjustHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', adjustHeight);
});
</script>

<style scoped>
.iframe-container {
  width: 100%;
  height: 100%; /* Take full height of parent */
}

.iframe-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>