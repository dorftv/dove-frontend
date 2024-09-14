<template>
  <div class="flex items-center space-x-4">
    <div class="flex items-center">
      <label for="inputPreview" class="mr-2">Input Preview</label>
      <InputSwitch v-model="inputPreview" inputId="inputPreview" />
    </div>
    <div class="flex items-center">
      <label for="mixerPreview" class="mr-2">Mixer Preview</label>
      <InputSwitch v-model="mixerPreview" inputId="mixerPreview" />
    </div>
  </div>
</template>

<script setup>


const { inputPreview, mixerPreview } = useUserState();
</script>
