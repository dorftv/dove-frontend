<template>
  <span
    v-if="!editing"
    @click="startEdit"
    class="group inline-flex items-center gap-0.5 cursor-text"
    :class="displayClass"
    title="Click to rename"
  >
    {{ modelValue }}
    <Icon name="ph:pencil-simple" size="10px" class="opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
  </span>
  <span v-else class="inline-flex items-center gap-0.5">
    <input
      ref="inputRef"
      :value="modelValue"
      @blur="save"
      @keydown.enter="save"
      @keydown.escape="cancel"
      class="bg-transparent border-b border-blue-400 outline-none"
      :class="inputClass"
    />
    <kbd class="text-[9px] bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-1 rounded font-mono leading-relaxed shrink-0">&#9166;</kbd>
  </span>
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
