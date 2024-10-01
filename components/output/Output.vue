<template>
  <div :class="output.state.toLowerCase()" v-if="!output.is_preview">
    <div class="flex items-center justify-end mb-2">
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
    </div>
    <div class="flex-grow overflow-hidden">
      <span
        v-tooltip="output.name + ' (' + output.type + ')'"
        :id="'outputName_' + output.uid"
        class="truncate inline-block w-full cursor-help"
      >
        {{ output.name }}
      </span>
    </div>
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
