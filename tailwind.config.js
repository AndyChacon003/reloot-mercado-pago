export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        reloot: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#0057ff',
          700: '#003eb8',
          900: '#0b192c',
        },
        mp: {
          DEFAULT: '#009ee3',
          dark: '#007eb5'
        }
      }
    },
  },
  plugins: [],
}
