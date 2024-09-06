<template>
  <UTooltip text="Add Output" v-if="addOutput">
    <UButton
      class="ma-0 pa-0"
      icon="heroicons-plus-circle"
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
                <div v-if="field.name!='type'">
                  <UFormGroup :label="field.label" :required="field.required">
                    <div v-if="field.type === 'string'">
                      <UInput
                        v-model="formData[item.label][field.name]"
                        :name="field.name"
                        :label="field.label"
                        :placeholder="field.placeholder"
                        :required="field.required"
                      />
                    </div>
                    <div v-if="field.type === 'integer'">
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
                </div>

              </div>
              <hr /> <!-- Generic Fields -->
              <UFormGroup label="Source" required>
                <USelect required
                  name="src"
                  v-model="formData[item.label]['src']"
                  :options="availSrc"
                  option-attribute="name"
                  placeholder="Select Source"
                />
              </UFormGroup>

              <UFormGroup label="Resolution" required>
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

const entityType = 'outputs';
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

const { addOutput} = useDoveConfig()

</script>
