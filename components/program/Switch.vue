<template>
  <div v-if="selectedScene" class="box-border p-4 border-4">
    <div class="mb-4">
      Active Scene: <span v-if="activeScene" class="text-red-500 font-bold">{{ activeScene.name }}</span>
    </div>

    <Dropdown v-model="switchmode" :options="switchemodes" optionLabel="name" class="w-full mb-4" />

    <div class="flex flex-col items-center">
      <div v-if="switchmode === 'Crossfade'" class="mb-4">
        Nothing to see yet. Use Cut
        <!--
        <div class="flex items-center">
          <Button icon="pi pi-minus" @click="duration--" class="p-button-text" />
          <InputNumber v-model="duration" :min="0" :max="10" class="w-24 mx-2" />
          <Button icon="pi pi-plus" @click="duration++" class="p-button-text" />
        </div>
        -->
      </div>
      <Button @click="cut" class="p-button-lg">
        Switch to {{ selectedScene.name }}
      </Button>
    </div>
  </div>
</template>

<script setup>

const switchemodes = [
  { name: 'Cut', value: 'Cut' },
  { name: 'Crossfade', value: 'Crossfade' }
];
const switchmode = ref(switchemodes[0]);
const duration = ref(2);

const { activeSceneUid, activeScene, selectedScene } = useActiveScene();

const cut = async () => {
  if (!selectedScene.value) {
    return;
  }

  try {
    const response = await fetch('/api/mixer/cut_program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        src: selectedScene.value.uid
      })
    });

    if (!response.ok) {
      throw new Error('Server responded with an error');
    }

    const data = await response.json();
    if (data && data.src) {
      // @TODO: Add Toast later
    } else {
      // @TODO: Add Toast later
    }
  } catch (error) {
      // @TODO: Add Toast later
  }
};
</script>
