<template>
  <!-- A playlist whose next list cannot be fetched plays the same clips again: say so everywhere -->
  <UPopover v-if="failing.length">
    <button class="flex items-center gap-1 px-2 h-7 rounded text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50" aria-label="Playlist fetch failing">
      <Icon name="ph:warning" size="14px" />
      <span class="hidden sm:inline">Playlist fetch failing</span>
    </button>
    <template #content>
      <div class="p-3 text-xs space-y-2 max-w-xs">
        <p class="text-gray-600 dark:text-gray-300">The next list could not be fetched; these playlists play their clips again until it can.</p>
        <div v-for="input in failing" :key="input.uid">
          <div class="font-medium text-gray-800 dark:text-gray-100">{{ input.name }}</div>
          <div class="text-gray-500 dark:text-gray-400">since {{ clock(input.next_error.since) }}</div>
          <div class="text-gray-500 dark:text-gray-400 break-words">{{ input.next_error.error }}</div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup>
const { inputs } = useEntities();
const failing = computed(() => inputs.value.filter((input) => input.next_error));
const clock = (seconds) => new Date(seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
</script>
