<template>
      <div 
        v-for="mixer in mixers" 
        :key="mixer.uid" 
        class="py-1">
        <InputSceneMixer 
            v-if="mixer.type === 'scene'"
            :input="input" 
            :mixer="mixer"
            />
      </div>        

  </template>
  
  <script setup>
  
  import { computed } from "@vue/reactivity"
  //<CreateInputUri :isOpen="isOpen" @close="(closing) => isOpen = closing" /> 
  
  const props = defineProps({
    input: Object,
    mixers: Object,
  })
  
  

  
  </script>
  
  <style>
  
  </style>
  
  