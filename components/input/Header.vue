<template>
  <div class="flex items-center w-full">
    <div class="flex-grow mr-2 overflow-hidden">
      <span
        v-tooltip="input.name + ' (' + input.type + ')'"
        :id="'inputName_' + input.uid"
        class="truncate inline-block max-w-full cursor-help"
      >
        {{ input.name }}
      </span>
    </div>
    <div class="flex-shrink-0 flex items-center">
      <OverlayPanel ref="op" appendTo="body">
        <pre>{{ inputDetails }}</pre>
      </OverlayPanel>
      <button
        @click="op.toggle($event)"
        class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 mr-2"
      >
        <i class="pi pi-info-circle text-sm"></i>
      </button>
      <button
        v-if="!input.locked"
        @click="submitRemove"
        class="flex items-center justify-center w-7 h-7 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200"
      >
        <i class="pi pi-trash text-sm"></i>
      </button>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  input: Object,
  inputEnabled: Boolean
});

const op = ref();

const inputDetails = computed(() => JSON.stringify(props.input, null, 2));

const previewEnabled = useCookie('enablePreview');

function enablePreview() {
  props.inputEnabled = !props.inputEnabled;
}

const submitRemove = async () => {
  try {
    const response = await fetch('/api/inputs', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: props.input.uid,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove input');
    }
    // @TODO: add Toast Later
  } catch (error) {
    // @TODO: add Toast Later
  }
};
</script>

<style scoped>

</style>