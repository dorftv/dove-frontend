<template>
  <div class="flex items-center w-full">
    <div class="flex-grow mr-2 overflow-hidden">
      <span
        v-tooltip="scene.uid"
        :id="'sceneName_' + scene.uid"
        class="truncate inline-block max-w-full cursor-help text-gray-800 dark:text-gray-200"
      >
        {{ scene.name }}
      </span>
    </div>
    <div class="flex-shrink-0 flex items-center">
      <Popover ref="op" appendTo="body">
        <pre class="text-xs text-gray-700 dark:text-gray-300">{{ mixerDetails }}</pre>
      </Popover>
      <button
        @click="op.toggle($event)"
        class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 mr-2"
      >
        <i class="pi pi-info-circle text-sm"></i>
      </button>
      <button
        v-if="!scene.locked || isUnlocked"
        @click="submitRemove"
        :disabled="deleting"
        class="flex items-center justify-center w-7 h-7 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 disabled:opacity-50"
      >
        <i :class="deleting ? 'pi pi-spinner pi-spin' : 'pi pi-trash'" class="text-sm"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()

const props = defineProps({
  scene: Object,
});

const op = ref();
const mixerDetails = computed(() => JSON.stringify(props.scene, null, 2));
const confirm = useConfirm();
const notify = useNotify();
const deleting = ref(false);

const doRemove = async () => {
  deleting.value = true;
  try {
    await $fetch('/api/mixers', {
      method: 'DELETE',
      body: { uid: props.scene.uid },
    });
  } catch (error) {
    notify.error('Failed to remove scene');
  } finally {
    deleting.value = false;
  }
};

const submitRemove = () => {
  confirm.require({
    message: `Delete scene "${props.scene.name}"?`,
    header: 'Confirm',
    acceptClass: 'p-button-danger',
    accept: doRemove,
  });
};
</script>
