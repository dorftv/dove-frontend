<template>
      <div>
            <h2></h2>    
        <UFormGroup label="Uri ( for files, SRT, RTMP, HLS, ...)" required>
          <UInput v-model="state.uri" />
        </UFormGroup>
   
        <UCheckbox v-model="state.loop" name="loop" label="Loop (content replays once finished)" />
  </div>
</template>

<script setup>



import { reactive, watchEffect } from 'vue';

const emit = defineEmits(['update:formData']);

const state = reactive({
  type: 'urisrc',
  uri: '',
  loop: false
});

// Emit formData updates when the reactive state changes
watchEffect(() => {
  emit('update:formData', state);
});



</script>
