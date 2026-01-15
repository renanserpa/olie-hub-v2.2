import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './index.tsx',
  ],
  theme: {
    extend: {
      colors: {
        olie: {
          rose: '#C08A7D',
          cream: '#FAF9F6',
          stone: '#333333',
          border: '#F2F0EA',
          accent: '#A67569',
        },
        stone: {
          50: '#FAF9F6',
          100: '#F2F0EA',
          800: '#333333',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'progress-olie': 'progress-loading 2s cubic-bezier(0.23, 1, 0.32, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'progress-loading': {
          '0%': { width: '0%', left: '0' },
          '50%': { width: '100%', left: '0' },
          '100%': { width: '0%', left: '100%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'olie': '0 20px 50px rgba(192, 138, 125, 0.1)',
      }
    },
  },
  plugins: [],
};

export default config;