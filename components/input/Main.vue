<template>
  <div class="col-span-12 p-2">Inputs <CreateInputPane /></div>

<div v-for="input in inputsPreview" :key="input.uid" class="col-span-2 px-4">
      <InputHeader :input="input" />
      <VideoPlayer muted="true"  v-if="(inputPreview || inputEnabled) && input.preview" :uid="input.uid" />
      <InputControls :state="input.state" :uid="input.uid"  :input="input" :inputEnabled="inputEnabled" @enablePreview="(preview) => inputEnabled = preview" />
      <InputScenes :input="input" />
</div>

<div v-for="input in inputsNoPreview" :key="input.uid" class="col-span-2 px-4">
      <InputHeader :input="input" />
      <InputControls :state="input.state" :uid="input.uid"  :input="input" :inputEnabled="inputEnabled" @enablePreview="(preview) => inputEnabled = preview" />
      <InputScenes :input="input" />
</div>

</template>

<script setup>


const { inputs, inputsPreview, inputsNoPreview } = useEntities();

const { inputPreview } = useUserState()
const inputEnabled = ref(false)


</script>

<style>
</style>

