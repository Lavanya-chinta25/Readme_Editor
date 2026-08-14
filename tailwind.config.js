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
          bg: '#ffffff',
          border: '#d0d7de',
          canvas: '#f6f8fa',
          text: '#1F2328',
          muted: '#656d76',
          link: '#0969da',
          success: '#1f883d',
          successHover: '#1a7f37'
        }
      }
    },
  },
  plugins: [],
}
