<template>
  <div class="col-span-4 gap-4">
  Scenes
  <UTabs :items="sceneMixers" orientation="vertical" :ui="{ wrapper: 'flex  gap-4', list: { width: 'w-100' } }">
    <template v-slot:sceneMixer="{ item }">
      <SceneMain :scene="item" />
    </template>
    <template #default="{ item, selected }">
      <div class="flex gap-2 relative truncate">
        <span class="truncate">{{ item.name }}</span>
        <span v-if="selected" class="absolute -right-4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />
      </div>
    </template>

    <template #item="{item, selected}">
       <div 
      class="col-span-3">
      <SceneMain :scene="item" :active="selected" />
       </div>
    </template>
  </UTabs>
    </div>


  <div class="grid col-span-1"> 
    </div>

     <ProgramMain />

  <div class="grid col-span-1">
    <OutputMain :outputs="outputs" />
  </div>

  <div class="grid col-span-8 grid-cols-8 gap-4 py-12">
    <div v-for="input in inputs" :key="input.uid" class="col-span-2">

      <InputMain :input="input" />
    </div>
  </div>

</template>

<script setup>

useHead({
  titleTemplate: (title) => `DOVE - Online Video Editor` 
})

const { inputs, sceneMixers, outputs } = useEntities();



</script>

<style scoped>
</style>