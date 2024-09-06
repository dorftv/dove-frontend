<template>
  <div class="flex flex-col">
    <div class="flex justify-between">
      {{ source.name }}
      <USelect
        v-if="!source.src_locked && inputs?.length"
        :key="source.src"
        @update:modelValue="handleChange('src', $event)"
        padding=false
        :modelValue="src"
        :id="src"
        :options="[{name: 'None', id: 'None'}, ...inputs.map(input => ({name: input.name, id: input.uid}))]"
        option-attribute="name"
        value-attribute="id"
        size="md"
      />

      <div v-if="source.src_locked">
        {{(inputs.find(input => input.uid === src) || {}).name }}
      </div>

      <UButton v-if="!mute && !scene.src_locked" color="white" trailing-icon="heroicons-speaker-wave" @click="handleChange('mute', true)" />
      <UButton v-if="mute && !scene.src_locked" color="white" trailing-icon="heroicons-speaker-x-mark" @click="handleChange('mute', false)" />

      <UButton v-if="!source.locked && !scene.src_locked" color="white"  trailing-icon="heroicons-adjustments-horizontal" @click="open = !open"/>
      <UButton v-if="source.locked || scene.src_locked" color="white"  trailing-icon="heroicons-lock-closed" />
    </div>
    <div v-if="open" class="container">
      <UButton color="white"  trailing-icon="heroicons-minus-circle" @click="removeSlot"/>

      <div v-for="(value, key) in { src, alpha, width, height, xpos, ypos, volume }" :key="key" class="d-flex">
        <div v-if="getMax(key)" class="flex">
          <div class="flex">{{ key }}</div>
          <URange
            class="flex"
            :modelValue="value"
            @update:modelValue="handleChange(key, $event)"
            name="range"
            :min="0"
            :max="getMax(key)"
          />
          <div class="flex no-wrap">{{ value }}/{{ getMax(key) }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSceneSources } from '@/composables/useSceneSources';

const props = defineProps({
  source: Object,
  scene: Object,
});

const { inputs, removeSlot, handleChange, getMax, src, alpha, width, height, xpos, ypos, volume, mute } = useSceneSources(props.scene, props.source);

const open = ref(false);

// Watch for changes in source.src and update src accordingly
watch(() => props.source.src, (newSrc) => {
  if (newSrc !== src.value) {
    src.value = newSrc;
  }
});
</script>

<style>
</style>