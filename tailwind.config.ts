
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./index.tsx",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Olie Hub V2 - Brand Identity Palette (Luxury Atelier)
        olie: {
          rose: '#C08A7D',   // Rose Olie (Base)
          cream: '#FAF9F6',  // Cream Olie (Background)
          stone: '#4A3B38',  // Stone Olie (Contrast/Text)
          
          // Technical Scale for UI states and depths
          50: '#FAF7F6',
          100: '#F5EFED',
          200: '#EBE4E2',
          300: '#DCC3BC',
          400: '#CEADA5',
          500: '#C08A7D', // Primary Action
          600: '#A66D60',
          700: '#8C5A4F',
          800: '#724940',
          900: '#4A3B38', // Deep Contrast
        },
        // System Neutrals - Stone Scale (Sophisticated Grays)
        stone: {
          50: '#FAF9F6', 
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        // Semantic Accents with Olie undertones
        emerald: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        },
        rose: {
          50: '#FFF1F2',
          500: '#F43F5E',
          600: '#E11D48',
        },
        amber: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        blue: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        'olie-soft': '0 4px 20px -2px rgba(192, 138, 125, 0.08)',
        'olie-lg': '0 20px 50px -12px rgba(192, 138, 125, 0.15)',
        'olie-inner': 'inset 0 2px 4px 0 rgba(74, 59, 56, 0.05)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '3rem',
      },
      animation: {
        'slow-spin': 'spin 12s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    }
  },
  plugins: [],
};

export default config;
