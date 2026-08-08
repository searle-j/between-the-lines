import { getCollection, type CollectionEntry } from 'astro:content';

export type Lang = 'ko' | 'en';
export type Kind = 'papers' | 'books';

export interface Post {
  slug: string;
  lang: Lang;
  kind: Kind;
  typeLabel: 'Paper' | 'Book';
  entry: CollectionEntry<'papers'> | CollectionEntry<'books'>;
}

/** `llms-cant-jump.ko` -> { slug: 'llms-cant-jump', lang: 'ko' } */
export function parseId(id: string): { slug: string; lang: Lang } | null {
  const m = id.match(/^(.+)\.(ko|en)$/);
  return m ? { slug: m[1], lang: m[2] as Lang } : null;
}

// Drafts stay visible in `astro dev` but are excluded from production builds.
function published(entry: { data: { draft: boolean } }): boolean {
  return import.meta.env.DEV || !entry.data.draft;
}

export async function getPosts(lang: Lang, kind?: Kind): Promise<Post[]> {
  const kinds: Kind[] = kind ? [kind] : ['papers', 'books'];
  const posts: Post[] = [];
  for (const k of kinds) {
    for (const entry of await getCollection(k, published)) {
      const parsed = parseId(entry.id);
      if (parsed?.lang === lang) {
        posts.push({ ...parsed, kind: k, typeLabel: k === 'papers' ? 'Paper' : 'Book', entry });
      }
    }
  }
  return posts.sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());
}

/** Number of distinct posts (a ko/en pair counts once). */
export async function countPosts(): Promise<number> {
  const slugs = new Set<string>();
  for (const k of ['papers', 'books'] as const) {
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
