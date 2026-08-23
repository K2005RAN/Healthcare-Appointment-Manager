/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7ccbfd',
          400: '#36b2f9',
          500: '#0c93e4',
          600: '#0275c6',
          700: '#035da3',
          800: '#074e84',
          900: '#0c426e',
          950: '#082a4a',
        },
        accent: {
          teal: '#0d9488',
          indigo: '#4f46e5',
          violet: '#7c3aed',
          rose: '#e11d48',
          amber: '#d97706',
          emerald: '#059669',
        },
        slate: {
          850: '#141e33',
          900: '#0f172a',
          950: '#080d1a',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-lg': '0 12px 40px 0 rgba(14, 165, 233, 0.15)',
        'card-subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 4px 14px -2px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 20px 35px -8px rgba(2, 117, 198, 0.18), 0 10px 16px -8px rgba(15, 23, 42, 0.05)',
        'glow-brand': '0 0 30px -4px rgba(12, 147, 228, 0.45)',
        'glow-teal': '0 0 30px -4px rgba(13, 148, 136, 0.45)',
        'glow-rose': '0 0 30px -4px rgba(225, 29, 72, 0.45)',
        'glow-indigo': '0 0 30px -4px rgba(79, 70, 229, 0.45)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-pattern': 'radial-gradient(at 0% 0%, rgba(12, 147, 228, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.1) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
