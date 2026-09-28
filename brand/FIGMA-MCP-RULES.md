# Figma → 코드 연동 규칙 (우클링 하루연애)

이 문서는 Figma MCP로 디자인을 가져오거나 내보낼 때 반드시 지킬 규칙이다.
**목적: 피그마 쪽 스타일을 그대로 박지 말고, 이 프로젝트의 토큰·규칙으로 다시 매핑한다.**

> 상위 규칙은 `CLAUDE.md`, `brand/DESIGN-SYSTEM.md`가 우선한다. 충돌하면 그 둘을 따른다.

---

## 0. 황금 규칙 (가장 중요)

피그마 디자인은 **레이아웃·구조·카피의 참고**로만 쓴다.
색·폰트·간격·그림자는 **피그마 값을 신뢰하지 말고** 아래 토큰으로 교체한다.

- 피그마에서 `#FF4D85` 같은 raw hex가 나와도 → `var(--ucld-accent)`로 매핑.
- 피그마 폰트가 Pretendard/강원교육현옥이어도 → 아래 "폰트 매핑" 표를 따른다.
- 매칭되는 토큰이 없으면 **임의 색을 만들지 말고** 사용자에게 물어본다.

---

## 1. 토큰 정의

**단일 출처: `brand/tokens/tokens.css`** (CSS 커스텀 프로퍼티). 플랫폼 중립본은 `brand/tokens/tokens.json`.
빌드 시스템·토큰 변환 도구는 없다 (정적 사이트). CSS 변수를 직접 쓴다.

### 피그마 변수 → CSS 토큰 매핑

피그마에서 `get_variable_defs`로 나온 값을 아래로 강제 변환한다.

| 의미 | 피그마에서 나올 법한 값 | → 써야 할 토큰 |
|---|---|---|
| 브랜드 주색 (버튼/활성/U 스트로크) | `#e0356b`, rose | `var(--ucld-primary)` |
| 주색 hover/pressed | `#b82a58` | `var(--ucld-primaryDeep)` |
| 주색 여린 단계 | `#f591ad` | `var(--ucld-primarySoft)` |
| **마음 액션**(좋아요·매칭·하트) | `#ff4d85`, pink | `var(--ucld-accent)` ※화면당 1곳만 |
| 칩·태그 여린 핑크 | `#ff9ec4` | `var(--ucld-accentSoft)` |
| 페이지 배경 | `#ffedf2`, blush | `var(--ucld-bg)` |
| 섹션/카드 위 카드 배경 | `#ffdce8` | `var(--ucld-bgDeep)` |
| 카드·시트 표면 | `#fff7f9`, cream | `var(--ucld-surface)` |
| 입력필드 순백 | `#ffffff` | `var(--ucld-surfacePlain)` |
| 본문 텍스트 | `#2b1b24`, plum | `var(--ucld-text)` |
| 보조 텍스트·캡션 | `#7a6570` | `var(--ucld-textMute)` |

### 절대 어기지 말 것 (DESIGN-SYSTEM.md에서)
- **핑크(`--ucld-accent`)는 "마음" 액션 한 곳에만.** 피그마에 핑크가 곳곳에 있어도 CTA·링크·활성탭은 전부 `--ucld-primary`(rose)로.
- **rose는 본문 텍스트 색 금지** (대비 4.5 미달). 작은 글씨는 `--ucld-text`(plum), rose는 밑줄·아이콘 등 비텍스트 강조에만.
- 로즈 버튼의 흰 라벨은 **16px bold 이상**에서만 안전 (대비 4.29).
- 본 서비스 팔레트(클레이 `#b85638`/데님 `#3a66a0`)와 **절대 혼용 금지.**

---

## 2. 폰트 매핑

이 프로젝트는 **두 개의 시각 트랙**이 공존한다. 어느 트랙인지 먼저 판단하고 폰트를 고른다.

| 트랙 | 용도 | 폰트 | 근거 파일 |
|---|---|---|---|
| **픽셀 감성** | 신청 웹사이트, 브랜드 카드뉴스(소개/QnA/안내) | `Galmuri11` / 제목 `Galmuri14` | `index.html`, `insta/cards.html` |
| **매거진 감성** | 동네 데이트 스팟 실사진 카드 | `Pretendard Variable` (제목 강조엔 `GangwonEduHyeonokT`) | 피그마 `📍 서연` 파일 |

- 피그마 매거진 템플릿을 코드로 옮길 때 → Pretendard 유지.
- 브랜드 톤(웹/신청/이벤트 안내) 카드로 옮길 때 → **Galmuri 픽셀 폰트로 바꾼다.** 피그마가 Pretendard여도 트랙이 다르면 교체.
- 픽셀 트랙에선 `image-rendering: pixelated; shape-rendering: crispEdges;`를 유지한다.

---

## 3. 컴포넌트 / 스타일 접근

