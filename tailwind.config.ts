import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // GemEx Enhanced Color Palette
        'charcoal-grey': '#1a1a24',
        'charcoal-light': '#242438',
        'charcoal-lighter': '#2d2d42',
        'midst-grey': '#f8f9fa',
        'midst-grey-dark': '#e9ecef',
        'vivid-violet': '#7c3aed',
        'amethyst-purple': '#a855f7',
        'neon-lime': '#84cc16',
        'neon-lime-bright': '#a3e635',
        'success-green': '#10b981',
        'warning-amber': '#f59e0b',
        'error-red': '#ef4444',
        'info-blue': '#3b82f6',
      },
      fontFamily: {
        sans: ['Geist', 'Geist Fallback', 'sans-serif'],
        mono: ['Geist Mono', 'Geist Mono Fallback', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config