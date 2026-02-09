/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f14",
        panel: "#121826",
        accent: "#3b82f6",
        muted: "#9ca3af",
      },
    },
  },
  plugins: [],
};
