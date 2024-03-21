<template>
<div class="box-border  p-4 border-4">
<USelect v-model="switchmode" :options="switchemodes" class="px-4 py-24" />

<div class="justify-center px-4 py-2 ">
  <UButton  color="white"  trailing-icon="i-heroicons-minus" @click="duration = duration - 1"/>

  <UInput :modelValue="duration" color="white" variant="outline" class="max-w-24" />

  <UButton  color="white"  trailing-icon="i-heroicons-plus" @click="duration = duration + 1"/>

  <UButton color="white" variant="solid">Switch</UButton>
</div>
</div>
</template>

<script setup>

const switchemodes = ['Crossfade']
const switchmode = ref(switchemodes[0])

const duration = ref(2)

</script>

<style>

</style>