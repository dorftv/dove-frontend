<template>
  <div class="min-h-[calc(100vh-2.5rem)]">
    <!-- Mobile nav -->
    <div class="md:hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <button
        @click="mobileNavOpen = !mobileNavOpen"
        class="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>{{ currentTitle }}</span>
        <Icon :name="mobileNavOpen ? 'ph:caret-up' : 'ph:caret-down'" size="14px" class="text-gray-400" />
      </button>
      <nav v-if="mobileNavOpen" class="px-4 pb-3 space-y-0.5 text-sm">
        <template v-for="item in navSections" :key="item.slug || item.title">
          <NuxtLink
            v-if="!item.type"
            :to="item.slug === 'index' ? '/help' : `/help/${item.slug}`"
            @click="mobileNavOpen = false"
            class="block px-3 py-1.5 rounded transition-colors"
            :class="currentSlug === item.slug
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            {{ item.title }}
          </NuxtLink>
          <template v-else-if="item.type === 'group'">
            <button
              @click="toggleGroup(item.title)"
              class="w-full flex items-center justify-between px-3 py-1.5 rounded transition-colors font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span>{{ item.title }}</span>
              <span class="text-xs">{{ openGroups.has(item.title) ? '▾' : '▸' }}</span>
            </button>
            <template v-if="openGroups.has(item.title)">
              <NuxtLink
                v-for="child in item.children" :key="child.slug"
                :to="`/help/${child.slug}`"
                @click="mobileNavOpen = false"
                class="block pl-5 pr-3 py-1.5 rounded transition-colors"
                :class="currentSlug === child.slug
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
              >
                {{ child.title }}
              </NuxtLink>
            </template>
          </template>
        </template>
      </nav>
    </div>

    <div class="flex max-w-6xl mx-auto">
      <!-- Desktop sidebar -->
      <nav class="hidden md:block w-52 shrink-0 border-r border-gray-200 dark:border-gray-700 p-4">
        <ul class="space-y-0.5 text-sm sticky top-14">
          <template v-for="item in navSections" :key="item.slug || item.title">
            <li v-if="!item.type">
              <NuxtLink
                :to="item.slug === 'index' ? '/help' : `/help/${item.slug}`"
                class="block px-3 py-1.5 rounded transition-colors"
                :class="currentSlug === item.slug
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
              >
                {{ item.title }}
              </NuxtLink>
            </li>
            <template v-else-if="item.type === 'group'">
              <li>
                <button
                  @click="toggleGroup(item.title)"
                  class="w-full flex items-center justify-between px-3 py-1.5 rounded transition-colors font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span>{{ item.title }}</span>
                  <span class="text-xs">{{ openGroups.has(item.title) ? '▾' : '▸' }}</span>
                </button>
              </li>
              <template v-if="openGroups.has(item.title)">
                <li v-for="child in item.children" :key="child.slug">
                  <NuxtLink
                    :to="`/help/${child.slug}`"
                    class="block pl-5 pr-3 py-1.5 rounded transition-colors"
                    :class="currentSlug === child.slug
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
                  >
                    {{ child.title }}
                  </NuxtLink>
                </li>
              </template>
            </template>
          </template>
        </ul>
      </nav>

      <!-- Content -->
      <div class="flex-1 min-w-0 px-4 sm:px-8 py-6 sm:py-8">
        <article
          v-if="html"
          class="prose dark:prose-invert prose-emerald max-w-3xl
                 prose-headings:font-semibold prose-h1:text-2xl
                 prose-a:text-emerald-600 dark:prose-a:text-emerald-400
                 prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                 prose-table:text-sm
                 prose-th:text-left prose-th:font-medium prose-th:text-gray-500 dark:prose-th:text-gray-400
                 prose-td:py-2"
          v-html="html"
        />
        <div v-else-if="error" class="text-gray-500 dark:text-gray-400 py-12 text-center">
          <p class="text-lg mb-2">Page not found</p>
          <NuxtLink to="/help" class="text-emerald-600 dark:text-emerald-400 hover:underline text-sm">Back to Help</NuxtLink>
        </div>
        <div v-else class="text-gray-400 py-12 text-center">Loading...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import MarkdownIt from 'markdown-it'

const route = useRoute()

const navSections = [
  { slug: 'index', title: 'Overview' },
  { slug: 'interface', title: 'Interface' },
  { slug: 'scenes', title: 'Scenes' },
  { slug: 'config', title: 'Configuration' },
  {
    type: 'group', title: 'Outputs',
    children: [
      { slug: 'outputs', title: 'Overview' },
      { slug: 'encoders', title: 'Encoders' },
    ],
  },
  {
    type: 'group', title: 'Inputs',
    children: [
      { slug: 'inputs', title: 'All Inputs' },
      { slug: 'inputs-uridecodebin3', title: 'Streams & Files' },
      { slug: 'inputs-playlist', title: 'Playlist' },
      { slug: 'inputs-wpesrc', title: 'HTML / Web' },
      { slug: 'inputs-ytdlp', title: 'yt-dlp' },
      { slug: 'inputs-nodecg', title: 'NodeCG' },
      { slug: 'inputs-testsrc', title: 'Test Source' },
    ],
  },
  { slug: 'previews', title: 'Previews' },
  { slug: 'keyboard-shortcuts', title: 'Keyboard Shortcuts' },
  { slug: 'connection-status', title: 'Connection Status' },
  { slug: 'debugging', title: 'Debugging' },
]

const mobileNavOpen = ref(false)
const openGroups = ref(new Set())

const md = new MarkdownIt({ html: false })

const currentSlug = computed(() => {
  const parts = route.params.slug
  if (!parts || parts.length === 0) return 'index'
  return parts.join('/')
})

const currentTitle = computed(() => {
  for (const item of navSections) {
    if (!item.type && item.slug === currentSlug.value) return item.title
    if (item.type === 'group') {
      const child = item.children?.find(c => c.slug === currentSlug.value)
      if (child) return `${item.title} › ${child.title}`
    }
  }
  return 'Help'
})

// Auto-open the group that contains the current page
watch(currentSlug, (slug) => {
  for (const item of navSections) {
    if (item.type === 'group' && item.children?.some(c => c.slug === slug)) {
      openGroups.value = new Set([...openGroups.value, item.title])
    }
  }
}, { immediate: true })

function toggleGroup(title) {
  const s = new Set(openGroups.value)
  if (s.has(title)) {
    s.delete(title)
  } else {
    s.add(title)
  }
  openGroups.value = s
}

const html = ref('')
const error = ref('')

async function fetchDoc(slug) {
  html.value = ''
  error.value = ''
  try {
    const raw = await $fetch(`/api/docs/${slug}.md`, { responseType: 'text' })
    html.value = md.render(raw)
  } catch (e) {
    error.value = `not found`
  }
}

watch(currentSlug, (slug) => fetchDoc(slug), { immediate: true })
</script>
