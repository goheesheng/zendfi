import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core darks — rich, deep, layered
        'zend-bg': '#08090f',
        'zend-bg2': '#0f1117',
        'zend-card': '#14161e',
        'zend-border': '#1e2030',
        'zend-input': '#0c0d14',
        // Accent — indigo spectrum
        'zend-accent': '#6366f1',
        'zend-accent-hover': '#4f46e5',
        'zend-accent-soft': '#818cf8',
        // Semantic
        'zend-success': '#34d399',
        'zend-warning': '#fbbf24',
        'zend-error': '#f87171',
        // Light mode
        'zend-light': '#fafbfc',
        'zend-light-card': '#f1f3f5',
      },
      maxWidth: {
        'app': '480px',
      },
      borderRadius: {
        'xl2': '24px',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-display)', 'EB Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'logo-scroll': 'logo-scroll 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'aurora': 'aurora 20s ease-in-out infinite',
        'aurora-2': 'aurora-2 25s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'logo-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0f1117 0%, #08090f 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
