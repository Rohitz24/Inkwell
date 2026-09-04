/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Lora"', "Georgia", "serif"],
        sans: ['"Inter"', "sans-serif"],
      },
      colors: {
        editorial: {
          bg: "#FAF9F6",
          darkBg: "#121212",
          cardDark: "#1E1E1E",
          dark: "#1A1A1A",
          muted: "#737373",
          border: "#E5E5E5",
          borderDark: "#2E2E2E",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};