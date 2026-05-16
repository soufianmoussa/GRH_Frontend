/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        'project-blue': '#237ad2',
        'project-dark': '#0a3d62',
      }
    },
  },
  plugins: [],
}