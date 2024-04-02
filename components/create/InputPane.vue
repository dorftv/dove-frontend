<template>
  <UTooltip text="Add Input">

    <UButton class="ma-0 pa-0"
  icon="i-heroicons-plus-circle"
  size="sm"
  color="white"
  variant="solid"
  label=""
  :trailing="false"
  @click="isOpen = true"

/>
  </UTooltip>
<UModal v-model="isOpen" :transition="false">
  <UTabs :items="items"  orientation="vertical">
    <template #item="{ item }">
      <div class="p-4">

        <UForm refs="inputForm"  :state="state" class="space-y-4" @submit="submitCreate">

          <CreateInputUri v-if="item.key === 'uri'" @update:formData="handleUpdateFormData"/> 
          <CreateInputYtDlp v-if="item.key === 'ytdlp'" @update:formData="handleUpdateFormData"/> 
          <CreateInputWpe v-if="item.key === 'wpe'" @update:formData="handleUpdateFormData"/> 
          <CreateInputTestsrc  v-if="item.key === 'testsrc'"   @update:formData="handleUpdateFormData"/> 
  
          <CreateInputCommon @update:formData="handleUpdateFormData"/>

          <UButton type="submit" label="Create Input"  />
          <UButton color="red" label="Cancel" @click="isOpen = false" />        
        </UForm>
      </div>
    </template> 
  </UTabs>      

</UModal>

</template>

<script setup>
const isOpen = ref(false)
// TODO receive a list of avaliable inputs from api
const items = [{
  key: 'uri',
  label: 'Uri Input',
  description: 'Add uri input.'
}, {
  key: 'ytdlp',
  label: 'YtDlp Input',
  description: 'Add yt_dlp input.'
}, {
  key: 'wpe',
  label: 'Html Source',
  description: 'Add Html Source.',
}, {
  key: 'testsrc',
  label: 'Test Source Input',
  description: 'Add testsrc input.'
}]

const handleClose = (closing) => {
  isOpen.value = closing
}

const formData = reactive({});

const state = reactive({
  type: '',
});

function handleUpdateFormData(updatedFormData) {
  Object.assign(formData, updatedFormData);
}


const submitCreate = async () => {
    const { data: responseData } = await $fetch('/api/inputs', {
        method: 'put',
        body: formData
    })
    handleClose()
}


</script>
