<template>
  <div ref="container">
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab v-for="(input, index) in inputsNodeCG" :key="input.uid" :value="index">
          {{ input.name }}
          {{ index }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="(input, index) in inputsNodeCG" :key="input.uid" :value="index">
          <div class="iframe-container">
            <iframe
              :src="`${input.nodecg_baseurl}/${input.panels}?standalone=true`"
              width="100%"
              height="600px"
              :style="{ height: iframeHeight }"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>

const { inputsNodeCG } = useEntities();
const container = ref(null);
const iframeHeight = ref('600px');
const activeTab = ref(0);  // PrimeVue uses integer index for active tab

const adjustHeight = () => {
  if (container.value) {
    const windowHeight = window.innerHeight;
    const containerTop = container.value.getBoundingClientRect().top;
    const newHeight = windowHeight - containerTop - 20;
    iframeHeight.value = `${newHeight}px`;
  }
};

const initializeHeight = () => {
  nextTick(() => {
    adjustHeight();
  });
};

onMounted(() => {
  initializeHeight();
  adjustHeight();
  window.addEventListener('resize', adjustHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', adjustHeight);
});

watch(activeTab, () => {
  initializeHeight();
});
</script>

<style>
.iframe-container {
  position: relative;
  width: 100%;
  height: '600px';
}
</style>
