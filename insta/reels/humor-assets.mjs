// ② 유머형 자막·CTA 에셋을 투명 PNG로 렌더 (Playwright).
// 산출: assets/text/cap1..cap5.png (투명 오버레이, 1080x1920) + cta.png (불투명 blush 카드)
import { chromium } from '../node_modules/playwright/index.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'assets', 'text');
fs.mkdirSync(outDir, { recursive: true });

const W = 1080, H = 1920;

// MZ 릴스 자막: 흰 글씨 + 검정 외곽선(어떤 영상 위에도 판독). 안전영역 하단~중앙.
const base = `
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${W}px; height:${H}px; }
  body { position:relative; font-family:'AppleSDGothicNeo','Apple SD Gothic Neo','Noto Sans KR',sans-serif; }
  .cap {
    position:absolute; left:60px; right:60px; text-align:center;
    color:#fff; font-weight:900; line-height:1.28;
    text-shadow: 0 0 2px #000, 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 0 6px 14px rgba(0,0,0,.45);
    -webkit-text-stroke: 2px #000;
  }
  .top  { font-size:78px; top:7%; }
  .hook { font-size:96px; top:34%; }
  .mid  { font-size:70px; top:72%; }
  .low  { font-size:64px; top:75%; }
  /* 핑크 하트 (브랜드 accent, 화면당 1곳) */
  .heart { position:absolute; left:0; right:0; text-align:center; top:40%;
           font-size:280px; color:#ff4d85; -webkit-text-stroke:6px #fff;
           text-shadow:0 8px 24px rgba(0,0,0,.35); }
`;

// 각 자막 = 투명 배경 위 텍스트. \n → <br>.
const caps = {
  cap1: `<div class="cap top">소개팅 결과.jpg ㅋㅋㅋㅋ</div>`,
  cap2: `<div class="cap mid">하… 소개팅 왜 하냐 진짜</div>`,
  cap3: `<div class="cap mid">그러다 발견함 👀</div>`,
  cap4: `<div class="cap low">우클링 하루연애 감 ㅇㅇ<br>(3:3 매칭)</div>`,
  cap5: `<div class="heart">♥</div><div class="cap low">여기서 여친 생김;;</div>`,
};

// CTA 카드 (불투명 blush 배경, 컷7)
const ctaHtml = `
  <div style="position:absolute;inset:0;background:#ffedf2;"></div>
  <div style="position:absolute;left:80px;right:80px;top:34%;text-align:center;
       font-family:'AppleSDGothicNeo','Apple SD Gothic Neo',sans-serif;">
    <div style="font-size:88px;font-weight:900;color:#2b1b24;line-height:1.35;">소개팅은 망해도<br>머그컵은 남으니까</div>
    <div style="margin-top:60px;display:inline-block;background:#e0356b;color:#fff;
         font-weight:800;font-size:52px;padding:28px 46px;border-radius:18px;
         box-shadow:12px 12px 0 #2b1b24;">신청은 프로필 링크에서</div>
    <div style="margin-top:40px;font-size:40px;color:#7a6570;font-weight:700;">우클링 하루연애 · 1회차 모집 중</div>
  </div>
`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport:{width:W,height:H}, deviceScaleFactor:1 });
const page = await context.newPage();

async function shot(name, inner, transparent) {
  const bg = transparent ? 'transparent' : '#ffedf2';
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${base}</style>
    <body style="background:${bg}">${inner}</body>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, name+'.png'), omitBackground: transparent });
  console.log('렌더:', name+'.png');
}

for (const [name, inner] of Object.entries(caps)) await shot(name, inner, true);
await shot('cta', ctaHtml, false);

await context.close();
await browser.close();
