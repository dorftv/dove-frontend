<template>

<div v-for="source in mixer.sources" :key="source.id">

<InputSceneMixerSources :input="input" :mixer="mixer" :source="source" v-if="!source.src_locked"/>
            </div>      

</template>
<script setup>
const props = defineProps({
  input: Object,
  mixer: Object,
})



const submitCut = async () => {
    const { data: responseData } = await useFetch('/api/mixer/add_source', {
        method: 'post',
        body: { 
          src: props.input.uid,
          target: props.mixer.uid,
          sink: props.source.sink
        }
    })
}

const submitOverlayRemove = async () => {
    const { data: responseData } = await useFetch('/api/mixer/remove_source', {
        method: 'post',
        body: { 
          src: props.input.uid,
          target: props.mixer.uid,
          sink: props.source.sink
        }
    })
}
</script>

<style>

</style>