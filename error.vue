<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-gray-400 dark:text-gray-500">
    <template v-if="redirecting">
      <Icon name="ph:spinner" size="32px" class="animate-spin" />
    </template>
    <template v-else>
      <span class="text-6xl font-bold text-gray-300 dark:text-gray-600">{{ error?.statusCode || 500 }}</span>
      <span class="mt-2 text-sm">{{ error?.message || 'Something went wrong' }}</span>
      <pre class="mt-2 text-xs text-red-400 max-w-lg overflow-auto">{{ error?.stack || error }}</pre>
      <button @click="handleError" class="mt-4 px-4 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700">
        Try again
      </button>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({ error: Object });

const isDynImportError = /dynamically imported module|Loading failed for the module/.test(props.error?.message || '');
const redirecting = ref(isDynImportError);

const handleError = () => clearError({ redirect: '/' });

onMounted(async () => {
  if (isDynImportError) {
    clearError({ redirect: '/' });
    return;
  }
  console.error('[error.vue] Nuxt error:', props.error);
  const { checkAuth, isAuthenticated, login } = useAuth();
  await checkAuth();
  if (!isAuthenticated.value) {
    redirecting.value = true;
    login();
    return;
  }
});
</script>
