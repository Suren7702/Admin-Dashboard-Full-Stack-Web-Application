/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Keeps your default font for English (Inter/System)
        sans: ['Inter', 'system-ui', 'sans-serif'],
        
        // ✅ Adds your new Tamil font
        tamil: ['"Noto Sans Tamil"', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};