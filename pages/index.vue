<template>
<div class="grid grid-cols-12 px-4 py-8  border-gray-200">

  <div class="col-span-5 gap-4">
    Scenes
    <CreateScenePane />


    <UTabs :items="sceneMixers" @change="onSceneChange" orientation="vertical" :ui="{ wrapper: 'flex  gap-4', list: { width: 'w-100' } }">
      <template v-slot:sceneMixer="{ item }">
        <SceneMain :scene="item" />
      </template>
      <template #default="{ item, selected }">
        <div class="flex gap-2 relative truncate" >
          <span class="truncate">{{ item.name }}</span>
          <span v-if="selected" class="absolute -right-4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />

        </div>
      </template>

      <template #item="{item, selected}">
         <div v-if="selected"   class="">
        <SceneMain :scene="item" :active="selected" />
         </div>
      </template>
    </UTabs>
  </div>


<div class="col-span-6">
     <ProgramMain />
     </div>

  <div class="col-span-1 px-4">
    <OutputMain />
  </div>

  <InputMain/>

</div>
</template>

<script setup>


const { sceneMixers } = useEntities();
const { selectedScene, onSceneChange } = useActiveScene()


</script>

<style scoped>
</style>