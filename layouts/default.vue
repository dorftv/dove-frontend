<template>
  <!-- Auth redirect in progress — minimal screen to prevent rendering errors -->
  <div v-if="authEnabled && authChecked && !isAuthenticated"
       class="flex items-center justify-center min-h-screen text-gray-400 dark:text-gray-500">
    <Icon name="ph:spinner" size="32px" class="animate-spin" />
  </div>

  <div v-else class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <nav class="px-3 h-10 flex items-center text-sm" aria-label="Main navigation">

        <!-- Logo -->
        <NuxtLink to="/" class="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">DOVE <span class="hidden md:inline font-normal text-gray-400 dark:text-gray-500">Online Video Editor</span></NuxtLink>

        <!-- Spacer -->
        <div class="flex-grow" />

        <!-- Preview toggles (desktop) -->
        <div class="hidden md:block mr-1">
          <TogglePreview />
        </div>

        <!-- Preview type toggle -->
        <button
          @click="cyclePreviewMode"
          class="hidden md:flex icon-btn text-[10px] font-mono tabular-nums mx-2"
          title="Preview Type"
        >
          {{ previewModeLabel }}
        </button>

        <!-- Divider -->
        <div class="hidden md:block w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

        <!-- Right icon buttons -->
        <div class="flex items-center gap-0.5">
          <!-- WS indicator — always visible -->
          <NuxtLink to="/websockets" class="flex icon-btn" :title="`WebSocket: ${wsStatus}`" :aria-label="`WebSocket: ${wsStatus}`">
            <Icon
              v-if="wsStatus === 'connected'" name="ph:check-circle-fill" size="14px"
              class="text-green-500"
            />
            <Icon
              v-else-if="wsStatus === 'reconnecting'" name="ph:arrow-clockwise" size="14px"
              class="text-orange-400 animate-spin"
            />
            <Icon
              v-else name="ph:x-circle-fill" size="14px"
              class="text-red-500"
            />
          </NuxtLink>

          <!-- Server status -->
          <ServerStatus />

          <!-- Desktop-only icons -->
          <NuxtLink v-if="canAdmin" to="/api/debug/graphviz" external target="_blank" class="hidden md:flex icon-btn" title="Pipelines" aria-label="Pipelines">
            <Icon name="ph:graph" size="16px" />
          </NuxtLink>
          <NuxtLink v-if="canAdmin" to="/api/debug/docs" external target="_blank" class="hidden md:flex icon-btn" title="API Docs" aria-label="API Docs">
            <Icon name="ph:code" size="16px" />
          </NuxtLink>
          <NuxtLink to="/help" class="hidden md:flex icon-btn" title="Help" aria-label="Help">
            <Icon name="ph:question" size="16px" />
          </NuxtLink>
          <NuxtLink to="/about" class="hidden md:flex icon-btn" title="About" aria-label="About">
            <Icon name="ph:info" size="16px" />
          </NuxtLink>

          <button v-if="canAdmin" @click="configExportOpen = true" class="hidden md:flex icon-btn" title="Export Config" aria-label="Export Config">
            <Icon name="ph:download-simple" size="16px" />
          </button>

          <button @click="cycleColorMode" class="hidden md:flex icon-btn" :title="`Color mode: ${colorMode.preference}`" :aria-label="`Color mode: ${colorMode.preference}`">
            <Icon v-if="colorMode.value === 'dark'" name="ph:moon" size="16px" />
            <Icon v-else-if="colorMode.value === 'light'" name="ph:sun" size="16px" />
            <Icon v-else name="ph:monitor" size="16px" />
          </button>

          <!-- User / Auth -->
          <template v-if="authEnabled && user">
            <div class="hidden md:block w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />
            <span class="hidden md:inline text-[11px] text-gray-400 dark:text-gray-500 mr-1">{{ user.username }}</span>
            <button @click="logout" class="hidden md:flex icon-btn" title="Logout" aria-label="Logout">
              <Icon name="ph:sign-out" size="16px" />
            </button>
          </template>

          <!-- Mobile hamburger -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="flex md:hidden icon-btn" :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'" :aria-expanded="mobileMenuOpen">
            <Icon :name="mobileMenuOpen ? 'ph:x' : 'ph:list'" size="18px" />
          </button>
        </div>
      </nav>

      <!-- Mobile dropdown -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 space-y-1">
        <NuxtLink to="/" @click="mobileMenuOpen = false" class="mobile-link">
          <Icon name="ph:house" size="16px" /> Home
        </NuxtLink>
        <NuxtLink to="/help" @click="mobileMenuOpen = false" class="mobile-link">
          <Icon name="ph:question" size="16px" /> Help
        </NuxtLink>
        <NuxtLink to="/about" @click="mobileMenuOpen = false" class="mobile-link">
          <Icon name="ph:info" size="16px" /> About
        </NuxtLink>
        <template v-if="canAdmin">
          <div class="pt-2 mt-1 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">Debug</div>
          <NuxtLink to="/websockets" @click="mobileMenuOpen = false" class="mobile-link">
            <Icon name="ph:plugs-connected" size="16px" /> WebSocket
          </NuxtLink>
          <NuxtLink to="/api/debug/graphviz" external target="_blank" class="mobile-link">
            <Icon name="ph:graph" size="16px" /> Pipelines
          </NuxtLink>
          <NuxtLink to="/api/debug/docs" external target="_blank" class="mobile-link">
            <Icon name="ph:code" size="16px" /> API Docs
          </NuxtLink>
        </template>
        <template v-if="authEnabled && user">
          <div class="pt-2 mt-1 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Icon name="ph:user" size="16px" />
            <span>{{ user.username }}</span>
            <div class="flex-grow" />
            <button @click="logout" class="mobile-link !py-1 !px-2">
              <Icon name="ph:sign-out" size="16px" /> Logout
            </button>
          </div>
        </template>
        <div class="pt-2 mt-1 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1">
          <button @click="inputPreview = !inputPreview" class="icon-btn" :title="inputPreview ? 'Hide input previews' : 'Show input previews'">
            <Icon :name="inputPreview ? 'ph:eye' : 'ph:eye-slash'" size="16px" :class="{ 'opacity-40': !inputPreview }" />
          </button>
          <button @click="audioMeters = !audioMeters" class="icon-btn" :title="audioMeters ? 'Hide audio meters' : 'Show audio meters'">
            <Icon name="ph:equalizer" size="16px" :class="{ 'opacity-40': !audioMeters }" />
          </button>
          <button @click="cyclePreviewMode" class="icon-btn" :title="`Preview: ${previewModeLabel}`">
            <span class="text-[10px] font-mono">{{ previewModeLabel }}</span>
          </button>
          <div class="flex-grow" />
          <button @click="cycleColorMode()" class="icon-btn" :title="`Color mode: ${colorMode.preference}`">
            <Icon v-if="colorMode.value === 'dark'" name="ph:moon" size="16px" />
            <Icon v-else-if="colorMode.value === 'light'" name="ph:sun" size="16px" />
            <Icon v-else name="ph:monitor" size="16px" />
          </button>
        </div>
      </div>
    </header>

    <main class="flex-grow" role="main">
      <slot />
    </main>
    <ConfigExport v-model:open="configExportOpen" />
    <KeyboardShortcuts />
  </div>
