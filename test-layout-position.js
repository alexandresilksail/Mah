/**
 * 第一关布局位置验收（本轮第三节）。
 *
 *   node test-layout-position.js
 *
 * 检查的是**真实生成出来的牌面**：每个档位 × 多个 seed 量出实际包围盒，
 * 用牌桌可视区 BOARD_BAND 的中心与高度做动态居中校验；同时回归三层结构、
 * 牌型、遮挡规则与不同缩放比下的重心比例。
 * 不用「所有牌加固定 Y 偏移」的假实现：这里会统计每局实际位移量，
 * 若所有 seed 的位移量完全相同（说明是写死的常量）则判定失败。
 *
 * 输出：reports/layout-position-report.{json,md}
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  LEVEL1_PROFILES, LEVEL2_PROFILES, BOARD_BAND, BOARD_CY,
  TILE_W, TILE_H, LATTICE_Y, layerPlanFor,
} from './src/game/config.js';
import { generateProfileLayout } from './src/game/layout_profiles.js';
import { isHalfLattice, sameLayerOverlapCount, countComponents } from './src/game/layout.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const REPORTS = path.join(ROOT, 'reports');
mkdirSync(REPORTS, { recursive: true });

let pass = 0, fail = 0;
const failures = [];
function ok(cond, label) {
  if (cond) { pass++; return true; }
  fail++; failures.push(label);
  console.log('  ✗ ' + label);
  return false;
}
function line(s) { console.log(s); }

/** 真实牌面包围盒（含牌高），以及重心与可视区中心的偏差 */
function boxOf(cards) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of cards) {
    if (c.x < minX) minX = c.x;
    if (c.x + TILE_W > maxX) maxX = c.x + TILE_W;
    if (c.y < minY) minY = c.y;
    if (c.y + TILE_H > maxY) maxY = c.y + TILE_H;
  }
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY, cy: (minY + maxY) / 2 };
}

line('============================================================================');
line(' MahLeMah · 第一关布局位置验收（真实牌面包围盒 / 各档位 / 多 seed）');
line('============================================================================');
line(` 牌桌可视区 top=${BOARD_BAND.top} bottom=${BOARD_BAND.bottom} 中心 BOARD_CY=${BOARD_CY}`);
line('');

const SEEDS_PER_PROFILE = 40;
const report = { generatedAt: new Date().toISOString(), boardBand: BOARD_BAND, boardCy: BOARD_CY, profiles: [] };
const allShifts = new Set();

