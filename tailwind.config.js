/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bgBase: '#0b1326',
        surface: '#131b2e',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        cyanGlow: 'rgba(34, 211, 238, 0.5)',
      }
    },
  },
  plugins: [],
}
