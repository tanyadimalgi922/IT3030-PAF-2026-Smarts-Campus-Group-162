/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        campus: {
          ink: "#102033",
          navy: "#173B57",
          teal: "#0E7C7B",
          mint: "#CDEFE6",
          amber: "#F4B942",
          coral: "#E86A58",
          cloud: "#F6F8FB",
        },
      },
      boxShadow: {
        panel: "0 24px 80px rgba(16, 32, 51, 0.16)",
      },
    },
  },
  plugins: [],
}

