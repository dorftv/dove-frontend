<template>
  <div class="flex justify-between">
    <UTooltip :text="mixer.uid" >

    {{mixer.name }}
    </UTooltip>

    <UPopover :popper="{ arrow: true }">
    <UButton color="white" label="Details" trailing-icon="i-heroicons-information-circle-20-solid" />
    <template #panel>
      <div class="p-4">
        <pre>{{ mixerDetails }}</pre>
      </div>
    </template>
  </UPopover>    
    <Icon v-if="!mixer.locked" name="uil:trash" color="red" size="24px" @click="submitRemove"/>   
  </div>
</template>

<script setup>
const props = defineProps({
  mixer: Object,
  inputEnabled: Boolean
})
// <UButton type="submit" label="Create Input" @click="$emit('close', false)" />


const previewEnabled = useCookie('enablePreview')

function enablePreview() {
  inputEnabled = !prop.inputEnabled
}
const mixerDetails = computed(() => JSON.stringify(props.mixer, null, 2));

const submitRemove = async () => {
    const { data: responseData } = await useFetch('/api/mixers', {
        method: 'delete',
        body: { 
          uid: props.mixer.uid,
        }
    })
}

</script>

<style>

</style>