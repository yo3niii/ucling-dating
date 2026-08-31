# 우클링 소개팅 — 로고 & 컬러 디자인시스템

기준 시안: `profile_dating_v2 / 09_twotone-on-blush`
심볼: 우클링 기본 심볼의 점(dot)을 하트로 교체한 투톤 마크.

> 이 팔레트는 **우클링 본 서비스 팔레트와 별개 계열**이다.
> 본 서비스는 수강생 클레이 `#b85638` / 공급자 데님 `#3a66a0` 를 쓴다
> (`03_mockup/mockup/src/theme/global.css`). 소개팅은 로즈/핑크 계열로 분리해
> 서비스 구분을 색으로 먼저 읽히게 한다. 두 팔레트를 한 화면에서 섞지 않는다.

---

## 1. 팔레트

| 토큰 | HEX | 역할 |
|---|---|---|
| `rose` | `#e0356b` | **Primary.** U 스트로크, 주요 버튼, 활성 상태 |
| `rose-deep` | `#b82a58` | primary hover / pressed |
| `rose-soft` | `#f591ad` | primary의 여린 단계, 비활성·보조 강조 |
| `pink` | `#ff4d85` | **Accent.** 하트, 좋아요·매칭 등 감정 액션 |
| `pink-soft` | `#ff9ec4` | accent 여린 단계, 칩·태그 |
| `blush` | `#ffedf2` | 앱·페이지 배경 |
| `blush-deep` | `#ffdce8` | 구분 섹션 배경, 카드 위 카드 |
| `cream` | `#fff7f9` | 카드·시트 표면 |
| `white` | `#ffffff` | 입력 필드 등 순백 표면 |
| `plum` | `#2b1b24` | 본문 텍스트 |
| `plum-mute` | `#7a6570` | 보조 텍스트, 캡션 |

로고 색 배정: **U = `rose`, 하트 = `pink`, 배경 = `blush`**

### accent는 화면당 한 곳
`pink`는 하트가 가진 감정 신호를 그대로 쓴다. 좋아요·매칭·수락처럼 "마음"에
해당하는 액션 하나에만 쓰고, 일반 CTA·링크·활성 탭은 전부 `rose`로 간다.
핑크가 화면 곳곳에 퍼지면 하트의 의미가 죽는다.

---

## 2. 대비 (WCAG 2.1, 실측값)

| 전경 / 배경 | 비율 | 판정 |
|---|---|---|
| `plum` / `blush` | 14.51 | ✅ 본문 텍스트 |
| `plum` / `cream` | 15.51 | ✅ 본문 텍스트 |
| `plum-mute` / `blush` | 4.75 | ✅ 본문 텍스트 (AA 4.5 통과) |
| `rose` / `blush` | 3.81 | ⚠️ 큰 텍스트(18.66px bold / 24px)·그래픽만 |
| `rose` / `white` | 4.29 | ⚠️ 큰 텍스트·그래픽만 (AA 4.5 미달) |
| `white` / `rose` | 4.29 | ⚠️ 버튼 라벨은 bold 16px 이상 권장 |
| `cream` / `rose` | 4.07 | ⚠️ 위와 동일 |
| `pink` / `blush` | 2.80 | ❌ 텍스트 금지. 아이콘·면적 채움 전용 |
| `pink` / `white` | 3.16 | ❌ 텍스트 금지 (그래픽 3:1 은 통과) |

**주의:** `rose`는 본문 텍스트 색으로 쓸 수 없다 (4.5 미달). 링크·라벨 등
작은 텍스트는 `plum`을 쓰고 `rose`는 밑줄·아이콘 같은 비텍스트 요소로 강조한다.
로즈 버튼의 흰 라벨은 4.29라 16px bold 이상에서만 안전하다.

---

## 3. 심볼 사용 규칙

### 클리어 스페이스
심볼 높이의 **25%** 를 사방 여백으로 비운다.

### 최소 크기
| 용도 | 최소 |
|---|---|
| 투톤 마크 (`symbol-twotone`) | **32px** |
| 모노 마크 (`symbol-mono-*`) | 20px |
| 파비콘 | 전용 에셋 사용 (아래) |

**투톤은 32px 미만에서 쓰지 않는다.** `pink`와 `rose`의 대비는 **1.36**뿐이라
작아지면 두 색이 한 덩어리로 뭉개지고 하트가 사라진다. 그 아래 크기는
`symbol-mono-rose` 또는 파비콘 에셋으로 대체한다.

