#!/usr/bin/env node
/**
 * Content sanity check, run before every build (`npm run build`).
 * Prints warnings only — a missing translation never fails the build.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KINDS = [
  { dir: 'content/papers', type: 'paper' },
  { dir: 'content/books', type: 'book' },
];

/** content.config.ts 의 glob('**\/*.{ko,en}.md') 과 같은 재귀 범위로 .md 를 모은다. */
function mdFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...mdFiles(path.join(dir, e.name)));
    else if (e.name.endsWith('.md')) out.push(path.join(dir, e.name));
  }
  return out;
}

let warnings = 0;
const warn = (msg) => {
  warnings++;
  console.warn(`  ⚠ ${msg}`);
};

/** @type {Map<string, Set<string>>} "papers/slug" -> langs */
const posts = new Map();

for (const { dir, type } of KINDS) {
  const abs = path.join(ROOT, dir);
  if (!existsSync(abs)) continue;

  for (const file of mdFiles(abs)) {
    const rel = path.relative(abs, file).split(path.sep).join('/');

    const m = rel.match(/^(.+)\.(ko|en)\.md$/);
    if (!m) {
      warn(`${dir}/${rel}: '<slug>.ko.md' / '<slug>.en.md' 형식이 아니어서 사이트에 실리지 않습니다.`);
      continue;
    }
    const [, slug, lang] = m;
    const key = `${dir.split('/')[1]}/${slug}`;
    if (!posts.has(key)) posts.set(key, new Set());
    posts.get(key).add(lang);

    const fm = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const typeValue = fm?.[1].match(/^type:\s*["']?([\w-]+)["']?\s*$/m)?.[1];
    if (typeValue && typeValue !== type) {
      warn(`${dir}/${rel}: frontmatter type이 '${typeValue}'인데 이 폴더는 '${type}'용입니다.`);
    }
  }
}

for (const [key, langs] of posts) {
  if (!langs.has('en')) warn(`${key}: 영어 번역(.en.md)이 없습니다.`);
  if (!langs.has('ko')) warn(`${key}: 한국어 원문(.ko.md)이 없습니다.`);
}

for (const lang of ['ko', 'en']) {
  if (!existsSync(path.join(ROOT, `content/pages/about.${lang}.md`))) {
    warn(`content/pages/about.${lang}.md 가 없습니다 (About 페이지 빌드에 필요).`);
  }
}

const translated = [...posts.values()].filter((s) => s.has('ko') && s.has('en')).length;
console.log(
  `✓ content check: ${posts.size} post(s), ${translated} fully translated, ${warnings} warning(s)`
);
