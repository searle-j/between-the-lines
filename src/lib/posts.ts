import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { collectInlineTags } from './remark-inline-tags.mjs';

export type { Lang };
export type Kind = 'papers' | 'books' | 'literature';

const KINDS: Kind[] = ['papers', 'books', 'literature'];
const TYPE_LABELS = { papers: 'Paper', books: 'Book', literature: 'Literature' } as const;

export interface Post {
  slug: string;
  lang: Lang;
  kind: Kind;
  typeLabel: (typeof TYPE_LABELS)[Kind];
  entry: CollectionEntry<'papers'> | CollectionEntry<'books'> | CollectionEntry<'literature'>;
}

/** `llms-cant-jump.ko` -> { slug: 'llms-cant-jump', lang: 'ko' } */
function parseId(id: string): { slug: string; lang: Lang } | null {
  const m = id.match(/^(.+)\.(ko|en)$/);
  return m ? { slug: m[1], lang: m[2] as Lang } : null;
}

// Publishing is opt-in: production builds only include `publish: true` posts.
// Everything stays visible in `astro dev` regardless.
function published(entry: { data: { publish: boolean } }): boolean {
  return import.meta.env.DEV || entry.data.publish;
}

export async function getPosts(lang: Lang, kind?: Kind): Promise<Post[]> {
  const kinds: Kind[] = kind ? [kind] : KINDS;
  const posts: Post[] = [];
  for (const k of kinds) {
    for (const entry of await getCollection(k, published)) {
      const parsed = parseId(entry.id);
      if (parsed?.lang === lang) {
        posts.push({ ...parsed, kind: k, typeLabel: TYPE_LABELS[k], entry });
      }
    }
  }
  return posts.sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());
}

/** Number of distinct posts (a ko/en pair counts once). */
export async function countPosts(): Promise<number> {
  const slugs = new Set<string>();
  for (const k of KINDS) {
    for (const entry of await getCollection(k, published)) {
      const parsed = parseId(entry.id);
      if (parsed) slugs.add(`${k}/${parsed.slug}`);
    }
  }
  return slugs.size;
}

/** Site-relative path (without the deploy base) of a post page. */
export function postPath(post: Pick<Post, 'lang' | 'kind' | 'slug'>): string {
  return `${post.lang === 'en' ? '/en' : ''}/${post.kind}/${post.slug}/`;
}

/**
 * [표기 규칙] 이 저장소에서 '게시물'의 날짜는 어디에 표시되든 예외 없이
 * YYYY-MM-DD (ISO 8601) 형식을 쓴다 — 홈 Recent, Papers/Books 목록,
 * 키워드 페이지, 게시물 헤더 전부 이 함수를 거친다.
 * 게시물 날짜를 보여주는 새 화면을 만들 때도 반드시 isoDate()를 사용할 것.
 */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function groupByYear(posts: Post[]): Array<[number, Post[]]> {
  const byYear = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.entry.data.date.getUTCFullYear();
    const group = byYear.get(year);
    if (group) group.push(post);
    else byYear.set(year, [post]);
  }
  return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
}

/**
 * 본문 인라인 `#태그`가 태그의 유일한 소스다 (frontmatter tags 없음).
 * 렌더러(remark-inline-tags)와 같은 워커·GFM 규칙으로 수집하므로
 * 본문에 링크로 표시되는 태그와 집계되는 태그가 어긋날 수 없다.
 */
export function postTags(entry: Post['entry']): string[] {
  return collectInlineTags(entry.body ?? '').sort();
}

export async function getAllTags(lang: Lang): Promise<Array<{ tag: string; count: number }>> {
  const counts = new Map<string, number>();
  for (const post of await getPosts(lang)) {
    for (const tag of postTags(post.entry)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag, 'en'));
}

export function tagPath(lang: Lang, tag: string): string {
  return `${lang === 'en' ? '/en' : ''}/tags/${tag}/`;
}

/** 게시물 상세 라우트 6개(kind 3종 × 언어 2종)가 공유하는 getStaticPaths 본문. */
export async function postStaticPaths(lang: Lang, kind: Kind) {
  const other: Lang = lang === 'ko' ? 'en' : 'ko';
  const [own, counterpart] = await Promise.all([getPosts(lang, kind), getPosts(other, kind)]);
  const counterpartSlugs = new Set(counterpart.map((p) => p.slug));
  return own.map((post) => ({
    params: { slug: post.slug },
    props: { post, hasAlternate: counterpartSlugs.has(post.slug) },
  }));
}

/** 태그 상세 라우트 2개가 공유하는 getStaticPaths 본문. */
export async function tagStaticPaths(lang: Lang) {
  const other: Lang = lang === 'ko' ? 'en' : 'ko';
  const [own, counterpart] = await Promise.all([getAllTags(lang), getAllTags(other)]);
  const counterpartTags = new Set(counterpart.map(({ tag }) => tag));
  return own.map(({ tag }) => ({
    params: { tag },
    props: { tag, hasAlternate: counterpartTags.has(tag) },
  }));
}
