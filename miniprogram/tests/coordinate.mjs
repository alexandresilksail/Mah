/**
 * 坐标变换测试：验证 720×1280 逻辑画布在多种屏幕/DPR 下
 * 1) touch→logic 与 logic→screen 严格互逆（点击位置=绘制位置）
 * 2) 等比缩放、无拉伸变形
 * 3) letterbox 留白左右/上下对称（居中）
 * 4) 逻辑画布四角落在可视区域内
 * 5) 牌面命中：牌矩形中心点往返后仍命中同一张牌
 */
import * as esbuild from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tmp = path.resolve('.ct.tmp.cjs');
await esbuild.build({
  entryPoints: [path.resolve('renderer/coordinate-transform.ts')],
  bundle: true, format: 'cjs', platform: 'node', outfile: tmp, logLevel: 'silent',
});
const { CoordinateTransform } = require(tmp);
const Core = require(path.resolve('core/mah-core.js'));

const DEVICES = [
  { name: 'iPhone SE 375x667', cssW: 375, cssH: 667, dpr: 2 },
  { name: 'iPhone 14 390x844', cssW: 390, cssH: 844, dpr: 3 },
  { name: 'iPhone 14 Pro Max 430x932', cssW: 430, cssH: 932, dpr: 3 },
  { name: 'Android 360x640', cssW: 360, cssH: 640, dpr: 2 },
  { name: 'Android 412x915', cssW: 412, cssH: 915, dpr: 2.625 },
  { name: 'Android 360x800(刘海)', cssW: 360, cssH: 800, dpr: 3 },
  { name: 'iPad 768x1024', cssW: 768, cssH: 1024, dpr: 2 },
  { name: '横屏 800x400', cssW: 800, cssH: 400, dpr: 2 },
];

let pass = 0, fail = 0;
const check = (ok, label, extra) => {
  if (ok) pass++;
  else { fail++; console.log('  ✗ ' + label + (extra ? ' :: ' + extra : '')); }
};
const EPS = 1e-9;

console.log('=== 坐标变换测试 ===');
for (const d of DEVICES) {
  const ct = new CoordinateTransform();
  const vp = ct.configure(d.cssW, d.cssH, d.dpr);
  const tag = `[${d.name}]`;

  // 2) 等比：两个方向同一 scale
  check(vp.scale > 0, tag + ' scale>0', vp.scale);
  const expectScale = Math.min(d.cssW / Core.W, d.cssH / Core.H);
  check(Math.abs(vp.scale - expectScale) < EPS, tag + ' scale 取 min 比值', `${vp.scale} vs ${expectScale}`);

  // 3) letterbox 居中：两侧留白相等
  const restX = d.cssW - Core.W * vp.scale;
  const restY = d.cssH - Core.H * vp.scale;
  check(Math.abs(vp.offsetX - restX / 2) < 1e-6, tag + ' 水平居中', `offX=${vp.offsetX} restX/2=${restX / 2}`);
  check(Math.abs(vp.offsetY - restY / 2) < 1e-6, tag + ' 垂直居中', `offY=${vp.offsetY} restY/2=${restY / 2}`);

  // 4) 四角在可视区域内
  const corners = [[0, 0], [Core.W, 0], [0, Core.H], [Core.W, Core.H]];
  for (const [lx, ly] of corners) {
    const sx = ct.toScreenX(lx), sy = ct.toScreenY(ly);
    check(sx >= -1e-6 && sx <= d.cssW + 1e-6 && sy >= -1e-6 && sy <= d.cssH + 1e-6,
      tag + ` 角(${lx},${ly})在屏内`, `${sx},${sy}`);
  }

  // 1) 往返互逆
  for (const [lx, ly] of [[0, 0], [360, 640], [720, 1280], [137.5, 902.25], [-50, 1400]]) {
    const sx = ct.toScreenX(lx), sy = ct.toScreenY(ly);
    const back = ct.toLogic(sx, sy);
    check(Math.abs(back.x - lx) < 1e-6 && Math.abs(back.y - ly) < 1e-6,
      tag + ` 往返(${lx},${ly})`, `→(${sx},${sy})→(${back.x},${back.y})`);
  }

  // 4b) 牌面不变形：CSS 下宽高比 == 逻辑宽高比
  const cssTileW = Core.TILE_W * vp.scale;
  const cssTileH = Core.TILE_H * vp.scale;
  check(Math.abs((cssTileW / cssTileH) - (Core.TILE_W / Core.TILE_H)) < 1e-9,
    tag + ' 牌面等比不变形', `${cssTileW.toFixed(2)}x${cssTileH.toFixed(2)}`);

  // 5) 命中：牌中心往返后仍落到该牌矩形内
  const card = { x: 165, y: 352 };
  const cx = card.x + Core.TILE_W / 2, cy = card.y + Core.TILE_H / 2;
  const hit = ct.toLogic(ct.toScreenX(cx), ct.toScreenY(cy));
  check(hit.x >= card.x && hit.x <= card.x + Core.TILE_W && hit.y >= card.y && hit.y <= card.y + Core.TILE_H,
    tag + ' 牌中心命中同一张牌', `${hit.x.toFixed(3)},${hit.y.toFixed(3)}`);

  // 额外：DPR 只影响物理像素，不改变逻辑/CSS 映射
  const ctHi = new CoordinateTransform(); ctHi.configure(d.cssW, d.cssH, d.dpr * 2);
  const a = ct.toLogic(100, 200), b = ctHi.toLogic(100, 200);
  check(Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS, tag + ' DPR 不影响映射');
}

fs.unlinkSync(tmp);
console.log(`\n坐标变换测试：${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
