import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: [
          'Fraunces',
          'Noto Serif SC',
          ...defaultTheme.fontFamily.serif
        ],
        sans: [
          'Noto Sans SC',
          ...defaultTheme.fontFamily.sans
        ],
      },
      colors: {
        'dark': '#312511',
        'light': '#f3ecda',
        'primary': '#7a1919',
        'accent': '#0a3b68',
      }
    },
  },
  plugins: [],
} satisfies Config
