<template>
  <div :class="output.state.toLowerCase()" v-if="!output.type.startsWith('preview')">

    {{ output.type }}
          <Popover ref="op" appendTo="body">
        <pre>{{ outputDetails }}</pre>
      </Popover>
      <button
        @click="op.toggle($event)"
        class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 mr-2"
      >
        <i class="pi pi-info-circle text-sm"></i>
      </button>
      <button
        v-if="!output.locked"
        @click="submitRemoveOutput"
        class="flex items-center justify-center w-7 h-7 rounded-full text-black-500 hover:bg-red-100 transition-colors duration-200"
      >
        <i class="pi pi-trash text-sm"></i>
      </button>
    <i
      v-if="!output.locked"
      class="pi pi-trash"
      style="color: red; font-size: 1.5rem;"
      @click="submitRemove"
    ></i>
  </div>
</template>

<script setup>

const props = defineProps({
  output: Object,
  mixers: Array,
});

const op = ref();



const mixerName = computed(() => {
  const mixer = props.mixers.find(mixer => mixer.uid === props.output.src);
  return mixer ? mixer.name : '';
});

const outputDetails = computed(() => JSON.stringify(props.output, null, 2));

const submitRemoveOutput = async () => {
  const { data: responseData } = await useFetch('/api/outputs', {
    method: 'delete',
    body: {
      uid: props.output.uid,
    }
  });
};
</script>

<style scoped>
</style>
