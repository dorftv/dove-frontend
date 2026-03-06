<template>
  <div class="flex items-center gap-3">
    <label class="toggle-label" :class="{ active: inputPreview }">
      <Icon :name="inputPreview ? 'ph:eye' : 'ph:eye-slash'" size="14px" />
      <span>Inputs</span>
      <ToggleSwitch v-model="inputPreview" class="toggle-sm" />
    </label>
    <label class="toggle-label" :class="{ active: mixerPreview }">
      <Icon :name="mixerPreview ? 'ph:eye' : 'ph:eye-slash'" size="14px" />
      <span>Mixer</span>
      <ToggleSwitch v-model="mixerPreview" class="toggle-sm" />
    </label>
    <button @click="audioMeters = !audioMeters" class="meter-btn" :class="{ active: audioMeters }" title="Audio Meters">
      <Icon name="ph:equalizer" size="14px" />
    </button>
  </div>
</template>

<script setup>
const { inputPreview, mixerPreview, audioMeters } = useUserState();
</script>

<style scoped>
.toggle-label {
  @apply flex items-center gap-1.5 text-xs cursor-pointer select-none
         text-gray-400 dark:text-gray-500 transition-colors duration-150;
}

.toggle-label.active {
  @apply text-gray-600 dark:text-gray-300;
}

.toggle-sm :deep(.p-toggleswitch) {
  transform: scale(0.75);
}

.meter-btn {
  @apply flex items-center justify-center w-6 h-6 rounded cursor-pointer
         text-gray-400 dark:text-gray-500 opacity-50
         hover:text-gray-600 dark:hover:text-gray-300
         transition-all duration-150;
}

.meter-btn.active {
  @apply text-gray-600 dark:text-gray-300 opacity-100;
}
</style>
