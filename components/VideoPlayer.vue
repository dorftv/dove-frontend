
<template>
  <div>
    <media-player v-if="uid" ref="mediaPlayer" :muted="mutedState[uid]" viewType="video" autoplay stream-type="live"  load="custom" :title="`${uid}`"  :src="`/preview/hls/${uid}/index.m3u8`" class="aspect-video">
      <media-provider></media-provider>
      <media-video-layout></media-video-layout>
    </media-player>

  </div>
</template>

<script setup>
import 'vidstack/player';
import 'vidstack/player/layouts';
import 'vidstack/player/ui';
import 'vidstack/player/styles/default/theme.css';
import 'vidstack/player/styles/default/layouts/video.css';
import HLS from 'hls.js';

import { MediaPlayerElement } from 'vidstack/elements';
import { MediaRemoteControl } from 'vidstack';
const mediaPlayer = ref(null);
const { mutedState, setMutedState } = useMutedState();
const remote = new MediaRemoteControl();
const props = defineProps({
  uid: String,
  muted: String
})

onMounted(() => {
  const player = mediaPlayer.value;

  player.addEventListener('media-mute-request', () => {
      setMutedState(props.uid, true);
  });

  player.addEventListener('media-unmute-request', () => {
    setMutedState(props.uid, false);
  });

  player.addEventListener('provider-change', (event) => {
  const provider = event.detail;
  if (provider?.type === 'hls') {
    provider.library = HLS;
    provider.config = {
    maxMaxBufferLength: 3,
    };
      setTimeout(() => {
      const src = player.src
      player.startLoading();
    }, 2000);
  }
});

  player.addEventListener('hls-error', (event) => {
    const provider = event.detail;
    const src = player.src
    player.src = src
  });
});

</script>

<style scoped>

</style>
