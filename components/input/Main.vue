<template>
  <div class="">
      <InputHeader :input="input" />
      <VideoPlayer muted="true"  v-if="inputPreview || inputEnabled" :uid="input.uid" />
      <InputControls :state="input.state" :uid="input.uid"  :input="input" :inputEnabled="inputEnabled" @enablePreview="(preview) => inputEnabled = preview" />
      <InputScenes :input="input" />
</div>
</template>

<script setup>

const props = defineProps({
  input: Object,
})

const { inputPreview } = useUserState()
const inputEnabled = ref(false)


</script>

<style>
</style>

