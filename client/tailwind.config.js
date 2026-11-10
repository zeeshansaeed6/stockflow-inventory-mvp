/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          pink:   '#ec4899',
          violet: '#8b5cf6',
          amber:  '#f59e0b',
          teal:   '#14b8a6',
          emerald:'#10b981',
          rose:   '#f43f5e',
        },
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(1200px 600px at 10% 0%, #c7d2fe 0%, transparent 60%), radial-gradient(900px 500px at 90% 100%, #fbcfe8 0%, transparent 60%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        'hero-gradient-dark':
          'radial-gradient(1200px 600px at 10% 0%, #312e81 0%, transparent 60%), radial-gradient(900px 500px at 90% 100%, #831843 0%, transparent 60%), linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      },
    },
  },
  plugins: [],
};
