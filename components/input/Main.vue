<template>
  <div class="col-span-12 p-2"><CreateInputPane /></div>

<div v-for="input in inputsPreview" :key="input.uid" class="col-span-2 px-4">
      <InputHeader :input="input" :inputEnabled="inputEnabled" @enablePreview="(preview) => inputEnabled = preview"/>
      <VideoPlayer muted="true"  v-if="(inputPreview || inputEnabled) && input.preview" :uid="input.uid" />
      <InputControls :input="input" :state="input.state" :uid="input.uid" />
      <InputScenes :input="input" />
</div>

<div v-for="input in inputsNoPreview" :key="input.uid" class="col-span-2 px-4">
      <InputHeader :input="input" />
      <InputControls :state="input.state" :uid="input.uid"  :input="input"  />
      <InputScenes :input="input" />
</div>

<InputNodeCG/>

</template>

<script setup>

const { inputs, inputsPreview, inputsNoPreview } = useEntities();
const { inputPreview } = useUserState()
const inputEnabled = ref(false)

</script>

<style>
</style>

