import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6eaf2',
          100: '#ccd5e6',
          200: '#99abcc',
          300: '#6681b3',
          400: '#335799',
          500: '#002d80',
          600: '#002366',
          700: '#001c52',
          800: '#00153d',
          900: '#000e29',
        },
      },
    },
  },
  plugins: [],
}
export default config
