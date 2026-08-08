// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import { remarkMdLinks } from './src/lib/remark-md-links.mjs';
import { remarkInlineTags } from './src/lib/remark-inline-tags.mjs';

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
    // Astro 7 표준: remark/rehype 파이프라인은 unified() 프로세서로 전달한다.
    processor: unified({
      remarkPlugins: [
        remarkMath,
        [remarkMdLinks, { base: BASE }],
        [remarkInlineTags, { base: BASE }],
      ],
      rehypePlugins: [
        rehypeKatex,
        // 외부 링크는 새 창으로
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
    shikiConfig: {
      // css-variables 테마: 토큰 색을 CSS 변수로 출력해 라이트/다크에서
      // 서로 다른 코드 팔레트를 쓴다. 변수 정의는 global.css / design-test.css.
      theme: 'css-variables',
      wrap: false,
    },
  },
});
