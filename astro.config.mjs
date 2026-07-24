// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourhq.co.nz',
  redirects: {
    '/portfolio': '/the-work',
    '/our-story': '/the-work',
  },
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.includes('/agent-test') &&
        !page.includes('/confirmation') &&
        !page.includes('/admin') &&
        !page.includes('/audit-intake') &&
        !page.includes('/next-steps-web-audit'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
});