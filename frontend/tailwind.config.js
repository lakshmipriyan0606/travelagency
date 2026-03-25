/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "custom-black": "#2B2B2B",
        primary: "#FCAF16",
      },
      fontFamily: {
        heading: ["Rubik", "sans-serif"],
        body: ["Quicksand", "sans-serif"],
        accent: ["Caramel", "cursive"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
