<template>
  <div class="flex items-center gap-3">
    <label class="toggle-label" :class="{ active: inputPreview }">
      <Icon :name="inputPreview ? 'ph:eye' : 'ph:eye-slash'" size="14px" />
      <span>Inputs</span>
      <USwitch v-model="inputPreview" size="xs" />
    </label>
    <label class="toggle-label" :class="{ active: mixerPreview }">
      <Icon :name="mixerPreview ? 'ph:eye' : 'ph:eye-slash'" size="14px" />
      <span>Mixer</span>
      <USwitch v-model="mixerPreview" size="xs" />
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
@reference "tailwindcss";

.toggle-label {
  @apply flex items-center gap-1.5 text-xs cursor-pointer select-none
         text-gray-400 dark:text-gray-500 transition-colors duration-150;
}

.toggle-label.active {
  @apply text-gray-600 dark:text-gray-300;
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
