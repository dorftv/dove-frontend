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
                   <div v-if="isEncoderField(field.name)">
    <Panel header="Header" toggleable collapsed>
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold">{{ field.label }}</span>
        </div>
      </template>
      <template #icons>
        <Button icon="pi pi-cog" severity="secondary" rounded text/>
      </template>
      <div class="flex items-center space-x-2">
        <label :for="field.name" class="font-bold text-sm whitespace-nowrap">{{ field.label }}</label>
        <Select
          :model-value="getEncoderValue(item.key, field.name, 'name')"
          @update:model-value="(value) => setEncoderValue(item.key, field.name, 'name', value)"
          :options="getEncoderOptions(field)"
          optionLabel="name"
          optionValue="name"
          :placeholder="`Select ${field.label}`"
          class="flex-grow text-sm"
          @change="updateEncoderOptions(item.key, field.name)"
        />
      </div>
      <div v-if="formData[item.key][field.name]" class="mt-2">
        <div v-for="(encfield, index) in (formData[item.key][field.name].fields || {})" :key="index" class="ml-2">
          <template v-if="!encfield.hidden && encfield.name !=='element' && encfield.name !=='name' && encfield.name !=='type'">
            <label :for="`${field.name}_${encfield.name}`" class="block font-bold text-sm mt-2">{{ encfield.label }}</label>
            <InputText
              v-if="encfield.type === 'string'"
              :model-value="getEncoderValue(item.key, field.name, encfield.name)"
              @update:model-value="(value) => setEncoderValue(item.key, field.name, encfield.name, value)"
              :id="`${field.name}_${encfield.name}`"
              :placeholder="encfield.placeholder"
              :required="encfield.required"
              class="w-full text-sm"
            />
            <InputNumber
              v-if="encfield.type === 'integer'"
              :model-value="getEncoderValue(item.key, field.name, encfield.name)"
              @update:model-value="(value) => setEncoderValue(item.key, field.name, encfield.name, value)"
              :id="`${field.name}_${encfield.name}`"
              :placeholder="encfield.placeholder"
              :required="encfield.required"
              class="w-full text-sm"
            />
            <Checkbox
              v-if="encfield.type === 'boolean'"
              :model-value="getEncoderValue(item.key, field.name, encfield.name)"
              @update:model-value="(value) => setEncoderValue(item.key, field.name, encfield.name, value)"
              :id="`${field.name}_${encfield.name}`"
              :binary="true"
            />
            <small id="encoderfield-help">{{ encfield.description }}</small>
          </template>
        </div>
      </div>
    </Panel>
  </div>
                  <div v-else>
                    <label :for="field.name" class="block font-bold text-sm mt-2">{{ field.label }}</label>
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
                    <small id="outputfield-help">{{ field.description }}</small>
                  </div>
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


const {
  isOpen,
  isLoading,
  fetchError,
  formData,
  availSrc,
  types,
  resolutionOptions,
  selectedResolution,
  submitCreate,
  activeTabIndex,
  onTabChange,
  addOutput,
  isEncoderField,
  getSelectedEncoder,
  updateEncoderOptions,
  getEncoderOptions,
  getEncoderValue,
  setEncoderValue,

} = useCreateOutput();

onMounted(() => {
  // This will ensure that encoder fields are properly initialized after the component is mounted
  types.value.forEach((type) => {
    type.fields.forEach((field) => {
      if (isEncoderField(field.name)) {
        updateEncoderOptions(type.key, field.name);
      }
    });
  });
});

</script>

<style scoped>
.output-pane-dialog {
  width: 90%;
  max-width: 800px;
}

.output-tabs :deep(.p-tabview-nav) {
  justify-content: center;
}

@media (max-width: 640px) {
  .output-pane-dialog {
    width: 95%;
  }
}
</style>
