<template>
  <div class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-2 py-1.5 flex items-center gap-1.5 text-xs">
    <!-- Name -->
    <span
      v-tooltip="scene.uid"
      class="truncate cursor-help text-sm text-gray-800 dark:text-gray-200 font-medium"
    >
      {{ scene.name }}
    </span>

    <!-- Spacer -->
    <div class="flex-grow" />

    <!-- Actions -->
    <Popover ref="op" appendTo="body">
      <pre class="text-xs text-gray-700 dark:text-gray-300">{{ mixerDetails }}</pre>
    </Popover>
    <button @click="op.toggle($event)" class="scene-btn" title="Details" aria-label="Show details">
      <i class="pi pi-info-circle text-[11px]"></i>
    </button>
    <button
      v-if="!scene.locked || isUnlocked"
      @click="submitRemove"
      :disabled="deleting"
      class="scene-btn text-red-400 hover:text-red-300 disabled:opacity-50"
      title="Delete"
      aria-label="Delete scene"
    >
      <i :class="deleting ? 'pi pi-spinner pi-spin' : 'pi pi-trash'" class="text-[11px]"></i>
    </button>
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

<style scoped>
.scene-btn {
  @apply flex items-center justify-center w-5 h-5 rounded
         text-gray-500 dark:text-gray-400
         hover:bg-gray-300 dark:hover:bg-gray-700
         hover:text-gray-900 dark:hover:text-white
         transition-colors duration-100 cursor-pointer;
}
</style>
