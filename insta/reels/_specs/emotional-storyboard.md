# emotional 스토리보드 — 감성형 픽셀 릴스

12초 · 9:16 1080×1920 · 30fps. 두 버전 출력: `out/emotional.mp4`(픽셀 Galmuri), `out/emotional_gothic.mp4`(고딕 Pretendard 굵게).
스프라이트/배경(Gemini 챗 생성, `insta/reels/assets/`): clii_front, clii_cry, baking, mugs, holdhands, couple + bg_room / bg_class / bg_field.

| # | 초 | 배경 | 화면 | 자막(흰 글씨+플럼 외곽선) |
|---|---|---|---|---|
| 1 | 0–2.0 | bg_room(핑크 거실+TV) | clii_front(폰) + 미니 핑크하트 | "하트시그널, 환승연애 보면서 / '나도 나가고싶다..' 했었어" |
| 2 | 2.0–3.8 | 검정 | clii_cry | "근데 나갈 / 방법이 없었지" + 서브(블록없이 흰글씨) "난 그냥 평범한 / K-직장인/대학생이니까" |
| 3 | 3.8–6.0 | bg_class(우드 공방) | baking | "동네 원데이 클래스에서 / 3:3으로 만나요"(3:3 핑크) |
| 4 | 6.0–8.0 | bg_class | mugs | "소개팅은 망해도 / 머그컵은 남으니까" |
| 5 | 8.0–9.8 | bg_field(공방+들판) | holdhands + 핑크하트 pop | "마음에 들면 / 비공개로 지목" |
| 6 | 9.8–12.0 | bg_field | couple(컷5와 **동일 위치** width720/top1000) + CTA버튼 + 배지 | "우클링 하루연애에서 / 내 인연을 찾아보세요" + "신청은 프로필 링크에서" |

## 제작
- `emotional.html`(JS `__render(t)`, `?font=gothic`로 고딕 전환) → `capture.mjs`(픽셀·고딕 둘 다 렌더) → ffmpeg. 무음.
- 폰트: 픽셀=Galmuri, 고딕=Pretendard Variable(CDN, 폴백 Apple SD Gothic Neo) 800.
- 회차 표기는 컷6 배지에서 수동 교체.
- 소소한 점: couple.png 하트 빨강(핑크 아님), 상대 후드 회색(팔레트 밖) — 필요시 재생성.
