# AGENTS.md

이 레포에서 글을 쓰거나 코드를 고칠 때 따르는 규칙이다. 규칙은 이 파일에만 적고 간결하게 유지한다. [README.md](README.md)에는 레포 소개만 둔다.

## 작업 원칙

- 한국어 원고(`.ko.md`)가 기준이다. 영어판(`.en.md`)은 직역하지 않고 자연스럽게 쓰되 뜻은 한국어와 같아야 한다.
- 한쪽을 고치면 다른 쪽도 함께 고친다. 한영 쌍은 `date`·`type`·`publish`, 헤딩 구조, 이미지, 저자 주석, 내부 링크, 태그가 서로 대응해야 한다.
- 한국어 원고는 요청이 없으면 손대지 않는다. 특히, '읽고 든 생각'과 '배운 점'은 작성자의 의견이므로 대신 지어내지 않는다. 단, 오타, 오정보, 에러 등이 있을 때에는 사용자에게 보고한다.
- `publish: true` 전환, 커밋, push는 요청받았을 때만 한다. `main`에 push하면 곧 배포된다.

## 글 쓰는 법

모든 글은 간결하고 캐주얼하게 쓰되, 기술 내용을 정확히 전달해 전문성을 유지한다.

### 파일

| 종류 | 위치 | 템플릿 |
| --- | --- | --- |
| 논문 리뷰 | `content/papers/<slug>.ko.md` + `<slug>.en.md` | `templates/post.*.md` |
| 비문학(학술서 등) | `content/non-fiction/<slug>.ko.md` + `<slug>.en.md` | `templates/non-fiction.*.md` |
| 문학·에세이 | `content/fiction/<slug>.ko.md` + `<slug>.en.md` | `templates/fiction.*.md` |
| 기타 글 | `content/misc/<slug>.ko.md` + `<slug>.en.md` | `templates/misc.*.md` |
| About | `content/pages/about.ko.md` / `about.en.md` | |
| 이미지 | `assets/<slug>/figure-N.png` | |

- `<slug>`가 URL이 된다: `papers/flash-attention-4.ko.md` → `/papers/flash-attention-4/`. 영문 소문자·하이픈을 쓴다.
- `.ko.md`는 기본(한국어) 페이지, `.en.md`는 `/en/` 아래 영어 페이지다. 우측 상단 토글이 두 페이지를 오간다.
- 이 형식이 아닌 `.md` 파일은 사이트에 실리지 않는다(로컬 메모용으로 쓸 수 있다).

### Frontmatter

한영 게시물의 `title`은 짧게 유지한다. 논문과 책의 전체 제목은 본문 서지 정보에 적는다.

```yaml
---
title: "제목"
date: 2026-08-08
type: paper          # paper | non-fiction | fiction | misc (폴더와 일치)
publish: true        # true여야 사이트에 발행 — 기본 false, 로컬 dev에서는 항상 보임
description: "검색엔진·공유 미리보기·RSS에 쓰이는 한 문장"
---
```

발행하는 글은 `description`을 반드시 채운다. 비워 두면 메타 설명이 빈 채로 나간다.

### 본문

- 템플릿의 섹션과 서지 정보 키를 그대로 쓴다. 논문·비문학·기타 글은 `서지 정보 / 세 줄 요약 / 요약 / 읽고 든 생각 / 배운 점 / 다음 읽을 것`, 문학·에세이는 서지 정보 뒤 자유 형식이다.
- 세 줄 요약은 그것만 읽어도 핵심을 파악할 수 있어야 한다. 요약 본문도 중요한 정보를 맥락 없이 나열하지 말고 앞뒤가 이어지게 쓴다.
- 독자의 이해를 돕기 위해, 낯선 배경 개념은 처음 나오는 곳에 작성자 주로 두세 줄 설명한다.
- 쓸 내용이 없는 섹션에는 `- None`을 적는다.
- arXiv 논문은 버전 없는 `/abs/` 주소로 적고, PDF 주소를 따로 덧붙이지 않는다.
- 발행 전에 템플릿의 `#template` 태그와 체크리스트 주석을 지운다.
- 표, 각주(`[^1]`), 코드 블록(구문 강조), 수식(`$…$`, `$$…$$`), 인용, 취소선 등 GFM + LaTeX를 쓸 수 있다. 한 줄로 쓴 `$$…$$`도 display 수식이 된다. 외부 링크는 자동으로 새 창(`target="_blank"`)으로 열린다.

### 이미지와 링크

```md
![그림 1](../../assets/<slug>/figure-1.png)
[다른 글](../fiction/satantango.ko.md)
```

- 상대 경로만 쓰면 Obsidian과 사이트 양쪽에서 동작한다. `.md`로 끝나는 내부 링크는 빌드 때 게시글 주소로 바뀐다. 같은 언어의 파일로 건다.
- 아직 안 쓴(또는 미발행) 글을 링크하면 '준비 중' 페이지(`/not-yet/`)로 연결되고 본문에서 점선 밑줄로 표시된다. 읽을 예정인 글을 미리 링크해 둘 때 쓴다.
- Obsidian 위키링크(`[[…]]`)는 사이트에서 렌더되지 않으므로 쓰지 않는다(check-content가 경고).
- 이미지에는 alt를 붙인다(`그림 1` / `Figure 1` 또는 설명 문구). Obsidian이 `assets/`에 붙여 넣은 `Pasted image …` 파일은 발행 전에 `assets/<slug>/figure-N.png`로 옮긴다.

