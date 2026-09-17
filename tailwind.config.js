/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#f4f7f4',
          100: '#e3ebe3',
          200: '#c7d9c8',
          300: '#9fc0a1',
          400: '#72a075',
          500: '#528355',
          600: '#3e6841',
          700: '#335335',
          800: '#2b432c',
          900: '#243725',
          950: '#121e13',
        },
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          700: '#15803d',
          900: '#14532d',
        },
        darkbg: '#0f172a',
        cardbg: '#1e293b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