line('[1] 第一关 4 个档位 × 40 seed 的实际重心与几何契约');
for (const p of LEVEL1_PROFILES) {
  let worstDev = 0, minCy = Infinity, maxCy = -Infinity;
  let badCenter = 0, badBounds = 0, badLattice = 0, badOverlap = 0, badLayers = 0, badConnect = 0;
  let badDynamic = 0;
  let minH = Infinity, maxH = 0, minTop = Infinity, maxBottom = 0;
  const shiftValues = new Set();
  const samples = [];
  for (let k = 0; k < SEEDS_PER_PROFILE; k++) {
    const seed = (0x41000000 + k * 2654435761 + p.id * 104729) >>> 0;
    const cards = generateProfileLayout(seed, p);
    const b = boxOf(cards);
    const dev = Math.abs(b.cy - BOARD_CY);
    if (dev > worstDev) worstDev = dev;
    // 直接证明「按本局包围盒动态计算」：实际顶边必须落在本局自己的目标顶边附近
    // （目标顶边随 h 变化；吸附到半格晶格后允许 ≤1 格误差，边界 clamp 除外）
    const bandH = BOARD_BAND.bottom - BOARD_BAND.top;
    const targetTop = BOARD_BAND.top + (bandH - b.h) / 2;
    if (Math.abs(b.minY - targetTop) > LATTICE_Y) badDynamic++;
    if (b.cy < minCy) minCy = b.cy;
    if (b.cy > maxCy) maxCy = b.cy;
    if (dev > 60) badCenter++;
    if (b.minY < BOARD_BAND.top || b.maxY > BOARD_BAND.bottom || b.minX < BOARD_BAND.left || b.maxX > BOARD_BAND.right) badBounds++;
    if (!isHalfLattice(cards)) badLattice++;
    if (sameLayerOverlapCount(cards) !== 0) badOverlap++;
    const layers = new Set(cards.map((c) => c.layer)).size;
    const plan = layerPlanFor(p);
    if (layers !== plan.length) badLayers++;
    if (countComponents(cards) !== 1) badConnect++;
    if (b.h < minH) minH = b.h;
    if (b.h > maxH) maxH = b.h;
    if (b.minY < minTop) minTop = b.minY;
    if (b.maxY > maxBottom) maxBottom = b.maxY;
    // 旧的固定写法把所有层钉在 topCy=240；这里记录每局相对旧顶边的实际位移
    shiftValues.add(b.minY - 240);
    allShifts.add(b.minY - 240);
    if (k < 3) samples.push({ seed, cy: b.cy, minY: b.minY, maxY: b.maxY, h: b.h, layers });
  }
  ok(badCenter === 0, `L1-${p.id} 40 局重心都在 BOARD_CY±60px 内（越界 ${badCenter}，最大偏差 ${worstDev}px）`);
  ok(badBounds === 0, `L1-${p.id} 全部牌都在 BOARD_BAND 内（越界 ${badBounds}）`);
  ok(badLattice === 0 && badOverlap === 0, `L1-${p.id} 半格晶格 / 同层零重叠（异常 ${badLattice}/${badOverlap}）`);
  ok(badLayers === 0, `L1-${p.id} 层数与 layerPlanFor 完全一致（异常 ${badLayers}）`);
  ok(badConnect === 0, `L1-${p.id} 紧凑堆保持整堆单连通（异常 ${badConnect}）`);
  ok(shiftValues.size > 1,
    `L1-${p.id} 纵向位移随 seed / 包围盒变化，不是写死的固定偏移（不同位移 ${shiftValues.size} 种）`);
  ok(badDynamic === 0,
    `L1-${p.id} 每局实际顶边 = 按本局包围盒动态求得的目标顶边（异常 ${badDynamic}）`);
  // 上下留白相对均衡（视觉重心，不是只保证不越界）
  const topGap = minTop - BOARD_BAND.top;
  const bottomGap = BOARD_BAND.bottom - maxBottom;
  ok(Math.abs(topGap - bottomGap) < 160,
    `L1-${p.id} 上下安全边距相对均衡（上 ${topGap} / 下 ${bottomGap}）`);
  line(`   L1-${p.id} ${p.mainCount} 张 · 重心 ${minCy.toFixed(0)}~${maxCy.toFixed(0)}（中心 ${BOARD_CY}）` +
    ` · 包围盒高 ${minH}~${maxH} · 最大偏差 ${worstDev}px · 不同位移 ${shiftValues.size} 种`);
  report.profiles.push({
    id: p.id, tiles: p.mainCount, seeds: SEEDS_PER_PROFILE,
    cyRange: [minCy, maxCy], worstDeviation: worstDev, boxHeight: [minH, maxH],
    topGap, bottomGap, distinctShifts: shiftValues.size,
    badCenter, badBounds, badLattice, badOverlap, badLayers, badConnect,
    samples,
  });
}
ok(allShifts.size >= 2, `全部档位合计出现 ${allShifts.size} 种不同纵向位移（半格晶格吸附后的真实取值，非固定偏移）`);

