<template>
  <UPopover v-model:open="open" :content="{ collisionPadding: 8 }">
    <button
      class="icon-btn"
      :class="{ 'text-blue-500 dark:text-blue-400': scene.epg_src || scene.epg_title }"
      title="Programme guide"
      aria-label="Programme guide"
    >
      <Icon name="ph:television-simple" size="11px" />
    </button>
    <template #content>
      <form @submit.prevent="save" class="p-3 w-72 space-y-2">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          What an SRT output with a channel name sends as its programme guide while it shows this scene.
        </p>
        <div>
          <label :for="`epg-src-${scene.uid}`" class="block font-bold text-xs mb-1 text-gray-700 dark:text-gray-300">Guide source</label>
          <UInput
            v-model="src"
            :id="`epg-src-${scene.uid}`"
            placeholder="playlist or https://…"
            class="w-full"
            size="sm"
          />
        </div>
        <div>
          <label :for="`epg-title-${scene.uid}`" class="block font-bold text-xs mb-1 text-gray-700 dark:text-gray-300">Guide title</label>
          <UInput
            v-model="title"
            :id="`epg-title-${scene.uid}`"
            placeholder="Shown when the source knows nothing"
            class="w-full"
            size="sm"
          />
        </div>
        <div class="flex justify-end space-x-2 pt-1">
          <UButton type="button" label="Cancel" variant="outline" size="xs" @click="open = false" />
          <UButton type="submit" label="Save" color="primary" size="xs" :loading="saving" />
        </div>
      </form>
    </template>
  </UPopover>
</template>

<script setup>
// Where a scene's programme guide comes from: the admins' to set, the backend refuses others
const props = defineProps({
  scene: Object,
});

const notify = useNotify();
const open = ref(false);
const saving = ref(false);
const src = ref('');
const title = ref('');

watch(open, (isOpen) => {
  if (isOpen) {
    src.value = props.scene.epg_src ?? '';
    title.value = props.scene.epg_title ?? '';
  }
});

const save = async () => {
  saving.value = true;
  try {
    // An empty field clears it
    const body = { epg_src: src.value.trim() || null, epg_title: title.value.trim() || null };
    await useApiFetch(`/api/v2/scenes/${props.scene.uid}`, { method: 'PATCH', body });
    open.value = false;
  } catch (error) {
    const detail = error?.data?.detail;
    notify.error(typeof detail === 'string' ? detail : 'Failed to save the programme guide');
  } finally {
    saving.value = false;
  }
};
</script>
