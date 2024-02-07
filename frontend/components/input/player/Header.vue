<template>
  <div class="">
    <UTooltip :text="input.uid" >
    {{ input.name }}
    ({{ input.type }})



  </UTooltip>

    <Icon name="uil:trash" color="red" size="24px" @click="submitRemove"/>   
  </div>
</template>

<script setup>
import useTimeFormatter from '@/composables/useTimeFormatter'

const props = defineProps({
  input: Object,
  inputEnabled: Boolean
})



const previewEnabled = useCookie('enablePreview')

function enablePreview() {
  inputEnabled = !prop.inputEnabled
}

const submitRemove = async () => {
    const { data: responseData } = await useFetch('/api/inputs', {
        method: 'delete',
        body: { 
          uid: props.input.uid,
        }
    })
}

</script>

<style>

</style>