# 우클링 하루연애 — 인스타 카드뉴스

- `cards.html` — 3세트(소개 7 · QnA 8 · 1회차 안내 1) 카드 전부. 카드 1장 = 1080×1350 (4:5).
- `export.mjs` — Playwright로 각 `.card`를 PNG로 내보냄 (2× 고해상도 → 2160×2700).
- `assets/` — 우상단 로고. 현재는 심볼 모노를 임시로 넣어둔 것이니, **실제 워드마크**(`ucling-wordmark-round-rose.png` / `-white.png`)로 교체하세요.
- `out/` — PNG 결과 16장.

## 실행

```bash
cd insta && npm install && npx playwright install chromium && node export.mjs
```

(이미 설치했다면 `node export.mjs` 만 실행)
