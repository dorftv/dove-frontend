
<template>
  <UTooltip text="Add Output">
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

        <UForm refs="inputForm" :state="state" class="space-y-4" @submit="submitCreate">

          <CreateOutputSrt v-if="item.key === 'srtsink'" @update:formData="handleUpdateFormData"/> 
          <CreateOutputDecklink v-if="item.key === 'decklinksink'" @update:formData="handleUpdateFormData"/> 
          <CreateOutputFake v-if="item.key === 'fakesink'" @update:formData="handleUpdateFormData"/> 

          <CreateOutputCommon @update:formData="handleUpdateFormData"/>

          <UButton type="submit" label="Create Output"  />
          <UButton color="red" label="Cancel" @click="isOpen = false" />        
        </UForm>
      </div>
    </template> 
  </UTabs>      
</UModal>
</template>

<script setup>

const state = reactive({
  type: '',
});

const isOpen = ref(false)
const items = [{
  key: 'srtsink',
  label: 'SRT Output',
  description: 'Add srt output.'
},
{
  key: 'decklinksink',
  label: 'Decklink Output',
  description: 'Add decklink output.'
},
{
  key: 'fakesink',
  label: 'Fake Sink',
  description: 'Add fakesink output.'
}]

const handleClose = (closing) => {
  isOpen.value = closing
}

const formData = reactive({});

function handleUpdateFormData(updatedFormData) {
  Object.assign(formData, updatedFormData);
}


const submitCreate = async () => {
    const { data: responseData } = await $fetch('/api/outputs', {
        method: 'put',
        body: formData
    })
    
    handleClose()

}


</script>
