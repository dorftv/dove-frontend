<template>
  <div v-if="program" class="flex">
    <VideoPlayerMain :uid="program.uid" class="flex-grow min-w-0" />
    <AudioMeter v-if="audioMeters" :uid="program.uid" />
  </div>
</template>

<script setup>
const { program } = useEntities();
const { audioMeters } = useUserState();
</script>
