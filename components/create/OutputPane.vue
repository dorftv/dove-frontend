<template>
  <Button
    label="Add Output"
    class="p-button-text text-xs"
    icon="pi pi-plus-circle"
    v-if="addOutput || isUnlocked"
    @click="toggle"
  />
  <Popover ref="op" appendTo="body" @hide="isOpen = false">
    <div class="p-3 w-[32rem] max-w-[calc(100vw-1rem)] max-h-[80vh] overflow-y-auto">
      <div class="text-sm font-medium mb-2">Add Output</div>

      <SelectButton
        v-model="activeTabIndex"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        :allowEmpty="false"
        class="hidden sm:inline-flex flex-wrap text-xs mb-3"
      />
      <Select
        v-model="activeTabIndex"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        class="sm:hidden w-full text-sm mb-3"
      />

      <template v-if="selectedType && formData[selectedType.key]">
        <form @submit.prevent="submitCreate(selectedType.key)" class="space-y-2">
          <div v-for="field in selectedType.fields" :key="field.name">
            <div v-if="field.name !== 'type'" class="mb-2">
              <div v-if="!isEncoderField(field.name)" class="encoder-field mb-4">
                <label :for="field.name" class="block font-bold text-sm mt-2 text-gray-700 dark:text-gray-300">{{ field.label }}</label>
                <InputText
                  v-if="field.type === 'string'"
                  v-model="formData[selectedType.key][field.name]"
                  :id="field.name"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  class="w-full text-sm"
                />
                <InputNumber
                  v-if="field.type === 'integer'"
                  v-model="formData[selectedType.key][field.name]"
                  :id="field.name"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  class="w-full text-sm"
                />
                <Checkbox
                  v-if="field.type === 'boolean'"
                  v-model="formData[selectedType.key][field.name]"
                  :id="field.name"
                  :binary="true"
                />
                <small class="text-xs text-gray-500 dark:text-gray-400">{{ field.description }}</small>
              </div>
            </div>
          </div>

          <Fieldset legend="Encoder Options" v-if="hasEncoderFields(selectedType)">
            <div v-for="field in selectedType.fields" :key="`enc_${field.name}`">
              <!-- Video / Audio encoder (entity-based) -->
              <div v-if="field.name === 'video_encoder' || field.name === 'audio_encoder'" class="encoder-field mb-4">
                <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">
                  {{ field.name === 'video_encoder' ? 'Video Encoder' : 'Audio Encoder' }}
                </label>
                <Select
                  :model-value="formData[selectedType.key][field.name]"
                  @update:model-value="(val) => onEncoderSelect(selectedType.key, field.name, val)"
                  :options="getEncoderSelectOptions(selectedType.key, field.name)"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select encoder (default if empty)"
                  class="w-full text-sm"
                />

                <!-- Inline creation sub-form -->
                <div
                  v-if="formData[selectedType.key][field.name] === '__new__' && formData[selectedType.key][`_new_${field.name}`]"
                  class="mt-2 ml-4 space-y-2 border-l-2 border-gray-200 dark:border-gray-600 pl-3"
                >
                  <div>
                    <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Element</label>
                    <Select
                      :model-value="formData[selectedType.key][`_new_${field.name}`].element"
                      @update:model-value="(val) => onNewEncoderElementChange(selectedType.key, field.name, val)"
                      :options="getCompatibleEncoderTypes(selectedType.key, field.name)"
                      optionLabel="name"
                      optionValue="element"
                      class="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Options</label>
                    <InputText
                      v-model="formData[selectedType.key][`_new_${field.name}`].options"
                      placeholder="Encoder options"
                      class="w-full text-sm"
                    />
                  </div>
                  <div v-if="field.name === 'video_encoder'">
                    <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Profile</label>
                    <InputText
                      v-model="formData[selectedType.key][`_new_${field.name}`].profile"
                      placeholder="e.g. high, main, baseline"
                      class="w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- Mux (inline pattern) -->
              <div v-if="field.name === 'mux'" class="encoder-field mb-4">
                <div class="flex items-center space-x-4 mb-2">
                  <label class="font-bold text-sm whitespace-nowrap w-1/4 text-gray-700 dark:text-gray-300">Mux</label>
                  <div class="relative w-2/3">
                    <Select
                      :model-value="getMuxValue(selectedType.key, 'name')"
                      @update:model-value="(value) => updateMuxField(selectedType.key, value)"
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
                    @click="toggleMuxFields()"
                    class="flex-shrink-0"
                  />
                </div>
                <div v-if="isMuxFieldsVisible()" class="encoder-subfields mt-2 ml-4">
                  <div v-if="getSelectedMux(selectedType.key)">
                    <div v-for="(encfield, idx) in getSelectedMux(selectedType.key).fields" :key="idx" class="mb-2">
                      <template v-if="!encfield.hidden && encfield.name !== 'element' && encfield.name !== 'name' && encfield.name !== 'type'">
                        <label :for="`mux_${encfield.name}`" class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">{{ encfield.label }}</label>
                        <InputText
                          v-if="encfield.type === 'string'"
                          :model-value="getMuxValue(selectedType.key, encfield.name)"
                          @update:model-value="(value) => setMuxValue(selectedType.key, encfield.name, value)"
                          :id="`mux_${encfield.name}`"
                          :placeholder="encfield.default"
                          class="w-full text-sm"
                        />
                        <InputNumber
                          v-if="encfield.type === 'integer'"
                          :model-value="getMuxValue(selectedType.key, encfield.name)"
                          @update:model-value="(value) => setMuxValue(selectedType.key, encfield.name, value)"
                          :id="`mux_${encfield.name}`"
                          :placeholder="encfield.placeholder"
                          class="w-full text-sm"
                        />
                        <small class="text-xs text-gray-500 dark:text-gray-400">{{ encfield.description }}</small>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Fieldset>

          <hr class="my-2 border-gray-200 dark:border-gray-600" />

          <div class="space-y-2">
            <div>
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Source</label>
              <Select
                v-model="formData[selectedType.key]['src']"
                :options="availSrc"
                optionLabel="name"
                optionValue="value"
                placeholder="Select Source"
                required
                class="w-full text-sm"
              />
            </div>
            <div>
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Resolution</label>
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
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
              <InputText
                v-model="formData[selectedType.key]['name']"
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
      </template>
    </div>
  </Popover>
</template>

<script setup>
const { isUnlocked } = useLocked()

const {
  isOpen,
  op,
  toggle,
  formData,
  availSrc,
  types,
  resolutionOptions,
  selectedResolution,
  submitCreate,
  activeTabIndex,
  selectedType,
  addOutput,
  isEncoderField,
  hasEncoderFields,
  getEncoderOptions,
  getEncoderSelectOptions,
  getCompatibleEncoderTypes,
  onEncoderSelect,
  onNewEncoderElementChange,
  toggleMuxFields,
  isMuxFieldsVisible,
  updateMuxField,
  getSelectedMux,
  getMuxValue,
  setMuxValue,
} = useCreateOutput();

const typeOptions = computed(() =>
  types.value.map((item, index) => ({
    label: item.label,
    value: index
  }))
)
</script>
