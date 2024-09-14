<template>
  <div :class="input.state.toLowerCase()">
    <div>{{ positionFormatted }}{{ durationFormatted }}</div>
    <Slider
      v-if="input.duration"
      :modelValue="position"
      @update:modelValue="handlePositionChange"
      :step="1"
      :min="0"
      :max="input.duration"
      class="mb-2"
    />
    <Icon name="uil:stop-circle" color="black" size="24px" @click="submitStop"/>
    <Icon name="uil:pause-circle" color="black" size="24px"  @click="submitPause" />
    <Icon name="uil:play-circle" color="black" size="24px" @click="submitPlay"/>

     {{ input.state }}
     <!-- toggle preview -->
    <Icon name="uil:video-slash" color="black" size="24px"  v-if="!inputPreview && inputEnabled" @click="$emit('enablePreview', false)"/>
    <Icon name="uil:video" color="black" size="24px"  v-if="!inputPreview && !inputEnabled"  @click="$emit('enablePreview', true)"/>
    <Icon name="icomoon-free:loop" color="black" size="24px"  v-if="input.loop" />

    <div>
    <div class="felx justify-between">
    <Slider  :modelValue="volume" @update:modelValue="handleVolumeChange" name="range" :min="0" :max="100"   />{{  volume  }}

    </div>
    </div>
  </div>
</template>
<script setup>



const props = defineProps({
  input: Object,
  inputEnabled: Boolean,
});

const { inputPreview } = useUserState();

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
} = useInputControls(props);

function enablePreview() {
  inputEnabled = !prop.inputEnabled;
}

</script>

<style scoped>
.playing {
  background-color: green;
}

.buffering {
  background-color: orange;
}

.pending {
  background-color: gray;
}

.paused {
  background-color: orange;
}

.eos {
  background-color: red;
}
</style>
