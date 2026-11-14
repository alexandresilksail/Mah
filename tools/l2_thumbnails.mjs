/**
 * 生成第二关 20 套**完整布局**缩略图（真实生成，不画示意图）。
 *
 *   node tools/l2_thumbnails.mjs
 *
 * 每套模板用固定 (档位 0, seed) 真实生成一局，取**全部牌**（主体掩膜牌 +
 * 该模板独有的 44 张外廓牌）的真实 x/y/layer，按 z 从低到高绘制俯视图，
 * 因此缩略图里的轮廓就是玩家实际看到的完整牌局形状。
 *
 * 【本轮重构】固定四链盲盒队列已彻底取消，44 张牌位由每套模板自己的外廓
 * 定义给出、20 套互不相同，所以缩略图必须画完整布局，不能再只画主体。
 * 虚线格同时给出 9×5 主体掩膜与 9×2 外廓掩膜，便于对照「规范 ↔ 实际落牌」。
 *
 * 输出：
 *   reports/l2-thumbnails.html   20 套完整布局缩略图一览（可直接打开）
 *   reports/l2-thumbnails.json   每套的轮廓 / 层数 / 区域 / 可点 / 外廓统计
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
  const outer = d.cards.filter((c) => c.seg === 'outer');
  /* 包围盒取全部牌：缩略图必须完整呈现主体 + 外廓，不能把外廓裁掉 */
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of d.cards) {
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
    outerMask: tpl.outer.mask,
    outerCellCount: tpl.outerCellCount,
    outerLayerCount: tpl.outerLayerCount,
    seed,
    cards: d.cards.length,
    mainCards: main.length,
    outerCards: outer.length,
    layers: Math.max(...d.cards.map((c) => c.layer)) + 1,
    mainLayers: Math.max(...main.map((c) => c.layer)) + 1,
    visible: d.visible,
    floating: d.floatingCount,
    box: { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY },
    all: d.cards.map((c) => ({ x: c.x, y: c.y, layer: c.layer, seg: c.seg })),
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
  const cards = it.all
    .slice()
    .sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  const rects = cards.map((c) => {
    const x = (c.x * scale + ox).toFixed(2);
    const y = (c.y * scale + oy).toFixed(2);
    const w = (TILE_W * scale).toFixed(2);
    const h = (TILE_H * scale).toFixed(2);
    /* 主体用琥珀色系；模板外廓段用青蓝系，一眼可见「完整布局」的两段结构 */
    const fill = c.seg === 'outer'
      ? `hsl(${(196 + 8 * (c.layer / Math.max(1, it.layers - 1))).toFixed(1)} 46% ${(68 - 22 * (c.layer / Math.max(1, it.layers - 1))).toFixed(1)}%)`
      : colorFor(c.layer, it.layers);
    const stroke = c.seg === 'outer' ? 'rgba(20,70,100,.55)' : 'rgba(60,30,10,.35)';
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.6" fill="${fill}" stroke="${stroke}" stroke-width=".6"/>`;
  }).join('');
  // 规范掩膜轮廓：主体 9×5 + 模板独有外廓 9×2（外廓整格行 r=4、r=5）
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
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 9; c++) {
      if (it.outerMask[r][c] === '.') continue;
      const x = ((33 + c * TILE_W) * scale + ox).toFixed(2);
      const y = ((220 + (4 + r) * TILE_H) * scale + oy).toFixed(2);
      maskLines.push(`<rect x="${x}" y="${y}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="none" stroke="rgba(30,96,140,.30)" stroke-width=".6" stroke-dasharray="3 2"/>`);
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
      <li><b>${it.layers}</b><span>全局层</span></li>
      <li><b>${it.mainCards}</b><span>主体张</span></li>
      <li><b>${it.outerCards}</b><span>外廓张</span></li>
      <li><b>${it.outerLayerCount}</b><span>外廓层</span></li>
      <li><b>${it.visible}</b><span>开局可点</span></li>
      <li><b>${it.maskCellCount}</b><span>主体格</span></li>
      <li><b>${it.outerCellCount}</b><span>外廓格</span></li>
    </ul>
    <div class="legend">
      <span class="sw" style="background:hsl(38 62% 74%)"></span>主体低层
      <span class="sw" style="background:hsl(26 80% 44%)"></span>主体高层
      <span class="sw" style="background:hsl(196 46% 62%)"></span>模板外廓段
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
    按<b>全部牌</b>的真实 <code>x / y / layer</code> 绘制俯视图，不是手画示意图。
    琥珀色为 9×5 主体掩膜牌，青蓝色为<b>该模板独有的 44 张外廓牌位</b>；
    虚线格同时给出主体 5×9 掩膜与外廓 2×9 掩膜。<b>固定四链盲盒队列已彻底取消</b>，
    44 张牌位由 20 套模板分别定义、互不相同，因此本图展示的是每套的<b>完整布局</b>。
  </p>
  <div class="meta">
    <span class="pill">模板 20 套 · 每套完整布局</span>
    <span class="pill">固定档位 0 · 321 张</span>
    <span class="pill">主体 + 44 张模板外廓牌</span>
    <span class="pill">开局可点 19–25 张</span>
    <span class="pill">主堆零悬空 · 三段保真</span>
    <span class="pill">最近 10 局模板级 + 几何级双重去重</span>
  </div>
  <div class="grid">${cards}</div>
  <footer>
    数据来源：<code>node tools/l2_thumbnails.mjs</code> · 真实生成于 ${new Date().toISOString()} ·
    20 套完整模板（主体 + 外廓牌位）定义见 <code>src/game/l2_templates.js</code>，
    规格与保真见 <code>src/game/l2_spec.js</code>，落牌见 <code>src/game/l2_geometry.js</code>。
  </footer>
</body>
</html>`;

writeFileSync(join(reports, 'l2-thumbnails.html'), html, 'utf8');
writeFileSync(join(reports, 'l2-thumbnails.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  profileId: 0,
  templates: items.map((it) => ({
    templateId: it.templateId, name: it.name, category: it.category, feature: it.feature,
    seed: it.seed, cards: it.cards, mainCards: it.mainCards, outerCards: it.outerCards,
    layers: it.layers, mainLayers: it.mainLayers, outerLayerCount: it.outerLayerCount,
    regions: it.maskRegionCount, maskCellCount: it.maskCellCount,
    outerMask: it.outerMask, outerCellCount: it.outerCellCount,
    visible: it.visible, floating: it.floating, box: it.box, mask: it.mask,
  })),
}, null, 2), 'utf8');

console.log('[thumbnails] 20 套完整布局已生成 → reports/l2-thumbnails.html');
for (const it of items) {
  console.log(`${it.templateId} ${it.name.padEnd(7, '　')} 全局层=${String(it.layers).padStart(2)} 主体=${it.mainCards} 外廓=${it.outerCards}/${it.outerLayerCount}层 可点=${it.visible} 悬空=${it.floating}`);
}
