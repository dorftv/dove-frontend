
<template>
    <div v-if="!output.type.startsWith('preview')">
      {{ mixerName }} {{ output.type }} {{ output.state }} 
      <Icon name="uil:trash" color="red" size="24px" @click="submitRemove"/>   
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    output: Object,
    mixers: Object,
  })

  const mixerName = computed(() => {
    const mixer = props.mixers.find(mixer => mixer.uid === props.output.src);
    return mixer ? mixer.name : '';
  });

  const submitRemove = async () => {
      const { data: responseData } = await useFetch('/api/outputs', {
          method: 'delete',
          body: { 
            uid: props.output.uid,
          }
      })
  }
  
  </script>
  
  <style>
  
  </style>