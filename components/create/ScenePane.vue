<template>
  <div v-if="canSupervisor && (addScene || canBypassLock)">
    <UButton
      variant="ghost"
      size="xs"
      icon="i-ph-plus-circle"
      @click="isOpen = true"
    >
      Add Scene
      <kbd class="ml-1 text-[11px] bg-gray-200 dark:bg-gray-600 px-1 rounded font-mono hidden md:inline">S</kbd>
    </UButton>
    <UModal v-model:open="isOpen" title="Add Scene" description="Create a new scene mixer">
      <template #content>
        <div class="p-4 w-full max-w-sm mx-auto min-h-0 overflow-y-auto">
          <form @submit.prevent="submit" class="space-y-2">
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

            <!-- Where the scene's programme guide comes from: the admins' to set -->
            <template v-if="canAdmin">
              <div>
                <label for="epg_src" class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Guide source</label>
                <UInput
                  v-model="formData.scene.epg_src"
                  id="epg_src"
                  placeholder="playlist or https://… (optional)"
                  class="w-full"
                  size="sm"
                />
              </div>
              <div>
                <label for="epg_title" class="block font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">Guide title</label>
                <UInput
                  v-model="formData.scene.epg_title"
                  id="epg_title"
                  placeholder="Shown when the source knows nothing (optional)"
                  class="w-full"
                  size="sm"
                />
              </div>
            </template>

            <div class="flex justify-end space-x-2 pt-2">
              <UButton type="button" label="Cancel" variant="outline" size="sm" @click="isOpen = false" />
              <UButton type="submit" label="Create Scene" color="primary" size="sm" :loading="isSubmitting" />
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const { canSupervisor, canAdmin, canBypassLock } = useAuth()

const {
  isOpen,
  isSubmitting,
  toggle,
  formData,
  submitCreate,
  selectedResolution,
  resolutionOptions,
  addScene,
} = useCreateScene();

// A guide field left empty is not sent: the backend takes an empty source for a wrong one
const submit = () => {
  for (const field of ['epg_src', 'epg_title']) {
    const value = formData.scene[field]?.trim();
    if (value) formData.scene[field] = value;
    else delete formData.scene[field];
  }
  return submitCreate('scene');
};

const { openDialog, close } = useCreateDialog()
watch(openDialog, (type) => { isOpen.value = type === 'scene' })
watch(isOpen, (val) => { if (!val) close() })
</script>
