// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#00ADB5',
        'brand-secondary': '#393E46',
        'brand-dark': '#222831',
        'brand-light': '#EEEEEE',
      },
    },
  },
  plugins: [],
}