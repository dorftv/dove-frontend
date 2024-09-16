<template>
  <div class="min-h-screen flex flex-col">
    <header class="shadow-sm bg-white">
      <nav class="container mx-auto px-2 py-1 flex justify-between items-center text-sm">
        <NuxtLink to="/" class="font-semibold">DOVE</NuxtLink>

        <ul class="flex items-center space-x-3">
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/about">About</NuxtLink></li>
          <li><NuxtLink to="/help">Help</NuxtLink></li>
          <li><NuxtLink to="/websockets">WS</NuxtLink></li>
          <li><NuxtLink to="/api/debug" external target="_blank">Pipelines</NuxtLink></li>
          <li><NuxtLink to="/docs" external target="_blank">API</NuxtLink></li>
        </ul>

        <div class="flex items-center space-x-2">
          <TogglePreview />
          <a href="https://github.com/dorftv/dove" class="text-gray-600 hover:text-gray-800">
            <Icon name="mingcute:git-lab-fill" size="18px" />
          </a>
        </div>
      </nav>
    </header>

    <main class="flex-grow">
      <keep-alive>
        <slot />
      </keep-alive>
    </main>
  </div>
</template>
<script setup>

useHead({
  titleTemplate: (title) => `DOVE - Online Video Editor`,
  link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
})

</script>
<style scoped>
.router-link-exact,
.router-link-exact-active {
  color: #12b488;
  font-weight: bold;
}
</style>
