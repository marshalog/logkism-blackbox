// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE, BASE } from './site.config.mjs';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  server: { port: 4322 },
  build: { inlineStylesheets: 'auto' },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
