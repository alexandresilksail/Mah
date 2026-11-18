/**
 * 生成 Windows / 微信 并排对照图（左 Windows，右 微信）。
 * 输入：reports/screenshots/{win,wx}/*.png
 * 输出：reports/screenshots/compare-*.png
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.resolve(__dirname, '../../reports/screenshots');
const W = 720, H = 1280, GAP = 24, PAD = 16, TOP = 56;

const ids = fs.readdirSync(path.join(BASE, 'win')).filter(f => f.endsWith('.png')).map(f => f.replace(/\.png$/, ''));

for (const id of ids) {
  const a = await loadImage(path.join(BASE, 'win', id + '.png'));
  const b = await loadImage(path.join(BASE, 'wx', id + '.png'));
  const cw = W * 2 + GAP + PAD * 2;
  const ch = H + TOP + PAD * 2;
  const cv = createCanvas(cw, ch);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#f5f1e8';
  ctx.fillRect(0, 0, cw, ch);
  ctx.font = 'bold 26px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#3a3226';
  ctx.fillText(`Windows 桌面版（基准）`, PAD + W / 2, TOP / 2 + 4);
  ctx.fillStyle = '#2f6b4f';
  ctx.fillText(`微信小程序版（本次修复）`, PAD + W + GAP + W / 2, TOP / 2 + 4);
  ctx.drawImage(a, PAD, TOP + PAD, W, H);
  ctx.drawImage(b, PAD + W + GAP, TOP + PAD, W, H);
  ctx.strokeStyle = '#c9bfa9';
  ctx.lineWidth = 2;
  ctx.strokeRect(PAD, TOP + PAD, W, H);
  ctx.strokeRect(PAD + W + GAP, TOP + PAD, W, H);
  fs.writeFileSync(path.join(BASE, 'compare-' + id + '.png'), cv.toBuffer('image/png'));
  console.log('  ✓', 'compare-' + id + '.png');
}
console.log('对照图生成完成，共', ids.length, '张');
