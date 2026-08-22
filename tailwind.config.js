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
        obsidian: {
          950: '#030712',
          900: '#060b17',
          850: '#0c1222',
          800: '#11192e',
          750: '#17223b',
          700: '#1e2d4a',
        },
        dark: {
          950: '#040711',
          900: '#080d1a',
          850: '#0e1526',
          800: '#141d33',
          750: '#1b2642',
          700: '#233052',
        },
        brand: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          purple: '#8b5cf6',
          violet: '#a855f7',
          cyan: '#06b6d4',
          emerald: '#10b981',
          teal: '#14b8a6',
          rose: '#f43f5e',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-rose': 'glowRose 2s ease-in-out infinite alternate',
        'glow-blue': 'glowBlue 2s ease-in-out infinite alternate',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite alternate',
        'glow-purple': 'glowPurple 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glowRose: {
          '0%': { boxShadow: '0 0 15px rgba(244, 63, 94, 0.2), inset 0 0 10px rgba(244, 63, 94, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(244, 63, 94, 0.45), inset 0 0 15px rgba(244, 63, 94, 0.25)' },
        },
        glowBlue: {
          '0%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.2), inset 0 0 10px rgba(59, 130, 246, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(59, 130, 246, 0.45), inset 0 0 15px rgba(59, 130, 246, 0.25)' },
        },
        glowEmerald: {
          '0%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.2), inset 0 0 10px rgba(16, 185, 129, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(16, 185, 129, 0.45), inset 0 0 15px rgba(16, 185, 129, 0.25)' },
        },
        glowPurple: {
          '0%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.2), inset 0 0 10px rgba(139, 92, 246, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(139, 92, 246, 0.45), inset 0 0 15px rgba(139, 92, 246, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
