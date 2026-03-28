/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'war': {
          'bg': '#f8f6f1',
          'surface': '#ffffff',
          'surface2': '#f0ede6',
          'border': '#d4d0c8',
          'border-hi': '#b0aca4',
          'text': '#1a1a1a',
          'text-dim': '#4a4a4a',
          'text-muted': '#8a8a8a',
          'amber': '#9a7b1a',
          'amber-dim': '#b89530',
          'red': '#a83232',
          'red-dim': '#c44040',
          'green': '#2a6e2a',
          'green-dim': '#3a8a3a',
          'blue': '#2a5a8a',
          'blue-dim': '#4a7ab8',
          'cyan': '#2a7a6a',
        },
      },
      fontFamily: {
        'blackletter': ['"UnifrakturCook"', '"Old English Text MT"', 'Georgia', 'serif'],
        'serif': ['"Crimson Text"', 'Georgia', '"Times New Roman"', 'serif'],
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        'display': ['"Crimson Text"', 'Georgia', 'serif'],
      },
      fontSize: {
        'xxs': '0.65rem',
      },
      maxWidth: {
        'content': '1400px',
      },
    },
  },
  plugins: [],
};
