<template>
  <div :class="input.state.toLowerCase() + ' p-4 rounded-lg'">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-4">
        <div>{{ positionFormatted }} / {{ durationFormatted }}</div>
        <div>{{ input.state }}</div>
        <div v-if="input.hasOwnProperty('loop')" class="relative cursor-pointer" @click="submitLoop(!input.loop)">
          <Icon name="icomoon-free:loop" color="black" size="16px" />
          <div v-if="!input.loop" class="strikethrough"></div>
        </div>
      </div>
    </div>

    <Slider
      v-if="input.duration && input.show_controls"
      :model-value="position"
      @update:model-value="handlePositionChange"
      :step="1"
      :min="0"
      :max="input.duration"
      class="w-full mb-2"
    />

    <div class="flex items-center justify-between">
      <div v-if="input.show_controls" class="flex items-center space-x-4">
        <Icon name="uil:stop-circle" color="black" size="24px" @click="submitStop" class="cursor-pointer" />
        <Icon name="uil:play-circle" color="black" size="24px" @click="submitPlay" class="cursor-pointer" />
        <Icon name="uil:pause-circle" color="black" size="24px" @click="submitPause" class="cursor-pointer" />
      </div>

      <div class="flex items-center text-lg text-black">
        <Knob
          :model-value="volume"
          @update:model-value="handleVolumeChange"
          name="volume"
          :min="0"
          :max="100"
          value-template="{value}"
          :size="40"
          class="text-black text-lg"
        />
      </div>
    </div>
  </div>
</template>


<script setup>

const props = defineProps({
  input: Object,
});

const {
  volume,
  position,
  durationFormatted,
  positionFormatted,
  handleVolumeChange,
  handlePositionChange,
  submitPlay,
  submitPause,
  submitStop,
  submitLoop,
} = useInputControls(props);



</script>

<style scoped>
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

/* Strikethrough style */
.strikethrough {
  position: absolute;
  top: 40%;
  left: 0;
  right: 0;
  height: 3px;
  background: rgb(0, 0, 0); /* Change color as needed */
  transform: rotate(-45deg);
}
</style>