### 태그

- 본문 인라인 `#태그`가 태그의 유일한 소스다. frontmatter에 `tags:` 필드는 없다. Obsidian의 문법을 따르기 위함이다.
- 글의 마지막 줄에 모아 적는다: `#AI #LLM #world_model`. 영문 스네이크케이스를 쓰고(태그가 URL이 된다), 대소문자를 구분하므로 기존 태그의 표기를 그대로 재사용한다.
- 줄 처음이나 공백·여는 괄호 뒤의 `#단어`는 헤딩·표 안에서도 태그로 수집된다. 코드 안의 `#`, URL의 `#fragment`, 숫자로만 된 것은 무시된다.
- 수집된 태그는 단일 키워드 페이지(`/tags/`)에 모이고 본문에서도 링크가 된다. 태그별 경로는 없다. 키워드 페이지는 토글로 게시물을 AND 조건으로 좁히고, 결과가 0이 될 키워드는 비활성화하며, 선택 상태를 `?k=tag1,tag2`로 URL에 남긴다.

### 저자 주석

- 이탤릭으로 `*(작성자 주. …)*` 또는 `*(Author's note. …)*`를 쓰면, 사이트에서 앞말에 붙는 위첨자 번호로 바뀌고 호버(모바일은 탭)하면 내용이 말풍선으로 보인다. Obsidian에서는 기울임 괄호 주석으로 보인다.
- 접두어는 마침표까지 그대로 쓰고, 주석 앞뒤에는 공백이나 문장부호를 둔다. 조사도 띄어 쓴다: `단어 *(작성자 주. …)* 을`. 붙여 쓰면 변환되지 않는다.
- 주석 안에는 평문·수식·링크만 쓴다. 내용이 비어 있으면(작성 중) 이탤릭 그대로 노출된다.
- `templates/author-note.ko.md` / `author-note.en.md`를 Insert template로 넣으면 편하다.

## 개발

```bash
# Node 24 (.nvmrc)
npm install
npm run dev            # http://localhost:4321/between-the-lines/
npm run build          # 콘텐츠 검사 + 빌드 + Pagefind 인덱싱 → dist/
npm run preview        # dist/ 를 로컬에서 서빙 (검색 포함 전체 확인)
npm run check          # Astro 템플릿 타입 검사 (CI에서 자동 실행)
npm run check:content  # 번역 누락·파일명 규칙·type-폴더 불일치 경고 (빌드 시 자동 실행)
```

- 빌드 후에는 `scripts/verify-dist.mjs`가 전 페이지의 내부 링크·내비 일관성·lang·hreflang·sitemap·검색 번들을 전수 검사하고, 위반이 있으면 빌드를 실패시킨다.
- 검색은 [Pagefind](https://pagefind.app)가 빌드 후(`postbuild`) `dist/`를 인덱싱해 `/search/`에서 제공한다. 한국어/영어 인덱스는 페이지 `lang`에 따라 자동 분리된다. dev 서버에는 인덱스가 없으므로 `npm run build && npm run preview`로 확인한다.
- dev 서버가 새로 만든 md 파일을 목록에 반영하지 못하면(장시간 구동 시 드물게 발생) `npx astro dev stop` 후 `npm run dev`로 재시작한다.
- remark 플러그인을 고쳤는데 기존 게시물에 반영되지 않으면 `rm -rf node_modules/.astro` 후 빌드한다(변경 없는 md는 변환 결과가 캐시된다).

### 배포

`main`에 push하면 GitHub Actions가 타입 검사 → 빌드 → 전수 검사를 통과한 경우에만 GitHub Pages로 배포한다(`.github/workflows/deploy.yml`). 배포 직후 최대 10분간은 CDN 캐시(max-age 600초) 때문에 이전 버전이 보이거나 스타일이 어긋날 수 있다. 강력 새로고침(Ctrl+Shift+R)으로 바로 확인할 수 있다.

### 방문 통계

[GoatCounter](https://www.goatcounter.com) hosted(`between-the-lines.goatcounter.com`)로 집계한다.

- 배포본에만 `count.js` 추적 스크립트가 들어간다(로컬 방문 제외). 조회수는 방문자 브라우저가 GoatCounter의 공개 카운터 JSON을 읽어 채운다: 글별은 게시물 메타 줄의 `<ViewCount>`(`/counter/<path>.json`), 전체는 홈의 `total views`(`/counter/TOTAL.json`).
- provider는 `src/analytics/provider.ts` 어댑터 뒤에 있어 GA4 등으로 교체해도 페이지 코드는 그대로다. 카운트를 못 가져오면 숫자를 조용히 숨긴다.
- GoatCounter Settings에서 **"Allow adding visitor counts on your website"** 를 켜야 사이트에 숫자가 표시된다(기본 꺼짐). 집계 자체는 스크립트가 배포된 시점부터 시작된다.

### Obsidian 설정

repo 루트를 vault로 열고 다음과 같이 설정한다.

- Files and links → Use \[\[Wikilinks\]\]: off (표준 Markdown 링크 사용)
- New link format: Relative path to file
- Default location for new attachments: `assets` 폴더
- Files and links → Excluded files: `src`, `public`, `scripts`, `node_modules`, `dist`, `.astro`, `.github`
- Templates → Template folder location: `templates`. 새 글은 위 표의 템플릿을 Insert template로 불러와 시작한다(`content/` 밖이라 사이트에는 실리지 않는다).
