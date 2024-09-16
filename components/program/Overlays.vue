<template>
  <div v-if="programMixer">
    <div v-for="overlay in programMixer.sources" :key="overlay.src">
      <div v-if="overlay.index >= 2" class="flex flex-col">
        <template v-if="getInputInfo(overlay.src)">
          <div :class="getInputInfo(overlay.src).state.toLowerCase()">
            {{ getInputInfo(overlay.src).name }} ({{ getInputInfo(overlay.src).type }})
          </div>
        </template>
        <template v-else>
          <div>Unknown Overlay ({{ overlay.src }})</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>

const { programMixer, overlays, getInputInfo } = useProgram();


</script>

<style>
.ready {
  background-color: #f8f8f8;
  color: #333;
}

.playing {
  background-color: #e0ffe0;
  color: #333;
}

.paused {
  background-color: #ffebcc;
  color: #333;
}

.stopped {
  background-color: #fff0f0;
  color: #333;
}

</style>