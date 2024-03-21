<script setup>
const isOpen = ref(false)

</script>

<template>
    <div>
        <header class="shadow-sm bg-white">
            <nav class="flex justify-between">
                <NuxtLink to="/" class="font-bold">DOVE - Online Video Editor</NuxtLink>
                <div class="flex" >
                  <CreateInputPane class="p-2"/>
                  <CreateScenePane class="p-2"/>
                  <CreateOutputPane class="p-2"/>
                </div>
                <ul class="flex gap-4">
                    <li><NuxtLink to="/">Home</NuxtLink></li>
                    <li><NuxtLink to="/about">About</NuxtLink></li>
                    <li><NuxtLink to="/help">Help</NuxtLink></li>
                    <li><NuxtLink to="/websockets">Websockets</NuxtLink></li>
                    <li><NuxtLink to="/api/debug" external target="_blank">Pipelines</NuxtLink></li>
                </ul>
                <TogglePreview />
                <a href="https://github.com/dorftv/dove">
                  <Icon name="uil:github" color="black" size="36px" />
                </a>
            </nav>
        </header>

        <div class="grid grid-cols-12 px-4 py-8  border-gray-200">
              <keep-alive>
        <slot />
    </keep-alive>
        </div>
    </div>
</template>

<style scoped>
.router-link-exact {
  color: #12b488;
}
.router-link-exact-active {
  color: #12b488;
}
</style>