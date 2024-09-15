<template>
  <div class="flex justify-between items-center">
  <div>{{ scene.name }} </div>
  <div>{{ source.sink }}</div>
  <div>{{inputName }}</div>

  <div class="flex space-x-4">
    <Icon  v-if="!isInSceneSources" name="heroicons:scissors" color="red" size="24px" @click="submitAddInputToScene" class="w-6"/>
    <Icon v-if="isInSceneSources" name="lets-icons:remove-fill" color="red" size="24px" @click="submitRemoveInputFromScene"/>
  </div>
</div>
</template>
<script setup>

const props = defineProps({
  input: Object,
  scene: Object,
  source: Object
})

const { inputs } = useEntities();

const {
  inputName,
  isInSceneSources,
  submitAddInputToScene,
  submitRemoveInputFromScene
} = useInputControls(props);

</script>

<style>

</style>