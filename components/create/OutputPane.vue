<template>
  <Button
    label="Add Output"
    class="p-button-rounded p-button-text text-xs"
    icon="pi pi-plus-circle"
    v-if="addOutput"
    @click="isOpen = true"
  />
  <Dialog v-model:visible="isOpen" :modal="true" class="output-pane-dialog">
    <template #header>
      <h3 class="text-lg font-semibold">Add Output</h3>
    </template>
    <Tabs :value="activeTabIndex" @tab-change="onTabChange" class="output-tabs">
      <TabList>
        <Tab v-for="(item, index) in types" :key="item.key" :value="index">
          {{ item.label }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="(item, index) in types" :key="item.key" :value="index">
          <div class="p-2 bg-gray-100 rounded-lg">
            <h2 class="text-base font-bold mb-1">{{ item.label }}</h2>
            <form @submit.prevent="submitCreate(item.key)" class="space-y-2">
              <div v-for="field in item.fields" :key="field.name">
                <div v-if="field.name !== 'type'" class="mb-2">
                  <label :for="field.name" class="block font-bold text-sm mb-1">{{ field.label }}</label>
                  <InputText
                    v-if="field.type === 'string'"
                    v-model="formData[item.key][field.name]"
                    :id="field.name"
                    :placeholder="field.placeholder"
                    :required="field.required"
                    class="w-full text-sm"
                  />
                  <InputNumber
                    v-if="field.type === 'integer'"
                    v-model="formData[item.key][field.name]"
                    :id="field.name"
                    :placeholder="field.placeholder"
                    :required="field.required"
                    class="w-full text-sm"
                  />
                  <Checkbox
                    v-if="field.type === 'boolean'"
                    v-model="formData[item.key][field.name]"
                    :id="field.name"
                    :binary="true"
                  />
                </div>
              </div>

              <hr class="my-2" />
              <!-- Generic Fields -->
              <div class="space-y-2">
                <div>
                  <label class="block font-bold text-sm mb-1">Source</label>
                  <Select
                    v-model="formData[item.key]['src']"
                    :options="availSrc"
                    optionLabel="name"
                    optionValue="value"
                    placeholder="Select Source"
                    required
                    class="w-full text-sm"
                  />
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
                    v-model="formData[item.key]['name']"
                    placeholder="Give a name. Default Output X"
                    class="w-full text-sm"
                  />
                </div>
              </div>

              <div class="flex justify-end space-x-2 mt-4">
                <Button type="button" label="Cancel" class="p-button-outlined p-button-sm" @click="isOpen = false" />
                <Button type="submit" label="Create Output" class="p-button-primary p-button-sm" />
              </div>
            </form>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Dialog>
</template>

<script setup>

const entityType = 'outputs';
const {
  isOpen,
  isLoading,
  fetchError,
  types,
  formData,
  availSrc,
  submitCreate,
  selectedResolution,
  resolutionOptions,
  activeTabIndex,
  onTabChange,
  addOutput,
} = useCreateEntity(entityType);
</script>

<style scoped>
</style>
