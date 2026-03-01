<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <nav class="container mx-auto px-3 h-10 flex items-center gap-1 text-sm">

        <!-- Logo -->
        <NuxtLink to="/" class="font-bold text-emerald-600 dark:text-emerald-400 mr-3 shrink-0">DOVE</NuxtLink>

        <!-- Desktop nav links -->
        <div class="hidden md:flex items-center gap-1">
          <NuxtLink to="/" class="nav-link">
            <Icon name="ph:house" size="15px" />
            <span>Home</span>
          </NuxtLink>
          <NuxtLink to="/websockets" class="nav-link">
            <Icon name="ph:plugs-connected" size="15px" />
            <span>WS</span>
          </NuxtLink>
          <NuxtLink to="/api/debug" external target="_blank" class="nav-link">
            <Icon name="ph:graph" size="15px" />
            <span>Pipelines</span>
          </NuxtLink>
          <NuxtLink to="/docs" external target="_blank" class="nav-link">
            <Icon name="ph:code" size="15px" />
            <span>API</span>
          </NuxtLink>
        </div>

        <!-- Spacer -->
        <div class="flex-grow" />

        <!-- Preview toggles (desktop) -->
        <div class="hidden md:block">
          <TogglePreview />
        </div>

        <!-- Divider -->
        <div class="hidden md:block w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

        <!-- Right icon buttons -->
        <div class="flex items-center gap-0.5">
          <NuxtLink to="/help" class="icon-btn" title="Help">
            <Icon name="ph:question" size="16px" />
          </NuxtLink>
          <NuxtLink to="/about" class="icon-btn" title="About">
            <Icon name="ph:info" size="16px" />
          </NuxtLink>

          <button @click="cycleColorMode" class="icon-btn" :title="`Color mode: ${colorMode.preference}`">
            <Icon v-if="colorMode.value === 'dark'" name="ph:moon" size="16px" />
            <Icon v-else-if="colorMode.value === 'light'" name="ph:sun" size="16px" />
            <Icon v-else name="ph:monitor" size="16px" />
          </button>

          <a href="https://github.com/dorftv/dove" target="_blank" class="icon-btn" title="GitHub">
            <Icon name="ph:github-logo" size="16px" />
          </a>

          <!-- Mobile hamburger -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden icon-btn">
            <Icon :name="mobileMenuOpen ? 'ph:x' : 'ph:list'" size="18px" />
          </button>
        </div>
      </nav>

      <!-- Mobile dropdown -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 space-y-1">
        <NuxtLink to="/" @click="mobileMenuOpen = false" class="mobile-link">
          <Icon name="ph:house" size="16px" /> Home
        </NuxtLink>
        <NuxtLink to="/websockets" @click="mobileMenuOpen = false" class="mobile-link">
          <Icon name="ph:plugs-connected" size="16px" /> WS
        </NuxtLink>
        <NuxtLink to="/api/debug" external target="_blank" class="mobile-link">
          <Icon name="ph:graph" size="16px" /> Pipelines
        </NuxtLink>
        <NuxtLink to="/docs" external target="_blank" class="mobile-link">
          <Icon name="ph:code" size="16px" /> API
        </NuxtLink>
        <NuxtLink to="/help" @click="mobileMenuOpen = false" class="mobile-link">
          <Icon name="ph:question" size="16px" /> Help
        </NuxtLink>
        <NuxtLink to="/about" @click="mobileMenuOpen = false" class="mobile-link">
          <Icon name="ph:info" size="16px" /> About
        </NuxtLink>
        <div class="pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
          <TogglePreview />
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>
  </div>
</template>

<script setup>
const colorMode = useColorMode()
const mobileMenuOpen = ref(false)

const cycleColorMode = () => {
  const modes = ['system', 'light', 'dark']
  const currentIndex = modes.indexOf(colorMode.preference)
  colorMode.preference = modes[(currentIndex + 1) % modes.length]
}

useHead({
  titleTemplate: () => `DOVE - Online Video Editor`,
  link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-1 px-2 py-1 rounded text-gray-500 dark:text-gray-400
         hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700
         transition-colors duration-150;
}

.nav-link.router-link-exact-active {
  @apply text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 font-medium;
}

.icon-btn {
  @apply flex items-center justify-center w-7 h-7 rounded
         text-gray-500 dark:text-gray-400
         hover:text-gray-900 dark:hover:text-white
         hover:bg-gray-100 dark:hover:bg-gray-700
         transition-colors duration-150;
}

.icon-btn.router-link-exact-active {
  @apply text-emerald-600 dark:text-emerald-400;
}

.mobile-link {
  @apply flex items-center gap-2 px-2 py-1.5 rounded text-sm
         text-gray-600 dark:text-gray-300
         hover:text-gray-900 dark:hover:text-white
         hover:bg-gray-100 dark:hover:bg-gray-700
         transition-colors duration-150;
}

.mobile-link.router-link-exact-active {
  @apply text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 font-medium;
}
</style>
