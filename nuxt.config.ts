import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  experimental: {
    appManifest: false,
  },
  ssr: false,
  static: true,
  nitro: {
    devProxy: {
      '/api': process.env.DOVE_API ? process.env.DOVE_API + '/api' : 'http://localhost:5000/api',
      '/proxy': process.env.DOVE_API ? process.env.DOVE_API + '/proxy' : 'http://localhost:5000/proxy',
      '/preview': process.env.DOVE_API ? process.env.DOVE_API + '/preview' : 'http://localhost:5000/preview',
    },

  },
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
    }
  },

  modulesDir: ['./node_modules'],
  modules: ['@nuxt/ui', '@primevue/nuxt-module', "@nuxt/icon"],

  primevue: {
    options: {
        theme: {
            preset: Aura
        }
    }
  }


})
