<template>
  <div v-if="programMixer" class="flex">
    <VideoPlayerMain :uid="programMixer.uid" class="flex-grow min-w-0" />
    <AudioMeter v-if="audioMeters" :uid="programMixer.uid" />
  </div>
</template>

<script setup>
const { programMixer } = useEntities();
const { audioMeters } = useUserState();
</script>
