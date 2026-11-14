<template>
  <div class="px-4 py-4 max-w-7xl mx-auto">
    <!-- Channel -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <h1 class="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
        <Icon name="ph:television-simple" size="22px" /> Programme guide
      </h1>
      <USelect
        v-if="channels.length > 1"
        v-model="channelUid"
        :items="channels.map((c) => ({ label: `${c.service_name} (${c.name})`, value: c.uid }))"
        label-key="label"
        value-key="value"
        size="sm"
        class="w-64"
      />
      <span v-else-if="channel" class="text-sm text-gray-500 dark:text-gray-400">
        {{ channel.service_name }}<template v-if="channel.provider_name"> · {{ channel.provider_name }}</template>
        · {{ channel.name }}
      </span>
      <div class="flex-grow" />
      <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
      <span v-else-if="updated" class="text-[11px] text-gray-400">as sent, updated {{ clock(updated) }}</span>
      <UButton icon="ph:question" color="neutral" variant="ghost" size="sm" to="/help/epg" aria-label="How the guide works" title="How the guide works" />
      <UButton icon="ph:x" color="neutral" variant="ghost" size="sm" aria-label="Close guide" title="Close (Esc)" @click="close" />
    </div>

    <div v-if="!channels.length" class="text-sm text-gray-500 dark:text-gray-400 py-12 text-center">
      No output carries a channel yet. An SRT output with a channel name sends the guide shown here:
      see <NuxtLink to="/help/epg" class="text-primary hover:underline">Programme Guide (EPG)</NuxtLink>.
    </div>

    <template v-else-if="guide">
      <!-- On air and next -->
      <div class="grid gap-3 md:grid-cols-2 mb-5">
        <div class="rounded-lg border border-primary/40 bg-primary/5 p-3">
          <div class="text-[11px] uppercase tracking-wide text-primary font-semibold mb-1">On air</div>
          <template v-if="guide.present">
            <div class="font-semibold text-gray-800 dark:text-gray-100">{{ guide.present.title }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {{ clock(guide.present.start) }}–{{ clock(end(guide.present)) }}
              <template v-if="guide.present.duration"> · {{ remaining(guide.present) }} left</template>
            </div>
            <div v-if="guide.present.duration" class="h-1.5 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
              <div class="h-full bg-primary" :style="{ width: `${progress(guide.present)}%` }" />
            </div>
            <p v-if="guide.present.text" class="text-sm text-gray-600 dark:text-gray-300">{{ guide.present.text }}</p>
          </template>
          <div v-else class="text-sm text-gray-400">Not known</div>
        </div>
        <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div class="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mb-1">Next</div>
          <template v-if="guide.following">
            <div class="font-semibold text-gray-800 dark:text-gray-100">{{ guide.following.title }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {{ clock(guide.following.start) }}–{{ clock(end(guide.following)) }} · in {{ span(guide.following.start - now) }}
            </div>
            <p v-if="guide.following.text" class="text-sm text-gray-600 dark:text-gray-300">{{ guide.following.text }}</p>
          </template>
          <div v-else class="text-sm text-gray-400">Not known</div>
        </div>
      </div>

      <!-- Days -->
      <div class="flex flex-wrap items-center gap-1 mb-2">
        <UButton
          v-for="day in days"
          :key="day.start"
          :label="day.label"
          :color="day.start === dayStart ? 'primary' : 'neutral'"
          :variant="day.start === dayStart ? 'solid' : 'ghost'"
          size="xs"
          @click="showDay(day.start)"
        />
        <div class="flex-grow" />
        <UButton label="Now" icon="ph:crosshair" size="xs" variant="outline" color="neutral" @click="jumpToNow" />
        <UButton icon="ph:magnifying-glass-minus" size="xs" variant="ghost" color="neutral" aria-label="Zoom out" :disabled="hourWidth <= 60" @click="hourWidth /= 2" />
        <UButton icon="ph:magnifying-glass-plus" size="xs" variant="ghost" color="neutral" aria-label="Zoom in" :disabled="hourWidth >= 480" @click="hourWidth *= 2" />
      </div>

      <!-- Timeline of the day -->
      <div ref="timeline" class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-5">
        <div class="relative" :style="{ width: `${24 * hourWidth}px`, height: '96px' }">
          <div
            v-for="hour in 24"
            :key="hour"
            class="absolute top-0 bottom-0 border-l border-gray-200 dark:border-gray-700 text-[10px] text-gray-400 pl-1"
            :style="{ left: `${(hour - 1) * hourWidth}px` }"
          >{{ String(hour - 1).padStart(2, '0') }}:00</div>
          <button
            v-for="item in dayProgrammes"
            :key="`${item.start}-${item.title}`"
            :title="`${clock(item.start)}–${clock(end(item))}  ${item.title}`"
            class="absolute top-5 h-16 rounded px-1.5 py-1 text-left overflow-hidden border text-[11px] leading-tight transition-colors"
            :class="[
              isOn(item) ? 'bg-primary/20 border-primary text-gray-900 dark:text-gray-100'
                : end(item) <= now ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200',
              isOpen(item) ? 'ring-2 ring-primary' : '',
            ]"
            :style="place(item)"
            @click="select(item)"
          >
            <div class="font-medium truncate">{{ item.title }}</div>
            <div class="text-[10px] opacity-70 truncate">{{ clock(item.start) }}</div>
          </button>
          <div
            v-if="now >= dayStart && now < dayStart + 86400"
            class="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
            :style="{ left: `${((now - dayStart) / 3600) * hourWidth}px` }"
          />
        </div>
      </div>

      <!-- The day as a list -->
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
        <div v-if="!dayProgrammes.length" class="p-4 text-sm text-gray-400">Nothing known for this day.</div>
        <!-- Collapsed rows; a click opens one row's details, closing any other -->
        <div
          v-for="item in dayProgrammes"
          :key="`row-${item.start}-${item.title}`"
          :class="[isOn(item) ? 'bg-primary/5' : '', end(item) <= now && !isOpen(item) ? 'opacity-50' : '', isOpen(item) ? 'bg-primary/10' : '']"
        >
          <button
            class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60"
            :aria-expanded="isOpen(item)"
            :aria-controls="`details-${item.start}`"
            @click="select(item)"
          >
            <div class="w-12 shrink-0 text-sm tabular-nums whitespace-nowrap text-gray-600 dark:text-gray-300">{{ clock(item.start) }}</div>
            <div class="min-w-0 flex-1 text-sm font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span class="truncate">{{ item.title }}</span>
              <span v-if="isOn(item)" class="text-[10px] font-semibold uppercase text-primary shrink-0">on air</span>
            </div>
            <div class="w-14 shrink-0 text-right text-xs text-gray-400 tabular-nums whitespace-nowrap">{{ item.duration ? span(item.duration) : '' }}</div>
            <Icon :name="isOpen(item) ? 'ph:caret-up' : 'ph:caret-down'" size="14px" class="shrink-0 text-gray-400" />
          </button>
          <div v-if="isOpen(item)" :id="`details-${item.start}`" class="px-3 pb-3 sm:pl-[4.75rem] text-sm">
            <div class="text-xs text-gray-500 dark:text-gray-400 tabular-nums mb-1">
              {{ clock(item.start) }}–{{ clock(end(item)) }}
              <template v-if="item.duration"> · {{ span(item.duration) }}</template>
              <template v-if="isOn(item) && item.duration"> · {{ remaining(item) }} left</template>
              <template v-else-if="item.start > now"> · in {{ span(item.start - now) }}</template>
            </div>
            <div class="font-medium text-gray-800 dark:text-gray-100 break-words mb-1">{{ item.title }}</div>
            <p v-if="item.text" class="text-gray-600 dark:text-gray-300 whitespace-pre-line">{{ item.text }}</p>
            <p v-else class="text-gray-400">No description sent.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
// What an output with a channel sends as its programme guide, as a viewer sees it
const { outputs } = useEntities()
const route = useRoute()
const router = useRouter()

const channels = computed(() => outputs.value.filter((output) => output.service_name))
const channelUid = ref(route.query.channel || null)
const channel = computed(() => channels.value.find((c) => c.uid === channelUid.value) || channels.value[0])
watch(channel, (c) => { if (c && c.uid !== channelUid.value) channelUid.value = c.uid }, { immediate: true })
watch(channelUid, (uid) => { if (uid) router.replace({ query: { ...route.query, channel: uid } }) }, { immediate: true })

// Back to where the guide was opened from, or to the mixer
const close = () => (window.history.state?.back ? router.back() : navigateTo('/'))
const onKey = (event) => { if (event.key === 'Escape' && !event.defaultPrevented) close() }

const guide = ref(null)
const error = ref(null)
const updated = ref(null)
const now = ref(Math.floor(Date.now() / 1000))

// The guide changes at most every few seconds; asked every ten
const load = async () => {
  if (!channel.value) return
  try {
    guide.value = await useApiFetch(`/api/v2/outputs/${channel.value.uid}/epg`)
    updated.value = Math.floor(Date.now() / 1000)
    error.value = null
  } catch (e) {
    error.value = 'Could not load the guide'
  }
}
watch(() => channel.value?.uid, () => { guide.value = null; load() }, { immediate: true })
let poll, tick
onMounted(() => {
  window.addEventListener('keydown', onKey)
  poll = setInterval(load, 10000)
  tick = setInterval(() => { now.value = Math.floor(Date.now() / 1000) }, 1000)
})
onBeforeUnmount(() => { clearInterval(poll); clearInterval(tick); window.removeEventListener('keydown', onKey) })

const programmes = computed(() => {
  if (!guide.value) return []
  const all = [guide.value.present, guide.value.following, ...(guide.value.schedule || [])].filter(Boolean)
  return all.sort((a, b) => a.start - b.start)
})

const end = (item) => item.start + item.duration
const isOn = (item) => item.start <= now.value && now.value < end(item)
const progress = (item) => Math.min(100, Math.max(0, ((now.value - item.start) / item.duration) * 100))
const remaining = (item) => span(end(item) - now.value)
const clock = (seconds) => new Date(seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const span = (seconds) => {
  const minutes = Math.max(0, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`
}

// Days in local time, from today to the last that has a programme
const midnight = (seconds) => {
  const date = new Date(seconds * 1000)
  date.setHours(0, 0, 0, 0)
  return Math.floor(date.getTime() / 1000)
}
const dayStart = ref(midnight(now.value))
const days = computed(() => {
  const today = midnight(now.value)
  const last = programmes.value.length ? midnight(end(programmes.value.at(-1)) - 1) : today
  const list = []
  for (let day = new Date(today * 1000); day.getTime() / 1000 <= last; day.setDate(day.getDate() + 1)) {
    const start = Math.floor(day.getTime() / 1000)
    const offset = Math.round((start - today) / 86400)
    const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow'
      : day.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'numeric' })
    list.push({ start, label })
  }
  return list
})
const dayProgrammes = computed(() =>
  programmes.value.filter((item) => end(item) > dayStart.value && item.start < dayStart.value + 86400))

// Timeline: an hour is this many pixels wide
const hourWidth = ref(120)
const timeline = ref(null)
const place = (item) => {
  const from = Math.max(item.start, dayStart.value)
  const to = item.duration ? Math.min(end(item), dayStart.value + 86400) : from + 600
  return {
    left: `${((from - dayStart.value) / 3600) * hourWidth.value}px`,
    width: `${Math.max(3, ((to - from) / 3600) * hourWidth.value - 2)}px`,
  }
}
const scrollTo = (seconds) => nextTick(() => {
  if (!timeline.value) return
  const x = ((seconds - dayStart.value) / 3600) * hourWidth.value
  timeline.value.scrollTo({ left: Math.max(0, x - timeline.value.clientWidth / 3), behavior: 'smooth' })
})

// The one programme whose details are open, in the list and marked on the timeline
// by start and title, so it stays open when the guide is fetched again
const key = (item) => `${item.start}-${item.title}`
const selected = ref(null)
const isOpen = (item) => selected.value === key(item)
const select = (item) => {
  selected.value = isOpen(item) ? null : key(item)
  if (selected.value) scrollTo(item.start)
}
const showDay = (start) => {
  dayStart.value = start
  selected.value = null
  scrollTo(start === midnight(now.value) ? now.value : start + 6 * 3600)
}
const jumpToNow = () => showDay(midnight(now.value))
watch(hourWidth, () => scrollTo(programmes.value.find(isOpen)?.start ?? now.value))
// Once the guide is there, show where now is
watch(() => !!guide.value, (there) => { if (there) scrollTo(now.value) })
</script>
