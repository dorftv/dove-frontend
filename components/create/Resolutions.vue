<template>
  <div>
    <USelect
      v-model="selectedResolution"
     :key="selectedResolution" 
      :options="resolutionOptions"
      option-attribute="label"
      value-attribute="key"
      size="md"
      padding="false"
    >
    </USelect>
  </div>
</template>

<script setup>

const { config, resolutionOptions, defaultResolution, getResolutionDimensions } = useDoveConfig();

const selectedResolution = ref(defaultResolution)



watchEffect(() => {

const dimensions = getResolutionDimensions(selectedResolution);
  if (dimensions) {
    state.width = dimensions.width;
    state.height = dimensions.height;
  }
// @TODO 
//  emit('update:handleUpdateFormData', state);
});

</script>

<style>

</style>