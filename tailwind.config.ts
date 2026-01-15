import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        rose: { 
          50: '#fff1f2', 
          100: '#ffe4e6', 
          500: '#f43f5e' 
        },
        olie: { 
          300: '#DCC3BC', 
          500: '#C08A7D', 
          700: '#A67569',
          900: '#4A3B38' 
        },
        stone: { 
          50: '#F9F7F3', 
          100: '#F0EBE5', 
          800: '#44403C' 
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;