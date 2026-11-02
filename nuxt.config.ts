export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@pinia/nuxt'],
  typescript: {
    strict: true,
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      titleTemplate: '%s · Notes',
      meta: [{ name: 'description', content: 'Заметки со списками задач' }],
    },
  },
  css: [
    '@fontsource-variable/onest/index.css',
    '~/assets/styles/main.scss'
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/styles/_variables" as *;
            @use "~/assets/styles/_mixins" as *;
          `
        }
      }
    }
  }
})
