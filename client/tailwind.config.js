/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#101828',
          950: '#0B0F19',
          900: '#101828',
          800: '#1D2939',
          700: '#344054',
          600: '#475467',
        },
        royalblue: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
        },
        accent: {
          DEFAULT: '#FF8A3D',
          hover: '#EA580C',
          light: '#FFF4ED',
          500: '#FF8A3D',
          600: '#EA580C',
        },
        travelbg: '#F7F9FC',
        traveltext: '#172033',
        travelmuted: '#667085',
        travelsuccess: '#12B76A',
        travelerror: '#F04438',
      }
    },
  },
  plugins: [],
}
