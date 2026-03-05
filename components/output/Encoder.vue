<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 mb-1 text-xs">
    <div class="flex items-center gap-1.5">
      <!-- State dot -->
      <span
        :title="encoder.state"
        class="w-2 h-2 rounded-full shrink-0"
        :class="stateDotClass(encoder.state)"
        role="status"
      />

      <!-- Type icon + element -->
      <Icon :name="encoder.type === 'video' ? 'ph:video-camera' : 'ph:speaker-high'" size="12px" class="text-gray-400 shrink-0" :title="encoder.type" />
      <span class="shrink-0 text-gray-800 dark:text-gray-200">{{ encoder.element }}</span>

      <!-- Resolution (video only) -->
      <span v-if="encoder.type === 'video' && encoder.width && encoder.height" class="text-[10px] text-gray-400 shrink-0">
        {{ encoder.width }}x{{ encoder.height }}
      </span>

      <!-- Options -->
      <span v-if="encoder.options" class="truncate text-[10px] text-gray-500 dark:text-gray-400" :title="encoder.options">
        {{ encoder.options }}
      </span>

      <!-- Spacer -->
      <div class="flex-grow" />

      <!-- Action buttons -->
      <DetailPopover :entity="encoder" />
      <button
        v-if="!encoder.locked || isUnlocked"
        @click="submitRemove"
        :disabled="deleting"
        class="icon-btn text-red-400 hover:text-red-300 disabled:opacity-50"
        title="Delete"
        aria-label="Delete encoder"
      >
        <i :class="deleting ? 'pi pi-spinner pi-spin' : 'pi pi-trash'" class="text-[11px]"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()
const { stateDotClass } = useStateClass()

const props = defineProps({
  encoder: Object,
});

const { deleting, submitRemove } = useDeleteEntity('encoder', () => props.encoder);
</script>
