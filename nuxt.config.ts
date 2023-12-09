import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/styles.css', 'vuetify/styles'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Isha Distributors',
      short_name: 'IshaDistributors',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      // globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    // client: {
    //   installPrompt: true,
    //   // you don't need to include this: only for testing purposes
    //   // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
    //   periodicSyncForUpdates: 20,
    // },
    devOptions: {
      enabled: true,
      // suppressWarnings: true,
      // navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  modules: [
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    'nuxt-icon',
    '@invictus.codes/nuxt-vuetify',
    '@nuxtjs/google-fonts',

  ],

  googleFonts: {
    families: {
      Poppins: true,
    },
    display: 'swap',
  },

  vuetify: {
    vuetifyOptions: {
    },
    defaultAssets: {
      font: {
        family: 'Poppins',
      },
    },
    moduleOptions: {
      treeshaking: true,
      useIconCDN: false,
      styles: true,
      autoImport: true,
      useVuetifyLabs: true,
    },
  },

  runtimeConfig: {
    public: {
      distribution: process.env.DISTRIBUTION,
    },
  },

})
