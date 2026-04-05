<template>
  <span
    v-if="!editing"
    @dblclick="startEdit"
    class="cursor-text"
    :class="displayClass"
    :title="'Double-click to rename'"
  >{{ modelValue }}</span>
  <input
    v-else
    ref="inputRef"
    :value="modelValue"
    @blur="save"
    @keydown.enter="save"
    @keydown.escape="cancel"
    class="bg-transparent border-b border-blue-400 outline-none"
    :class="inputClass"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  displayClass: { type: String, default: '' },
  inputClass: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const editing = ref(false);
const inputRef = ref(null);

const startEdit = () => {
  editing.value = true;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
};

const save = () => {
  const newValue = inputRef.value?.value?.trim();
  if (newValue && newValue !== props.modelValue) {
    emit('update:modelValue', newValue);
  }
  editing.value = false;
};

const cancel = () => {
  editing.value = false;
};
</script>
