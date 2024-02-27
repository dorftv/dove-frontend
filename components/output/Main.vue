<template>
<div>
  <Output v-for="output in outputs" :key="output.uid" :output="output" :mixers="mixers" />
</div>  
</template>

<script setup>



const props = defineProps({
    outputs: Object,
    mixers: Object,
  })
</script>

<style>

</style>