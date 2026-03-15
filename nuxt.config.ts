export default defineNuxtConfig({
  experimental: {
    appManifest: false,
  },
  ssr: false,

  runtimeConfig: {
    public: {
      wsUrl: process.env.DOVE_WS_URL || '',
    },
  },

  devtools: { enabled: true },
  css: ["@/assets/css/tailwind.css"],

  vite: {
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('media-'),
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.DOVE_API || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/openapi.json': {
          target: process.env.DOVE_API || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/proxy': {
          target: process.env.DOVE_API || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/preview': {
          target: process.env.DOVE_API || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/whep': {
          target: process.env.DOVE_API || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/assets': {
          target: process.env.DOVE_API || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/auth': {
          target: process.env.DOVE_API || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  },

  modulesDir: ['./node_modules'],
  modules: ["@nuxt/ui"],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
})
