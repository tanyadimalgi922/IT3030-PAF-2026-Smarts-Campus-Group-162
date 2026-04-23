/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        campus: {
          ink: "#0F172A",
          navy: "#0B2E59",
          blue: "#2563EB",
          sky: "#E0F2FE",
          pale: "#F8FBFF",
          cloud: "#EFF6FF",
        },
      },
      boxShadow: {
        panel: "0 24px 80px rgba(37, 99, 235, 0.14)",
      },
    },
  },
  plugins: [],
}

