<template>
  <div v-if="programMixer" class="border-t border-gray-200 dark:border-gray-700">
    <template v-for="(overlay, i) in programMixer.sources" :key="overlay.src">
      <div
        v-if="overlay.index >= 2"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
        :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-800/30'"
      >
        <template v-if="getInputInfo(overlay.src)">
          <span :class="stateBadgeClass(getInputInfo(overlay.src).state)" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide leading-none shrink-0">
            <Icon :name="stateIcon(getInputInfo(overlay.src).state)" size="10px" />
            {{ getInputInfo(overlay.src).state }}
          </span>
          <span class="truncate text-gray-800 dark:text-gray-200">{{ getInputInfo(overlay.src).name }}</span>
          <span class="text-[10px] text-gray-500">{{ getInputInfo(overlay.src).type }}</span>
          <div class="flex-grow" />
          <DetailPopover :entity="getFullInput(overlay.src)" />
        </template>
        <template v-else>
          <span class="text-gray-400 dark:text-gray-500 italic">Empty</span>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
const { programMixer, getInputInfo } = useProgram();
const { inputs } = useEntities();
const { stateIcon, stateBadgeClass } = useStateClass();

const getFullInput = (uid) => inputs.value.find(input => input.uid === uid);
</script>
