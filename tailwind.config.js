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
        'buong-orange': '#F18F01',
        'deep-amber': '#D97706',
        'fintech-emerald': '#10B981',
        'signal-crimson': '#F43F5E',
        'snow-slate': '#F8FAFC',
        'hairline-gray': '#E2E8F0',
        'muted-steel': '#64748B',
        'graphite-slate': '#1E293B',
        'oled-obsidian': '#09090B',
        orange: '#F18F01',
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
