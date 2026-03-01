<template>
  <div class="bg-gray-900 text-gray-300 rounded-t-lg px-2 py-1.5 flex items-center gap-1.5 text-xs">
    <!-- Name -->
    <span
      v-tooltip="input.name + ' (' + input.type + ')'"
      class="truncate cursor-help text-sm text-gray-200 font-medium"
    >
      {{ input.name }}
    </span>
    <span class="text-[10px] text-gray-500">{{ input.type }}</span>

    <!-- Spacer -->
    <div class="flex-grow" />

    <!-- Actions -->
    <Popover ref="inputInfoPopover" appendTo="body">
      <pre class="text-xs text-gray-700 dark:text-gray-300">{{ inputDetails }}</pre>
    </Popover>
    <button @click="inputInfoPopover.toggle($event)" class="header-btn" title="Details">
      <i class="pi pi-info-circle text-[11px]"></i>
    </button>
    <button
      v-if="!input.locked || isUnlocked"
      @click="submitRemoveInput"
      :disabled="deleting"
      class="header-btn text-red-400 hover:text-red-300 disabled:opacity-50"
      title="Delete"
    >
      <i :class="deleting ? 'pi pi-spinner pi-spin' : 'pi pi-trash'" class="text-[11px]"></i>
    </button>
    <button
      v-if="!inputPreview && inputEnabled"
      @click="$emit('enablePreview', toggleInputPreview())"
      class="header-btn"
      title="Disable preview"
    >
      <Icon name="uil:video-slash" size="14px" />
    </button>
    <button
      v-if="!inputPreview && !inputEnabled"
      @click="$emit('enablePreview', toggleInputPreview())"
      class="header-btn"
      title="Enable preview"
    >
      <Icon name="uil:video" size="14px" />
    </button>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()

const props = defineProps({
  input: Object,
  inputEnabled: Boolean
});

const {
  inputInfoPopover,
  inputDetails,
  inputPreview,
  submitRemoveInput,
  deleting,
  toggleInputPreview
} = useInputControls(props);
</script>

<style scoped>
.header-btn {
  @apply flex items-center justify-center w-5 h-5 rounded
         text-gray-400 hover:bg-gray-700 hover:text-white
         transition-colors duration-100 cursor-pointer;
}
</style>
