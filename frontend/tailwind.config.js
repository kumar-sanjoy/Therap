/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // FLOW brand colors with dark variants
        flow: {
          primary: '#343434',
          'primary-dark': '#1a1a1a',
          secondary: '#ffffff',
          'secondary-dark': '#f3f4f6',
        }
      },
      backgroundColor: {
        'dark-primary': '#0f172a',
        'dark-secondary': '#1e293b',
        'dark-tertiary': '#334155',
      },
      textColor: {
        'dark-primary': '#f8fafc',
        'dark-secondary': '#e2e8f0',
        'dark-tertiary': '#cbd5e1',
      },
      borderColor: {
        'dark-primary': '#334155',
        'dark-secondary': '#475569',
      }
 
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}