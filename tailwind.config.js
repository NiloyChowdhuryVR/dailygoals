/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a11',
          900: '#0b0f19',
          850: '#111726',
          800: '#161f33',
          700: '#222d46',
        },
        brand: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-rose': 'glowRose 2s ease-in-out infinite alternate',
        'glow-blue': 'glowBlue 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowRose: {
          '0%': { boxShadow: '0 0 10px rgba(244, 63, 94, 0.2), inset 0 0 10px rgba(244, 63, 94, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(244, 63, 94, 0.4), inset 0 0 15px rgba(244, 63, 94, 0.2)' },
        },
        glowBlue: {
          '0%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
