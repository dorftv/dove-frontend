<template>
  <!-- Where each slot is, on the scene's picture: one coloured frame per slot (switched in
       SceneHeader); the slot whose "Position & sizing" panel is open is drawn stronger -->
  <div v-if="slotOverlay" class="absolute inset-0 pointer-events-none overflow-hidden">
    <div
      v-for="slot in scene.slots"
      :key="slot.id"
      class="absolute"
      :class="slot.id === editing ? 'border-[3px] z-10' : 'border border-dashed'"
      :style="{ ...boxOf(slot), borderColor: slotColor(slot), backgroundColor: slot.id === editing ? slotColor(slot) + '26' : 'transparent' }"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  scene: Object,
});

const { slotOverlay } = useUserState();
// Which slot's panel is open, per scene: set by SceneInputs
const editingSlots = useState('slot-editing', () => ({}));
const editing = computed(() => editingSlots.value[props.scene.uid]);

const percent = (value, total) => `${(value / total) * 100}%`;
const boxOf = (slot) => ({
  left: percent(slot.xpos, props.scene.width),
  top: percent(slot.ypos, props.scene.height),
  width: percent(slot.width, props.scene.width),
  height: percent(slot.height, props.scene.height),
});
</script>
