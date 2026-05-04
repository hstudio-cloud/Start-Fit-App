/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070b10',
          800: '#0d1117',
          700: '#0d1f2d',
          600: '#0f2942',
        },
        brand: {
          900: '#0d2137',
          700: '#0a3d62',
          600: '#1e6091',
          500: '#0077b6',
          400: '#0096c7',
          300: '#00b4d8',
          200: '#48cae4',
          100: '#90e0ef',
          50:  '#caf0f8',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
