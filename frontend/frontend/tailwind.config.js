
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        success: '#34C759',
        warning: '#FFCC00',
        danger:  '#FF3B30'
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem'
      }
    },
  },
  plugins: [],
}
