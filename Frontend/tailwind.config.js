/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#0000FF',       // Biru utama
          darkblue: '#0303B5',   // Biru yang lebih gelap
          yellow: '#FFD700',     // Kuning
        },
        bem: {
          blue: '#0000FF',
          yellow: '#FFD700',
          lightblue: '#1E90FF',
        }
      },
      fontFamily: {
        'sans': ['Qanelas', 'system-ui', 'sans-serif'],
        'qanelas': ['Qanelas', 'sans-serif'],
      },
    },
  },
  plugins: [],
}