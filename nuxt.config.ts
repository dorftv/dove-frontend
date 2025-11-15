import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  experimental: {
    appManifest: false,
  },
  ssr: false,
  
  devtools: { enabled: true },
  css: ["@/assets/css/tailwind.css", "primeicons/primeicons.css"],
  postcss: {
    plugins: {
      "postcss-import": {},
      "tailwindcss/nesting": {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  
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
        '/docs': {
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

      },
    },
  },

  modulesDir: ['./node_modules'],
  modules: ["@primevue/nuxt-module", "@nuxt/icon"],

  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    }
  }
})
