/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        custom1: '#3c2a21',
        custom2: '#b5a896',
        custom3: '#a47851',
        custom4: '#c19f80',
      },
    },
  },
  plugins: [],
}