<template>
  <div class="audio-player group">
    <video ref="videoEl" autoplay muted playsinline class="hidden"></video>

    <div class="meters">
      <div class="meter-channel">
        <span class="meter-label">L</span>
        <div class="meter-track">
          <div class="meter-fill" :style="{ width: left + '%' }" />
        </div>
        <span class="meter-db">{{ leftDb }}</span>
      </div>
      <div class="meter-channel">
        <span class="meter-label">R</span>
        <div class="meter-track">
          <div class="meter-fill" :style="{ width: right + '%' }" />
        </div>
        <span class="meter-db">{{ rightDb }}</span>
      </div>
    </div>

    <button
      @click="toggleMute"
      class="mute-btn sm:opacity-0 sm:group-hover:opacity-100"
      :title="isMuted ? 'Unmute' : 'Mute'"
    >
      <Icon :name="isMuted ? 'ph:speaker-x' : 'ph:speaker-high'" size="16px" />
    </button>
  </div>
</template>

<script setup>
const props = defineProps({ uid: String });

const { videoEl, isMuted, toggleMute } = useAudioOnlyPlayer(props);
const { left, right, leftDb, rightDb } = useAudioLevels(() => props.uid);
</script>

<style scoped>
@reference "tailwindcss";

.audio-player {
  @apply flex items-center gap-3 px-3 py-4 bg-gray-900/80 relative;
  aspect-ratio: 16/9;
}
.meters {
  @apply flex-grow flex flex-col gap-1.5 justify-center;
}
.meter-channel {
  @apply flex items-center gap-2;
}
.meter-label {
  @apply text-[10px] font-mono text-gray-500 w-3 shrink-0;
}
.meter-track {
  @apply flex-grow h-3 bg-gray-800 rounded-sm overflow-hidden;
}
.meter-fill {
  @apply h-full rounded-sm transition-[width] duration-100;
  background: linear-gradient(to right, #22c55e 0%, #22c55e 65%, #eab308 65%, #eab308 85%, #ef4444 85%, #ef4444 100%);
}
.meter-db {
  @apply text-[10px] font-mono text-gray-500 w-8 text-right tabular-nums shrink-0;
}
.mute-btn {
  @apply absolute bottom-1 right-1 flex items-center justify-center w-7 h-7 rounded
         bg-black/60 text-white/80 hover:text-white
         cursor-pointer transition-all;
}
</style>
