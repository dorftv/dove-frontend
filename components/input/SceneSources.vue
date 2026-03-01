<template>
  <div class="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
    <div>{{ source.name }}</div>
    <div>{{ inputName }}</div>

    <div class="flex space-x-4" v-if="source.src_locked && !isUnlocked">
      <i class="pi pi-lock text-green-600 dark:text-green-400"></i>
    </div>
    <div class="flex space-x-4" v-if="!source.src_locked || isUnlocked">
      <i v-if="!isInSceneSources" class="pi pi-plus-circle cursor-pointer hover:text-green-600 dark:hover:text-green-400" @click="submitAddInputToScene"></i>
      <i v-if="isInSceneSources" class="pi pi-minus-circle cursor-pointer hover:text-red-600 dark:hover:text-red-400" @click="submitRemoveInputFromScene"></i>
    </div>
  </div>
</template>

<script setup>
const { isUnlocked } = useLocked()

const props = defineProps({
  input: Object,
  scene: Object,
  source: Object
})

const {
  inputName,
  isInSceneSources,
  submitAddInputToScene,
  submitRemoveInputFromScene
} = useInputControls(props);
</script>
