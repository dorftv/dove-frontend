<script setup>
defineProps({
  message: { type: String, default: 'Are you sure?' },
  header: { type: String, default: 'Confirm' },
})
const emit = defineEmits(['close'])
</script>

<template>
  <UModal :title="header">
    <template #body>
      <p class="text-sm text-gray-600 dark:text-gray-300">{{ message }}</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="outline" @click="emit('close', false)" />
        <UButton label="Yes" color="error" @click="emit('close', true)" />
      </div>
    </template>
  </UModal>
</template>
