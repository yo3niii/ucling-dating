// schedule-recruit.html 의 각 .card 를 PNG로 저장 (deviceScaleFactor 2 → 2160×2700).
// 파일명은 data-name 사용 → out/Frame 5.png, out/Frame 6.png 를 덮어쓴다.
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

await page.goto("file://" + path.join(__dirname, "schedule-recruit.html"));
await page.waitForLoadState("networkidle");
await page.evaluate(async () => { await document.fonts.ready; });

const cards = await page.$$(".card");
let n = 0;
for (const card of cards) {
  const name = await card.getAttribute("data-name");
  await card.screenshot({ path: path.join(outDir, `${name}.png`) });
  n++;
  console.log(`✓ ${name}.png`);
}

await browser.close();
console.log(`\n완료 — ${n}장 저장.`);
