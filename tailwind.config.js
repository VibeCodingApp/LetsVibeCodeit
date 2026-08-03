/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border-color)',
        'border-2': 'var(--border-2)',
        fg: 'var(--fg)',
        'fg-2': 'var(--fg-2)',
        muted: 'var(--muted)',
        'muted-2': 'var(--muted-2)',
        primary: 'var(--primary)',
        'primary-dim': 'var(--primary-dim)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        ticker: 'ticker 120s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'badge-pop': 'badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px var(--primary-glow)' },
          '50%': { boxShadow: '0 0 20px var(--primary-glow-strong)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
