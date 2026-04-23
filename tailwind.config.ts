import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'zend-bg': '#0f111a',
        'zend-bg2': '#1a1f2e',
        'zend-card': '#1e2336',
        'zend-border': '#2d3446',
        'zend-input': '#141724',
        'zend-accent': '#6366f1',
        'zend-accent-hover': '#4338ca',
        'zend-success': '#10b981',
        'zend-warning': '#f59e0b',
        'zend-error': '#ef4444',
      },
      maxWidth: {
        'app': '480px',
      },
      borderRadius: {
        'xl2': '24px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-display)', 'EB Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'logo-scroll': 'logo-scroll 10s linear infinite',
      },
      keyframes: {
        'logo-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