- **프레임워크 없음.** 순수 HTML/CSS/JS 정적 사이트. React/Vue로 만들지 말 것 (`CLAUDE.md` 규칙).
- CSS 방법론: 전역 스타일시트 + BEM식 클래스(`.card`, `.card__logo`, `.btn-primary`, `.btn-like`). CSS Modules/styled-components 안 씀.
- 전역 스타일: 웹은 `styles.css`, 카드뉴스는 `insta/cards.html` 내부 `<style>`.
- 컴포넌트 라이브러리/스토리북 없음. "컴포넌트"는 재사용 클래스 패턴으로 존재.

### 피그마의 반복 컴포넌트 → 코드 클래스
피그마 파일의 재사용 구조와 코드 클래스 대응:

| 피그마 프레임 | 코드에서 |
|---|---|
| `표지 레이아웃` | `.card.cover` |
| `본문 레이아웃` / `본문_기본` | `.card` + `.head`/`.body` |
| `마무리 장표 레이아웃`(팔로우 CTA) | 마지막 카드 + `.cta` 픽셀 버튼 |
| `팔로우 버튼` | `.cta` (rose 배경, 흰 라벨, `--px-shadow`) |

버튼 스타일 표준(픽셀 트랙): `background: var(--ucld-primary); color:#fff; font-weight:700; box-shadow: var(--px-shadow)`.

---

## 4. 반응형

- **모바일 우선.** 대부분 인스타 광고 → 모바일 유입 (`CLAUDE.md`).
- 신청 웹(`index.html`)만 반응형 필요. 카드뉴스는 **고정 캔버스 1080×1350 (4:5)** — 반응형 아님.
- 카드는 2× 배율로 내보낸다 → 2160×2700 (`insta/export.mjs`, Playwright).

---

## 5. 에셋 관리

- 로고/파비콘/심볼은 **`brand/` 안의 파일만** 쓴다. 피그마에서 로고를 다시 export 하지 말 것.
- **SVG가 마스터.** 크기가 필요하면 `brand/svg/`에서 다시 뽑는다. PNG 확대 금지.
- 카드뉴스 우상단 로고는 `insta/assets/`. 심볼 최소 크기 **투톤 32px / 모노 20px**. 회전·그림자·색변경 금지.
- 피그마에서 사진 에셋을 `download_assets`로 받을 때 → 동네별 폴더(`insta/서촌/`, `insta/행궁동/` …) 규칙을 따른다.
- CDN 설정 없음. Galmuri 폰트만 jsDelivr CDN(`cdn.jsdelivr.net/npm/galmuri`)에서 로드.

### 아이콘 시스템
전용 아이콘 폰트/라이브러리 없음. 이모지를 아이콘처럼 쓴다 (피그마에 "이모지 모음" 프레임 있음: 별·하트·화살표). 피그마의 이모지는 그대로 카피 가능.

---

## 6. 프로젝트 구조

```
/                     신청 웹사이트 (정적)
  index.html          신청 폼 (픽셀 트랙)
  styles.css          웹 전역 스타일
  app.js              폼 로직 · submitApplication() (Web3Forms, 교체지점)
brand/                디자인 시스템 (본 서비스와 별개)
  DESIGN-SYSTEM.md    색·로고 규칙 (최우선)
  FIGMA-MCP-RULES.md  ← 이 문서
  tokens/             tokens.css · tokens.json
  svg/  png/          로고·심볼·파비콘 (SVG 마스터)
insta/                인스타 카드뉴스
  cards.html          브랜드 카드(픽셀 트랙) 전 장표
  export.mjs          Playwright PNG 내보내기 (2×)
  {동네}/             동네별 매거진 카드 PNG (서촌·행궁동·혜화·연희·합정·망원)
```

---

## 7. code-to-design (코드 → 피그마)

지금 만든 카드/폼을 피그마로 내보낼 때:
- `use_figma`/`generate_figma_design` 호출 전 **반드시 `/figma-use` 스킬을 먼저 로드**한다 (MCP 서버 지침).
- 색은 위 토큰 hex를 그대로 피그마 변수로 만든다 (raw hex 흩뿌리지 말 것).
- 두 트랙(픽셀/매거진)을 한 프레임에 섞지 않는다.

---

## 8. 작업 전 체크리스트

- [ ] 이 디자인은 픽셀 트랙인가, 매거진 트랙인가? → 폰트 결정
- [ ] 피그마 색을 §1 표로 전부 토큰 매핑했는가?
- [ ] 핑크를 화면당 1곳(마음 액션)에만 썼는가?
- [ ] 본문에 rose를 쓰지 않았는가?
- [ ] 로고를 피그마가 아니라 `brand/`에서 가져왔는가?
- [ ] 매칭 안 되는 색/폰트를 임의로 만들지 않고 물어봤는가?
```
