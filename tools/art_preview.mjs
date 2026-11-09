/**
 * 牌面样张：把 34 种牌放大画在一张图上，方便肉眼检查 Q 版绘制效果。
 *   node tools/art_preview.mjs
 *   → dist/_tiles.html（直接用浏览器打开）
 */
import { build } from 'esbuild';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => path.join(root, ...s);

const entry = `
import { drawTile, TYPE_LIST } from './src/game/tiles.js';

const COLS = 7;
const TW = 150, TH = 172, GAP = 14;
const rows = Math.ceil(TYPE_LIST.length / COLS);
const W = COLS * (TW + GAP) + GAP;
const H = rows * (TH + GAP) + GAP + 40;

const cv = document.createElement('canvas');
cv.width = W; cv.height = H;
document.body.appendChild(cv);
const ctx = cv.getContext('2d');
ctx.fillStyle = '#3A2A1E';
ctx.fillRect(0, 0, W, H);

TYPE_LIST.forEach((t, i) => {
  const c = i % COLS, r = Math.floor(i / COLS);
  const x = GAP + c * (TW + GAP);
  const y = GAP + r * (TH + GAP);
  drawTile(ctx, x, y, TW, TH, t.id, {});
  ctx.fillStyle = 'rgba(255,240,210,0.55)';
  ctx.font = '600 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(t.id, x + TW / 2, y + TH + 14);
});

// 小尺寸对照：第 2 关实际牌宽 68 / 槽位牌 80
const small = document.createElement('canvas');
small.width = 720; small.height = 110;
small.style.display = 'block';
small.style.marginTop = '8px';
document.body.appendChild(small);
const c2 = small.getContext('2d');
c2.fillStyle = '#3A2A1E';
c2.fillRect(0, 0, 720, 110);
['wan-3', 'tiao-5', 'tong-7', 'zi-5', 'wan-9', 'tong-2', 'tiao-1'].forEach((id, i) => {
  drawTile(c2, 10 + i * 74, 8, 68, 76, id, {});
  drawTile(c2, 10 + i * 74, 8 + 0, 68, 76, id, { covered: false });
});
document.title = 'tile sheet';
`;

const result = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'js' },
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: false,
  write: false,
  charset: 'utf8',
});

const js = result.outputFiles[0].text;
const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>Q版牌面样张</title>
<style>body{margin:0;background:#3A2A1E;display:flex;flex-direction:column;align-items:center;padding:12px}</style>
</head><body><script>${js}</script></body></html>`;

await mkdir(p('dist'), { recursive: true });
await writeFile(p('dist/_tiles.html'), html, 'utf8');
console.log('✔ dist/_tiles.html');
