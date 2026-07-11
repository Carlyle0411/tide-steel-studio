/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      },
      colors: {
        ink: "#07090c",
        panel: "#10141b",
        panel2: "#151b24",
        line: "#26303d",
        gold: "#d6b46a",
        jade: "#7ed6bd",
        mist: "#d6dee7"
      },
      boxShadow: {
        soft: "0 20px 70px rgba(0,0,0,.35)"
      }
    }
  },
  plugins: []
};
