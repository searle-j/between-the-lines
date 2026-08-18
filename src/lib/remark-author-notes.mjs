/**
 * 저자 주석: 본문의 이탤릭 괄호 주석 `*(작성자 주. …)*` / `*(Author's note. …)*`를
 * 앞말에 붙는 위첨자 번호와 호버·포커스 팝오버로 바꾼다.
 *
 * 규칙:
 * - 이탤릭(emphasis)으로 감싼 괄호 주석만 인식한다 — Obsidian에서는
 *   종이책 주석처럼 기울임 괄호로 보이고, 이탤릭 경계가 곧 주석 경계다.
 * - 내용이 비어 있으면(템플릿 삽입 직후) 변환하지 않고 그대로 둔다.
 * - 링크·코드·수식·HTML 안은 건드리지 않는다.
 * - 주석 내용은 평문만 지원한다. 이탤릭 안에 다른 Markdown을 겹치면
 *   변환하지 않고 원문 그대로 남긴다.
 */
const PREFIXES = [
  { open: '(작성자 주.', label: '작성자 주.', ariaLabel: '작성자 주' },
  // SmartyPants가 어포스트로피를 둥근 따옴표(’)로 바꾸므로 두 형태 모두 인식한다.
  { open: "(Author's note.", label: "Author's note.", ariaLabel: "Author's note" },
  { open: '(Author’s note.', label: 'Author’s note.', ariaLabel: 'Author’s note' },
];

const SKIP_CHILDREN = new Set([
  'link',
  'linkReference',
  'code',
  'inlineCode',
  'math',
  'inlineMath',
  'html',
]);

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function remarkAuthorNotes() {
  return (tree) => {
    let noteNumber = 0;
    walk(tree, () => ++noteNumber);
  };
}

function walk(node, nextNumber) {
  if (SKIP_CHILDREN.has(node.type) || !Array.isArray(node.children)) return;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const note = child.type === 'emphasis' ? parseNote(child) : null;
    if (!note) {
      walk(child, nextNumber);
      continue;
    }

    // 앞 텍스트의 꼬리 공백을 지워 위첨자 마커가 앞말에 바로 붙게 한다.
    const prev = node.children[i - 1];
    if (prev?.type === 'text') prev.value = prev.value.replace(/[ \t]+$/, '');

    const number = nextNumber();
    const id = `author-note-${number}`;
    node.children[i] = {
      type: 'html',
      value:
        '<span class="author-note">' +
        '<sup class="author-note-ref">' +
        `<button type="button" class="author-note-mark" aria-label="${escapeHtml(note.prefix.ariaLabel)} ${number}" aria-describedby="${id}">${number}</button>` +
        '</sup>' +
        `<span class="author-note-box" id="${id}" role="note"><span class="author-note-label">${escapeHtml(note.prefix.label)}</span> ${escapeHtml(note.body)}</span>` +
        '</span>',
    };
  }
}

/** `*(작성자 주. …)*` 형태의 emphasis 노드에서 주석 내용을 추출한다. */
function parseNote(emphasis) {
  if (emphasis.children.length !== 1 || emphasis.children[0].type !== 'text') return null;
  const value = emphasis.children[0].value.trim();
  for (const prefix of PREFIXES) {
    if (!value.startsWith(prefix.open) || !value.endsWith(')')) continue;
    const body = value.slice(prefix.open.length, -1).trim();
    if (!body) return null; // 빈 스니펫은 이탤릭 그대로 노출 — 미완성이 눈에 띄게
    return { prefix, body };
  }
  return null;
}
