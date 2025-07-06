/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ocean Protocol Brand Colors
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7', // Primary Ocean Blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // ASI-1 mini / Fetch.ai Colors
        asi: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // Primary ASI Red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Self Protocol Colors
        self: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569', // Primary Self Blue-Gray
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Real Estate / Data Colors
        estate: {
          50: '#fefdf8',
          100: '#fefbf0',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // Primary Estate Gold
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Gradient Colors for Ocean Protocol inspiration
        gradient: {
          'ocean-start': '#0284c7',
          'ocean-middle': '#0ea5e9',
          'ocean-end': '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'ocean-gradient': 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)',
        'asi-gradient': 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        'self-gradient': 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)',
        'estate-gradient': 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
      },
      boxShadow: {
        'ocean': '0 4px 14px 0 rgba(2, 132, 199, 0.2)',
        'asi': '0 4px 14px 0 rgba(220, 38, 38, 0.2)',
        'self': '0 4px 14px 0 rgba(71, 85, 105, 0.2)',
        'estate': '0 4px 14px 0 rgba(217, 119, 6, 0.2)',
        'glow': '0 0 20px rgba(2, 132, 199, 0.3)',
        'glow-asi': '0 0 20px rgba(220, 38, 38, 0.3)',
        'xl-ocean': '0 20px 25px -5px rgba(2, 132, 199, 0.1), 0 10px 10px -5px rgba(2, 132, 199, 0.04)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    // Custom plugin for Ocean Protocol component styles
    function({ addComponents, theme }) {
      addComponents({
        '.btn-ocean': {
          '@apply px-4 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 transition-colors font-medium': {},
        },
        '.btn-ocean-outline': {
          '@apply px-4 py-2 border border-ocean-600 text-ocean-600 rounded-md hover:bg-ocean-50 transition-colors font-medium': {},
        },
        '.btn-asi': {
          '@apply px-4 py-2 bg-asi-600 text-white rounded-md hover:bg-asi-700 transition-colors font-medium': {},
        },
        '.btn-self': {
          '@apply px-4 py-2 bg-self-600 text-white rounded-md hover:bg-self-700 transition-colors font-medium': {},
        },
        '.btn-estate': {
          '@apply px-4 py-2 bg-estate-600 text-white rounded-md hover:bg-estate-700 transition-colors font-medium': {},
        },
        '.card': {
          '@apply bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow': {},
        },
        '.card-ocean': {
          '@apply bg-gradient-to-br from-ocean-50 to-ocean-100 rounded-lg border border-ocean-200 p-6 shadow-ocean': {},
        },
        '.card-asi': {
          '@apply bg-gradient-to-br from-asi-50 to-asi-100 rounded-lg border border-asi-200 p-6 shadow-asi': {},
        },
        '.card-self': {
          '@apply bg-gradient-to-br from-self-50 to-self-100 rounded-lg border border-self-200 p-6 shadow-self': {},
        },
        '.ocean-gradient-text': {
          '@apply bg-gradient-to-r from-ocean-600 to-ocean-400 bg-clip-text text-transparent': {},
        },
        '.asi-gradient-text': {
          '@apply bg-gradient-to-r from-asi-600 to-asi-400 bg-clip-text text-transparent': {},
        },
        '.section-ocean': {
          '@apply bg-gradient-to-br from-ocean-50 via-ocean-100 to-blue-50': {},
        },
        '.glass-ocean': {
          '@apply bg-ocean-50/50 backdrop-blur-sm border border-ocean-200/50': {},
        },
        '.glass-white': {
          '@apply bg-white/70 backdrop-blur-sm border border-gray-200/50': {},
        },
      })
    }
  ],
} 