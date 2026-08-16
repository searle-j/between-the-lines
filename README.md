# Between the Lines

**Live: <https://searle-j.github.io/between-the-lines/>**

논문과 책 리뷰를 기록하는 개인 블로그.

Markdown이 원본이고(Obsidian으로 작성), [Astro](https://astro.build)가 정적 사이트로 조판해 GitHub Pages로 배포된다. 서버 없음.

```text
Obsidian ──▶ Markdown + assets ──▶ git push ──▶ GitHub Actions(astro build) ──▶ GitHub Pages
```

## 글 쓰는 법

### 파일 위치와 이름

| 종류             | 위치                                                |
| ---------------- | --------------------------------------------------- |
| 논문 리뷰        | `content/papers/<slug>.ko.md` + `<slug>.en.md`      |
| 책(학술·비문학)  | `content/books/<slug>.ko.md` + `<slug>.en.md`       |
| 문학·에세이      | `content/literature/<slug>.ko.md` + `<slug>.en.md`  |
| 이미지           | `assets/<slug>/…`                                   |
| About            | `content/pages/about.ko.md` / `about.en.md`         |

- `<slug>`가 URL이 된다: `papers/flash-attention-4.ko.md` → `/papers/flash-attention-4/`. 영문 소문자·하이픈 권장.
- `.ko.md`는 기본(한국어) 페이지, `.en.md`는 `/en/` 아래 영어 페이지. 우측 상단 토글이 두 페이지를 오간다.
- 이 형식이 아닌 `.md` 파일은 **사이트에 실리지 않는다** (로컬 메모용으로 활용 가능).

### Frontmatter

```yaml
---
title: "제목"
date: 2026-08-08
type: paper          # paper | book | literature (폴더와 일치)
publish: true        # true여야 사이트에 발행 — 기본 false, 로컬 dev에서는 항상 보임
description: "목록·RSS·검색엔진에 쓰일 한 줄 요약 (선택)"
---
```

### 이미지와 링크

```md
![그림 1](../../assets/<slug>/figure-1.png)
[다른 글](../books/satantango.ko.md)
```

상대 경로만 쓰면 Obsidian과 사이트 양쪽에서 동작한다. `.md`로 끝나는 내부 링크는 빌드 때 자동으로 게시글 주소로 변환된다.

### 태그

Obsidian 스타일 그대로 본문에 `#llm` 처럼 쓰면 된다 (`#ability_test`, `#world_model` 같은 스네이크케이스 권장 — 태그가 URL이 된다). 본문 인라인 `#태그`가 태그의 **유일한 소스**다 — frontmatter에 `tags:` 필드는 없다.

- 인라인 `#태그`는 자동으로 수집되어 `/tags/` 목록과 `/tags/<태그>/` 페이지가 생기고, 본문에서도 클릭 가능한 링크로 렌더된다.
- 코드 블록/인라인 코드 안의 `#`, URL의 `#fragment`, 숫자로만 된 태그는 무시된다.
- 태그 페이지에서는 넓은 화면(≥1280px) 오른쪽의 **Also tagged** 목록으로 태그를 추가 선택해 AND 조건으로 좁힐 수 있다. 선택 상태는 `?and=tag1,tag2`로 URL에 남아 공유·새로고침에도 유지된다.

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

- `npm run check:content` — 번역 누락·파일명 규칙·type-폴더 불일치 경고 (빌드 시 자동 실행)
- `npm run check` — Astro 템플릿 타입 검사 (CI에서 자동 실행)
- 빌드 후에는 `scripts/verify-dist.mjs`가 전 페이지의 내부 링크·내비 일관성·lang·hreflang·sitemap·검색 번들을 전수 검사하고, 위반이 있으면 빌드를 실패시킨다.
- dev 서버가 새로 만든 md 파일을 목록에 반영하지 못하면(장시간 구동 시 드물게 발생) `npx astro dev stop` 후 `npm run dev`로 재시작한다.

## 배포

`main`에 push하면 GitHub Actions가 타입 검사→빌드→전수 검사를 통과한 경우에만 GitHub Pages로 배포한다 (`.github/workflows/deploy.yml`).

배포 직후 몇 분간은 CDN 캐시(max-age 600초) 때문에 일부 페이지가 이전 버전으로 보이거나 스타일이 어긋날 수 있다. 최대 10분 안에 자동 해소되며, 강력 새로고침(Ctrl+Shift+R)으로 즉시 확인할 수 있다.

## 방문 통계

[GoatCounter](https://www.goatcounter.com) hosted(`between-the-lines.goatcounter.com`)로 집계한다. 배포본에만 `count.js` 추적 스크립트가 들어가고(로컬 방문 제외), 조회수는 방문자 브라우저가 GoatCounter의 공개 카운터 JSON을 읽어 채운다.

- 글별 조회수: 게시물 메타 줄의 `<ViewCount>` (`/counter/<path>.json`)
- 전체 조회수: 홈의 `total views` (`/counter/TOTAL.json`)
- provider는 `src/analytics/provider.ts` 어댑터 뒤에 있어 GA4 등으로 교체해도 페이지 코드는 그대로다. 카운트를 못 가져오면(설정 off·데이터 없음·네트워크 오류) 숫자를 조용히 숨긴다.

**필수 설정:** GoatCounter Settings에서 **"Allow adding visitor counts on your website"** 를 켜야 사이트에 숫자가 표시된다 (기본 꺼짐). 집계 자체는 스크립트가 배포된 시점부터 시작된다.

## Obsidian 설정

repo 루트를 vault로 열어 쓴다. 권장 설정:

- **Files and links → Use \[\[Wikilinks\]\]: off** (표준 Markdown 링크 사용)
- **New link format: Relative path to file**
- **Default location for new attachments**: `assets` 폴더
- **Files and links → Excluded files**: `src`, `public`, `scripts`, `node_modules`, `dist`, `.astro`, `.github`
- **Templates → Template folder location**: `templates` — 논문·학술서적은 `templates/post.ko.md`/`post.en.md`, 문학·에세이는 `literature.ko.md`/`literature.en.md`(frontmatter만)를 Insert template로 불러와 시작한다 (`content/` 밖이라 사이트에는 실리지 않음).

## License

- Code (`src/`, configs): [MIT](LICENSE)
- Content in `content/` and `assets/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), unless otherwise noted. Any material quoted from the original works remains © its original authors. See [LICENSE-content.md](LICENSE-content.md).
