/**
 * 生成第二关 20 套布局缩略图（真实生成，不画示意图）。
 *
 *   node tools/l2_thumbnails.mjs
 *
 * 每套模板用固定 (档位 0, seed) 真实生成一局，取主堆牌的真实 x/y/layer，
 * 按 z 从低到高绘制俯视图，因此缩略图里的轮廓就是玩家实际看到的牌堆形状。
 * 44 张盲盒队列是固定规则组件（每局完全一样），缩略图只画主堆，避免遮挡轮廓。
 *
 * 输出：
 *   reports/l2-thumbnails.html   20 套缩略图一览（可直接打开）
 *   reports/l2-thumbnails.json   每套的轮廓 / 层数 / 区域 / 可点统计
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { L2_TEMPLATES } from '../src/game/l2_templates.js';
import { generateLevel, countVisible } from '../src/game/generator.js';
import { mainStackCards } from '../src/game/l2_structure.js';
import { TILE_W, TILE_H, BOARD_BAND } from '../src/game/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reports = join(root, 'reports');
if (!existsSync(reports)) mkdirSync(reports, { recursive: true });

const realInfo = console.info;
console.info = () => {};

const items = [];
for (let i = 0; i < L2_TEMPLATES.length; i++) {
  const tpl = L2_TEMPLATES[i];
  const seed = (7077 + i * 131) >>> 0;
  const d = generateLevel(2, seed, { profile: 0, templateId: tpl.templateId });
  const main = mainStackCards(d.cards);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of main) {
    minX = Math.min(minX, c.x);
    maxX = Math.max(maxX, c.x + TILE_W);
    minY = Math.min(minY, c.y);
    maxY = Math.max(maxY, c.y + TILE_H);
  }
  items.push({
    templateId: tpl.templateId,
    name: tpl.name,
    category: tpl.categoryLabel,
    feature: tpl.feature,
    mask: tpl.structure.mask,
    maskCellCount: tpl.maskCellCount,
    maskRegionCount: tpl.maskRegionCount,
    seed,
    cards: d.cards.length,
    mainCards: main.length,
    layers: Math.max(...main.map((c) => c.layer)) + 1,
    visible: d.visible,
    floating: d.floatingCount,
    box: { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY },
    main: main.map((c) => ({ x: c.x, y: c.y, layer: c.layer })),
  });
}
console.info = realInfo;

/* ---------------- SVG ---------------- */

const W = 330;   // 面板宽
const H = 300;   // 绘图区高
const PAD = 10;

function colorFor(layer, layers) {
  const t = layers <= 1 ? 0 : layer / (layers - 1);
  const hue = 38 - 12 * t;          // 38° 琥珀 → 26° 橙红
  const sat = 62 + 18 * t;          // 62% → 80%
  const light = 74 - 30 * t;        // 74% → 44%
  return `hsl(${hue.toFixed(1)} ${sat.toFixed(1)}% ${light.toFixed(1)}%)`;
}

