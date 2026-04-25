<template>
  <div v-if="canOutputs">
    <UButton
      label="Add Encoder"
      variant="ghost"
      size="xs"
      icon="i-ph-plus-circle"
      @click="isOpen = true"
    />
    <UModal v-model:open="isOpen" title="Add Encoder" description="Create a new encoder">
      <template #content>
        <div class="p-4 w-full max-w-lg mx-auto">
          <form @submit.prevent="submitCreate()" class="space-y-2">
            <div>
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Type</label>
              <div class="inline-flex">
                <UButton
                  v-for="opt in typeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :color="encoderType === opt.value ? 'primary' : 'neutral'"
                  :variant="encoderType === opt.value ? 'solid' : 'outline'"
                  size="xs"
                  @click="encoderType = opt.value; onTypeChange()"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Element</label>
              <USelect
                :model-value="formData.element"
                @update:model-value="onElementChange"
                :items="elementOptions"
                label-key="name"
                value-key="element"
                placeholder="Select encoder element"
                required
                class="w-full"
                size="sm"
              />
            </div>

            <div>
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Options</label>
              <UInput
                v-model="formData.options"
                placeholder="Encoder options"
                class="w-full"
                size="sm"
              />
            </div>

            <div v-if="encoderType === 'video'">
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Profile</label>
              <UInput
                v-model="formData.profile"
                placeholder="e.g. high, main, baseline"
                class="w-full"
                size="sm"
              />
            </div>

            <hr class="my-2 border-gray-200 dark:border-gray-600" />

            <div>
              <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Source</label>
              <USelect
                v-model="formData.src"
                :items="availSrc"
                label-key="name"
                value-key="value"
                placeholder="Select Source"
                class="w-full"
                size="sm"
              />
            </div>

            <div v-if="encoderType === 'video'">
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
                v-model="formData.name"
                placeholder="Optional name"
                class="w-full"
                size="sm"
              />
            </div>

            <div class="flex justify-end space-x-2 pt-2">
              <UButton type="button" label="Cancel" variant="outline" size="sm" @click="isOpen = false" />
              <UButton type="submit" label="Create Encoder" color="primary" size="sm" />
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { canOutputs } = useAuth()

const {
  isOpen,
  toggle,
  encoderType,
  formData,
  availSrc,
  resolutionOptions,
  selectedResolution,
  elementOptions,
  onElementChange,
  onTypeChange,
  submitCreate,
} = useCreateEncoder();

const typeOptions = [
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
];

const { openDialog } = useCreateDialog()
watch(openDialog, (type) => { isOpen.value = type === 'encoder' })
</script>
