<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Help</h1>

    <!-- Keyboard Shortcuts -->
    <section class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Keyboard Shortcuts</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Active on the main page when not typing in a form field.</p>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Key</th>
            <th class="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Action</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 dark:text-gray-300">
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <td class="py-2 pr-4"><kbd>1</kbd> &ndash; <kbd>9</kbd></td>
            <td class="py-2">Select scene by number</td>
          </tr>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <td class="py-2 pr-4"><kbd>Enter</kbd></td>
            <td class="py-2">Cut selected scene to program</td>
          </tr>
          <tr>
            <td class="py-2 pr-4"><kbd>?</kbd></td>
            <td class="py-2">Open this help page</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Interface Overview -->
    <section class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Interface Overview</h2>
      <dl class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <dt class="font-medium">Scenes</dt>
          <dd class="text-gray-500 dark:text-gray-400">Compositor layouts that combine multiple inputs. Select a scene to preview it before sending to program.</dd>
        </div>
        <div>
          <dt class="font-medium">Program Switch</dt>
          <dd class="text-gray-500 dark:text-gray-400">Controls which scene is currently live. Use the Cut button or press Enter to switch.</dd>
        </div>
        <div>
          <dt class="font-medium">Program</dt>
          <dd class="text-gray-500 dark:text-gray-400">The live output being sent to all configured outputs.</dd>
        </div>
        <div>
          <dt class="font-medium">Inputs</dt>
          <dd class="text-gray-500 dark:text-gray-400">Media sources (video files, streams, test patterns, HTML pages) that can be assigned to scene slots.</dd>
        </div>
        <div>
          <dt class="font-medium">Outputs</dt>
          <dd class="text-gray-500 dark:text-gray-400">Streaming destinations (SRT, RTMP, HLS, etc.) that receive the program output.</dd>
        </div>
      </dl>
    </section>

    <!-- Connection Status -->
    <section class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Connection Status</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">The dot in the header shows the WebSocket connection state:</p>
      <ul class="space-y-2 text-sm">
        <li class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
          <span class="text-gray-700 dark:text-gray-300"><strong>Green</strong> &mdash; Connected to the backend</span>
        </li>
        <li class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
          <span class="text-gray-700 dark:text-gray-300"><strong>Red</strong> &mdash; Disconnected</span>
        </li>
        <li class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
          <span class="text-gray-700 dark:text-gray-300"><strong>Orange (pulsing)</strong> &mdash; Reconnecting</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
kbd {
  @apply inline-block px-1.5 py-0.5 text-xs font-mono
         bg-gray-100 dark:bg-gray-700
         border border-gray-300 dark:border-gray-600
         rounded shadow-sm
         text-gray-700 dark:text-gray-300;
}
</style>
