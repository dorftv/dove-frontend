<template>
  <div v-if="canOutputs && (addOutput || canBypassLock)">
    <UButton
      label="Add Output"
      variant="ghost"
      size="xs"
      icon="i-ph-plus-circle"
      @click="isOpen = true"
    />
    <UModal v-model:open="isOpen" title="Add Output" description="Create a new output destination">
      <template #content>
        <div class="p-4 w-full max-w-lg mx-auto">
          <div class="hidden sm:inline-flex flex-wrap mb-3">
            <UButton
              v-for="opt in typeOptions"
              :key="opt.value"
              :label="opt.label"
              :color="activeTabIndex === opt.value ? 'primary' : 'neutral'"
              :variant="activeTabIndex === opt.value ? 'solid' : 'outline'"
              size="xs"
              @click="activeTabIndex = opt.value"
            />
          </div>
          <USelect
            v-model="activeTabIndex"
            :items="typeOptions"
            label-key="label"
            value-key="value"
            class="sm:hidden w-full mb-3"
            size="sm"
          />

          <template v-if="selectedType && formData[selectedType.key]">
            <form @submit.prevent="submitCreate(selectedType.key)" class="space-y-2">
              <div v-for="field in selectedType.fields" :key="field.name">
                <div v-if="field.name !== 'type'" class="mb-2">
                  <div v-if="!isEncoderField(field.name)" class="encoder-field mb-4">
                    <label :for="field.name" class="block font-bold text-sm mt-2 text-gray-700 dark:text-gray-300">{{ field.label }}</label>
                    <USelect
                      v-if="field.enum"
                      v-model="formData[selectedType.key][field.name]"
                      :items="field.enum"
                      :placeholder="field.default"
                      class="w-full"
                      size="sm"
                    />
                    <UInput
                      v-else-if="field.type === 'string'"
                      v-model="formData[selectedType.key][field.name]"
                      :id="field.name"
                      :placeholder="field.placeholder"
                      :required="field.required"
                      class="w-full"
                      size="sm"
                    />
                    <UInput
                      v-if="field.type === 'integer'"
                      v-model="formData[selectedType.key][field.name]"
                      type="number"
                      :id="field.name"
                      :placeholder="field.placeholder"
                      :required="field.required"
                      class="w-full"
                      size="sm"
                    />
                    <UCheckbox
                      v-if="field.type === 'boolean'"
                      v-model="formData[selectedType.key][field.name]"
                      :id="field.name"
                    />
                    <small class="text-xs text-gray-500 dark:text-gray-400">{{ field.description }}</small>
                  </div>
                </div>
              </div>

              <fieldset v-if="hasEncoderFields(selectedType)" class="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <legend class="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">Encoder Options</legend>
                <div v-for="field in selectedType.fields" :key="`enc_${field.name}`">
                  <!-- Video / Audio encoder (entity-based) -->
                  <div v-if="field.name === 'video_encoder' || field.name === 'audio_encoder'" class="encoder-field mb-4">
                    <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">
                      {{ field.name === 'video_encoder' ? 'Video Encoder' : 'Audio Encoder' }}
                    </label>
                    <USelect
                      :model-value="formData[selectedType.key][field.name]"
                      @update:model-value="(val) => onEncoderSelect(selectedType.key, field.name, val)"
                      :items="getEncoderSelectOptions(selectedType.key, field.name)"
                      label-key="label"
                      value-key="value"
                      placeholder="Select encoder (default if empty)"
                      class="w-full"
                      size="sm"
                    />

                    <!-- Inline creation sub-form -->
                    <div
                      v-if="formData[selectedType.key][field.name] === '__new__' && formData[selectedType.key][`_new_${field.name}`]"
                      class="mt-2 ml-4 space-y-2 border-l-2 border-gray-200 dark:border-gray-600 pl-3"
                    >
                      <div>
                        <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Element</label>
                        <USelect
                          :model-value="formData[selectedType.key][`_new_${field.name}`].element"
                          @update:model-value="(val) => onNewEncoderElementChange(selectedType.key, field.name, val)"
                          :items="getCompatibleEncoderTypes(selectedType.key, field.name)"
                          label-key="name"
                          value-key="element"
                          class="w-full"
                          size="sm"
                        />
                      </div>
                      <div>
                        <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Options</label>
                        <UInput
                          v-model="formData[selectedType.key][`_new_${field.name}`].options"
                          placeholder="Encoder options"
                          class="w-full"
                          size="sm"
                        />
                      </div>
                      <div v-if="field.name === 'video_encoder'">
                        <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Profile</label>
                        <UInput
                          v-model="formData[selectedType.key][`_new_${field.name}`].profile"
                          placeholder="e.g. high, main, baseline"
                          class="w-full"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Mux (inline pattern) -->
                  <div v-if="field.name === 'mux'" class="encoder-field mb-4">
                    <div class="flex items-center space-x-4 mb-2">
                      <label class="font-bold text-sm whitespace-nowrap w-1/4 text-gray-700 dark:text-gray-300">Mux</label>
                      <div class="relative w-2/3">
                        <USelect
                          :model-value="getMuxValue(selectedType.key, 'name')"
                          @update:model-value="(value) => updateMuxField(selectedType.key, value)"
                          :items="getEncoderOptions(field)"
                          label-key="name"
                          value-key="name"
                          :placeholder="`Select ${field.label}`"
                          class="w-full"
                          size="sm"
                        />
                      </div>
                      <UButton
                        icon="i-ph-gear"
                        color="neutral"
                        variant="ghost"
                        @click="toggleMuxFields()"
                        class="flex-shrink-0"
                      />
                    </div>
                    <div v-if="isMuxFieldsVisible()" class="encoder-subfields mt-2 ml-4">
                      <div v-if="getSelectedMux(selectedType.key)">
                        <div v-for="(encfield, idx) in getSelectedMux(selectedType.key).fields" :key="idx" class="mb-2">
                          <template v-if="!encfield.hidden && encfield.name !== 'element' && encfield.name !== 'name' && encfield.name !== 'type'">
                            <label :for="`mux_${encfield.name}`" class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">{{ encfield.label }}</label>
                            <UInput
                              v-if="encfield.type === 'string'"
                              :model-value="getMuxValue(selectedType.key, encfield.name)"
                              @update:model-value="(value) => setMuxValue(selectedType.key, encfield.name, value)"
                              :id="`mux_${encfield.name}`"
                              :placeholder="encfield.default"
                              class="w-full"
                              size="sm"
                            />
                            <UInput
                              v-if="encfield.type === 'integer'"
                              :model-value="getMuxValue(selectedType.key, encfield.name)"
                              @update:model-value="(value) => setMuxValue(selectedType.key, encfield.name, value)"
                              type="number"
                              :id="`mux_${encfield.name}`"
                              :placeholder="encfield.placeholder"
                              class="w-full"
                              size="sm"
                            />
                            <small class="text-xs text-gray-500 dark:text-gray-400">{{ encfield.description }}</small>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>

              <hr class="my-2 border-gray-200 dark:border-gray-600" />

              <div class="space-y-2">
                <div>
                  <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Source</label>
                  <USelect
                    v-model="formData[selectedType.key]['src']"
                    :items="availSrc"
                    label-key="name"
                    value-key="value"
                    placeholder="Select Source"
                    required
                    class="w-full"
                    size="sm"
                  />
                </div>
                <div>
                  <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Resolution</label>
                  <USelect
                    v-model="selectedResolution"
                    :items="resolutionOptions"
                    label-key="label"
                    value-key="key"
                    placeholder="Select Resolution"
                    class="w-full"
                    size="sm"
                  />
                </div>
                <div>
                  <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
                  <UInput
                    v-model="formData[selectedType.key]['name']"
                    placeholder="Give a name. Default Output X"
                    class="w-full"
                    size="sm"
                  />
                </div>
              </div>
              <div class="flex justify-end space-x-2 pt-2">
                <UButton type="button" label="Cancel" variant="outline" size="sm" @click="isOpen = false" />
                <UButton type="submit" label="Create Output" color="primary" size="sm" />
              </div>
            </form>
          </template>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { canOutputs, canBypassLock } = useAuth()

const {
  isOpen,
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

const { openDialog } = useCreateDialog()
watch(openDialog, (type) => { isOpen.value = type === 'output' })
</script>
