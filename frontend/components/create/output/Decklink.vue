<template>
    <div>
          <h2></h2>    
      <UFormGroup label="Device ID" required>
        <UInput v-model="state.device" placeholder="0"/>
      </UFormGroup>
      <UFormGroup label="Mode" required>
        <UInput v-model="state.mode" placeholder="41 ( PAL widescreen )."/>
      </UFormGroup>
      <UCheckbox v-model="state.interlaced" name="interlaced" label="Interlaced" />

      
</div>
</template>

<script setup>



import { reactive, watchEffect } from 'vue';

const emit = defineEmits(['update:formData']);

const state = reactive({
type: 'decklinksink',
device: '',
mode: '',
interlaced: false,
});

// Emit formData updates when the reactive state changes
watchEffect(() => {
emit('update:formData', state);
});



</script>
