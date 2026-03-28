/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'war': {
          'bg': '#0a0a0c',
          'surface': '#111114',
          'surface2': '#18181c',
          'border': '#2a2a30',
          'border-hi': '#3a3a42',
          'text': '#e8e6e3',
          'text-dim': '#8a8880',
          'text-muted': '#5a5850',
          'amber': '#d4a017',
          'amber-dim': '#8a6a10',
          'red': '#c44040',
          'red-dim': '#6a2020',
          'green': '#3a8a3a',
          'green-dim': '#1a4a1a',
          'blue': '#4a7ab8',
          'blue-dim': '#2a4a6a',
          'cyan': '#4aaa9a',
        },
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        'sans': ['"DM Sans"', '"Helvetica Neue"', 'sans-serif'],
        'display': ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      fontSize: {
        'xxs': '0.65rem',
      },
    },
  },
  plugins: [],
};
