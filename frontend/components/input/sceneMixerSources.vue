<template>
  <div v-if="mixer.type != 'program' && mixer.type != 'preview'" class="flex justify-between items-center">
  <div>{{ source.sink }}</div>
  <div>{{ source.src }}</div>

  <div class="flex space-x-4">
    
    <Icon  v-if="!isInMixerSources" name="heroicons:scissors" color="red" size="24px" @click="submitAddSource" class="w-6"/>   
    <Icon v-if="isInMixerSources" name="lets-icons:remove-fill" color="red" size="24px" @click="submitRemoveSource"/>

  </div>
</div>
</template>
<script setup>

const props = defineProps({
  input: Object,
  mixer: Object,
  source: Object
})


const isInMixerSources = computed(() => {
  return props.mixer.sources.some(source => source.src === props.input.uid && source.sink === props.source.sink);

});

const submitAddSource = async () => {
    const { data: responseData } = await useFetch('/api/mixer/add_source', {
        method: 'post',
        body: { 
          src: props.input.uid,
          target: props.mixer.uid,
          sink: props.source.sink
        }
    })
}

const submitRemoveSource = async () => {
    const { data: responseData } = await useFetch('/api/mixer/remove_source', {
        method: 'post',
        body: { 
          src: "None",
          target: props.mixer.uid,
          sink: props.source.sink
        }
    })
}
</script>

<style>

</style>