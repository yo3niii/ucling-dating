# humor 스토리보드 — 유머형 픽셀 릴스

11.6초 · 9:16 1080×1920 · 30fps · Galmuri · MZ 밈 어투. 출력 `out/humor.mp4`.
자막 스타일 = 감성형과 동일(흰 글씨 + 플럼 8방향 외곽선). 핑크 하트 = **컷5 1곳**.
(이전 실사 스톡+ffmpeg 버전은 `humor-live.mjs`로 보관. 스톡 파일 `assets/stock/*`은 미사용.)

| # | 초 | 배경 | 요소 | 자막 |
|---|---|---|---|---|
| 1 | 0–2.0 | bg_room | **CSS 픽셀 카톡**(순화 거절 "인연이 아닌 거 같아요"→"...넵") + clii_front(폰) | "소개팅 결과.jpg ㅋㅋㅋㅋ" |
| 2 | 2.0–3.6 | bg_room+dim | clii_cry | "하… 소개팅 / 왜 하냐 진짜" |
| 3 | 3.6–5.2 | bg_room | 우클링 U심볼(`brand/png/symbol/symbol-twotone-512.png`) pop + ✦ + clii_front | "그러다 발견함 👀" |
| 4 | 5.2–6.9 | bg_class | baking | "우클링 하루연애 감 ㅇㅇ / (3:3 매칭)" |
| 5 | 6.9–8.6 | bg_class | holdhands + **핑크 하트 pop(1곳)** | "여기서 여친 생김;;" |
| 6 | 8.6–10.0 | bg_class | mugs | "머그컵은 덤 ㅎ" |
| 7·CTA | 10.0–11.6 | bg_field | couple + CTA 버튼 + 배지 | "소개팅은 망해도 / 머그컵은 남으니까" + "신청은 프로필 링크에서" |

## 제작
- `insta/reels/humor.html`(JS `__render(t)`, 감성형 CSS 재사용 + CSS 카톡) → `node insta/reels/capture.mjs humor humor` → `out/humor.mp4`. 무음(BGM 나중에 mux).
- 에셋 전부 재사용(clii_front/clii_cry/baking/mugs/holdhands/couple, bg_room/bg_class/bg_field). 컷1 카톡은 코드로 그림(에셋 X).
- 개선 여지: clii 황당표정 스프라이트(`clii_done.png`)를 컷1·2에 넣으면 유머 톤 더 살아남. couple.png 하트 빨강(핑크 아님).
- 개인정보/명예훼손: 카톡 문구는 순화(실명·외모비하 없음).
