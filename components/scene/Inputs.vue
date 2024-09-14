<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-center">
      {{ source.name }}
      <Select
        v-if="!source.src_locked && inputs?.length"
        :key="source.src"
        @change="handleChange('src', $event.value)"
        :modelValue="src"
        :options="[{name: 'None', id: 'None'}, ...inputs.map(input => ({name: input.name, id: input.uid}))]"
        optionLabel="name"
        optionValue="id"
        class="w-40"
      />

      <div v-if="source.src_locked">
        {{(inputs.find(input => input.uid === src) || {}).name }}
      </div>

      <Button v-if="!mute && !scene.src_locked" icon="pi pi-volume-up" @click="handleChange('mute', true)" class="p-button-text" />
      <Button v-if="mute && !scene.src_locked" icon="pi pi-volume-off" @click="handleChange('mute', false)" class="p-button-text" />

      <Button v-if="!source.locked && !scene.src_locked" icon="pi pi-cog" @click="open = !open" class="p-button-text" />
      <Button v-if="source.locked || scene.src_locked" icon="pi pi-lock" class="p-button-text p-button-disabled" disabled />
    </div>
    <div v-if="open" class="mt-2">
      <Button label="remove Slot"
        icon="pi pi-minus-circle"
        @click="removeSlot"
        class="p-button-text p-button-sm text-xs py-1 px-2"
      />
      <div v-for="(value, key) in { src, alpha, width, height, xpos, ypos, volume }" :key="key" class="flex items-center mb-2">
        <div v-if="getMax(key)" class="flex w-full">
          <span class="w-20">{{ key }}</span>
          <Slider
            class="flex-grow mx-2"
            :modelValue="value"
            @update:modelValue="handleChange(key, $event)"
            :step="1"
            :min=0
            :max="getMax(key)"
          />
          <span class="w-20 text-right">{{ value }}/{{ getMax(key) }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  source: Object,
  scene: Object,
});

const { inputs, removeSlot, handleChange, getMax, src, alpha, width, height, xpos, ypos, volume, mute } = useSceneSources(props.scene, props.source);

const open = ref(false);

watch(() => props.source.src, (newSrc) => {
  if (newSrc !== src.value) {
    src.value = newSrc;
  }
});
</script>

<style>
</style>