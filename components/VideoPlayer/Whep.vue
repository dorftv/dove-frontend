<template>
  <div :id="`videocontainer-${props.uid}`" class="video-container aspect-video">
    <video
      ref="videoPlayer"
      autoplay
      :muted="mutedState[uid]"
      controls
      playsinline
    ></video>
  </div>
</template>

<script setup>
const props = defineProps({
  uid: String,
  muted: String,
});

const { videoPlayer, mutedState } = useWhepPlayer(props);
</script>

<style scoped>
.video-container {
  width: 100%;
}

video {
  width: 100%;
  height: auto;
}
</style>
