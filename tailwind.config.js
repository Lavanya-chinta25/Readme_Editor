/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        github: {
          dark: '#0d1117',
          border: '#30363d',
          canvas: '#161b22',
          text: '#c9d1d9',
          muted: '#8b949e',
          link: '#58a6ff',
          success: '#238636',
          successHover: '#2ea043'
        }
      }
    },
  },
  plugins: [],
}
