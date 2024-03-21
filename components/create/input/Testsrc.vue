
<template>
    <div>
        <div class="p-4">
          <h2></h2>
            <CreateResolutions />                    

            <div>         
             <URange v-model="state.pattern" name="range" :min="0" :max="28" :step="1" />
              Pattern: {{ state.pattern }}
            </div>
            <div>
              <URange v-model="state.wave" name="range" :min="0" :max="12" :step="1" />
              Wave: {{ state.wave }}
            </div>
          
          <UFormGroup label="Frequency">
            <UInput v-model="state.freq" size="md" placeholder="440.0" />
          </UFormGroup>
          
        </div>
    </div>
  </template>

<script setup>
const emit = defineEmits(['update:formData']);
const { getResolutionDimensions } = useDoveConfig();

const state = reactive({
  type: 'testsrc',
  loop: false,
  pattern: 0,
  wave: 1,
  freq: 440.1,
  width: null,
  height: null,
});

watchEffect(() => {
  const resolution = state.defaultResolution; // or wherever you store the current resolution
  const dimensions = getResolutionDimensions(resolution);
  if (dimensions) {
    state.width = dimensions.width;
    state.height = dimensions.height;
  }

  emit('update:formData', state);
});


const updateResolution = ({ width, height }) => {
  state.width = width;
  state.height = height;
};


</script>
