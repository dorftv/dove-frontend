<template>
  <Button
    label="Add Scene"
    class="p-button-text text-xs"
    icon="pi pi-plus-circle"
    v-if="addScene || isUnlocked"
    @click="toggle"
  />
  <Popover ref="op" appendTo="body" @hide="isOpen = false">
    <div class="p-3 w-80 max-w-[calc(100vw-1rem)]">
      <div class="text-sm font-medium mb-2">Add Scene</div>
      <form @submit.prevent="submitCreate('scene')" class="space-y-2">
        <div class="mb-2">
          <label for="name" class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
          <InputText
            v-model="formData.scene.name"
            id="name"
            placeholder="Enter scene name"
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

        <div class="flex justify-end space-x-2 mt-4">
          <Button type="button" label="Cancel" class="p-button-outlined p-button-sm" @click="isOpen = false" />
          <Button type="submit" label="Create Scene" class="p-button-primary p-button-sm" />
        </div>
      </form>
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
  submitCreate,
  selectedResolution,
  resolutionOptions,
  addScene,
} = useCreateScene();
</script>
