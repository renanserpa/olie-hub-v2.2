
import type { Config } from "tailwindcss";

const config: Config = {
  // Define content paths relative to project root to ensure Tailwind scans all files
  content: [
    "./index.tsx",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Palette: Warm Minimalist
        background: '#FDFBF7', // Cream/Paper
        
        // Brand: Rose Gold / Terracotta
        olie: { 
          300: '#DCC3BC', 
          500: '#C08A7D', // Primary Action
          600: '#A66D60', // Hover State
          700: '#A67569',
          900: '#4A3B38'  // Dark Brand Text (Headings)
        },
        
        // Neutrals: Warm Stone
        stone: { 
          50: '#FAF9F6', 
          100: '#F5F5F4', 
          200: '#E7E5E4', // Borders
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C', // Text Muted
          600: '#57534E',
          700: '#44403C', 
          800: '#44403C', // Text Main (Softer than black)
          900: '#292524',
        },

        // Semantic Colors (Used in Status Tags & Alerts)
        rose: { 
          50: '#fff1f2', 
          100: '#ffe4e6', 
          400: '#fb7185',
          500: '#f43f5e' 
        },
        emerald: {
          50: '#ecfdf5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669'
        },
        blue: {
          50: '#eff6ff',
          500: '#3b82f6'
        }
      },
      fontFamily: {
        // Primary Sans for UI Text
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Brand Serif for Headings & Accents
        serif: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem', // Luxury Card Radius used in Olie Cards
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
