<template>
  <div ref="container">
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab v-for="(input, index) in inputsNodeCG" :key="input.uid" :value="index">
          {{ input.name }}
          {{ input.index }}
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
const {     inputsNodeCG,    container,    iframeHeight,    activeTab,    adjustHeight, } = useNodeCG();


</script>

<style>
.iframe-container {
  position: relative;
  width: 100%;
  height: '600px';
}
</style>
