<template>
  <div class="flex items-center w-full">
    <div class="flex-grow mr-2 overflow-hidden">
      <span
        v-tooltip="scene.uid"
        :id="'sceneName_' + scene.uid"
        class="truncate inline-block max-w-full cursor-help"
      >
        {{ scene.name }}
      </span>
    </div>
    <div class="flex-shrink-0 flex items-center">
      <OverlayPanel ref="op" appendTo="body">
        <pre>{{ mixerDetails }}</pre>
      </OverlayPanel>
      <button
        @click="op.toggle($event)"
        class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 mr-2"
      >
        <i class="pi pi-info-circle text-sm"></i>
      </button>
      <button
        v-if="!scene.locked"
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
  scene: Object,
  inputEnabled: Boolean
});

const op = ref();

const mixerDetails = computed(() => JSON.stringify(props.scene, null, 2));

const previewEnabled = useCookie('enablePreview');

function enablePreview() {
  props.inputEnabled = !props.inputEnabled;
}

const submitRemove = async () => {
  try {
    const response = await fetch('/api/mixers', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: props.scene.uid,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove scene');
    }

    // @TODO: add Toast later
  } catch (error) {
    // @TODO: add Toast later
  }
};
</script>
