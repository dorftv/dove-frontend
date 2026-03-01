<template>
  <div v-if="programMixer">
    <div v-for="overlay in programMixer.sources" :key="overlay.src">
      <div v-if="overlay.index >= 2" class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded px-2 py-1 mt-1 text-xs flex items-center gap-1.5">
        <template v-if="getInputInfo(overlay.src)">
          <span :class="stateBadgeClass(getInputInfo(overlay.src).state)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none shrink-0">
            <Icon :name="stateIcon(getInputInfo(overlay.src).state)" size="10px" />
            {{ getInputInfo(overlay.src).state }}
          </span>
          <span class="truncate text-gray-800 dark:text-gray-300">{{ getInputInfo(overlay.src).name }}</span>
          <span class="text-[10px] text-gray-500">{{ getInputInfo(overlay.src).type }}</span>
        </template>
        <template v-else>
          <span class="text-gray-500 italic">Empty ({{ overlay.src }})</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const { programMixer, getInputInfo } = useProgram();

const stateIcon = (state) => {
  const icons = {
    PLAYING: 'ph:play-circle',
    PAUSED: 'ph:pause-circle',
    NULL: 'ph:stop-circle',
    READY: 'ph:circle-dashed',
    EOS: 'ph:stop',
    ERROR: 'ph:warning-circle',
    BUFFERING: 'ph:spinner',
  };
  return icons[state] || 'ph:circle';
};

const stateBadgeClass = (state) => {
  const classes = {
    PLAYING: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-400',
    PAUSED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-400',
    NULL: 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    READY: 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    EOS: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-400',
    ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-400',
    BUFFERING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-400',
  };
  return classes[state] || 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
};
</script>
