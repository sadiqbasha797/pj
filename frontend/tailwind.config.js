/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {},
    fontFamily: {
      exo: ['"Exo 2"', 'sans-serif'],
      roboto: ['Roboto', 'sans-serif'],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

