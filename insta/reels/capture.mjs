// 픽셀 릴스 HTML 타임라인을 프레임 단위로 캡처 → PNG 시퀀스 → ffmpeg mp4.
// 사용법: node capture.mjs [htmlBase] [outName]
//   node capture.mjs                → emotional.html → out/emotional.mp4 (기본, 하위호환)
//   node capture.mjs humor humor    → humor.html    → out/humor.mp4
import { chromium } from '../node_modules/playwright/index.mjs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlBase = process.argv[2] || 'emotional';
const outName  = process.argv[3] || htmlBase;
const url = 'file://' + path.join(__dirname, htmlBase + '.html');
const W = 1080, H = 1920;

const browser = await chromium.launch();
const framesDir = path.join(__dirname, 'out', '_frames_' + htmlBase);
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const context = await browser.newContext({ viewport:{width:W,height:H}, deviceScaleFactor:1 });
const page = await context.newPage();
await page.addInitScript(() => { window.__CAPTURE = true; });
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  await Promise.all([...document.images].map(im => im.complete ? 0 :
    new Promise(r => { im.onload = im.onerror = r; })));
});
await page.waitForTimeout(600);

const FPS = await page.evaluate(() => window.__FPS);
const DUR = await page.evaluate(() => window.__DUR);
const N = Math.round(DUR * FPS);
console.log(`[${htmlBase}] 캡처 ${N}프레임 @${FPS}fps (${DUR}s)`);
for (let f = 0; f < N; f++) {
  await page.evaluate(tt => window.__render(tt), f / FPS);
  await page.screenshot({ path: path.join(framesDir, String(f).padStart(4,'0') + '.png'),
                          clip:{x:0,y:0,width:W,height:H} });
  if (f % 60 === 0) process.stdout.write(`.${f}`);
}
console.log('');
await context.close();
await browser.close();

const out = path.join(__dirname, 'out', outName + '.mp4');
const r = spawnSync('ffmpeg', ['-hide_banner','-y','-framerate', String(FPS),
  '-i', path.join(framesDir, '%04d.png'),
  '-r','30','-pix_fmt','yuv420p','-c:v','libx264','-profile:v','high','-preset','veryfast','-crf','20',
  '-movflags','+faststart', out], { encoding:'utf8' });
if (r.status !== 0) { console.error(r.stderr.split('\n').slice(-8).join('\n')); process.exit(1); }
fs.rmSync(framesDir, { recursive: true, force: true });
console.log('완성:', out);
