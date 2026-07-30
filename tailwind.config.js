/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#082536",
        teal: "#145A68",
        orange: "#FF6000",
        cream: "#FFF6EF",
        mist: "#F5F7F8",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(8,37,54,.08)",
      },
    },
  },
  plugins: [],
};
