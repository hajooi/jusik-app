/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#353535',
        slate: '#5F5F5F',
        'dark-green': '#24613B',
        'mid-green': '#68A67D',
        'light-green': '#8FBF9F',
        'base-cream': '#F5ECD7',
        'soft-beige': '#EBE2CD',
        'dark-beige': '#C2BAA6',
        orange: '#F18F01',
        'deep-brown': '#833500',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
