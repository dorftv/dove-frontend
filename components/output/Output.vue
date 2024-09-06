
<template>
    <div :class="output.state.toLowerCase()" v-if="!output.type.startsWith('preview')">

       {{ output.type }}
      <UPopover :popper="{ arrow: true }">
        <UButton color="white" trailing-icon="heroicons-information-circle-20-solid" />
        <template #panel>
            <pre>{{ outputDetails }}</pre>
        </template>
      </UPopover>
      <Icon v-if="!output.locked" name="uil:trash" color="red" size="24px" @click="submitRemove"/>
    </div>
  </template>

  <script setup>
  const props = defineProps({
    output: Object,
  })

  const mixerName = computed(() => {
    const mixer = props.mixers.find(mixer => mixer.uid === props.output.src);
    return mixer ? mixer.name : '';
  });
  const outputDetails = computed(() => JSON.stringify(props.output, null, 2));

  const submitRemove = async () => {
      const { data: responseData } = await useFetch('/api/outputs', {
          method: 'delete',
          body: {
            uid: props.output.uid,
          }
      })
  }

  </script>

  <style>

  </style>