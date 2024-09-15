<template>
  <div v-if="programMixer">
    <div v-for="overlay in programMixer.sources" :key="overlay.src">
      <div v-if="overlay.index >= 2" class="flex flex-col" :class="getInputInfo(overlay.src).state.toLowerCase()">
        {{ getInputInfo(overlay.src).name }} ({{ getInputInfo(overlay.src).type }})
      </div>
    </div>
  </div>
</template>

<script setup>

const { programMixer, inputs  } = useEntities()

const getInputInfo = (uid) => {
  const matchingInput = inputs.value.find(input => input.uid === uid)
  return matchingInput ? { name: matchingInput.name, type: matchingInput.type, state: matchingInput.state } : null
}
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