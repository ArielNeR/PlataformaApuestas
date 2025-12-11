/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        bet: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#0f3b38',
          bg: '#0B0D17',
          card: '#11131F',
          border: '#1A1D2E',
          green: '#00D4AA',
          red: '#FF006E',
          purple: '#9D4EDD',
          gold: '#FFD700',
        }
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-main': 'radial-gradient(circle at top left, #16213E, #0B0D17)',
      }
    },
  },
  plugins: [],
}