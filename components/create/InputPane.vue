<template>
  <Button
    label="Add Input"
    class="p-button-rounded p-button-text text-xs"
    icon="pi pi-plus-circle"
    v-if="addInput"
    @click="isOpen = true"
  />
  <Dialog v-model:visible="isOpen" :modal="true" class="input-pane-dialog">
    <template #header>
      <h3 class="text-lg font-semibold">Add Input</h3>
    </template>
    <Tabs :value="activeTabIndex" @tab-change="onTabChange" class="input-tabs">
      <TabList>
        <Tab v-for="(item, index) in types" :key="item.label" :value="index">
          {{ item.fields['type'].label }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="(item, index) in types" :key="item.label" :value="index">
        <div class="p-2 bg-gray-100 rounded-lg">
          <h2 class="text-base font-bold mb-1">{{ item.fields['type'].label }}</h2>
          <p class="text-xs italic mb-2">{{ item.fields['type'].description }}</p>
          <form @submit.prevent="submitCreateInput(item.label)" class="space-y-2">
            <div v-for="field in item.fields" :key="field.name">
              <div v-if="field.name !== 'type' && field.hidden !== true" class="mb-2">
                <label :for="field.name" class="block font-bold text-sm mb-1">{{ field.label }}</label>
                <InputText
                  v-if="field.type === 'string'"
                  v-model="formData[item.label][field.name]"
                  :id="field.name"
                  :aria-describedby="`${field.name}-description`"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  class="w-full text-sm"
                />
                <InputNumber
                  v-if="field.type === 'integer' || field.type === 'number'"
                  v-model="formData[item.label][field.name]"
                  :id="field.name"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  class="w-full text-sm"
                />
                <Checkbox
                  v-if="field.type === 'boolean'"
                  v-model="formData[item.label][field.name]"
                  :id="field.name"
                  :binary="true"
                />
                <small :id="`${field.name}-description`" class="block mt-1 text-xs text-gray-500 italic">{{ field.description }}</small>

                <!-- Show proxies if configured. -->
                <div class="mt-1">
                  <div v-for="(proxy, proxyType) in proxyTypes" :key="proxyType" class="mb-1">
                    <div v-if="item.key === proxy.type && field.name === proxy.field" class="flex items-center space-x-1">
                      <div v-if="proxyItems[proxyType] && proxyItems[proxyType].length > 0" class="flex-grow">
                        <Select
                          v-model="formData[item.label][field.name]"
                          :options="proxyItems[proxyType]"
                          optionLabel="name"
                          optionValue="url"
                          placeholder="Select Stream"
                          @change="(e) => handleProxyNameChange(item.label, proxy.field, proxyType, e.value)"
                          class="text-xs w-full"
                        />
                      </div>
                      <Button icon="pi pi-refresh" @click="fetchItems(proxyType)" class="p-button-outlined p-button-sm" />
                      <span class="text-xs text-gray-600">{{ proxyType }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr class="my-2" />

            <!-- Generic Fields -->
            <div class="space-y-2">
              <div>
                <label class="block font-bold text-sm mb-1">Volume</label>
                <Slider v-model="formData[item.label]['volume']" :min="0" :max="1" :step="0.05" class="w-full" />
                <span class="text-xs text-gray-600">Volume: {{ Math.round(formData[item.label].volume * 100) }}%</span>
              </div>

              <div>
                <label class="block font-bold text-sm mb-1">Resolution</label>
                <Select
                  v-model="selectedResolution"
                  :options="resolutionOptions"
                  optionLabel="label"
                  optionValue="key"
                  placeholder="Select Resolution"
                  class="w-full text-sm"
                />
              </div>

              <div>
                <label class="block font-bold text-sm mb-1">Name</label>
                <InputText
                  v-model="formData[item.label]['name']"
                  placeholder="Give a name. Default Output X"
                  class="w-full text-sm"
                />
              </div>

              <div>
                <label class="block font-bold text-sm mb-1">Scene</label>
                <Select
                  v-model="selectedScene.uid"
                  :options="sceneMixers"
                  optionLabel="name"
                  optionValue="uid"
                  placeholder="Add Input to Scene"
                  showClear
                  class="w-full text-sm mb-1"
                />
                <div v-if="selectedScene.uid" class="mt-1">
                  <Select
                    v-model="selectedScene.slot"
                    :options="currentSources"
                    optionLabel="name"
                    optionValue="index"
                    placeholder="Select a Slot"
                    class="w-full text-sm mb-1"
                  />
                  <div v-if="selectedScene.slot !== null" class="flex items-center mt-1">
                    <Checkbox v-model="selectedSceneProgram" binary class="mr-1" />
                    <label class="text-sm">Set Program</label>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-2 mt-4">
              <Button type="button" label="Cancel" class="p-button-outlined p-button-sm" @click="isOpen = false" />
              <Button type="submit" label="Create Input" class="p-button-primary p-button-sm" />
            </div>
          </form>
        </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Dialog>
</template>

<script setup>

const {
  isOpen,
  isLoading,
  fetchError,
  formData,
  availSrc,
  types,
  resolutionOptions,
  selectedResolution,
  activeTabIndex,
  onTabChange,
  selectedSceneProgram,
  proxyItems,
  selectedScene,
  currentSources,
  submitCreateInput,
  handleProxyNameChange,
  fetchItems,
  addInput,
  proxyTypes,
  sceneMixers,
} = useCreateInput();
</script>

<style scoped>
</style>
