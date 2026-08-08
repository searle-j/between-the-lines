import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts live in content/{papers,books}/<slug>.{ko,en}.md — one file per
// language. Files that don't match the pattern are ignored by the site, so
// stray local notes never get published by accident.
const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  type: z.enum(['paper', 'book']),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  draft: z.boolean().default(false),
});

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

// Keep IDs as the raw file path minus `.md` — the default slugger would strip
// the dot in `satantango.en`, breaking the language suffix convention.
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

export const collections = {
  papers: defineCollection({
    loader: glob({ pattern: '**/*.{ko,en}.md', base: './content/papers', generateId }),
    schema: postSchema,
  }),
  books: defineCollection({
    loader: glob({ pattern: '**/*.{ko,en}.md', base: './content/books', generateId }),
    schema: postSchema,
  }),
  pages: defineCollection({
    loader: glob({ pattern: '**/*.{ko,en}.md', base: './content/pages', generateId }),
    schema: pageSchema,
  }),
};
