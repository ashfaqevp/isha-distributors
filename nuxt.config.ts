import vuetify from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  devtools: { enabled: true },
  css: ['@/assets/css/styles.css', 'vuetify/styles'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  vite: {
    // @ts-expect-error
    // curently this will lead to a type error, but hopefully will be fixed soon #justBetaThings
    ssr: {
      noExternal: ['vuetify'], // add the vuetify vite plugin
    },
  },
  modules: [
    // ...
    '@pinia/nuxt',
    'nuxt-icon',
    '@invictus.codes/nuxt-vuetify',
    // '@nuxtjs/eslint-module',
    // async (options, nuxt) => {
    //   nuxt.hooks.hook('vite:extendConfig', config => config.plugins.push(
    //       vuetify()
    //     ))
    // }
  ],
  buildDir: 'dist',
  target: 'static',
  generate: {
    fallback: true,
  },

  vuetify: {
    /* vuetify options */
    vuetifyOptions: {
      // @TODO: list all vuetify options
    },
    moduleOptions: {
      /* nuxt-vuetify module options */
      treeshaking: true,
      useIconCDN: false,
      /* vite-plugin-vuetify options */
      styles: true,
      autoImport: true,
      useVuetifyLabs: true,
    },
  },
})
