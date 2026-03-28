import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Misty Morning Gold palette
        midnight:      '#FDFBF7',   // misty pearl — page base & input backgrounds
        'midnight-mid':'#EEE5C8',   // warm vanilla mid
        cosmos:        '#FFFFFF',   // frosted pearl card (overridden by CSS to glass)
        ivory: {
          DEFAULT: '#4A5568',       // Slate Blue-Grey — primary readable text
          dim:     '#718096',       // secondary text
        },
        gold: {
          DEFAULT: '#C8902A',       // Deep Amber — visible on light backgrounds (title, CTAs)
          soft:    '#E6BE8A',       // Soft Amber — subtle card accents (ovulation)
        },
        rose: {
          DEFAULT: '#D4A5A5',       // Dusty Rose — menstruation
          soft:    '#E8C8C8',
        },
        lavender: {
          DEFAULT: '#A99BC8',       // muted lavender
          soft:    '#D4CCE8',
        },
        teal: {
          DEFAULT: '#9CAF88',       // Sage Green — positive / Google calendar
          soft:    '#BDD4B4',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        sans:  ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
