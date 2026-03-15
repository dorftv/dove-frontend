<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">About</h1>

    <section class="flex flex-col sm:flex-row items-center gap-6 mb-8">
      <img :src="'/branding/logo.png'" alt="DOVE" class="w-40 sm:w-48 md:w-56 shrink-0" />
      <div class="flex flex-col justify-center">
        <p class="text-gray-700 dark:text-gray-300 mb-3">
          <strong>DOVE</strong> (Dove Online Video Editor) is an API-driven live video mixing application.
          It combines multiple video and audio sources into scenes, mixes them into a live program output,
          and streams to various destinations.
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          Built for community television production at
          <a href="https://dorftv.at" target="_blank" class="text-emerald-600 dark:text-emerald-400 hover:underline">dorftv</a>.
        </p>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Technology</h2>
      <dl class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div class="flex gap-2">
          <dt class="font-medium w-28 shrink-0">Backend</dt>
          <dd class="text-gray-500 dark:text-gray-400">Python, FastAPI, GStreamer</dd>
        </div>
        <div class="flex gap-2">
          <dt class="font-medium w-28 shrink-0">Frontend</dt>
          <dd class="text-gray-500 dark:text-gray-400">Nuxt, Vue, Nuxt UI, Tailwind CSS</dd>
        </div>
        <div class="flex gap-2">
          <dt class="font-medium w-28 shrink-0">Streaming</dt>
          <dd class="text-gray-500 dark:text-gray-400">SRT, RTMP, HLS, WebRTC (WHEP), Decklink</dd>
        </div>
      </dl>
    </section>

    <section>
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Links</h2>
      <div class="flex gap-4 text-sm">
        <a href="https://dorftv.at" target="_blank" class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
          <Icon name="ph:globe" size="16px" /> dorftv.at
        </a>
        <a href="https://github.com/dorftv/dove" target="_blank" class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
          <Icon name="ph:github-logo" size="16px" /> GitHub
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>
