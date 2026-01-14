/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1ABC9C',
          dark: '#16A085',
          light: '#48C9B0'
        },
        background: '#F8F9FA'
      }
    },
  },
  plugins: [],
}
