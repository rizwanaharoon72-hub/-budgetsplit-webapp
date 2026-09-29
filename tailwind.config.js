/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          accent: '#0F766E',
          'accent-hover': '#0D645E',
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
          muted: '#64748B',
          border: '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
