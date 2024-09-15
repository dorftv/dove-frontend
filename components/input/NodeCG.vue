<template>
<div v-for="input in inputsNodecg" :key="input.uid" class="col-span-2 px-4">
      <div class="iframe-container">
    <iframe
      :src="`${input.nodecg_baseurl}/${input.panels}?standalone=true`"
      width="100%"
      height="400"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</div>

</template>

<script setup>

const { inputsNodecg } = useEntities();


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

<style>

</style>