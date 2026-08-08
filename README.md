# Between the Lines

**Live: <https://searle-j.github.io/between-the-lines/>**

논문과 책 리뷰를 기록하는 개인 블로그.

Markdown이 원본이고(Obsidian으로 작성), [Astro](https://astro.build)가 정적 사이트로 조판해 GitHub Pages로 배포된다. 서버 없음.

```text
Obsidian ──▶ Markdown + assets ──▶ git push ──▶ GitHub Actions(astro build) ──▶ GitHub Pages
```

## 글 쓰는 법

### 파일 위치와 이름

| 종류      | 위치                                            |
| --------- | ----------------------------------------------- |
| 논문 리뷰 | `content/papers/<slug>.ko.md` + `<slug>.en.md`  |
| 책 리뷰   | `content/books/<slug>.ko.md` + `<slug>.en.md`   |
| 이미지    | `assets/<slug>/…`                               |
| About     | `content/pages/about.ko.md` / `about.en.md`     |

- `<slug>`가 URL이 된다: `papers/flash-attention-4.ko.md` → `/papers/flash-attention-4/`. 영문 소문자·하이픈 권장.
- `.ko.md`는 기본(한국어) 페이지, `.en.md`는 `/en/` 아래 영어 페이지. 우측 상단 토글이 두 페이지를 오간다.
- 이 형식이 아닌 `.md` 파일은 **사이트에 실리지 않는다** (로컬 메모용으로 활용 가능).

### Frontmatter

```yaml
---
title: "제목"
date: 2026-08-08
type: paper          # paper | book (폴더와 일치)
tags:
  - reasoning
description: "목록·RSS·검색엔진에 쓰일 한 줄 요약 (선택)"
draft: true          # true면 배포에서 제외, 로컬 dev에서는 보임 (선택)
---
```

### 이미지와 링크

```md
![그림 1](../../assets/<slug>/figure-1.png)
[다른 글](../books/satantango.ko.md)
```

상대 경로만 쓰면 Obsidian과 사이트 양쪽에서 동작한다. `.md`로 끝나는 내부 링크는 빌드 때 자동으로 게시글 주소로 변환된다.

### 태그

Obsidian 스타일 그대로 본문에 `#llm` 처럼 쓰면 된다 (`#ability_test`, `#world_model` 같은 스네이크케이스 권장 — 태그가 URL이 된다).

- 본문 인라인 `#태그`는 자동으로 수집되어 `/tags/` 목록과 `/tags/<태그>/` 페이지가 생기고, 본문에서도 클릭 가능한 링크로 렌더된다.
- frontmatter `tags:` 목록도 병합된다 (양쪽 다 써도 됨).
- 코드 블록/인라인 코드 안의 `#`, URL의 `#fragment`, 숫자로만 된 태그는 무시된다.

### 지원 문법

표, 각주(`[^1]`), 코드 블록(구문 강조), 수식(`$…$`, `$$…$$`), 인용, 취소선 등 GFM + LaTeX. 외부 링크는 자동으로 새 창(`target="_blank"`)으로 열린다.

## 검색

[Pagefind](https://pagefind.app)가 빌드 후 `dist/`를 인덱싱한다(`postbuild`). `/search/` 페이지에서 키워드 검색이 되고, 한국어/영어 인덱스는 페이지 `lang`에 따라 자동 분리된다. dev 서버에는 인덱스가 없으므로 `npm run build && npm run preview`로 확인한다.

## 로컬 미리보기

```bash
# Node 24 (.nvmrc)
npm install
npm run dev        # http://localhost:4321/between-the-lines/
npm run build      # 콘텐츠 검사 + 빌드 + Pagefind 인덱싱 → dist/
npm run preview    # dist/ 를 로컬에서 서빙 (검색 포함 전체 확인)
```

`npm run check:content`는 번역 누락, 파일명 규칙 위반, type-폴더 불일치를 경고한다 (빌드 시 자동 실행).

## 배포

`main`에 push하면 GitHub Actions가 빌드해 GitHub Pages로 자동 배포한다 (`.github/workflows/deploy.yml`).

## 방문 통계 (예정)

조회수 UI는 `src/analytics/provider.ts` 어댑터 뒤에 숨어 있다. GoatCounter 가입 후 이 어댑터에 구현을 연결하면 글별/전체 조회수가 표시된다. provider를 나중에 교체해도 페이지 쪽 코드는 바뀌지 않는다.

## Obsidian 설정

repo 루트를 vault로 열어 쓴다. 권장 설정:

- **Files and links → Use \[\[Wikilinks\]\]: off** (표준 Markdown 링크 사용)
- **New link format: Relative path to file**
- **Default location for new attachments**: `assets` 폴더
- **Files and links → Excluded files**: `src`, `public`, `scripts`, `node_modules`, `dist`, `.astro`, `.github`

## License

- Code (`src/`, configs): [MIT](LICENSE)
- Content in `content/` and `assets/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), unless otherwise noted. Figures quoted from reviewed papers remain © their original authors. See [LICENSE-content.md](LICENSE-content.md).
