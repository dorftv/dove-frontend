<template>
  <UModal v-model:open="open" title="Keyboard Shortcuts" description="Available keyboard shortcuts">
    <template #content>
      <div class="p-5 max-w-md">
        <div class="space-y-3 text-sm">
          <div v-for="group in groups" :key="group.label">
            <div class="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-medium">{{ group.label }}</div>
            <div class="space-y-1">
              <div v-for="s in group.shortcuts" :key="s.key" class="flex items-center justify-between py-0.5">
                <span class="text-gray-700 dark:text-gray-300">{{ s.desc }}</span>
                <kbd class="text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono border border-gray-200 dark:border-gray-600 min-w-[24px] text-center">{{ s.key }}</kbd>
              </div>
            </div>
          </div>
        </div>
        <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-4">Press <kbd class="bg-gray-100 dark:bg-gray-700 px-1 rounded font-mono text-[11px]">?</kbd> or <kbd class="bg-gray-100 dark:bg-gray-700 px-1 rounded font-mono text-[11px]">Esc</kbd> to close</p>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const open = useState('shortcuts-modal-open', () => false);

const groups = [
  {
    label: 'Scenes',
    shortcuts: [
      { key: '1–9', desc: 'Select scene' },
      { key: 'Enter', desc: 'Take (cut/crossfade to program)' },
      { key: 'T', desc: 'Toggle transition mode' },
    ],
  },
  {
    label: 'Panels',
    shortcuts: [
      { key: 'O', desc: 'Toggle outputs drawer' },
      { key: 'N', desc: 'Toggle NodeCG panel' },
    ],
  },
  {
    label: 'Create',
    shortcuts: [
      { key: 'I', desc: 'New input' },
      { key: 'S', desc: 'New scene' },
    ],
  },
  {
    label: 'Other',
    shortcuts: [
      { key: 'Esc', desc: 'Close open panel' },
      { key: '?', desc: 'This dialog' },
    ],
  },
];
</script>
