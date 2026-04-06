/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./docs/**/*.mdx",
    "./docs/**/*.md",
  ],
  theme: {
    extend: {
      colors: {
        'ant-bg': '#faf6f0',
        'ant-dark': '#2d1b19',
        'ant-red': '#dc2626',
        'ant-red-light': '#fca5a5',
        'ant-surface': '#ffffff',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
