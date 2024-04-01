<template>
      <USelect v-model="state.src" :options="availSrc" option-attribute="name"   placeholder="Select Source" />
    
      <UInput v-model="state.name" size="md" placeholder="Give a name. Default Output X" />
          
      <CreateResolutions />

</template>

<script setup>
const { data: availMixers, pending, error } = await useFetch('/api/mixers');

const availSrc = ref([])

watchEffect(() => {
  if (availMixers.value && availMixers.value.length > 0) {
    availSrc.value = availMixers.value.map(item => {
      return { name: item.name, value: item.uid }
    });
  }
});
const emit = defineEmits(['update:formData']);

const state = reactive({
src: ''
});
// Emit formData updates when the reactive state changes
// Emit formData updates when the reactive state changes
watchEffect(() => {
  emit('update:formData', { src: state.src, name: state.name });
});


</script>

<style>

</style>