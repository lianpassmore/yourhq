/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        carbon: '#0B0B0C',
        bone: '#F2EFEA',
        deepGreen: '#0F3D2E',
        terracotta: '#C4683C',
        signal: '#2563EB',
        softGrey: '#6B6B6E',
        surface: '#FAF8F5',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['Agrandir', 'sans-serif'], 
        logo: ['"Barlow Condensed"', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(4.5rem, 6vw, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display': ['clamp(3.25rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'headline': ['clamp(2.25rem, 4vw, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'accent': ['clamp(1.125rem, 2.5vw, 1.75rem)', { lineHeight: '1.2' }],
        'subhead': ['clamp(1.25rem, 3vw, 1.75rem)', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'body': ['clamp(0.9375rem, 2vw, 1.0625rem)', { lineHeight: '1.65', letterSpacing: '0.015em' }],
        'ui': ['clamp(0.8125rem, 1.5vw, 0.9375rem)', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'badge': ['clamp(0.5625rem, 1vw, 0.75rem)', { lineHeight: '1.5', letterSpacing: '0.12em' }],
        'price': ['clamp(2rem, 4vw, 2.75rem)', { lineHeight: '1' }],
      },
      boxShadow: {
        // Replaced the brutalist shadows with high-end, editorial drop shadows
        'subtle': '0 4px 20px -2px rgba(11, 11, 12, 0.05)',
        'elegant': '0 10px 30px -5px rgba(11, 11, 12, 0.08)',
        'float': '0 20px 40px -10px rgba(15, 61, 46, 0.1)', // A very soft deep-green tint for hovering
      }
    },
  },
  plugins: [
    typography(),
  ],
}