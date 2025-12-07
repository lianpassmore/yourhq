/** @type {import('tailwindcss').Config} */

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				carbon: '#111111',
				paper: '#F5F5F7',
				signal: '#2563EB',
				pureWhite: '#FFFFFF',
				hibiscus: '#F2547D',
				frangipani: '#FDBA74',
				deepGreen: '#064E3B',
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				mono: ['"Courier Prime"', 'monospace'],
			},
			boxShadow: {
				'hard': '4px 4px 0px 0px #111111',
				'hard-sm': '2px 2px 0px 0px #111111',
				'hard-white': '4px 4px 0px 0px #FFFFFF',
			},
			backgroundImage: {
				'grid-pattern': "linear-gradient(to right, #1111110a 1px, transparent 1px), linear-gradient(to bottom, #1111110a 1px, transparent 1px)",
			},
			letterSpacing: {
				tighter: '-0.04em',
			}
		},
	},
	plugins: [  typography(), ],
}