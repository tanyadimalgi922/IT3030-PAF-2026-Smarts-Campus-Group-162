/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        ocean: "#0f766e",
        lagoon: "#14b8a6",
        mango: "#f59e0b",
        sand: "#fff7ed",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(20, 184, 166, 0.26)",
      },
    },
  },
  plugins: [],
}

