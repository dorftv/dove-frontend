

<template>
      <UTooltip text="Add Scene">
    <UButton class="ma-0 pa-0"
  icon="i-heroicons-plus"
  size="sm"
  color="white"
  variant="solid"
  label=""
  tooltip="xx"
  :trailing="false"
  @click="isOpen = true"
/>
      </UTooltip>
    <UModal v-model="isOpen" :transition="false">
      <UContainer>
      <UForm  class="p-4 space-y-4"  :state="state" @submit="submitCreateScene">

      <div class="p-4">
        <UFormGroup label="Name">
          <UInput v-model="state.name" />
        </UFormGroup>
        <CreateResolutions />
        <UButton  type="submit" label="Create Scene" @click="isOpen = false"   />
        <UButton color="red" label="Cancel" @click="isOpen = false" />
      </div>
    </UForm>
    </UContainer>
    </UModal>
</template>

<script setup>
const isOpen = ref(false)

const state = reactive({
  type: 'scene',

});

const submitCreateScene = async () => {
    const { data: responseData } = await useFetch('/api/mixers', {
        method: 'put',
        body: {
          type: 'scene',
          name: state.name

        }
    })

    //setSelectedScene(responseData)
}
</script>
