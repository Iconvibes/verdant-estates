/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1E3A2F',
        'forest-deep': '#162B22',
        cream: '#FAF7F0',
        bronze: '#BFA06B',
        text: '#2D2A26',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(30, 58, 47, 0.25)',
        lift: '0 24px 60px -20px rgba(30, 58, 47, 0.4)',
      },
    },
  },
  plugins: [],
}
