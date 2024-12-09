import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          light: '#c6b2a2',
          medium: '#a67c5c',
          dark: '#855c3b',
          darker: '#6d462a',
          base: '#9b7653',
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin'), // Adds Flowbite plugin for Tailwind CSS
  ],
} satisfies Config;
