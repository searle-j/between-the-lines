import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfm } from 'micromark-extension-gfm';
import { gfmFromMarkdown } from 'mdast-util-gfm';

/**
 * Obsidian 스타일 인라인 태그: 본문의 `#llm` 을 태그 페이지 링크로 바꾼다.
 *
 * 규칙 (Obsidian과 동일):
 * - 태그는 줄의 시작 또는 공백/여는 괄호 뒤에서만 시작한다. URL 의 #fragment,
 *   인라인 요소 바로 뒤에 붙은 `**bold**#단어` 는 태그가 아니다.
 * - 숫자로만 이루어진 태그는 무시한다.
 * - text 노드만 순회하므로 코드 블록·인라인 코드·링크 텍스트는 건드리지 않는다.
 *
 * 렌더링(remarkInlineTags)과 집계(collectInlineTags)가 이 한 워커를 공유하므로
 * '본문에 링크로 표시되는 태그'와 'posts.ts가 세는 태그'는 구조적으로 항상 같다.
 */
const TAG_PATTERN = /(^|[\s(（[])#([A-Za-z0-9_가-힣][A-Za-z0-9_가-힣/-]*)/g;

/**
 * mdast 트리를 순회하며 인라인 태그를 찾아 onTag(tag)로 알린다.
 * link(tag)가 주어지면 해당 text 노드를 태그 링크로 치환한다.
 */
function processTree(tree, onTag, link) {
  walk(tree);

  function walk(node) {
    const children = node.children;
    if (!children) return;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.type === 'link' || child.type === 'linkReference') continue;
      if (child.type !== 'text') {
        walk(child);
        continue;
      }
      // 노드 맨 앞의 #는 문단 시작(첫 자식)이거나 hard break 직후일 때만 태그다.
      const atLineStart = i === 0 || children[i - 1].type === 'break';
      const parts = splitText(child.value, atLineStart);
      if (parts) children.splice(i, 1, ...parts);
    }
  }

  function splitText(text, atLineStart) {
    const out = [];
    let last = 0;
    for (const m of text.matchAll(TAG_PATTERN)) {
      const [, lead, tag] = m;
      if (m.index === 0 && lead === '' && !atLineStart) continue;
      if (/^[0-9/]+$/.test(tag)) continue;
      onTag(tag);
      if (!link) continue;
      const start = m.index + lead.length;
      if (start > last) out.push({ type: 'text', value: text.slice(last, start) });
      out.push(link(tag));
      last = start + 1 + tag.length;
    }
    if (!link || out.length === 0) return null;
    if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
    return out;
  }
}

export function remarkInlineTags(options = {}) {
  const base = (options.base ?? '').replace(/\/$/, '');
  return (tree, file) => {
    const lang = /\.en\.md$/.test(file?.path ?? '') ? 'en' : 'ko';
    processTree(tree, () => {}, (tag) => ({
      type: 'link',
      url: `${base}${lang === 'en' ? '/en' : ''}/tags/?k=${encodeURIComponent(tag)}`,
      data: { hProperties: { className: ['inline-tag'] } },
      children: [{ type: 'text', value: `#${tag}` }],
    }));
  };
}

/** 렌더러와 동일한 규칙(GFM)으로 본문 문자열에서 인라인 태그 이름을 수집한다. */
export function collectInlineTags(markdown) {
  const tree = fromMarkdown(markdown ?? '', {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const tags = new Set();
  processTree(tree, (tag) => tags.add(tag), null);
  return [...tags];
}
