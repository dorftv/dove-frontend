<template>
<div>
  Outputs:
  <CreateOutputPane class="p-2"/>

  <Output v-for="output in outputs" :key="output.uid" :output="output" class="px-4" />
</div>  
</template>

<script setup>



const props = defineProps({
    outputs: Object,
  })
</script>

<style>

</style>