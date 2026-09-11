---
name: reels
description: "우클링 하루연애 인스타 릴스(9:16 세로 영상 광고)를 기획부터 제작까지 만드는 오케스트레이터. 스크립트라이터→스토리보드디렉터→QA 서브에이전트로 설계하고, 메인 세션이 실제 영상을 제작한다(픽셀=코드 파이프라인, 실사=스톡+ffmpeg). 트리거: '릴스 만들어줘', '영상 만들어줘', '동영상 광고 만들어줘', '숏폼/세로영상', 그리고 기존 릴스 '다시 만들어줘/수정/보완/재실행/다른 톤으로'."
---

# 릴스 만들기 (우클링 인스타 세로 영상)

우클링 하루연애의 인스타 **릴스(9:16 세로 영상 광고)** 를 **한 콘셉트 = 한 편**으로 만든다. 기획(초 단위 스크립트·컷·자막)은 서브에이전트가, 실제 영상 제작은 메인 세션이 한다. 콘텐츠는 미끼, 목적은 하루연애 신청 — 모든 편은 마지막에 "신청은 프로필 링크에서" CTA로 수렴한다.

> 카드뉴스 하네스(`.claude/skills/cardnews/`)와 **별개**다. 카드뉴스는 정지 카드+Figma, 릴스는 초 단위 타이밍·훅·자막·모션·사운드가 근육이다. 서로 참조는 하되 파일은 섞지 않는다.

## 왜 이렇게 나누나
영상 제작은 (a)픽셀=코드 파이프라인(HTML/CSS 애니 → Playwright 프레임 캡처 → ffmpeg), (b)실사=무료 스톡 다운로드 + ffmpeg 편집으로 간다. 둘 다 **로컬 도구·인증**이 필요해서 서브에이전트가 직접 못 만질 수 있다. 그래서 서브에이전트는 설계(스크립트·스토리보드·검수)만 만들고, 메인 세션이 그 설계로 영상을 찍는다.

## 준비물 (먼저 읽기)
- `.claude/skills/reels/references/reels-spec.md` — 공통 영상 규격·5톤 테스트 매핑·스톡 라이선스·제작 도구. **제작의 기준.**
- `CLAUDE.md`, `소개팅 마케팅 기획서.md` — 컨셉·5톤 광고 테스트·전환추적(메타 픽셀 Lead).
- `brand/DESIGN-SYSTEM.md`, `brand/tokens/tokens.css` — 브랜드 하드 규칙(토큰만·핑크 1곳·본문 plum·로고 변형금지).

## 워크플로우

### Phase 1 — 스크립트 (서브에이전트)
`reels-scriptwriter` 를 Agent 도구로 호출(`subagent_type: "reels-scriptwriter"`). 주제·톤(감성/유머/후기/나도연프/클래스비주얼)·길이·회차를 전달.
→ 산출: `insta/reels/_specs/{slug}-script.md` (훅·초 단위 나레이션/자막·CTA)

### Phase 2 — 스토리보드 (서브에이전트)
`reels-storyboard-director` 호출. 스크립트를 컷별 표로 매핑(초/화면/모션/자막/소스/사운드). 픽셀편은 캐릭터·씬 슬롯, 실사편은 스톡 슬롯을 지정.
→ 산출: `insta/reels/_specs/{slug}-storyboard.md`

### Phase 3 — QA (서브에이전트)
`reels-qa` 호출. 브랜드·개인정보 + **영상 규격**(9:16·훅 2초·자막 무음가독·길이·CTA·핑크 1곳) 검수.
→ 산출: `insta/reels/_specs/{slug}-qa.md`. FAIL이면 해당 컷만 1회 수정 후 재검수.

### Phase 4 — 제작 (메인 세션에서만)
- **픽셀편(예: emotional)**: `insta/reels/{slug}.html`(CSS keyframes, 1080×1920) 작성 → `insta/reels/capture.mjs`로 프레임 캡처(PNG 시퀀스) → `ffmpeg`로 mp4(+BGM mux). 마스코트 스프라이트는 `gemini-3-pro-imagegen` 스킬로 생성(`insta/reels/assets/`).
- **실사편(예: humor)**: `claude-in-chrome` MCP로 스톡 다운로드(`insta/reels/assets/stock/`) + 필요시 `index.html` 화면 녹화 → `insta/reels/{slug}.mjs`(ffmpeg 트림·drawtext 자막·반반 split·BGM) → mp4.
- 완성물은 `insta/reels/out/{slug}.mp4`. 먼저 짧은 프리뷰(또는 표지 프레임)로 사용자 확인 후 풀 렌더.

## 데이터 전달
- 전부 파일 기반: `insta/reels/_specs/{slug}-script.md` → `-storyboard.md` → `-qa.md`.
- `{slug}` 은 콘셉트 슬러그(예: `emotional`, `humor`). 편마다 파일이 분리된다.

## 재실행 / 수정 / 다른 톤
- "○○ 릴스 수정/보완": 해당 `{slug}-*` 스펙만 고치고 Phase 2~4 재실행.
- "다른 톤으로 하나 더": 새 `{slug}` 으로 Phase 1부터.
- 톤 풀(5톤 테스트): 감성형·유머형·후기증언형·"나도 연프?"·클래스비주얼형. 자세한 정의는 reels-spec.md.

## 하지 말 것
- 서브에이전트에게 실제 영상 렌더/스톡 다운로드를 시키지 않는다(로컬 도구·인증 못 닿음). 설계만.
- 카드뉴스 하네스 파일·원본 자산 수정 금지.
- 브랜드 토큰 밖의 색, 핑크 남발, 본문 rose, 로고 변형 금지.
- 이름 등 개인정보를 영상/자막에 넣지 않는다. 스톡 인물을 명예훼손적으로 연출하지 않는다.
