// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkMdLinks } from './src/lib/remark-md-links.mjs';

const SITE = 'https://searle-j.github.io';
const BASE = '/between-the-lines';

export default defineConfig({
  site: SITE,
  base: BASE,
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMath, [remarkMdLinks, { base: BASE }]],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
