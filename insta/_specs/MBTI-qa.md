# QA 판정: FAIL

검수 대상: `insta/_specs/MBTI-build.json` (+ `MBTI-content.md`)
기준: `brand/DESIGN-SYSTEM.md`, `CLAUDE.md`

## 요약
- **심각(FAIL)**: 핸들이 전 카드에서 `@ucling_dating` 으로 잘못 박힘. 프로젝트 공식 핸들은 `@ucling.official` (index.html·app.js·제안서 전부 일치). 애착유형 세트와도 불일치.
- 색 토큰 / 핑크 1곳 / 본문 plum / 개인정보 / CTA 수렴은 모두 통과.
- 글자수 넘침은 각 카드 overflowFix에 축약안이 이미 있어 "제작 후 사람 확인"으로 통과 가능.

---

## 전 카드 공통 (FAIL — 반드시 수정)
- [핸들] 문제: `text.handle`, 카드6 `profile`, 표지 캡션 등 모든 핸들이 `@ucling_dating`. 실제 운영 계정은 `@ucling.official` (index.html L328, app.js L20, 업체 제휴 제안서.md L99에서 확인). 존재하지 않는/틀린 계정을 노출하는 셈이라 심각.
  - 지시: 6장 전부 `@ucling_dating` → `@ucling.official` 로 교체. 카드6 `profile`의 `@ucling_dating · 우클링 하루연애 1회차 모집 중` 도 동일 교체. → **오케스트레이터/카피라이터**가 build.json·content.md 양쪽 수정.

## 카드 1 (표지)
- 이상 없음. 색·핑크(타이틀 '?' 1곳)·본문 plum 모두 정상. (핸들만 위 공통 수정)

## 카드 2~5 (NT/NF/SJ/SP 본문)
- [글자수] 문제: 본문 4줄이 각 30~34자로 템플릿 폭 넘칠 위험. 카드4는 타이틀도 길다.
  - 지시: 각 카드 `overflowFix`에 축약안이 이미 있음. Figma에 앉힌 뒤 넘침 확인되면 그 축약안 적용. → **아트디렉터**, 제작 후 사람 눈 확인.
- [색] 이상 없음. 핑크는 🌟인사이트 헤드라인 1곳뿐. titleBar/badgeBg는 rose(그래픽·뱃지)로 정상.

## 카드 6 (CTA)
- [CTA 수렴] 통과: 핵심 CTA '신청은 프로필 링크에서' + 우클링 소개(원데이 클래스 3:3, 1회차 모집) 있음. 핑크도 CTA 1곳.
- [회차] 참고: 본문·profile에 "1회차" 하드코딩됨. 규칙상 수동 텍스트라 허용이나, 애착유형 세트는 회차를 비워 운영자 입력으로 둠. 회차 표기 방식을 두 세트 간 통일할지 사람이 결정 권장(경미).
- [핸들] 위 공통 수정 적용.

---

## 재검수 포인트
핸들만 고치면 나머지는 통과 수준. 핸들 교체 후 1회 재검수 → 이상 없으면 PASS.
