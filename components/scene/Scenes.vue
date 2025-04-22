<template>
  <div class="flex flex-col" v-if="scene">
    <SceneHeader :scene="scene" />
    <div v-if="mixerPreview || mixerEnabled" class="w-full aspect-video">
      <VideoPlayerMain :uid="scene.uid" class="w-full h-full" />
    </div>
    <div class="flex justify-start mt-2">
      <Button
        v-if="!scene.src_locked || isUnlocked"
        label="Add Slot"
        icon="pi pi-plus"
        class="p-button-text p-button-sm text-xs py-1 px-2"
        @click="addSlot"
      />
    </div>
    <div v-for="source in [...scene.sources].reverse()" :key="source.sink">
        <SceneInputs :source="source" :scene="scene" />
    </div>
  </div>
</template>


<script setup>

const { isUnlocked } = useLocked()

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
