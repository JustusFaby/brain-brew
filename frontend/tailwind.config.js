export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Warm off-white / cream backgrounds
        cream: {
          50: '#FFFDF9',
          100: '#FFF9F0',
          200: '#FFF3E0',
          300: '#FFE8C8',
          400: '#FFD9A8',
          500: '#F5E6D3',
        },
        // Coffee brown palette — extracted from logo
        coffee: {
          50: '#FAF5F0',
          100: '#F0E6D8',
          200: '#E0CCAE',
          300: '#D4A574',
          400: '#C08B5C',
          500: '#8B5E3C',
          600: '#6B4226',
          700: '#5A3520',
          800: '#4A2C1A',
          900: '#3B2013',
          950: '#2A1508',
        },
        // Remap dark scale to brownish-grays for text/borders
        dark: {
          50: '#FAFAF8',
          100: '#F5F3EF',
          200: '#E8E4DC',
          300: '#D5CFC4',
          400: '#A89F91',
          500: '#7A7064',
          600: '#5E554A',
          700: '#453D34',
          800: '#332C25',
          900: '#231D17',
          950: '#1A1410',
        },
        // Accent = coffee brown (primary action color)
        accent: {
          50: '#FAF5F0',
          100: '#F0E6D8',
          200: '#E0CCAE',
          300: '#D4A574',
          400: '#C08B5C',
          500: '#8B5E3C',
          600: '#6B4226',
          700: '#5A3520',
          800: '#4A2C1A',
          900: '#3B2013',
        },
        // Focus mode — deep espresso / mocha
        focus: {
          50: '#F8F0EB',
          100: '#EEDDD2',
          200: '#DBBBA5',
          300: '#C89878',
          400: '#A8724E',
          500: '#7A4F30',
          600: '#633D23',
          700: '#4D2F1B',
          800: '#3A2314',
          900: '#2A180D',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(139, 94, 60, 0.2), 0 0 30px rgba(139, 94, 60, 0.08)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(139, 94, 60, 0.35), 0 0 50px rgba(139, 94, 60, 0.15)',
          },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(107, 66, 38, 0.06), 0 4px 12px rgba(107, 66, 38, 0.04)',
        'card-hover': '0 4px 16px rgba(107, 66, 38, 0.1), 0 8px 32px rgba(107, 66, 38, 0.06)',
        'warm': '0 2px 8px rgba(139, 94, 60, 0.12)',
      },
    },
  },
  plugins: [],
}
