<script setup>

const { inputPreview, mixerPreview } = useUserState()
</script>

<template>
  <div>
    Input Preview
    <UToggle v-model="inputPreview"/>
    Mixer Preview
    <UToggle v-model="mixerPreview"/>
  </div>
</template>