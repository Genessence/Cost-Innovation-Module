/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F6',
        primary: {
          DEFAULT: '#0F766E',
          dark: '#134E4A',
          accent: '#14B8A6',
          light: '#CCFBF1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        lifted: '0 8px 24px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
};
