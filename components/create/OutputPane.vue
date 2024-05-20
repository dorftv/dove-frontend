<template>
  <UTooltip text="Add Output">
    <UButton
      class="ma-0 pa-0"
      icon="i-heroicons-plus-circle"
      size="sm"
      color="white"
      variant="solid"
      label=""
      :trailing="false"
      @click="isOpen = true"
    />
  </UTooltip>

  <UModal v-model="isOpen" :transition="false">
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="fetchError">Error: {{ fetchError.message }}</div>
    <div v-else>
      <UTabs :items="types" orientation="vertical">
        <template #item="{ item }">
          <div class="p-4">
            <b>{{ item.label }}</b>

            <UForm :state="formData" class="space-y-4" @submit="submitCreate(item.label)">
              <div v-for="field in item.fields" :key="field.name">
                <UFormGroup :label="field.label" :required="field.required">
                  <div v-if="field.type === 'string'">
                    <UInput
                      v-model="formData[item.label][field.name]"
                      :name="field.name"
                      :label="field.label"
                      :placeholder="field.placeholder"
                    />
                  </div>
                  <div v-if="field.type === 'integer'">
                    <UInput
                      v-model="formData[item.label][field.name]"
                      :name="field.name"
                      :label="field.label"
                      :placeholder="field.placeholder"
                    />
                  </div>
                  <div v-if="field.type === 'boolean'">
                    <UCheckbox
                      v-model="formData[item.label][field.name]"
                      :name="field.name"
                      :label="field.label"
                    />
                  </div>
                </UFormGroup>


              </div>
              <hr />

              <USelect label="xxx" name="src" v-model="formData[item.label]['src']" :options="availSrc" option-attribute="name"   placeholder="Select Source" />


              <UInput
                v-model="formData[item.label]['name']"
                name="name"
                size="md"
                placeholder="Give a name. Default Output X"
              />

              <UButton type="submit" label="Create Output" />
              <UButton color="red" label="Cancel" @click="isOpen = false" />
            </UForm>
          </div>
        </template>
      </UTabs>
    </div>
  </UModal>
</template>


<script setup>


const isOpen = ref(false);

const handleClose = (closing) => {
  isOpen.value = closing;
};

const formData = reactive({
  'src': ''
});

const { types, isLoading, fetchError } = useOutputTypes();

// Initialize the form data structure dynamically based on types
watch(types, (newTypes) => {
  newTypes.forEach((type) => {
    if (!(type.key in formData)) {
      formData[type.key] = {};
      if (Array.isArray(type.fields)) {
        type.fields.forEach((field) => {
          formData[type.key][field.name] = field.type === 'boolean' ? false : '';
        });
      }
    }
  });
});
// Function to initialize form data if not already initialized
const initializeFormData = (type) => {
  if (!formData[type.label]) {
    formData[type.label] = {};
    if (Array.isArray(type.fields)) {
      type.fields.forEach((field) => {
        formData[type.label][field.name] = field.type === 'boolean' ? false : '';
      });
    }
  }
};

// Watch types and initialize form data
watch(types, (newTypes) => {
  newTypes.forEach((type) => {
    initializeFormData(type);
  });
}, { immediate: true });


const submitCreate = async (itemType) => {
  try {
    const responseData = await $fetch(`/api/outputs/${itemType}`, {
      method: 'PUT',
      body: formData[itemType],
    });
    handleClose();
    // Handle success response if needed
  } catch (error) {
    console.error('Failed to create output:', error);
    // Handle error if needed
  }
};


const { data: availMixers, pending, error } = await useFetch('/api/mixers');

const availSrc = ref([])

watchEffect(() => {
  if (availMixers.value && availMixers.value.length > 0) {
    availSrc.value = availMixers.value.map(item => {
      return { name: item.name, value: item.uid }
    });
  }
});
const emit = defineEmits(['update:formData']);



</script>
