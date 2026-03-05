<template>
  <div>
    <media-player v-if="uid" ref="mediaPlayer" :muted="mutedState[uid]" viewType="video" autoplay stream-type="live" load="custom" :title="`${uid}`" :src="`/preview/hls/${uid}/index.m3u8`" class="aspect-video">
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

const props = defineProps({
  uid: String,
  muted: String,
  entity: Object,
});

const { mediaPlayer, mutedState } = useHlsPlayer(props);
</script>
