/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#009639",
        "primary-hover": "#007a2e",
        secondary: "#2563eb",
        accent: "#fbbf24",
        dark: "#1f2937",
        "light-gray": "#f9fafb",
        gray: "#6b7280",
        border: "#e5e7eb",
        "status-red": "#ef4444",
        "status-blue": "#3b82f6",
      }
    },
  },
  plugins: [],
}
