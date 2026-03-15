<template>
  <div v-if="canSupervisor && (addScene || canBypassLock)">
    <UButton
      label="Add Scene"
      variant="ghost"
      size="xs"
      icon="i-ph-plus-circle"
      @click="isOpen = true"
    />
    <UModal v-model:open="isOpen">
      <template #content>
        <div class="p-4 w-full max-w-sm mx-auto">
          <div class="text-sm font-medium mb-3">Add Scene</div>
          <form @submit.prevent="submitCreate('scene')" class="space-y-2">
            <div>
              <label for="name" class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
              <UInput
                v-model="formData.scene.name"
                id="name"
                placeholder="Enter scene name"
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

            <div class="flex justify-end space-x-2 pt-2">
              <UButton type="button" label="Cancel" variant="outline" size="sm" @click="isOpen = false" />
              <UButton type="submit" label="Create Scene" color="primary" size="sm" />
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { canSupervisor, canBypassLock } = useAuth()

const {
  isOpen,
  toggle,
  formData,
  submitCreate,
  selectedResolution,
  resolutionOptions,
  addScene,
} = useCreateScene();

const { openDialog } = useCreateDialog()
watch(openDialog, (type) => { isOpen.value = type === 'scene' })
</script>
