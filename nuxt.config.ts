import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  experimental: {
    appManifest: false,
  },
  ssr: false,
  target: 'static',
  nitro: {
    devProxy: {
      '/api': process.env.DOVE_API ? process.env.DOVE_API + '/api' : 'http://localhost:5000/api',
      '/docs': process.env.DOVE_API ? process.env.DOVE_API + '/docs' : 'http://localhost:5000/docs',
      '/proxy': process.env.DOVE_API ? process.env.DOVE_API + '/proxy' : 'http://localhost:5000/proxy',
      '/preview': process.env.DOVE_API ? process.env.DOVE_API + '/preview' : 'http://localhost:5000/preview',
      '/whep': process.env.WHEP_URL ? process.env.WHEP_URL + '/' : 'http://localhost:8889/',
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
  modules: ["@primevue/nuxt-module", "@nuxt/icon"],

  primevue: {
    options: {
        theme: {
            preset: Aura
        }
    }
  }


})
