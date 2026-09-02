// 각 .card 요소를 PNG로 저장한다 (deviceScaleFactor 2 → 2160×2700 고해상도).
// 파일명은 각 카드의 data-name 속성을 사용한다.
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "out");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 2 });
const page = await context.newPage();

await page.goto("file://" + path.join(__dirname, "cards.html"));
await page.waitForLoadState("networkidle");
// 웹폰트(Pretendard·Nunito) 로드 완료까지 대기 — 안 하면 폰트 깨진 채로 찍힘
await page.evaluate(async () => {
  await document.fonts.ready;
});

const cards = await page.$$(".card");
let n = 0;
for (const card of cards) {
  const name = await card.getAttribute("data-name");
  await card.screenshot({ path: path.join(outDir, `${name}.png`) });
  n++;
  console.log(`✓ ${name}.png`);
}

await browser.close();
console.log(`\n완료 — ${n}장을 out/ 에 저장했어요.`);
