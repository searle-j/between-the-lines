/**
 * Obsidian 스타일 인라인 태그: 본문 텍스트의 `#llm` 을 태그 페이지 링크로
 * 바꾼다. text 노드만 순회하므로 코드 블록·인라인 코드 안의 #은 건드리지
 * 않고, URL 조각(#fragment)은 공백 뒤가 아니므로 제외된다.
 * Obsidian 규칙대로 숫자로만 이루어진 태그는 무시한다.
 */
const TAG_PATTERN = /(^|[\s(（[])#([A-Za-z0-9_가-힣][A-Za-z0-9_가-힣/-]*)/g;

export function remarkInlineTags(options = {}) {
  const base = (options.base ?? '').replace(/\/$/, '');

  return (tree, file) => {
    const lang = /\.en\.md$/.test(file?.path ?? '') ? 'en' : 'ko';
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
        const replaced = splitTags(child.value);
        if (replaced) children.splice(i, 1, ...replaced);
      }
    }

    function splitTags(text) {
      const out = [];
      let last = 0;
      for (const m of text.matchAll(TAG_PATTERN)) {
        const [, lead, tag] = m;
        if (/^[0-9/]+$/.test(tag)) continue;
        const start = m.index + lead.length;
        if (start > last) out.push({ type: 'text', value: text.slice(last, start) });
        out.push({
          type: 'link',
          url: `${base}${lang === 'en' ? '/en' : ''}/tags/${tag}/`,
          data: { hProperties: { className: ['inline-tag'] } },
          children: [{ type: 'text', value: `#${tag}` }],
        });
        last = start + 1 + tag.length;
      }
      if (out.length === 0) return null;
      if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
      return out;
    }
  };
}
