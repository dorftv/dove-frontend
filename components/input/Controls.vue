<template>
  <div :class="[stateClass(input.state), 'p-4 rounded-lg']">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-4">
        <div class="text-sm">{{ positionFormatted }} {{ durationFormatted }}</div>
        <div class="text-xs font-medium">{{ input.state }}</div>
        <div v-if="input.hasOwnProperty('loop')" class="relative cursor-pointer" @click="submitLoop(!input.loop)">
          <Icon name="icomoon-free:loop" class="text-gray-700 dark:text-gray-300" size="16px" />
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
        <Icon name="uil:stop-circle" class="text-gray-700 dark:text-gray-300 cursor-pointer" size="24px" @click="submitStop" />
        <Icon name="uil:play-circle" class="text-gray-700 dark:text-gray-300 cursor-pointer" size="24px" @click="submitPlay" />
        <Icon name="uil:pause-circle" class="text-gray-700 dark:text-gray-300 cursor-pointer" size="24px" @click="submitPause" />
      </div>

      <div class="flex items-center">
        <Knob
          :model-value="volume"
          @update:model-value="handleVolumeChange"
          name="volume"
          :min="0"
          :max="100"
          value-template="{value}"
          :size="40"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  input: Object,
});

const { stateClass } = useStateClass();

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
.strikethrough {
  position: absolute;
  top: 40%;
  left: 0;
  right: 0;
  height: 3px;
  @apply bg-gray-700 dark:bg-gray-300;
  transform: rotate(-45deg);
}
</style>
