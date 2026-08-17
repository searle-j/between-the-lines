import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Rewrites relative links that point at content Markdown files into site
 * routes, so the same link works both in Obsidian (opens the file) and on
 * the published site (opens the page):
 *
 *   [사탄탱고](../fiction/satantango.ko.md)   -> /between-the-lines/fiction/satantango/
 *   [Satantango](../fiction/satantango.en.md) -> /between-the-lines/en/fiction/satantango/
 *
 * A link to a post that does not exist yet — or exists but is not
 * `publish: true` — goes to the "not ready yet" page instead, so future
 * reading lists can be written as normal links without breaking the build.
 *
 * External URLs, absolute paths, anchors, and non-Markdown targets are left
 * untouched (images are `image` nodes and never pass through here).
 */
export function remarkMdLinks(options = {}) {
  const base = (options.base ?? '').replace(/\/$/, '');

  return (tree, file) => {
    if (!file?.path) return;
    const fromDir = path.dirname(file.path);
    visit(tree);

    function visit(node) {
      if (node.type === 'link' && typeof node.url === 'string') rewrite(node);
      for (const child of node.children ?? []) visit(child);
    }

    function isPublished(absOsPath) {
      if (!existsSync(absOsPath)) return false;
      const fm = readFileSync(absOsPath, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
      return /^publish:\s*true\s*$/m.test(fm?.[1] ?? '');
    }

    function rewrite(node) {
      const url = node.url;
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('/') || url.startsWith('#')) return;

      const hashIndex = url.indexOf('#');
      const target = hashIndex === -1 ? url : url.slice(0, hashIndex);
      const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
      if (!target.endsWith('.md')) return;

      // 잘못된 퍼센트 인코딩(예: `100%.md`)이 있으면 빌드를 죽이는 대신 그대로 둔다.
      let decoded;
      try {
        decoded = decodeURI(target);
      } catch {
        return;
      }
      const absOs = path.resolve(fromDir, decoded);
      const abs = absOs.split(path.sep).join('/');

      let m = abs.match(/\/content\/(papers|non-fiction|fiction)\/([^/]+)\.(ko|en)\.md$/);
      if (m) {
        const [, kind, slug, lang] = m;
        const prefix = `${base}${lang === 'en' ? '/en' : ''}`;
        if (isPublished(absOs)) {
          node.url = `${prefix}/${kind}/${slug}/${hash}`;
        } else {
          // 아직 없는(또는 미발행) 글 — 준비 중 페이지로 보내고 본문에서 구분한다.
          node.url = `${prefix}/not-yet/`;
          node.data = { ...node.data, hProperties: { className: ['stub-link'] } };
        }
        return;
      }

      m = abs.match(/\/content\/pages\/about\.(ko|en)\.md$/);
      if (m) {
        node.url = `${base}${m[1] === 'en' ? '/en' : ''}/about/${hash}`;
      }
    }
  };
}
