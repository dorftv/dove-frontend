<template>
      <div class="flex flex-col">
      <div class="flex justify-between">
    {{ source.name }}
    <USelect 
  v-if="!source.src_locked && inputs?.length"
  :key="source.sink" 
  @update:modelValue="handleChange('src', $event)"  
  padding=false 
  :modelValue="source.src"
  :id="source.src" 
  :options="[{name: 'None', id: 'None'}, ...inputs.map(input => ({name: input.name, id: input.uid}))]"
  option-attribute="name" 
  value-attribute="id"
  size="md"
/>

  <div v-if="source.src_locked">
        {{(inputs.find(input => input.uid === source.src) || {}).name }}
  </div>

 <UButton v-if="!source.locked" color="white"  trailing-icon="i-heroicons-adjustments-horizontal" @click="open = !open"/>
 <UButton v-if="source.locked" color="white"  trailing-icon="i-heroicons-lock-closed" />
  </div>
  <div v-if="open" class="container ">
  <UButton color="white"  trailing-icon="i-heroicons-minus-circle" @click="removePad"/>
{{  source.alpha }}
{{  source.src }}
  <div v-for="(ref, key) in refs" :key="key" class="d-flex" >
    {{ refs.alpha  }}
  <div v-if="getMax(key)" class="flex">
    <div class="flex">{{  key }}</div>
      <URange 
        class="flex" 
        :modelValue="refs[key]" 
        @update:modelValue="handleChange(key, $event)" 
        name="range" 
        :min="0" 
        :max="getMax(key)" 
      />
    <div class="flex no-wrap">{{  ref }}/{{ getMax(key) }}</div>
  </div>
  </div>

</div>


</div>
</template>

<script setup>
const props = defineProps({
  source: Object,
  mixer: Object,
  inputs: Object
})

import { useEntities } from '@/composables/useEntities';
const { sendWebSocketMessage } = useEntities();

const removePad = async () => {
    const { data: responseData } = await useFetch('/api/mixer/remove_pad', {
        method: 'post',
        body: { 
          uid: props.mixer.uid,
          sink: { sink: props.source.sink }
        }
    })
}

const open = ref(false)

const refs = reactive({
  src: props.source.src,
  alpha: props.source.alpha * 100,
  width: props.source.width,
  height: props.source.height,
  xpos: props.source.xpos,
  ypos: props.source.ypos
});

const getMax = (type) => {
  const typeMaxMap = {
    'src': false,
    'alpha': 100,
    'width': props.mixer.width,
    'xpos': props.mixer.width,
    'height': props.mixer.height,
    'ypos': props.mixer.height
  };
  
  return typeMaxMap[type];
};

watchEffect(() => {
  refs.src = props.source.src;
  refs.alpha = props.source.alpha * 100;
  refs.width = props.source.width;
  refs.height = props.source.height;
  refs.xpos = props.source.xpos;
  refs.ypos = props.source.ypos;
});

const handleChange = (prop, newValue) => {
  if (prop === 'alpha') {
    refs.alpha = newValue;
    newValue = newValue / 100;
  } else {
    refs[prop] = newValue;
  }  

  sendWebSocketMessage({
    type: 'mixer',
    action: 'UPDATE',
    data: {
      uid: props.mixer.uid,
      sink: props.source.sink,
      //src: props.source.src,
      [prop]: newValue
    }
  });
};

</script>

<style>
</style>