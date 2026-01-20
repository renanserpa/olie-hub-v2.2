
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        // Olie Hub V2 - Brand Identity Palette
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
        // System Neutrals - Stone Scale
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
        // Semantic Accents
        emerald: {
          500: '#10B981',
        },
        rose: {
          500: '#F43F5E',
        },
        amber: {
          500: '#F59E0B',
        },
        blue: {
          500: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'olie-soft': '0 4px 20px -2px rgba(192, 138, 125, 0.08)',
        'olie-lg': '0 20px 50px -12px rgba(192, 138, 125, 0.15)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '3rem',
      },
      animation: {
        'slow-spin': 'spin 12s linear infinite',
      }
    }
  },
  plugins: [],
};

export default config;
