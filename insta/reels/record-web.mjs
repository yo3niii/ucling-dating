// 컷3 "우클링 발견" — index.html을 세로 뷰포트로 스크롤하며 녹화.
// 산출: assets/stock/cut3_web.webm (→ humor.mjs에서 mp4로 씀)
import { chromium } from '../node_modules/playwright/index.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, '../..');
const outDir = path.join(__dirname, 'assets', 'stock');

const W = 1080, H = 1920;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  recordVideo: { dir: outDir, size: { width: W, height: H } },
});
const page = await context.newPage();
// 페이스북 픽셀 등 외부 트래킹 차단 (녹화가 실제 픽셀 데이터를 오염시키지 않게)
await page.route(/facebook\.(net|com)/, r => r.abort());

await page.goto('file://' + path.join(repo, 'index.html'));
await page.waitForTimeout(1500); // 폰트/레이아웃 안정

// 위 → 아래로 부드럽게 스크롤 (약 4초)
await page.evaluate(async () => {
  const total = document.body.scrollHeight - window.innerHeight;
  const dur = 4000, start = performance.now();
  await new Promise(res => {
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
      window.scrollTo(0, total * ease * 0.6); // 상단 히어로~중간까지만
      if (t < 1) requestAnimationFrame(step); else res();
    }
    requestAnimationFrame(step);
  });
});
await page.waitForTimeout(400);

const video = page.video();
await context.close();
await browser.close();
const saved = await video.path();
console.log('녹화 저장:', saved);
