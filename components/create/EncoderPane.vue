<template>
  <Button
    label="Add Encoder"
    class="p-button-text text-xs"
    icon="pi pi-plus-circle"
    @click="toggle"
  />
  <Popover ref="op" appendTo="body" @hide="isOpen = false">
    <div class="p-3 w-[32rem] max-w-[calc(100vw-1rem)] max-h-[80vh] overflow-y-auto">
      <div class="text-sm font-medium mb-2">Add Encoder</div>

      <form @submit.prevent="submitCreate()" class="space-y-2">
        <div>
          <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Type</label>
          <SelectButton
            v-model="encoderType"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            :allowEmpty="false"
            class="text-xs"
            @update:model-value="onTypeChange"
          />
        </div>

        <div>
          <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Element</label>
          <Select
            :model-value="formData.element"
            @update:model-value="onElementChange"
            :options="elementOptions"
            optionLabel="name"
            optionValue="element"
            placeholder="Select encoder element"
            required
            class="w-full text-sm"
          />
        </div>

        <div>
          <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Options</label>
          <InputText
            v-model="formData.options"
            placeholder="Encoder options"
            class="w-full text-sm"
          />
        </div>

        <div v-if="encoderType === 'video'">
          <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Profile</label>
          <InputText
            v-model="formData.profile"
            placeholder="e.g. high, main, baseline"
            class="w-full text-sm"
          />
        </div>

        <hr class="my-2 border-gray-200 dark:border-gray-600" />

        <div>
          <label class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Source</label>
          <Select
            v-model="formData.src"
            :options="availSrc"
            optionLabel="name"
            optionValue="value"
            placeholder="Select Source"
            class="w-full text-sm"
          />
        </div>

        <div v-if="encoderType === 'video'">
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
            v-model="formData.name"
            placeholder="Optional name"
            class="w-full text-sm"
          />
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <Button type="button" label="Cancel" class="p-button-outlined p-button-sm" @click="isOpen = false" />
          <Button type="submit" label="Create Encoder" class="p-button-primary p-button-sm" />
        </div>
      </form>
    </div>
  </Popover>
</template>

<script setup>
const {
  isOpen,
  op,
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
</script>
