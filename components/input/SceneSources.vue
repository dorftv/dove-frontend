<template>
  <div class="flex justify-between items-center">
  <div>{{ source.name }}</div>
  <div>{{inputName }}</div>

  <div class="flex space-x-4" v-if="source.src_locked && !isUnlocked">
    <i class="pi pi-lock" color="green" ></i>
  </div>
  <div class="flex space-x-4" v-if="!source.src_locked || isUnlocked">
       <i v-if="!isInSceneSources" class="pi pi-plus-circle" @click="submitAddInputToScene"></i>
       <i v-if="isInSceneSources" class="pi pi-minus-circle" @click="submitRemoveInputFromScene"></i>


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

<style>

</style>