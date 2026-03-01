<template>
  <div class="flex items-center w-full">
    <div class="flex-grow mr-2 overflow-hidden">
      <span
        v-tooltip="input.name + ' (' + input.type + ')'"
        :id="'inputName_' + input.uid"
        class="truncate inline-block max-w-full cursor-help text-gray-800 dark:text-gray-200"
      >
        {{ input.name }}
      </span>
    </div>
    <div class="flex-shrink-0 flex items-center">
      <Popover ref="inputInfoPopover" appendTo="body">
        <pre class="text-xs text-gray-700 dark:text-gray-300">{{ inputDetails }}</pre>
      </Popover>
      <button
        @click="inputInfoPopover.toggle($event)"
        class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 mr-2"
      >
        <i class="pi pi-info-circle text-sm"></i>
      </button>
      <button
        v-if="!input.locked || isUnlocked"
        @click="submitRemoveInput"
        class="flex items-center justify-center w-7 h-7 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
      >
        <i class="pi pi-trash text-sm"></i>
      </button>
      <Icon name="uil:video-slash" class="text-gray-700 dark:text-gray-300 cursor-pointer" size="24px" v-if="!inputPreview && inputEnabled" @click="$emit('enablePreview', toggleInputPreview())"/>
      <Icon name="uil:video" class="text-gray-700 dark:text-gray-300 cursor-pointer" size="24px" v-if="!inputPreview && !inputEnabled" @click="$emit('enablePreview', toggleInputPreview())"/>
    </div>
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
  toggleInputPreview
} = useInputControls(props);
</script>
