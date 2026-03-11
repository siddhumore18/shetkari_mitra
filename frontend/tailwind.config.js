/** @type {import('tailwindcss').Config} */

const customGreen = {
  50: '#F8FAF8',
  100: '#EAF5EA',
  200: '#D3EBD3',
  300: '#8FD694',
  400: '#7BC780',
  500: '#6BAF6B',
  600: '#5A965A',
  700: '#467646',
  800: '#385B38',
  900: '#2F3E2F',
  950: '#1C261C',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Override standard colors to force unified fresh green theme */
        emerald: customGreen,
        teal: customGreen,
        green: customGreen,
        cyan: customGreen,
        indigo: customGreen,
        blue: customGreen,
        violet: customGreen,
        purple: customGreen,
        sky: customGreen,
        /* Override neutrals as well to ensure text and backgrounds match the requested palette perfectly */
        slate: customGreen,
        gray: customGreen,
        zinc: customGreen,
        neutral: customGreen,
        stone: customGreen,
        
        /* Legacy KK tokens */
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: 'var(--text-accent)',
        page: 'var(--bg-page)',
        'card-hover': 'var(--bg-card-hover)',
        'border-card': 'var(--border-card)',
        /* shadcn standard tokens */
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        'muted-foreground': 'var(--muted-foreground)',
        'accent-foreground': 'var(--accent-foreground)',
        /* shadcn Sidebar tokens */
        sidebar: {
          DEFAULT: 'var(--sidebar-background)',
          foreground: 'var(--sidebar-foreground)',
          border: 'var(--sidebar-border)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
        },
      },
      backgroundColor: {
        page: 'var(--bg-page)',
        'page-2': 'var(--bg-page-2)',
        card: 'var(--bg-card)',
      },
      transitionProperty: {
        'width': 'width',
      },
    },
  },
  plugins: [],
}









