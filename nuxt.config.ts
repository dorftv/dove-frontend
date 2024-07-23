// https://nuxt.com/docs/api/configuration/nuxt-config
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
  css: ["@/assets/css/tailwind.css"],
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
  modules: ['@nuxt/ui', 'nuxt-icon', "nuxt-icon-tw"],


})