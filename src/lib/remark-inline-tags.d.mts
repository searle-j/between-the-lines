// remark-inline-tags.mjs 의 타입 (posts.ts 가 collectInlineTags 를 타입 안전하게 import).
export function remarkInlineTags(options?: {
  base?: string;
}): (tree: unknown, file: unknown) => void;

export function collectInlineTags(markdown: string): string[];
