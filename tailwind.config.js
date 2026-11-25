/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        reloot: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#0f172a'
        },
        mp: {
          DEFAULT: '#009ee3',
          dark: '#007eb5',
          light: '#e6f6fd'
        }
      }
    }
  },
  plugins: []
};