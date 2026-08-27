/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF8F3',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F3F1EB',
          raised: '#ECEAE2',
        },
        border: {
          DEFAULT: 'rgba(0, 0, 0, 0.07)',
          strong: 'rgba(0, 0, 0, 0.14)',
        },
        'text-primary': '#1C1B18',
        'text-secondary': '#6E6B5F',
        'text-muted': '#A8A49A',
        accent: {
          DEFAULT: '#C96442',
          hover: '#B5572E',
          light: '#F2E8E2',
        },
        success: {
          DEFAULT: '#059669',
          light: '#ECFDF5',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
      },
      keyframes: {
        'opacity-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'opacity-pulse': 'opacity-pulse 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
