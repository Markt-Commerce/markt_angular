/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        markt: {
          primary: '#E94C2A',
          secondary: '#E94B26',
          accent: '#E07575',
          dark: '#181211',
          light: '#F4F1F0',
          muted: '#886A63',
          border: '#E5DDDC'
        }
      },
                fontFamily: {
            sans: ['Inter', 'sans-serif'],
          },
    },
  },
  plugins: [],
} 