<template>
  <div class="flex justify-between">
    <UTooltip :text="input.uid" >
    {{ input.name }}
    ({{ input.type }})
  </UTooltip>
  <UPopover :popper="{ arrow: true }">
    <UButton color="white" label="Details" trailing-icon="i-heroicons-information-circle-20-solid" />
    <template #panel>
      <div class="p-4">
        <pre>{{ inputDetails }}</pre>
      </div>
    </template>
  </UPopover>
    <Icon name="uil:trash" color="red" size="24px" @click="submitRemove"/>   
  </div>
</template>

<script setup>
import useTimeFormatter from '@/composables/useTimeFormatter'

const props = defineProps({
  input: Object,
  inputEnabled: Boolean
})


const inputDetails = computed(() => JSON.stringify(props.input, null, 2));

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