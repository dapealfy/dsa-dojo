/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0d1117',
          soft: '#161b22',
          card: '#1c2128',
          hover: '#21262d',
        },
        border: {
          DEFAULT: '#30363d',
          soft: '#21262d',
        },
        text: {
          DEFAULT: '#e6edf3',
          muted: '#8b949e',
          subtle: '#6e7681',
        },
        accent: {
          DEFAULT: '#7ee787',
          soft: '#56d364',
          deep: '#3fb950',
        },
        purple: {
          DEFAULT: '#d2a8ff',
          soft: '#bc8cff',
        },
        easy: '#3fb950',
        medium: '#d29922',
        hard: '#f85149',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'xp-float': {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.9)' },
          '20%': { opacity: '1', transform: 'translateY(-8px) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(-48px) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(126, 231, 135, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(126, 231, 135, 0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        'xp-float': 'xp-float 1400ms ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}