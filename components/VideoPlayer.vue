
<template>
  <div>     
    <media-player v-if="uid" ref="mediaPlayer" :muted="muted" viewType="video" autoplay stream-type="live"  load="custom" :title="`${uid}`"  :src="`/preview/hls/${uid}/index.m3u8`" class="aspect-video">
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

const mediaPlayer = ref(null);

const props = defineProps({
  uid: String,
  muted: String
})

onMounted(() => {
  const player = mediaPlayer.value;

  player.addEventListener('provider-change', (event) => {
  const provider = event.detail;
  if (provider?.type === 'hls') {

    provider.library = HLS;
    provider.config = {
      // Limit loading ahead to 30 seconds, this may affect playback experience.
    maxMaxBufferLength: 3, 
    };
    setTimeout(() => {
    const src = player.src
    player.startLoading();
    //  player.play();
}, 2000);
  }
});


  player.addEventListener('hls-error', (event) => {
    const provider = event.detail;
    const src = player.src
    player.src = src      
  });
});


//console.log(player)


</script>
 
<style scoped>  

</style>
