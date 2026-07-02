import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Editorial palette — warm charcoal + gold
        midnight:      '#18160f',   // warm near-black — page base
        'midnight-mid':'#242018',   // slightly lighter dark
        cosmos:        '#2e2a1e',   // card background
        surface:       '#3d3929',   // secondary panels / olive
        ivory: {
          DEFAULT: '#EDE5CC',       // warm light text
          dim:     '#B8B0A0',       // secondary text
        },
        gold: {
          DEFAULT: '#C9A830',       // warm gold — accent / CTA
          soft:    '#E6C86A',       // lighter gold
        },
        rose: {
          DEFAULT: '#C47A7A',       // menstruation — visible on dark
          soft:    '#D4A5A5',
        },
        lavender: {
          DEFAULT: '#8B80B8',       // luteal — visible on dark
          soft:    '#A99BC8',
        },
        teal: {
          DEFAULT: '#7A9B6A',       // follicular — visible on dark
          soft:    '#9CAF88',
        },
      },
      fontFamily: {
        'serif-display': ['Cinzel', 'Playfair Display', 'serif'],  // editorial all-caps
        serif: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        script: ['Great Vibes', 'cursive'],                         // gold script accent
        sans:  ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