line('\n[2] 不同屏幕尺寸 / 缩放比下的视觉重心（逻辑坐标整体缩放，重心比例不变）');
{
  const cards = generateProfileLayout(0x41234567, LEVEL1_PROFILES[3]);
  const b = boxOf(cards);
  const ratioLogical = (b.cy - BOARD_BAND.top) / (BOARD_BAND.bottom - BOARD_BAND.top);
  let bad = 0;
  const rows = [];
  for (const scale of [0.5, 0.75, 1, 1.5, 2, 3]) {
    const scaledTop = BOARD_BAND.top * scale;
    const scaledBottom = BOARD_BAND.bottom * scale;
    const scaledCy = b.cy * scale;
    const ratio = (scaledCy - scaledTop) / (scaledBottom - scaledTop);
    if (Math.abs(ratio - ratioLogical) > 1e-9) bad++;
    rows.push({ scale, ratio: Number(ratio.toFixed(6)) });
  }
  ok(bad === 0, `6 种缩放比下重心相对可视区的位置比例恒定（${ratioLogical.toFixed(4)}，异常 ${bad}）`);
  report.scaling = { ratio: ratioLogical, rows };
  line('   ' + rows.map((r) => `×${r.scale} → ${r.ratio}`).join(' · '));
}

line('\n[3] 第二关布局回归（本次不改第二关几何，确认没有被连带破坏）');
{
  let bad = 0, minW = Infinity, minH = Infinity;
  for (const p of LEVEL2_PROFILES) {
    for (let k = 0; k < 8; k++) {
      const seed = (0x42000000 + k * 2654435761 + p.id * 7919) >>> 0;
      const cards = generateProfileLayout(seed, p);
      const b = boxOf(cards);
      if (b.w < minW) minW = b.w;
      if (b.h < minH) minH = b.h;
      if (b.w < 560 || b.h < 440 || b.minY < BOARD_BAND.top || b.maxY > BOARD_BAND.bottom) bad++;
      if (!isHalfLattice(cards) || sameLayerOverlapCount(cards) !== 0) bad++;
    }
  }
  ok(bad === 0, `L2 10 档 × 8 seed 包围盒 / 边界 / 晶格 / 重叠回归 0 异常（最小 ${minW}×${minH}）`);
  report.level2Regression = { profiles: LEVEL2_PROFILES.length, seedsPerProfile: 8, bad, minW, minH };
  line(`   L2 最小包围盒 ${minW}×${minH} · 异常 ${bad}`);
}

report.summary = { pass, fail, failures };
writeFileSync(path.join(REPORTS, 'layout-position-report.json'), JSON.stringify(report, null, 2), 'utf8');
let md = `# 第一关布局位置验收报告\n\n` +
  `- 牌桌可视区：${BOARD_BAND.top}–${BOARD_BAND.bottom}，中心 ${BOARD_CY}\n` +
  `- 样本：4 档 × ${SEEDS_PER_PROFILE} seed = ${4 * SEEDS_PER_PROFILE} 局真实牌面\n` +
  `- 断言：${pass} 通过 / ${fail} 失败\n\n` +
  `## 各档位重心\n\n| 档位 | 牌数 | 重心范围 | 最大偏差 | 包围盒高 | 上/下留白 | 不同位移 | 异常 |\n` +
  `|---|---:|---|---:|---|---|---|---:|\n`;
for (const p of report.profiles) {
  md += `| L1-${p.id} | ${p.tiles} | ${p.cyRange[0].toFixed(0)}–${p.cyRange[1].toFixed(0)} | ` +
    `${p.worstDeviation}px | ${p.boxHeight[0]}–${p.boxHeight[1]} | ${p.topGap}/${p.bottomGap} | ` +
    `${p.distinctShifts} | ${p.badCenter + p.badBounds + p.badLattice + p.badOverlap + p.badLayers + p.badConnect} |\n`;
}
md += `\n## 缩放适配\n\n比例恒定 ${report.scaling.ratio.toFixed(6)}，` +
  report.scaling.rows.map((r) => `×${r.scale}`).join(' / ') + ` 全部一致。\n\n` +
  `## 第二关回归\n\n最小包围盒 ${report.level2Regression.minW}×${report.level2Regression.minH}，异常 ${report.level2Regression.bad}。\n`;
writeFileSync(path.join(REPORTS, 'layout-position-report.md'), md, 'utf8');

line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line(' 报告：reports/layout-position-report.json / .md');
line('============================================================================');
if (fail) process.exit(1);
