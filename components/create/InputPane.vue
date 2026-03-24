<template>
  <div v-if="canUser && (addInput || canBypassLock)">
    <UButton
      variant="ghost"
      size="xs"
      icon="i-ph-plus-circle"
      @click="isOpen = true"
    >
      Add Input
      <kbd class="ml-1 text-[10px] bg-gray-200 dark:bg-gray-600 px-1 rounded font-mono">I</kbd>
    </UButton>
    <UModal v-model:open="isOpen">
      <template #content>
        <div class="p-4 w-full max-w-lg mx-auto">
          <div class="text-sm font-medium mb-3">Add Input</div>

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

          <template v-if="selectedType && formData[selectedType.label]">
            <form @submit.prevent="submitCreateInput(selectedType.label)" class="space-y-2">
              <template v-for="field in selectedType.fields" :key="field.name">
                <template v-if="field.name !== 'type' && field.hidden !== true">
                  <!-- Boolean fields: compact inline row -->
                  <div v-if="field.type === 'boolean'" class="flex items-center justify-between py-0.5">
                    <div>
                      <span class="text-sm text-gray-700 dark:text-gray-300">{{ field.label }}</span>
                      <span v-if="field.description" class="text-[10px] text-gray-400 dark:text-gray-500 ml-1">{{ field.description }}</span>
                    </div>
                    <USwitch v-model="formData[selectedType.label][field.name]" />
                  </div>

                  <!-- Other fields -->
                  <div v-else>
                    <label :for="field.name" class="block font-bold text-sm text-gray-700 dark:text-gray-300">{{ field.label }}</label>
                    <UInput
                      v-if="field.type === 'string'"
                      v-model="formData[selectedType.label][field.name]"
                      :id="field.name"
                      :placeholder="field.placeholder || field.description"
                      :required="field.required"
                      class="w-full"
                      size="sm"
                    />
                    <UInput
                      v-if="field.type === 'integer' || field.type === 'number'"
                      v-model="formData[selectedType.label][field.name]"
                      type="number"
                      :id="field.name"
                      :placeholder="field.placeholder || field.description"
                      :required="field.required"
                      class="w-full"
                      size="sm"
                    />

                    <template v-for="(proxy, proxyType) in proxyTypes" :key="proxyType">
                      <div v-if="selectedType.key === proxy.type && field.name === proxy.field" class="flex items-center space-x-1 mt-1">
                        <div v-if="proxyItems[proxyType] && proxyItems[proxyType].length > 0" class="flex-grow">
                          <USelect
                            v-model="formData[selectedType.label][field.name]"
                            :items="proxyItems[proxyType]"
                            label-key="name"
                            value-key="url"
                            placeholder="Select Stream"
                            @update:model-value="(val) => handleProxyNameChange(selectedType.label, proxy.field, proxyType, val)"
                            class="w-full"
                            size="xs"
                          />
                        </div>
                        <UButton icon="i-ph-arrows-clockwise" @click="fetchItems(proxyType)" variant="outline" size="sm" />
                        <span class="text-xs text-gray-600 dark:text-gray-400">{{ proxyType }}</span>
                      </div>
                    </template>
                  </div>
                </template>
              </template>

              <hr class="!my-1 border-gray-200 dark:border-gray-600" />

              <!-- Volume -->
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-700 dark:text-gray-300 shrink-0">Volume</label>
                <USlider v-model="formData[selectedType.label]['volume']" :min="0" :max="1" :step="0.05" class="flex-1" />
                <span class="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{{ Math.round(formData[selectedType.label].volume * 100) }}%</span>
              </div>

              <!-- Resolution + Name row -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-sm text-gray-700 dark:text-gray-300">Resolution</label>
                  <USelect
                    v-model="selectedResolution"
                    :items="resolutionOptions"
                    label-key="label"
                    value-key="key"
                    placeholder="Resolution"
                    class="w-full"
                    size="sm"
                  />
                </div>
                <div>
                  <label class="block text-sm text-gray-700 dark:text-gray-300">Name</label>
                  <UInput
                    v-model="formData[selectedType.label]['name']"
                    placeholder="Optional"
                    class="w-full"
                    size="sm"
                  />
                </div>
              </div>

              <!-- Preview toggle -->
              <div class="flex items-center justify-between py-0.5">
                <span class="text-sm text-gray-700 dark:text-gray-300">Preview</span>
                <USwitch v-model="formData[selectedType.label]['preview']" />
              </div>

              <!-- Scene assignment -->
              <div>
                <label class="block text-sm text-gray-700 dark:text-gray-300">Scene</label>
                <USelect
                  v-model="selectedScene.uid"
                  :items="sceneMixers"
                  label-key="name"
                  value-key="uid"
                  placeholder="Add Input to Scene"
                  class="w-full"
                  size="sm"
                />
                <div v-if="selectedScene.uid" class="mt-1">
                  <USelect
                    v-model="selectedScene.slot"
                    :items="currentSources"
                    label-key="name"
                    value-key="index"
                    placeholder="Select a Slot"
                    class="w-full mb-1"
                    size="sm"
                  />
                  <div v-if="selectedScene.slot !== null" class="flex items-center justify-between py-0.5">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Set Program</span>
                    <USwitch v-model="selectedSceneProgram" />
                  </div>
                </div>
              </div>

              <div class="flex justify-end space-x-2 pt-2">
                <UButton type="button" label="Cancel" variant="outline" size="sm" @click="isOpen = false" />
                <UButton type="submit" label="Create Input" color="primary" size="sm" />
              </div>
            </form>
          </template>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { canUser, canBypassLock } = useAuth()

const {
  isOpen,
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

const { openDialog, close } = useCreateDialog()
watch(openDialog, (type) => { isOpen.value = type === 'input' })
watch(isOpen, (val) => { if (!val) close() })
</script>
