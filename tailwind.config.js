/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Anuphan', 'sans-serif'],
      },
      borderRadius: {
        'md': '6px', // 4-8px range as requested (rounded-md = 6px)
      },
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        emergency: {
          red: '#ef4444',
          amber: '#f59e0b',
          green: '#10b981',
          slate: '#64748b',
        }
      }
    },
  },
  plugins: [],
}
