<template>
  <div v-if="entityPreview && entityPreview.type === 'hlssink2'">
    <VideoPlayerHls :uid="uid" :muted="muted" />
  </div>
  <div v-else>
    <VideoPlayerWhep :uid="uid" :muted="muted" />
  </div>
</template>

<script setup>

const props = defineProps({
  uid: String,
  muted: String
});

const { previewOutputs } = useEntities();

const entityPreview = computed(() => {
  return previewOutputs.value.find(input => input.src === props.uid);
});

</script>

<style>

</style>