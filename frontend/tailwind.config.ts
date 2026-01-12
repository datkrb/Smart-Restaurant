/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#ec6d13",
        "primary-hover": "#d55f0d",
        "background-light": "#f8f7f6",
        "background-dark": "#221810",
        "text-main": "#111418",
        "text-secondary": "#637588",
        "border-light": "#e6e8eb",
        "input-bg": "#f0f2f4",
      },
      fontFamily: {
        "sans": ["Work Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
