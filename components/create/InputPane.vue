<template>
  <Button
    label="Add Input"
    class="p-button-text text-xs"
    icon="pi pi-plus-circle"
    v-if="addInput || isUnlocked"
    @click="toggle"
  />
  <Popover ref="op" appendTo="body" @hide="isOpen = false">
    <div class="p-3 w-[32rem] max-w-[calc(100vw-1rem)] max-h-[80vh] overflow-y-auto">
      <div class="text-sm font-medium mb-2">Add Input</div>

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

      <template v-if="selectedType && formData[selectedType.label]">
        <p class="text-xs italic mb-2 text-gray-500 dark:text-gray-400">{{ selectedType.fields['type'].description }}</p>
        <form @submit.prevent="submitCreateInput(selectedType.label)" class="space-y-2">
          <div v-for="field in selectedType.fields" :key="field.name">
            <div v-if="field.name !== 'type' && field.hidden !== true" class="mb-2">
              <label :for="field.name" class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">{{ field.label }}</label>
              <InputText
                v-if="field.type === 'string'"
                v-model="formData[selectedType.label][field.name]"
                :id="field.name"
                :aria-describedby="`${field.name}-description`"
                :placeholder="field.placeholder"
                :required="field.required"
                class="w-full text-sm"
              />
              <InputNumber
                v-if="field.type === 'integer' || field.type === 'number'"
                v-model="formData[selectedType.label][field.name]"
                :id="field.name"
                :placeholder="field.placeholder"
                :required="field.required"
                class="w-full text-sm"
              />
              <Checkbox
                v-if="field.type === 'boolean'"
                v-model="formData[selectedType.label][field.name]"
                :id="field.name"
                :binary="true"
              />
              <small :id="`${field.name}-description`" class="block mt-1 text-xs text-gray-500 dark:text-gray-400 italic">{{ field.description }}</small>

              <div class="mt-1">
                <div v-for="(proxy, proxyType) in proxyTypes" :key="proxyType" class="mb-1">
                  <div v-if="selectedType.key === proxy.type && field.name === proxy.field" class="flex items-center space-x-1">
                    <div v-if="proxyItems[proxyType] && proxyItems[proxyType].length > 0" class="flex-grow">
                      <Select
                        v-model="formData[selectedType.label][field.name]"
                        :options="proxyItems[proxyType]"
                        optionLabel="name"
                        optionValue="url"
                        placeholder="Select Stream"
                        @change="(e) => handleProxyNameChange(selectedType.label, proxy.field, proxyType, e.value)"
                        class="text-xs w-full"
                      />
                    </div>
                    <Button icon="pi pi-refresh" @click="fetchItems(proxyType)" class="p-button-outlined p-button-sm" />
                    <span class="text-xs text-gray-600 dark:text-gray-400">load from {{ proxyType }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr class="my-2 border-gray-200 dark:border-gray-600" />

          <div class="space-y-2">
            <div>
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Volume</label>
              <Slider v-model="formData[selectedType.label]['volume']" :min="0" :max="1" :step="0.05" class="w-full" />
              <span class="text-xs text-gray-600 dark:text-gray-400">Volume: {{ Math.round(formData[selectedType.label].volume * 100) }}%</span>
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
                v-model="formData[selectedType.label]['name']"
                placeholder="Give a name. Default Output X"
                class="w-full text-sm"
              />
            </div>

            <div>
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Scene</label>
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
                  <label class="text-sm text-gray-700 dark:text-gray-300">Set Program</label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-2 mt-4">
            <Button type="button" label="Cancel" class="p-button-outlined p-button-sm" @click="isOpen = false" />
            <Button type="submit" label="Create Input" class="p-button-primary p-button-sm" />
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
  types,
  resolutionOptions,
  selectedResolution,
  activeTabIndex,
  selectedType,
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

const typeOptions = computed(() =>
  types.value.map((item, index) => ({
    label: item.fields?.['type']?.label || item.label,
    value: index
  }))
)
</script>
