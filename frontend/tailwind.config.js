/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        campus: {
          ink: "#07111F",
          navy: "#0B1F44",
          blue: "#2563EB",
          cyan: "#06B6D4",
          violet: "#7C3AED",
          sky: "#E0F7FF",
          pale: "#F8FBFF",
          cloud: "#EEF6FF",
        },
      },
      boxShadow: {
        panel: "0 28px 90px rgba(37, 99, 235, 0.18)",
        glow: "0 18px 50px rgba(6, 182, 212, 0.22)",
      },
    },
  },
  plugins: [],
}

