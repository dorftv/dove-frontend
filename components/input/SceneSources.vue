<template>
  <div class="flex justify-between items-center">
  <div>{{ scene.name }} </div>
  <div>{{ source.sink }}</div>
  <div>{{inputName }}</div>

  <div class="flex space-x-4">
    <Icon  v-if="!isInSceneSources" name="heroicons:scissors" color="red" size="24px" @click="submitAddSource" class="w-6"/>
    <Icon v-if="isInSceneSources" name="lets-icons:remove-fill" color="red" size="24px" @click="submitRemoveSource"/>
  </div>
</div>
</template>
<script setup>

const props = defineProps({
  input: Object,
  scene: Object,
  source: Object
})

const { inputs } = useEntities();

const inputName = computed(() => {
  const input = inputs.value.find(input => input.uid === props.source.src);
  return input ? input.name : '';
});

const isInSceneSources = computed(() => {
  return props.scene.sources.some(source => source.src === props.input.uid && source.sink === props.source.sink);

});

const submitAddSource = async () => {
    const { data: responseData } = await useFetch('/api/mixer/add_source', {
        method: 'post',
        body: {
          src: props.input.uid,
          target: props.scene.uid,
          index: props.source.index
        }
    })
}

const submitRemoveSource = async () => {
    const { data: responseData } = await useFetch('/api/mixer/remove_source', {
        method: 'post',
        body: {
          src: "None",
          target: props.scene.uid,
          index: props.source.index
        }
    })
}
</script>

<style>

</style>