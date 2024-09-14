<template>
  <div class="flex flex-col">
    <SceneHeader :scene="scene" />
    <div v-if="mixerPreview || mixerEnabled" class="w-full aspect-video">
      <VideoPlayer :uid="scene.uid" class="w-full h-full" />
    </div>
    <Button v-if="!scene.src_locked"
            icon="pi pi-plus"
            class="p-button-text"
            @click="addSlot" />
    <div v-for="source in scene.sources" :key="source.sink">
      <SceneInputs :source="source" :scene="scene" />
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  scene: Object,
  inputs: Object,
  active: Boolean
});

const { mixerPreview } = useUserState();
const mixerEnabled = ref(false);

const addSlot = async () => {
  try {
    const response = await fetch('/api/mixer/add_slot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: props.scene.uid,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to add slot');
    }
    // @TODO: add Toast later
  } catch (error) {
    // @TODO: add Toast later
  }
};


</script>
