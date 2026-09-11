// ② 유머형 실사 릴스 조립 (ffmpeg).
// 컷별로 1080x1920/30fps 정규화 + 자막 PNG 오버레이 + 컷5 반반(hstack) → concat.
// 입력: assets/stock/*, assets/text/*, insta/망한소개팅 카톡 캡처
// 산출: out/humor.mp4  (v1 무음 — BGM은 이후 추가)
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, '../..');
const stock = path.join(__dirname, 'assets', 'stock');
const text = path.join(__dirname, 'assets', 'text');
const outDir = path.join(__dirname, 'out');
const segDir = path.join(outDir, '_seg');
fs.mkdirSync(segDir, { recursive: true });

const katalk = path.join(repo, 'insta', '망한소개팅', '스크린샷 2026-09-11 오후 12.55.23.png');
const ENC = ['-r','30','-pix_fmt','yuv420p','-c:v','libx264','-profile:v','high','-preset','veryfast','-crf','20','-an','-movflags','+faststart'];
const cover = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30';

function ff(args, label) {
  const r = spawnSync('ffmpeg', ['-hide_banner','-y', ...args], { encoding:'utf8' });
  if (r.status !== 0) { console.error(`[FAIL] ${label}\n`, r.stderr.split('\n').slice(-8).join('\n')); process.exit(1); }
  console.log(`[ok] ${label}`);
}
const seg = n => path.join(segDir, n);

// 컷1 — 카톡 캡처를 blush 카드로 + 상단 자막 (2.0s)
ff(['-f','lavfi','-t','2','-i','color=c=0xffedf2:s=1080x1920:r=30',
    '-i', katalk, '-i', path.join(text,'cap1.png'),
    '-filter_complex','[1:v]scale=1000:-1[k];[0:v][k]overlay=(W-w)/2:(H-h)/2[b];[b][2:v]overlay=0:0,format=yuv420p[v]',
    '-map','[v]','-t','2', ...ENC, seg('c1.mp4')], 'cut1 카톡');

// 컷2 — 한숨 (1.5s)
ff(['-ss','0.5','-t','1.5','-i',path.join(stock,'02_sigh.mp4'),'-i',path.join(text,'cap2.png'),
    '-filter_complex',`[0:v]${cover}[bg];[bg][1:v]overlay=0:0,format=yuv420p[v]`,
    '-map','[v]','-t','1.5', ...ENC, seg('c2.mp4')], 'cut2 한숨');

// 컷3 — 우클링 발견 (웹 녹화, 1.5s)
ff(['-ss','1.2','-t','1.5','-i',path.join(stock,'cut3_web.webm'),'-i',path.join(text,'cap3.png'),
    '-filter_complex',`[0:v]${cover}[bg];[bg][1:v]overlay=0:0,format=yuv420p[v]`,
    '-map','[v]','-t','1.5', ...ENC, seg('c3.mp4')], 'cut3 발견');

// 컷4 — 도자기 클래스 (1.5s)
ff(['-ss','1.0','-t','1.5','-i',path.join(stock,'04_class.mp4'),'-i',path.join(text,'cap4.png'),
    '-filter_complex',`[0:v]${cover}[bg];[bg][1:v]overlay=0:0,format=yuv420p[v]`,
    '-map','[v]','-t','1.5', ...ENC, seg('c4.mp4')], 'cut4 클래스');

// 컷5 — 반반 split + 하트 (1.7s)  좌=커플(여친 생김), 우=머그컵 들고
ff(['-ss','3.0','-t','1.7','-i',path.join(stock,'05_couple.mp4'),
    '-ss','1.0','-t','1.7','-i',path.join(stock,'06_mug.mp4'),
    '-i',path.join(text,'cap5.png'),
    '-filter_complex',
    '[0:v]scale=540:1920:force_original_aspect_ratio=increase,crop=540:1920,fps=30[l];'+
    '[1:v]scale=540:1920:force_original_aspect_ratio=increase,crop=540:1920,fps=30[r];'+
    '[l][r]hstack=inputs=2[s];[s][2:v]overlay=0:0,setsar=1,format=yuv420p[v]',
    '-map','[v]','-t','1.7', ...ENC, seg('c5.mp4')], 'cut5 반반');

// 컷6 — 머그컵 여운 (자막 없음, 1.5s)
ff(['-ss','1.0','-t','1.5','-i',path.join(stock,'06_mug.mp4'),
    '-filter_complex',`[0:v]${cover},format=yuv420p[v]`,
    '-map','[v]','-t','1.5', ...ENC, seg('c6.mp4')], 'cut6 머그컵');

// 컷7 — CTA 카드 (1.8s)
ff(['-loop','1','-t','1.8','-i',path.join(text,'cta.png'),
    '-filter_complex','[0:v]fps=30,setsar=1,format=yuv420p[v]',
    '-map','[v]','-t','1.8', ...ENC, seg('c7.mp4')], 'cut7 CTA');

// concat
const list = path.join(segDir,'list.txt');
fs.writeFileSync(list, ['c1','c2','c3','c4','c5','c6','c7'].map(n=>`file '${seg(n+'.mp4')}'`).join('\n'));
ff(['-f','concat','-safe','0','-i',list, ...ENC, path.join(outDir,'humor.mp4')], 'concat → humor.mp4');

console.log('\n완성: insta/reels/out/humor.mp4');
