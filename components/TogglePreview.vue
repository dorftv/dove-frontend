<template>
  <div class="flex items-center gap-2">
    <button @click="inputPreview = !inputPreview" class="toggle-btn" :class="{ disabled: !inputPreview }" title="Toggle input previews">
      <Icon :name="inputPreview ? 'ph:eye' : 'ph:eye-slash'" size="14px" />
      <span>Inputs</span>
    </button>
    <button @click="audioMeters = !audioMeters" class="toggle-btn" :class="{ disabled: !audioMeters }" title="Toggle audio meters">
      <Icon name="ph:equalizer" size="14px" />
    </button>
  </div>
</template>

<script setup>
const { inputPreview, audioMeters } = useUserState();
</script>

<style scoped>
@reference "tailwindcss";

.toggle-btn {
  @apply flex items-center gap-1 text-xs cursor-pointer select-none
         text-gray-600 dark:text-gray-300 transition-colors duration-150
         hover:text-gray-900 dark:hover:text-white;
}

.toggle-btn.disabled {
  @apply text-gray-400 dark:text-gray-500 line-through;
}
</style>
