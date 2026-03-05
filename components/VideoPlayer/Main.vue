<template>
  <VideoPlayerHls v-if="useHls" :uid="uid" :muted="muted" />
  <VideoPlayerWhep v-else :uid="uid" :muted="muted" @error="onWhepError" />
</template>

<script setup>
const props = defineProps({
  uid: String,
  muted: String,
});

const { previewOutputs } = useEntities();
const { previewMode } = usePreviewMode();

const whepFailed = ref(false);

const hlsAvailable = computed(() =>
  previewOutputs.value.some(o => o.src === props.uid && o.type === 'hlssink2')
);

const useHls = computed(() => {
  if (previewMode.value === 'hls') return hlsAvailable.value;
  if (previewMode.value === 'webrtc') return false;
  // auto: use WebRTC unless it failed and HLS is available
  return whepFailed.value && hlsAvailable.value;
});

const onWhepError = () => {
  if (hlsAvailable.value) whepFailed.value = true;
};

watch(() => props.uid, () => { whepFailed.value = false; });
watch(previewMode, () => { whepFailed.value = false; });
</script>
