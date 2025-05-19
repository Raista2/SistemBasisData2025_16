/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Warna BEM FTUI dari gambar yang Anda berikan
        primary: {
          blue: '#0000FF',       // Biru utama
          darkblue: '#0303B5',   // Biru yang lebih gelap (untuk hover)
          yellow: '#FFD700',     // Kuning cerah di footer
        },
        secondary: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        bem: {
          blue: '#0000FF',
          yellow: '#FFD700',
          lightblue: '#1E90FF',  // Untuk variasi warna (button hover, dll)
        }
      },
      fontFamily: {
        'sans': ['Qanelas', 'system-ui', 'sans-serif'],
        'qanelas': ['Qanelas', 'sans-serif'],
        'heading': ['Qanelas', 'sans-serif'],
        'body': ['Qanelas', 'sans-serif'],
      },
    },
  },
  plugins: [],
}