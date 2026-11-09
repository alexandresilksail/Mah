/**
 * 牌面样张：把 15 种传统麻将牌放大画在一张图上，方便肉眼检查绘制效果。
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
import { TILE_W, TILE_H } from './src/game/config.js';

const COLS = 5;
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

// 实际尺寸对照：可点（亮 + 浅色描边） / 被压 1 层 / 被压 4 层
const small = document.createElement('canvas');
const ROW_H = TILE_H + 12;
small.width = 720; small.height = ROW_H * 3 + 10;
small.style.display = 'block';
small.style.marginTop = '8px';
document.body.appendChild(small);
const c2 = small.getContext('2d');
c2.fillStyle = '#3A2A1E';
c2.fillRect(0, 0, 720, small.height);
const states = [
  { name: '可点', opt: { playable: true } },
  { name: '压 1 层', opt: { dimLevel: 1 } },
  { name: '压 4 层', opt: { dimLevel: 4 } },
];
['yaoji', 'zi-zhong', 'tong-5', 'tiao-9', 'zi-dong', 'tong-1'].forEach((id, i) => {
  states.forEach((st, r) => drawTile(c2, 10 + i * 116, 8 + r * ROW_H, TILE_W, TILE_H, id, st.opt));
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
