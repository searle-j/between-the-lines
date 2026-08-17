#!/usr/bin/env node
/**
 * 빌드 산출물(dist) 전수 검사 — postbuild에서 실행되어 위반이 있으면
 * 빌드를 실패시킨다. 검사 항목:
 *   1) 모든 HTML의 내부 href/src가 실제 파일로 해석되는가
 *   2) 모든 페이지의 내비게이션이 동일한 구조인가
 *   3) <html lang>이 경로(/en/ 여부)와 일치하는가
 *   4) canonical·favicon·RSS 링크가 모든 페이지에 있는가
 *   5) hreflang 대상 경로가 실제로 존재하는가
 *   6) sitemap의 모든 URL이 실제 페이지로 존재하는가
 *   7) 검색(Pagefind) 번들이 존재하는가
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] ?? path.join(ROOT, 'dist'));
const BASE = '/between-the-lines';
const ORIGIN = 'https://searle-j.github.io';
const NAV_LABELS = 'Review|Papers|Non-fiction|Fiction|Search|Keywords|Full-text|About';

const errors = [];
const fail = (file, msg) => errors.push(`${path.relative(ROOT, file)}: ${msg}`);

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith('.html')) yield p;
  }
}

/** 사이트 내부 URL을 dist 안의 실제 파일 경로로 해석한다. 실패 시 null. */
function resolveInternal(url) {
  let u = url.startsWith(ORIGIN) ? url.slice(ORIGIN.length) : url;
  if (!u.startsWith(`${BASE}/`) && u !== BASE) return undefined; // 내부 URL 아님
  u = decodeURIComponent(u.slice(BASE.length).split('#')[0].split('?')[0]) || '/';
  const target = path.join(DIST, u);
  if (existsSync(target) && statSync(target).isDirectory()) {
    return existsSync(path.join(target, 'index.html')) ? target : null;
  }
  return existsSync(target) ? target : null;
}

if (!existsSync(DIST)) {
  console.error('✗ dist/ 가 없습니다 — 먼저 빌드하세요.');
  process.exit(1);
}

const pages = [...htmlFiles(DIST)];

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = path.relative(DIST, file);

  // 1) 내부 링크·에셋 존재
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:|#)/.test(url) && !url.startsWith(ORIGIN)) continue;
    if (resolveInternal(url) === null) fail(file, `깨진 내부 링크: ${url}`);
  }

  // 2) 내비게이션 구조 동일성
  const nav = html.match(/<nav aria-label="Site">.*?<\/nav>/s)?.[0];
  if (!nav) {
    fail(file, '사이트 내비게이션 없음');
  } else {
    const labels = [...nav.matchAll(new RegExp(`>(${NAV_LABELS})<`, 'g'))].map((m) => m[1]).join(' ');
    if (labels !== NAV_LABELS.replaceAll('|', ' ')) {
      fail(file, `내비게이션 구조 불일치: [${labels}]`);
    }
  }

  // 3) lang 속성과 경로 일치
  const lang = html.match(/<html lang="(\w+)"/)?.[1];
  const expected = rel === 'en.html' || rel.startsWith(`en${path.sep}`) ? 'en' : 'ko';
  if (lang !== expected) fail(file, `lang="${lang}" (경로상 기대값: ${expected})`);

  // 4) 필수 head 요소
  if (rel !== '404.html' && !html.includes('rel="canonical"')) fail(file, 'canonical 없음');
  if (!html.includes('rel="icon"')) fail(file, 'favicon 링크 없음');
  if (!html.includes('application/rss+xml')) fail(file, 'RSS 링크 없음');

  // 5) hreflang 대상 존재
  for (const [, url] of html.matchAll(/hreflang="\w+(?:-\w+)?" href="([^"]+)"/g)) {
    if (resolveInternal(url) === null) fail(file, `hreflang 대상 없음: ${url}`);
  }
}

// 6) sitemap의 모든 URL 존재
const sitemapIndex = path.join(DIST, 'sitemap-index.xml');
if (!existsSync(sitemapIndex)) {
  fail(sitemapIndex, 'sitemap-index.xml 없음');
} else {
  const parts = readFileSync(sitemapIndex, 'utf8').match(/<loc>([^<]+)<\/loc>/g) ?? [];
  for (const part of parts) {
    const partPath = path.join(DIST, part.replace(/<\/?loc>/g, '').replace(`${ORIGIN}${BASE}/`, ''));
    if (!existsSync(partPath)) {
      fail(partPath, 'sitemap 파트 없음');
      continue;
    }
    for (const [, loc] of readFileSync(partPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (resolveInternal(loc) === null) fail(partPath, `sitemap URL이 존재하지 않음: ${loc}`);
    }
  }
}

// 7) 검색 번들
for (const f of ['pagefind/pagefind.js', 'pagefind/pagefind-ui.js', 'pagefind/pagefind-ui.css']) {
  if (!existsSync(path.join(DIST, f))) fail(path.join(DIST, f), 'Pagefind 번들 없음');
}

if (errors.length > 0) {
  console.error(`✗ dist 검사 실패 — ${errors.length}건:`);
  for (const e of errors) console.error(`  · ${e}`);
  process.exit(1);
}
console.log(`✓ dist 검사 통과: HTML ${pages.length}개, 링크·내비·lang·hreflang·sitemap·검색 번들 정상`);
