<template>
  <Button
    label="Add Scene"
    class="p-button-rounded p-button-text text-xs"
    icon="pi pi-plus-circle"
    v-if="addScene"
    @click="isOpen = true"
  />
  <Dialog v-model:visible="isOpen" :modal="true" class="scene-pane-dialog">
    <template #header>
      <h3 class="text-lg font-semibold">Add Scene</h3>
    </template>
    <div class="p-2 bg-gray-100 rounded-lg">
      <form @submit.prevent="submitCreate('scene')" class="space-y-2">
        <div class="mb-2">
          <label for="name" class="block font-bold text-sm mb-1">Name</label>
          <InputText
            v-model="formData.scene.name"
            id="name"
            placeholder="Enter scene name"
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

        <div class="flex justify-end space-x-2 mt-4">
          <Button type="button" label="Cancel" class="p-button-outlined p-button-sm" @click="isOpen = false" />
          <Button type="submit" label="Create Scene" class="p-button-primary p-button-sm" />
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup>

const entityType = 'mixers';
const {
  isOpen,
  isLoading,
  fetchError,
  types,
  formData,
  submitCreate,
  selectedResolution,
  resolutionOptions,
} = useCreateEntity(entityType);

const { addScene } = useDoveConfig();

</script>

<style scoped>

</style>
