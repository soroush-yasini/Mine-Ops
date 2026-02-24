import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1a5276',
          50: '#eaf2fb',
          100: '#d4e6f7',
          500: '#1a5276',
          600: '#154560',
          700: '#0f3244',
        },
        gold: {
          DEFAULT: '#f0b429',
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f0b429',
          600: '#d4a017',
        }
      }
    },
  },
  plugins: [],
} satisfies Config
