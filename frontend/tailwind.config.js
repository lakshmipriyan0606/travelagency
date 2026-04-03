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
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)',
        'premium-lg': '0 20px 50px -15px rgba(0, 0, 0, 0.15)',
        'premium-xl': '0 30px 80px -20px rgba(0, 0, 0, 0.3)',
        'glow': '0 10px 30px -10px rgba(252, 175, 22, 0.3), 0 1px 4px rgba(252, 175, 22, 0.1)',
        'glow-lg': '0 20px 50px -15px rgba(252, 175, 22, 0.4)',
        'glow-xl': '0 30px 80px -20px rgba(252, 175, 22, 0.5)',
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
