<template>
  <div v-if="programMixer">
    <div v-for="overlay in programMixer.sources" :key="overlay.src">
      <div v-if="overlay.index >= 2" class="flex flex-col">
        <template v-if="getInputInfo(overlay.src)">
          <div :class="[stateClass(getInputInfo(overlay.src).state), 'px-2 py-1 rounded text-sm']">
            {{ getInputInfo(overlay.src).name }} ({{ getInputInfo(overlay.src).type }})
          </div>
        </template>
        <template v-else>
          <div class="text-sm text-gray-500 dark:text-gray-400">Unknown Overlay ({{ overlay.src }})</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const { programMixer, getInputInfo } = useProgram();
const { stateClass } = useStateClass();
</script>
