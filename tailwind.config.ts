import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Bright editorial palette
        'zend-bg': '#fafaf8',
        'zend-surface': '#ffffff',
        'zend-surface-alt': '#f4f3f0',
        'zend-border': '#e8e6e1',
        'zend-border-strong': '#d4d1cb',
        // Coral accent (primary CTA)
        'zend-coral': '#FF6B6B',
        'zend-coral-hover': '#e85d5d',
        'zend-coral-soft': '#fff0f0',
        // Electric blue (info, links, active)
        'zend-electric': '#4361EE',
        'zend-electric-hover': '#3651d4',
        'zend-electric-soft': '#eef1ff',
        // Legacy aliases for components that still reference them
        'zend-blue': '#4361EE',
        'zend-blue-dark': '#3651d4',
        'zend-accent': '#4361EE',
        'zend-accent-hover': '#3651d4',
        // Text
        'zend-ink': '#1a1a1a',
        'zend-ink-secondary': '#6b6b6b',
        'zend-ink-muted': '#a0a0a0',
        // Semantic
        'zend-success': '#22c55e',
        'zend-warning': '#f59e0b',
        'zend-error': '#ef4444',
        // Dark mode (kept for dark theme contexts)
        'zend-card': '#161a2e',
        'zend-input': '#0e1222',
        'zend-accent-soft': '#8b9dff',
        // Light mode
        'zend-light': '#fafbfc',
        'zend-light-card': '#f5f6f8',
      },
      maxWidth: {
        'app': '520px',
      },
      borderRadius: {
        'xl2': '24px',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Source Sans 3', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'EB Garamond', 'Georgia', 'serif'],
        heading: ['var(--font-heading)', 'Syne', 'system-ui', 'sans-serif'],
      },
      animation: {
        'logo-scroll': 'logo-scroll 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'aurora': 'aurora 20s ease-in-out infinite',
        'aurora-2': 'aurora-2 25s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'logo-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(67, 97, 238, 0.15)',
        'glow-lg': '0 0 40px rgba(67, 97, 238, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(0, 0, 0, 0.06)',
        'coral-glow': '0 4px 20px rgba(255, 107, 107, 0.25)',
        'electric-glow': '0 4px 20px rgba(67, 97, 238, 0.2)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #4361EE 0%, #7B2FF2 100%)',
        'coral-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #ee5a5a 100%)',
        'surface-mesh': 'radial-gradient(at 20% 80%, rgba(67, 97, 238, 0.03) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(255, 107, 107, 0.03) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
