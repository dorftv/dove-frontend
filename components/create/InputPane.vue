<template>
  <UTooltip text="Add Output" v-if="addInput">
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
      <UTabs :items="types" orientation="vertical"  @change="onTabChange">
        <template #item="{ item }">
          <div class="p-4">
            <div>
            <b>{{ item.fields['type'].label}}</b>
            </div>
            <div>
            <i>{{ item.fields['type'].description }}</i>
            </div>
            <UForm :state="formData" class="space-y-4" @submit="submitCreate(item.label)">
              <div v-for="field in item.fields" :key="field.name">
                <div v-if="field.name!='type' && field.hidden!=true">
                  <UFormGroup :label="field.label" :required="field.required" :description="field.description" :help="field.help">

                    <div v-if="field.type === 'string'">

                      <UInput
                        v-model="formData[item.label][field.name]"
                        :name="field.name"
                        :label="field.label"
                        :placeholder="field.placeholder"
                        :required="field.required"
                      />

                    </div>
                    <div v-if="field.type === 'integer' || field.type ==='number'">

                      <UInput
                        v-model="formData[item.label][field.name]"
                        :name="field.name"
                        :label="field.label"
                        :placeholder="field.placeholder"
                        :required="field.required"
                      />

                    </div>
                    <div v-if="field.type === 'boolean'">

                      <UCheckbox
                        v-model="formData[item.label][field.name]"
                        :name="field.name"
                        :label="field.label"
                        :required="field.required"
                      />

                    </div>
                  </UFormGroup>


                  <!-- Show proxies if configured. -->
                  <div class="flex justify">
                    <div v-for="(proxy, proxyType) in proxyTypes" :key="proxyType" >
                      <div v-if="item.key === proxy.type && field.name === proxy.field">
                        <div v-if="proxyItems[proxyType] && proxyItems[proxyType].length > 0">
                          <USelect
                            color="primary"
                            placeholder="Select Stream from Proxy"
                            v-model="formData[item.label][field.name]"
                            variant="outline"
                            :options="proxyItems[proxyType]"
                            optionAttribute="name"
                            valueAttribute="url"
                            @change="handleProxyName(item.label, field.name, proxyType, $event)"
                          />
                        </div>
                        {{ proxyType }}
                        <a href="#" @click="fetchItems(proxyType)">
                          <Icon  name="heroicons:arrow-path" color="green" size="18px"/>
                        </a>
                      </div>
                  </div>
                </div>


              </div>
            </div>
            <hr />

            <!-- Generic Fields -->
          <URange v-model="formData[item.label]['volume']" name="range" :min="0" :max="1" :step="0.05" />
          Volume: {{  formData[item.label].volume  * 100 }}

              <UFormGroup label="Resolution">
                <USelect name="resolution"
                  v-model="selectedResolution"
                  :options="resolutionOptions"
                  option-attribute="label"
                  value-attribute="key"
                />
              </UFormGroup>

              <UFormGroup label="Name">
                <UInput label="Name"
                  v-model="formData[item.label]['name']"
                  name="name"
                  size="md"
                  placeholder="Give a name. Default Output X"
                />
              </UFormGroup>

              <UButton type="submit" label="Create Input" />
              <UButton color="red" label="Cancel" @click="isOpen = false" />
            </UForm>
          </div>
        </template>
      </UTabs>
    </div>
  </UModal>
</template>


<script setup>


const entityType = 'inputs';
const {
  isOpen,
  isLoading,
  fetchError,
  types,
  formData,
  availSrc,
  submitCreate,
  selectedResolution,
  resolutionOptions,
} = useCreateEntity(entityType);


const {addInput, config, proxyTypes } = useDoveConfig();
let refresh = null;
const proxyItems = ref({});

const handleProxyName = (itemLabel, fieldName,  proxyType, selectedValue) => {
  const selectedItem = proxyItems.value[proxyType].find(item => item.url === selectedValue);
  if (selectedItem) {
    formData[itemLabel]['name'] = selectedItem.name;
  }
};

function onTabChange (index) {
  proxyItems.value = []
}

async function fetchItems(proxyType) {
  const { data, error, execute, refresh: refreshFunc } = await useFetch(() => `/proxy/${proxyType}`);
  refresh = refreshFunc;
  if (error.value) {
    proxyItems.value = []
    console.error('Failed to fetch items:', error.value);
  } else {
    proxyItems.value[proxyType] = data.value;
  }
}

watch(isOpen, (newValue) => {
  if (!newValue) {
    proxyItems.value = [];
  }
});

</script>
