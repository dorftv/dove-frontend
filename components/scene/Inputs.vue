<template>
  <div class="w-full flex flex-col text-sm">
    <div class="flex items-center space-x-4 py-0.5">
      <div class="w-1/3 truncate">{{ source.name }}</div>
      <div class="w-1/3 truncate">{{(inputs.find(input => input.uid === src) || {}).name }}</div>
      <div class="w-1/3 flex justify-end space-x-1">
        <Button v-if="!mute && !scene.src_locked" icon="pi pi-volume-up" @click="handleChange('mute', true)" class="p-button-text p-button-sm p-0" />
        <Button v-if="mute && !scene.src_locked" icon="pi pi-volume-off" @click="handleChange('mute', false)" class="p-button-text p-button-sm p-0" />
        <Button v-if="!source.locked && !scene.src_locked" icon="pi pi-cog" @click="open = !open" class="p-button-text p-button-sm p-0" />
        <Button v-if="source.locked || scene.src_locked" icon="pi pi-lock" class="p-button-text p-button-sm p-button-disabled p-0" disabled />
      </div>
    </div>
    <div v-if="open" class="mt-1">
      <Button label="remove Slot"
              icon="pi pi-minus-circle"
              @click="removeSlot"
              class="p-button-text p-button-sm text-xs py-0 px-2 mb-1 w-full justify-start"
      />
      <div v-for="(value, key) in { src, alpha, width, height, xpos, ypos, volume }" :key="key" class="flex items-center mb-1">
        <div v-if="getMax(key)" class="flex w-full">
          <span class="w-16 text-xs">{{ key }}</span>
          <Slider
            class="flex-grow mx-2"
            :modelValue="value"
            @update:modelValue="handleChange(key, $event)"
            :step="1"
            :min="0"
            :max="getMax(key)"
          />
          <span class="w-16 text-right text-xs">{{ value }}/{{ getMax(key) }}</span>
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


<style scoped>
.p-button.p-button-sm {
  width: 1.5rem;
  height: 1.5rem;
}
.p-button.p-button-sm.w-full {
  width: 100%;
  height: auto;
}
</style>