### 파비콘이 투톤이 아닌 이유
16px에서 투톤 마크는 판독이 불가능하다. 그래서 파비콘만
**로즈 솔리드 배경 + 크림 모노 마크, 심볼 비율 68%** 로 따로 그렸다.
형태 하나로 읽히게 만든 의도적 파생형이다.

### 배경별 선택
| 배경 | 마크 |
|---|---|
| `blush` / `cream` / 밝은 사진 | `symbol-twotone` |
| `rose` 솔리드 / 어두운 배경 | `symbol-mono-white` |
| 단색 인쇄·팩스·각인 | `symbol-mono-plum` |
| 복잡한 사진 위 | 마크를 얹지 말고 `tile-rounded` 타일을 깔고 그 위에 |

### 금지
- 하트만 떼어내 단독 사용
- U와 하트 색을 서로 바꾸기
- 심볼 비율 변경, 회전, 기울이기
- 그림자·외곽선·글로우 추가
- 팔레트 밖의 색으로 칠하기
- 본 서비스 클레이/데님 팔레트와 혼용

---

## 4. 에셋

```
svg/
  symbol-twotone.svg        투톤 마크, 투명 배경 (마스터)
  symbol-mono-rose.svg      단색 로즈
  symbol-mono-white.svg     단색 화이트 (어두운 배경용)
  symbol-mono-plum.svg      단색 플럼 (단색 인쇄용)
    ㄴ 위 4종은 viewBox가 심볼 실제 bbox에 딱 맞다(여백 0, 비율 31.5:32.5).
       height만 지정하면 의도한 광학 크기가 그대로 나온다. 여백은 CSS로 준다.
  profile.svg               1024 정사각, blush 배경
  app-icon.svg              1024 앱 아이콘, 풀블리드
  app-icon-maskable.svg     안드로이드 마스커블 (심볼 40%)
  favicon.svg               로즈 솔리드 + 크림 모노
  tile-rounded.svg          라운드 타일 (사진 위 배치용)

png/
  app-icon/   1024 512 192 180 152 120 + android-maskable-512   (알파 없음)
  profile/    1024 512 400 200                                   (알파 없음)
  favicon/    16 32 48 64 128 256 + favicon.ico (멀티사이즈)      (알파 없음)
  symbol/     twotone 1024/512/256/128, mono rose·white·plum 512/256  (투명, 여백 0)
              ㄴ 파일명 숫자는 '높이'. 폭은 비율에 따라 약 0.969배 (예: 512 -> 496x512)

tokens/
  tokens.css   CSS 커스텀 프로퍼티
  tokens.json  플랫폼 중립 토큰
```

**SVG가 마스터다.** 크기가 필요하면 SVG에서 다시 뽑는다. PNG를 확대하지 않는다.

### 용도별
- **iOS 앱 아이콘** — `app-icon-1024.png` (알파 없음, 라운딩 없음. 시스템이 스쿼클로 자른다)
- **Android** — `app-icon-512.png` + `android-maskable-512.png` (마스커블은 세이프존 대응으로 심볼을 40%로 줄인 별도 파일)
- **웹 파비콘** — `favicon.ico` + `favicon.svg` + `favicon-32/180.png`
- **프로필 사진** — `profile-400.png` (원형 크롭 대응. 심볼 54% 배치라 잘리지 않는다)
- **웹사이트 헤더** — `symbol-twotone.svg`, 높이 32px 이상 (`height: 32px; width: auto`)
- **어두운 배경 / 오버레이** — `symbol-mono-white.svg`

---

## 5. 코드에 넣기

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/app-icon-180.png">
```

```css
@import "tokens/tokens.css";

.btn-primary   { background: var(--ucld-primary); color: var(--ucld-white); font-weight: 700; }
.btn-primary:hover { background: var(--ucld-primaryDeep); }
.btn-like      { color: var(--ucld-accent); }   /* 화면당 한 곳 */
body           { background: var(--ucld-bg); color: var(--ucld-text); }
.caption       { color: var(--ucld-textMute); }
```

---

## 6. 아직 없는 것

- **워드마크가 없다.** 현재는 심볼 단독뿐이라 심볼+로고타입 가로 조합(lockup)은
  만들 수 없다. 서체를 정한 뒤 별도로 그려야 한다.
- 다크 모드 팔레트. `plum` `#2b1b24` 를 배경으로 쓰는 방향이 자연스럽지만
  (`profile_dating_v2 / 11_twotone-on-plum` 참고) 전체 스케일은 미정이다.
