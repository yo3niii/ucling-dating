# 마스코트 "클리" — Gemini 챗 생성 프롬프트 팩

우클링 하루연애 ①감성형 릴스용 픽셀 마스코트. **Gemini 챗(프로 구독) 한 대화에서 순서대로** 생성 → 다운로드(PNG) → 세션에 붙이기.
배경은 단색 초록(#00B140) 또는 투명. 캐릭터 안에는 초록색 쓰지 말 것(키 처리 위해).

브랜드 팔레트: 후드 로즈 `#e0356b` · 하트 핑크 `#ff4d85` · 볼터치 `#ffdce8` · 상대 후드 연분홍 `#f591ad`.

---

## 1) 클리 — 정면 (마스터, 폰 보는 중)
```
Cute cozy pixel-art character mascot named "Clii", a cheerful young person wearing an oversized rose-pink (#e0356b) hoodie, short dark hair peeking from the hood, simple round dot eyes, small smile, soft blush-pink cheeks (#ffdce8). Full body, front view, standing, looking down at a small smartphone held in both hands. Crisp visible pixels, clean chunky pixel-art style, cozy indie diary-game aesthetic, warm pastel palette. Flat solid green (#00B140) background, character centered with generous empty margin, no ground shadow, no text, no watermark.
```

## 2) 클리 — 걷기 (옆모습)
```
The exact same "Clii" character, same face, same rose-pink hoodie, same pixel-art style and colors. Now full body side view, walking to the right with a happy bounce, arms mid-swing. Flat solid green (#00B140) background, centered, generous margin, no shadow, no text.
```

## 3) 클리 — 앉기 (클래스에서)
```
The exact same "Clii" character, same style and colors. Now full body, sitting on a small stool leaning slightly forward as if focused on a craft table, gentle smile. Flat solid green (#00B140) background, centered, generous margin, no shadow, no text.
```

## 4) 클리 — 설렘 (두근)
```
The exact same "Clii" character, same style and colors. Now full body front view, excited and shy, both hands near the cheeks, sparkly happy eyes, a few small bright-pink (#ff4d85) hearts floating around the head. Flat solid green (#00B140) background, centered, generous margin, no shadow, no text.
```

## 5) 상대 캐릭터 — 정면
```
A different cute pixel-art character in the exact same art style as "Clii" (same crisp pixel look, same proportions), a friendly young person wearing a soft light-pink (#f591ad) hoodie, different hairstyle (slightly longer hair), warm smile, blush cheeks. Full body, front view, standing, one hand giving a small wave. Flat solid green (#00B140) background, centered, generous margin, no shadow, no text.
```

## (선택) 6) 둘이 나란히 — 매칭 순간
```
The two characters "Clii" (rose-pink hoodie) and the partner (light-pink hoodie) standing side by side, both smiling, a big bright-pink (#ff4d85) heart floating between them. Same crisp pixel-art style, warm pastel palette. Flat solid green (#00B140) background, centered, generous margin, no shadow, no text.
```

---

## 받은 뒤 (메인 세션)
- 초록 배경 → chromakey/colorkey로 투명 PNG 변환 → `insta/reels/assets/clii_*.png`.
- `emotional.html` 씬에 배치 → Playwright 캡처 → ffmpeg mp4.
- 색이 브랜드와 어긋나면 해당 프롬프트에 hex 강조해서 재생성 요청.
