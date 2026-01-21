
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        olie: {
          rose: '#C08A7D',
          cream: '#FAF9F6',
          stone: '#4A3B38',
          50: '#FAF7F6',
          100: '#F5EFED',
          200: '#EBE4E2',
          300: '#DCC3BC',
          400: '#CEADA5',
          500: '#C08A7D',
          600: '#A66D60',
          700: '#8C5A4F',
          800: '#724940',
          900: '#4A3B38',
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
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia', 'serif'],
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
      }
    }
  },
  plugins: [],
};

export default config;