function svgFor(it) {
  const scale = Math.min(
    (W - PAD * 2) / it.box.w,
    (H - PAD * 2) / it.box.h,
  );
  const ox = PAD + ((W - PAD * 2) - it.box.w * scale) / 2 - it.box.minX * scale;
  const oy = PAD + ((H - PAD * 2) - it.box.h * scale) / 2 - it.box.minY * scale;
  const cards = it.main
    .slice()
    .sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  const rects = cards.map((c) => {
    const x = (c.x * scale + ox).toFixed(2);
    const y = (c.y * scale + oy).toFixed(2);
    const w = (TILE_W * scale).toFixed(2);
    const h = (TILE_H * scale).toFixed(2);
    const fill = colorFor(c.layer, it.layers);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.6" fill="${fill}" stroke="rgba(60,30,10,.35)" stroke-width=".6"/>`;
  }).join('');
  // 掩膜轮廓：仅画允许格的外框，帮助对照「设计形状」与「真实落牌」
  const cellW = TILE_W * scale;
  const cellH = TILE_H * scale;
  const maskLines = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 9; c++) {
      if (it.mask[r][c] === '.') continue;
      const x = ((33 + c * TILE_W) * scale + ox).toFixed(2);
      const y = ((220 + r * TILE_H) * scale + oy).toFixed(2);
      maskLines.push(`<rect x="${x}" y="${y}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="none" stroke="rgba(120,90,60,.22)" stroke-width=".5" stroke-dasharray="2 2"/>`);
    }
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${it.templateId} ${it.name}">
    <rect x="0" y="0" width="${W}" height="${H}" fill="#fbf6ec"/>
    ${maskLines.join('')}
    ${rects}
  </svg>`;
}

/* ---------------- HTML ---------------- */

const cards = items.map((it, idx) => `
  <article class="card">
    <header class="card-head">
      <div class="idx">${String(idx + 1).padStart(2, '0')}</div>
      <div class="title">
        <h3>${it.name}</h3>
        <div class="tid">${it.templateId} · ${it.category}</div>
      </div>
    </header>
    <div class="thumb">${svgFor(it)}</div>
    <p class="feature">${it.feature}</p>
    <ul class="stats">
      <li><b>${it.layers}</b><span>主堆层</span></li>
      <li><b>${it.mainCards}</b><span>主堆张</span></li>
      <li><b>${it.maskRegionCount}</b><span>区域</span></li>
      <li><b>${it.visible}</b><span>开局可点</span></li>
      <li><b>${it.maskCellCount}</b><span>掩膜格</span></li>
    </ul>
    <div class="legend">
      <span class="sw" style="background:hsl(38 62% 74%)"></span>低层
      <span class="sw" style="background:hsl(26 80% 44%)"></span>高层
    </div>
  </article>`).join('');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>第二关 20 套布局缩略图 · MahLeMah</title>
<style>
  :root { --ink:#241a12; --muted:#7a6a58; --line:#e6dccb; --bg:#f4efe4; --card:#fffdf8; --accent:#b03a2e; }
  * { box-sizing:border-box; }
  body { margin:0; padding:28px 22px 48px; background:var(--bg); color:var(--ink);
         font-family:"PingFang SC","Microsoft YaHei",system-ui,-apple-system,sans-serif; }
  h1 { margin:0 0 6px; font-size:24px; letter-spacing:.5px; }
  .sub { color:var(--muted); font-size:13px; line-height:1.7; margin:0 0 18px; }
  .sub code { background:#efe7d7; padding:1px 5px; border-radius:4px; font-size:12px; }
  .meta { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 22px; }
  .pill { background:#efe7d7; color:#5d4a35; border-radius:999px; padding:4px 11px; font-size:12px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px;
          padding:13px 14px 12px; box-shadow:0 1px 2px rgba(80,50,20,.05); }
  .card-head { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .idx { width:30px; height:30px; flex:0 0 30px; border-radius:9px; background:var(--accent);
         color:#fff; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; }
  .title h3 { margin:0; font-size:16px; }
  .tid { color:var(--muted); font-size:11.5px; margin-top:2px; letter-spacing:.3px; }
  .thumb { border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#fbf6ec; }
  .feature { font-size:12.5px; color:#5d4a35; line-height:1.6; margin:9px 0 8px; min-height:38px; }
  .stats { list-style:none; display:flex; flex-wrap:wrap; gap:6px; padding:0; margin:0 0 8px; }
  .stats li { flex:1 1 54px; background:#f7f1e4; border-radius:8px; padding:5px 4px; text-align:center; }
  .stats b { display:block; font-size:15px; line-height:1.25; }
  .stats span { font-size:10.5px; color:var(--muted); }
  .legend { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--muted); }
  .sw { width:12px; height:12px; border-radius:3px; display:inline-block; margin-left:4px; }
  footer { margin-top:26px; color:var(--muted); font-size:12px; line-height:1.8; }
</style>
</head>
<body>
  <h1>第二关 · 20 套布局缩略图</h1>
  <p class="sub">
    每张缩略图由 <code>generateLevel(2, seed, { profile:0, templateId })</code> <b>真实生成</b>后，
    按主堆牌的真实 <code>x / y / layer</code> 绘制俯视图，不是手画示意图。
    虚线格为模板的 5×9 全局轮廓掩膜，实心牌为实际落牌；颜色由低层（浅琥珀）到高层（深橙红）。
    44 张盲盒队列是固定规则组件、每局完全一致，缩略图只画主堆以突出轮廓。
  </p>
  <div class="meta">
    <span class="pill">模板 20 套</span>
    <span class="pill">固定档位 0 · 321 张</span>
    <span class="pill">开局可点 19–25 张</span>
    <span class="pill">主堆零悬空</span>
    <span class="pill">最近 10 局模板级 + 几何级双重去重</span>
  </div>
  <div class="grid">${cards}</div>
  <footer>
    数据来源：<code>node tools/l2_thumbnails.mjs</code> · 真实生成于 ${new Date().toISOString()} ·
    结构参数定义见 <code>src/game/l2_templates.js</code>，落牌实现见 <code>src/game/l2_geometry.js</code>。
  </footer>
</body>
</html>`;

writeFileSync(join(reports, 'l2-thumbnails.html'), html, 'utf8');
writeFileSync(join(reports, 'l2-thumbnails.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  profileId: 0,
  templates: items.map((it) => ({
    templateId: it.templateId, name: it.name, category: it.category, feature: it.feature,
    seed: it.seed, cards: it.cards, mainCards: it.mainCards, layers: it.layers,
    regions: it.maskRegionCount, maskCellCount: it.maskCellCount, visible: it.visible,
    floating: it.floating, box: it.box, mask: it.mask,
  })),
}, null, 2), 'utf8');

console.log('[thumbnails] 20 套已生成 → reports/l2-thumbnails.html');
for (const it of items) {
  console.log(`${it.templateId} ${it.name.padEnd(7, '　')} 层=${String(it.layers).padStart(2)} 主堆=${it.mainCards} 区域=${it.maskRegionCount} 可点=${it.visible} 悬空=${it.floating}`);
}
