
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6', // Stone 50 equivalent for base background
        olie: { 
          50: '#FAF7F6',
          100: '#F5EFED',
          300: '#DCC3BC', 
          500: '#C08A7D', // Primary brand color (Old Rose)
          600: '#A66D60',
          700: '#A67569',
          900: '#4A3B38'
        },
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
        '4xl': '2rem',
        '5xl': '3rem',
      }
    }
  },
  plugins: [],
};

export default config;
