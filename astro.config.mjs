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
      // css-variables: 토큰 색을 CSS 변수로 출력 → 디자인 조합(팔레트)별로
      // 코드 하이라이팅이 함께 전환된다. 변수 정의는 global.css / design-test.css.
      theme: 'css-variables',
      wrap: false,
    },
  },
});
