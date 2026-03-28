import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://grossklein.github.io',
  base: '/13H_LW',
  integrations: [react(), tailwind()],
  output: 'static',
});
