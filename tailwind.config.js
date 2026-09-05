/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        scope: {
          bg: "#F8FAFC",
          ink: "#0F172A",
        },
      },
    },
  },
  plugins: [],
};