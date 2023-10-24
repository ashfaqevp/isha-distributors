/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],  theme: {
    extend: {
      colors: {
        primary: '#bababa',
        secondary: '#007BFF',
        dark: '#FF5733',
        light: '#007BFF',
      },
    },
  },
  plugins: [],
}