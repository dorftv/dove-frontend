<template>
  <!-- The number next to a slider, to type: applied on Enter or when the field is left; without
       spin buttons, which would take the digits' room. Its width comes from where it is used -->
  <input
    type="number"
    :value="value"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    @change="apply"
    @keydown.enter="$event.target.blur()"
    class="shrink-0 text-right text-xs tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-400 disabled:opacity-50"
  />
</template>

<script setup>
const props = defineProps({
  value: Number,
  min: Number,
  max: Number,
  step: { type: Number, default: 1 },
  disabled: Boolean,
});

// The typed number, on the slider's steps and within its range; anything else puts the field back
const emit = defineEmits(['set']);

const apply = (event) => {
  const typed = Number(event.target.value);
  if (event.target.value === '' || Number.isNaN(typed)) {
    event.target.value = props.value;
    return;
  }
  const decimals = (String(props.step).split('.')[1] || '').length;
  const stepped = Math.round(typed / props.step) * props.step;
  const value = Number(Math.min(props.max, Math.max(props.min, stepped)).toFixed(decimals));
  event.target.value = value;
  emit('set', value);
};
</script>