</template>

<script setup>
const colorMode = useColorMode()
const mobileMenuOpen = ref(false)
const { wsStatus } = useEntities()
const { previewMode, cycle: cyclePreviewMode } = usePlayerMode()
const { inputPreview, audioMeters } = useUserState()
const { user, authEnabled, authChecked, isAuthenticated, canAdmin, logout } = useAuth()
const configExportOpen = ref(false)

const previewModeLabel = computed(() => {
  if (previewMode.value === 'auto') return 'Auto';
  if (previewMode.value === 'webrtc') return 'WebRTC';
  return 'HLS';
})

const cycleColorMode = () => {
  const modes = ['system', 'light', 'dark']
  const currentIndex = modes.indexOf(colorMode.preference)
  colorMode.preference = modes[(currentIndex + 1) % modes.length]
}

const faviconSvg = (color) =>
  `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='8' fill='${encodeURIComponent(color)}'/></svg>`

const faviconHref = computed(() => {
  if (wsStatus.value === 'connected') return faviconSvg('#22c55e')
  if (wsStatus.value === 'reconnecting') return faviconSvg('#f97316')
  return faviconSvg('#ef4444')
})

useHead({
  titleTemplate: () => `DOVE - Online Video Editor`,
  link: [{ rel: 'icon', type: 'image/svg+xml', href: faviconHref }],
})
</script>

<style scoped>
@reference "tailwindcss";

.icon-btn {
  @apply items-center justify-center w-7 h-7 rounded
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
