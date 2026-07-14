/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      primary: "var(--primary)",
      secondary: "var(--secondary)",
      border: "var(--border)",
      "light-primary": "var(--light-primary)",
      "light-gray": "var(--light-gray)",

      background: "var(--background)",
      "surface-overlay": "var(--surface-overlay)",

      text: {
        primary: "var(--text-primary)",
        darker: "var(--text-darker)",
        secondary: "var(--text-secondary)",
        naturalGray: "var(--text-natural-gray)",
      },
    },
    borderRadius: {
      'md': '12px',
    }
    },
  },
  plugins: [],
}