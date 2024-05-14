<template>
      <div>
            <h2></h2>
        <UFormGroup label="Uri ( for files, SRT, RTMP, HLS, ...)" required>
          <UInput v-model="state.uri" />
        </UFormGroup>
        <div v-for="proxyType in proxyTypes" :key="proxyType">

            <a href="#" @click="fetchItems(proxyType)">
        {{ proxyType }}
        <Icon  name="heroicons:arrow-path" color="green" size="18px"/>

      </a>
      <div v-if="items.length > 0">

    <USelect
    color="primary"
    placeholder="Select Stream"
    v-model="state.uri"
    variant="outline"
    :options="items"
    optionAttribute="name"
    valueAttribute="url"
  />
</div>
        </div>

        <UCheckbox v-model="state.loop" :options="items" valueAttribute  optionAttributename="loop" label="Loop (content replays once finished)" />
  </div>
</template>

<script setup>

const { config, proxyTypes } = useDoveConfig();

const emit = defineEmits(['update:formData']);

const items = ref([]);  // Holds fetched items
const state = reactive({
  type: 'urisrc',
  uri: '',
  loop: false,
  name: ''
});
let refresh = null;


async function fetchItems(proxyType) {
  const { data, error, execute, refresh: refreshFunc } = await useFetch(() => `/proxy/${proxyType}`);
  refresh = refreshFunc; // Save the refresh function for later use
  if (error.value) {
    console.error('Failed to fetch items:', error.value);
  } else {
    items.value = data.value;  // Assuming the API returns an array directly
  }
}

watch(() => state.uri, async (newUri) => {
  if (items.value.length > 0) {
    const selectedItem = items.value.find((item) => item.url === newUri);
    if (selectedItem) {
      state.name = selectedItem.name;
    } else {
      state.name = ''
    }
  }
});

// Emit formData updates when the reactive state changes
watchEffect(() => {
  emit('update:formData', state);
});


</script>
