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
        },
        primary: '#E94C2A',
        secondary: '#E94B26',
        accent: '#E07575',
        dark: '#181211',
        light: '#F4F1F0',
        muted: '#886A63',
        border: '#E5DDDC',
        'primary-dark': '#D63E1F',
        'gray-text': '#6B7280',
        'gray-light': '#F9FAFB',
        'gray-border': '#E5E7EB',
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.04)',
        DEFAULT: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        md: '0 2px 4px -1px rgba(0,0,0,0.10), 0 4px 6px -1px rgba(0,0,0,0.10)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -2px rgba(0,0,0,0.05)'
      }
    },
  },
  plugins: [],
} 