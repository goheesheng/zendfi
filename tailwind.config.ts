import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core darks — app dark mode
        'zend-bg': '#0c0f1a',
        'zend-bg2': '#111527',
        'zend-card': '#161a2e',
        'zend-border': '#232842',
        'zend-input': '#0e1222',
        // Accent — electric teal
        'zend-accent': '#06D6A0',
        'zend-accent-hover': '#05C090',
        'zend-accent-soft': '#D0F5E8',
        // Teal (app accent)
        'zend-blue': '#06D6A0',
        'zend-blue-dark': '#05C090',
        // Semantic
        'zend-success': '#34d399',
        'zend-warning': '#fbbf24',
        'zend-error': '#f87171',
        // Light mode
        'zend-light': '#fafbfc',
        'zend-light-card': '#f5f6f8',
      },
      maxWidth: {
        'app': '480px',
      },
      borderRadius: {
        'xl2': '24px',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Outfit', 'system-ui', 'sans-serif'],
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
        'glow': '0 0 20px rgba(6, 214, 160, 0.25)',
        'glow-lg': '0 0 40px rgba(6, 214, 160, 0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #06D6A0 0%, #05C090 50%, #049E78 100%)',
        'dark-gradient': 'linear-gradient(180deg, #111527 0%, #0c0f1a 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
