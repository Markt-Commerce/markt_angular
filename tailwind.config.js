/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      container: {
        center: true,
      },
      colors: {
        'secRed': '#e94c2a',
        'secWhite': '#F5F5F5',
      },
    },
  },
  plugins: [
    require('flowbite/plugin') // add this line
  ],
}
