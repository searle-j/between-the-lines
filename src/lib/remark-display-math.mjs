/**
 * 한 줄로 쓴 `$$ … $$` 를 display 수식으로 승격한다.
 *
 * remark-math는 `$$`가 줄 처음에 오고 내용이 다음 줄부터 와야 display로 본다.
 * 그런데 인용(`>`) 안에서는 그 여러 줄 형식이 Obsidian 미리보기에서 깨져
 * `>` 기호가 수식 안으로 섞여 들어간다. 한 줄로 쓰면 Obsidian은 제대로
 * 그리지만 이번에는 remark-math가 인라인 수식으로 읽는다.
 *
 * 그래서 '문단에 단 하나 있는 인라인 수식이고 원본이 `$$`로 시작할 때'만
 * display 수식 노드로 바꾼다. 양쪽 렌더러에서 같은 결과가 나온다.
 * `$…$` 하나짜리 문단은 건드리지 않는다.
 */
export function remarkDisplayMath() {
  return (tree, file) => {
    const source = String(file?.value ?? '');
    walk(tree);

    function walk(node) {
      const children = node.children;
      if (!Array.isArray(children)) return;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type !== 'paragraph') {
          walk(child);
          continue;
        }
        const math = soleInlineMath(child);
        const offset = math?.position?.start?.offset;
        if (math && offset != null && source.startsWith('$$', offset)) {
          children[i] = displayMath(math.value, child.position);
        }
      }
    }
  };
}

/** 문단의 유일한 알맹이가 인라인 수식이면 그 노드를, 아니면 null을 준다. */
function soleInlineMath(paragraph) {
  let found = null;
  for (const child of paragraph.children ?? []) {
    if (child.type === 'text' && child.value.trim() === '') continue;
    if (child.type === 'inlineMath' && !found) {
      found = child;
      continue;
    }
    return null;
  }
  return found;
}

/** remark-math가 여러 줄 `$$`에 붙이는 것과 같은 모양의 display 수식 노드. */
function displayMath(value, position) {
  return {
    type: 'math',
    value,
    position,
    data: {
      hName: 'pre',
      hChildren: [
        {
          type: 'element',
          tagName: 'code',
          properties: { className: ['language-math', 'math-display'] },
          children: [{ type: 'text', value }],
        },
      ],
    },
  };
}
