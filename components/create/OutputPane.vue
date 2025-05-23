<template>
  <Button
    label="Add Output"
    class="p-button-rounded p-button-text text-xs"
    icon="pi pi-plus-circle"
    v-if="addOutput || isUnlocked"
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

                    <div v-if="!isEncoderField(field.name)" class="encoder-field mb-4">

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

                <!-- Encoder Fields -->
                <Fieldset legend="Encoder Options" v-if="hasEncoderFields(item)">
                  <div v-for="field in item.fields" :key="field.name">
                    <div v-if="isEncoderField(field.name)" class="encoder-field mb-4">

                    <div class="flex items-center space-x-4 mb-2">
                      <label :for="field.name" class="font-bold text-sm whitespace-nowrap w-1/4">
                        {{
                          field.name === 'video_encoder' ? 'Video' :
                          field.name === 'audio_encoder' ? 'Audio' :
                          field.name === 'mux' ? 'Mux' :
                          field.label
                        }}
                      </label>
                      <div class="relative w-2/3">
                        <Select
                          :model-value="getEncoderValue(item.key, field.name, 'name')"
                          @update:model-value="(value) => updateEncoderField(item.key, field.name, value)"
                          :options="getEncoderOptions(field)"
                          optionLabel="name"
                          optionValue="name"
                          :placeholder="`Select ${field.label}`"
                          class="w-full text-sm"
                        />
                      </div>
                      <Button
                        icon="pi pi-cog"
                        severity="secondary"
                        rounded
                        text
                        @click="toggleEncoderFields(field.name)"
                        class="flex-shrink-0"
                      />
                    </div>
                    <div v-if="isEncoderFieldsVisible(field.name)" class="encoder-subfields mt-2 ml-4">
                      <div v-if="getSelectedEncoder(item.key, field.name)">
                        <div v-for="(encfield, index) in getSelectedEncoder(item.key, field.name).fields" :key="index" class="mb-2">
                          <template v-if="!encfield.hidden && encfield.name !== 'element' && encfield.name !== 'name' && encfield.name !== 'type'">
                            <label :for="`${field.name}_${encfield.name}`" class="block font-bold text-sm mb-1">{{ encfield.label }}</label>
                            <InputText
                              v-if="encfield.type === 'string'"
                              :model-value="getEncoderValue(item.key, field.name, encfield.name)"
                              @update:model-value="(value) => setEncoderValue(item.key, field.name, encfield.name, value)"
                              :id="`${field.name}_${encfield.name}`"
                              :placeholder="encfield.default"
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
                            <small id="encoderfield-help" class="text-gray-500">{{ encfield.description }}</small>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fieldset>

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
  getEncoderOptions,
  updateEncoderField,
  getSelectedEncoder,
  getEncoderValue,
  setEncoderValue,
  initializeForm,
  toggleEncoderFields,
  isEncoderFieldsVisible,
  hasEncoderFields
} = useCreateOutput();


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
