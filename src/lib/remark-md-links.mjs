import path from 'node:path';

/**
 * Rewrites relative links that point at content Markdown files into site
 * routes, so the same link works both in Obsidian (opens the file) and on
 * the published site (opens the page):
 *
 *   [사탄탱고](../books/satantango.ko.md)   -> /between-the-lines/books/satantango/
 *   [Satantango](../books/satantango.en.md) -> /between-the-lines/en/books/satantango/
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
      const abs = path.resolve(fromDir, decoded).split(path.sep).join('/');

      let m = abs.match(/\/content\/(papers|books|literature)\/([^/]+)\.(ko|en)\.md$/);
      if (m) {
        const [, kind, slug, lang] = m;
        node.url = `${base}${lang === 'en' ? '/en' : ''}/${kind}/${slug}/${hash}`;
        return;
      }

      m = abs.match(/\/content\/pages\/about\.(ko|en)\.md$/);
      if (m) {
        node.url = `${base}${m[1] === 'en' ? '/en' : ''}/about/${hash}`;
      }
    }
  };
}
