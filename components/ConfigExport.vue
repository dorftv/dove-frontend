<template>
  <USlideover v-model:open="open" side="right" :overlay="false" :ui="{ width: 'max-w-xl' }">
    <template #title>
      <div class="flex items-center gap-2">
        <Icon name="ph:download-simple" size="16px" class="text-emerald-400" />
        <span class="font-medium text-sm">Export Config</span>
      </div>
    </template>
    <template #body>
      <div class="space-y-4 text-sm">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Select what to include, preview, then download.
        </p>

        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <USwitch v-model="includeInputs" size="xs" />
            <span>Inputs</span>
            <span class="text-xs text-gray-500">({{ inputCount }})</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <USwitch v-model="includeScenes" size="xs" />
            <span>Scenes & slots</span>
            <span class="text-xs text-gray-500">({{ sceneCount }})</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <USwitch v-model="includeOutputs" size="xs" />
            <span>Outputs & encoders</span>
            <span class="text-xs text-gray-500">({{ outputCount }})</span>
          </label>
          <label v-if="canAdmin" class="flex items-center gap-2 cursor-pointer">
            <USwitch v-model="includeSettings" size="xs" />
            <span>Global settings</span>
            <span class="text-[10px] text-amber-500">admin only</span>
          </label>
          <UAlert
            v-if="canAdmin && includeSettings"
            color="warning"
            variant="subtle"
            icon="ph:warning"
            title="Export includes credentials"
            description="The TOML will contain plaintext auth.cookie_secret and auth.api_tokens. Treat the file as a secret."
            :ui="{ root: 'py-2', title: 'text-xs font-medium', description: 'text-[11px]' }"
          />
        </div>

        <div class="flex gap-2">
          <UButton @click="loadPreview" :loading="loading" color="neutral" variant="outline" block>
            Preview
          </UButton>
          <UButton @click="download" :disabled="!preview" color="primary" block>
            Download
          </UButton>
        </div>

        <div v-if="preview" class="flex-grow min-h-0">
          <pre class="text-[10px] bg-gray-900 text-gray-300 p-2 rounded overflow-auto h-full max-h-[calc(100vh-280px)] font-mono">{{ preview }}</pre>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup>
const open = defineModel('open', { type: Boolean, default: false });

const { inputs, sceneMixers, outputs } = useEntities();
const { canAdmin } = useAuth();
const toast = useToast();

const includeInputs = ref(true);
const includeScenes = ref(true);
const includeOutputs = ref(true);
const includeSettings = ref(canAdmin.value);
const loading = ref(false);
const preview = ref(null);

const inputCount = computed(() => inputs.value.length);
const sceneCount = computed(() => sceneMixers.value.length);
const outputCount = computed(() => outputs.value.filter(o => !o.is_preview).length);

// Clear preview when toggles change
watch([includeInputs, includeScenes, includeOutputs, includeSettings], () => {
  preview.value = null;
});

const buildUrl = () => {
  const params = new URLSearchParams();
  params.set('inputs', includeInputs.value);
  params.set('scenes', includeScenes.value);
  params.set('outputs', includeOutputs.value);
  params.set('settings', includeSettings.value);
  return `/api/config/export?${params}`;
};

const loadPreview = async () => {
  loading.value = true;
  try {
    const response = await fetch(buildUrl(), {
      headers: useAuthHeaders(),
    });
    if (!response.ok) {
      preview.value = `Error: ${response.status} ${response.statusText}`;
      return;
    }
    preview.value = await response.text();
  } catch (e) {
    console.error('Config preview failed:', e);
    preview.value = `Error: ${e.message}`;
  } finally {
    loading.value = false;
  }
};

const download = () => {
  if (!preview.value) return;
  if (includeSettings.value && canAdmin.value) {
    toast.add({
      title: 'Credentials included',
      description: 'The TOML will contain plaintext auth.cookie_secret and auth.api_tokens. Treat the file as a secret.',
      color: 'warning',
    });
  }
  const blob = new Blob([preview.value], { type: 'application/toml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dove-config-${new Date().toISOString().slice(0, 10)}.toml`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
