/**
 * 离线难度调优工具（方案 b）：生成「通过第三轮验收的第 2 关 seed 池」。
 *
 *   node tools/tune_pool.mjs [候选数] [池大小] [贪心探针数]
 *   npm run tune:pool
 *
 * 对每个候选 seed 生成一局真实第 2 关，逐项筛：
 *   1. 几何硬约束：222 张 / 7 层 / 15 花色 / 每种 %3==0 / 支撑 / 晶格 /
 *      单堆连通 / 半格晶格 / 包围盒不越界 / 肚子宽度 / 上层矩形与填充率；
 *   2. 压迫感五项（1.4 节）：开局可点 14%~20%、顶层占比 ≥40%、
 *      第 0–1 层被压 ≥90%、平均压深 ≥4.0、遮挡图最长链 = 7；
 *   3. 发牌：证书 + verify 通过、上带 ≥12 种花色、开局可点 ≥10 种花色
 *      且 ≥6 种各有 ≥3 张、沿 order 挂起花色 ≤6；
 *   4. 难度：验收随机源下 random / greedy / greedy+10%失误 / 浅层优先 greedy
 *      四种机器人全不通关；另用多个泛化随机源复核 greedy 不通关；
 *      greedy 失败进度 ≥0.60（软指标「中位数 ≥65%」的调优目标）。
 *
 * 通过者写入 src/game/seed_pool.js（≥100 个）。运行时只查表 + 确定性生成，
 * 不受单局 400ms 预算约束。
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { generateLevel, simulateRobot, verify } from '../src/game/generator.js';
import { pressureStats, countComponents, isHalfLattice, hasSupport, overlapArea } from '../src/game/layout.js';
import { SUITS_L2 } from '../src/game/tiles.js';
import { makeRng } from '../src/game/rng.js';
import {
  TILE_W, TILE_H, TILE_AREA, BOARD_BAND, CONNECT_PAD, LAYER_SHAPE, BAND_RATIOS,
} from '../src/game/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = parseInt(process.argv[2] || '9000', 10);
const WANT = parseInt(process.argv[3] || '220', 10);
const NRNG = parseInt(process.argv[4] || '5', 10);
const VERIFY_XOR = 0xabcdef;
const XOR = [VERIFY_XOR, 0x13579bdf, 0x2468ace0, 0x55aa55aa, 0x0f0f0f0f, 0x31415926, 0x27182818, 0xdeadbeef];

/** 一局的全部结构 / 压迫感 / 发牌检查（不含耗时的机器人） */
function inspect(d) {
  const cards = d.cards;
  if (cards.length !== 222) return null;
  const cnt = {};
  const byLayer = {};
  for (const c of cards) {
    cnt[c.type] = (cnt[c.type] || 0) + 1;
    (byLayer[c.layer] = byLayer[c.layer] || []).push(c);
  }
  if (Object.keys(cnt).length !== 15) return null;
  if (!Object.values(cnt).every((n) => n % 3 === 0)) return null;
  if (Object.keys(byLayer).length !== 7) return null;
  for (const t of SUITS_L2) if (!cnt[t]) return null;

  let noSup = 0;
  let same = 0;
  let out = 0;
  for (let li = 1; li < 7; li++) {
    const lower = byLayer[li - 1] || [];
    for (const c of byLayer[li]) if (!hasSupport(c, lower)) noSup++;
  }
  for (const li of Object.keys(byLayer)) {
    const a = byLayer[li];
    for (let i = 0; i < a.length; i++) {
      for (let j = i + 1; j < a.length; j++) if (overlapArea(a[i], a[j]) > 0) same++;
    }
  }
  for (const c of cards) {
    if (c.x < BOARD_BAND.left || c.x + TILE_W > BOARD_BAND.right ||
        c.y < BOARD_BAND.top || c.y + TILE_H > BOARD_BAND.bottom) out++;
  }
  if (noSup || same || out || !isHalfLattice(cards) || countComponents(cards, CONNECT_PAD) !== 1) return null;

  // 层宽：第 2、3 层比第 0 层至少宽 TILE_W/2
  const width = (li) => {
    const a = byLayer[li];
    return Math.max(...a.map((c) => c.x + TILE_W)) - Math.min(...a.map((c) => c.x));
  };
  const w0 = width(0);
  if (width(2) < w0 + LAYER_SHAPE.bellyExtraPx) return null;
  if (width(3) < w0 + LAYER_SHAPE.bellyExtraPx) return null;

  // 第 5、6 层完整矩形；第 4 层填充率 ≥85%；第 0–3 层 80%~90% + ≥2 边缘缺口
  const gridOf = (li) => {
    const a = byLayer[li];
    const minX = Math.min(...a.map((c) => c.x));
    const minY = Math.min(...a.map((c) => c.y));
    const cols = Math.round((Math.max(...a.map((c) => c.x + TILE_W)) - minX) / TILE_W);
    const rows = Math.round((Math.max(...a.map((c) => c.y + TILE_H)) - minY) / TILE_H);
    return { cols, rows, cells: cols * rows, minX, minY };
  };
  for (let li = 0; li < 7; li++) {
    const g = gridOf(li);
    const fill = byLayer[li].length / g.cells;
    if (li >= 5) { if (fill !== 1) return null; }
    else if (li === 4) { if (fill < LAYER_SHAPE.topFillMin) return null; }
    else if (fill < LAYER_SHAPE.fillMin || fill > LAYER_SHAPE.fillMax) return null;
    if (li <= 3) {
      // 边缘缺口数
      const set = new Set(byLayer[li].map((c) => `${Math.round((c.x - g.minX) / TILE_W)},${Math.round((c.y - g.minY) / TILE_H)}`));
      let edgeGaps = 0;
      for (let r = 0; r < g.rows; r++) {
        for (let c2 = 0; c2 < g.cols; c2++) {
          if (r === 0 || r === g.rows - 1 || c2 === 0 || c2 === g.cols - 1) {
            if (!set.has(`${c2},${r}`)) edgeGaps++;
          }
        }
      }
      if (edgeGaps < LAYER_SHAPE.minEdgeGaps) return null;
    }
  }

  const ps = pressureStats(cards);
  if (ps.freeRatio < 0.14 || ps.freeRatio > 0.20) return null;
  if (ps.topShare < 0.40) return null;
  if (ps.bottomCovered < 0.90) return null;
  if (ps.avgPressDepth < 4.0) return null;
  if (ps.longestChain !== 7) return null;

  // 发牌结构
  if (!d.certificate.ok || !verify(d)) return null;
  if (d.bands.top[1] % 3 !== 0 || Math.abs(d.bands.top[1] / 222 - BAND_RATIOS[0]) > 0.02) return null;
  if ((d.bands.mid[1] - d.bands.top[1]) % 3 !== 0) return null;
  const topKinds = new Set(d.typeSeq.slice(0, d.bands.top[1])).size;
  if (topKinds < 12) return null;
  const wave0 = d.waves[0][1];
  const first = d.order.slice(0, wave0).map((id) => cards.find((c) => c.id === id));
  const kinds = {};
  for (const c of first) kinds[c.type] = (kinds[c.type] || 0) + 1;
  if (Object.keys(kinds).length < 10) return null;
  if (Object.values(kinds).filter((n) => n >= 3).length < 6) return null;
  // 沿 order 重放时同时挂起的花色 ≤6
  const seen = {};
  let hangPeak = 0;
  for (let i = 0; i < d.typeSeq.length; i++) {
    const t = d.typeSeq[i];
    seen[t] = ((seen[t] || 0) + 1) % 3;
    const hang = Object.values(seen).filter((n) => n > 0).length;
    if (hang > hangPeak) hangPeak = hang;
  }
  if (hangPeak > 6) return null;
  return { ps, hangPeak, topKinds };
}

const pool = [];
const losePcts = [];
const t0 = Date.now();
let tried = 0;
let geoPass = 0;

for (let seed = 1; seed <= CANDIDATES && pool.length < WANT; seed++) {
  tried++;
  const d = generateLevel(2, seed);
  const info = inspect(d);
  if (!info) continue;
  geoPass++;

  // 最便宜的一发：验收源 greedy
  const vr = makeRng((seed ^ VERIFY_XOR) >>> 0);
  const g0 = simulateRobot(d, vr, { mode: 'greedy' });
  if (g0.win || g0.pct < 0.60 || g0.pct > 0.99) continue;

  // 验收源下的另外三种机器人
  const rnd = simulateRobot(d, makeRng((seed ^ VERIFY_XOR) >>> 0), { mode: 'random' });
  if (rnd.win) continue;
  const noisy = simulateRobot(d, makeRng((seed ^ VERIFY_XOR) >>> 0), { mode: 'greedy', noise: 0.1 });
  if (noisy.win) continue;
  const shallow = simulateRobot(d, makeRng((seed ^ VERIFY_XOR) >>> 0), { mode: 'shallow' });
  if (shallow.win) continue;

  // 泛化：多种随机源下 greedy 仍不通关
  let wins = 0;
  const pcts = [g0.pct];
  for (let k = 1; k < NRNG; k++) {
    const r = simulateRobot(d, makeRng((seed ^ XOR[k % XOR.length]) >>> 0), { mode: 'greedy' });
    if (r.win) wins++;
    else pcts.push(r.pct);
  }
  if (wins > 0) continue;

  pool.push(seed);
  losePcts.push(g0.pct);
}

losePcts.sort((a, b) => a - b);
const ms = Date.now() - t0;
const med = losePcts.length ? losePcts[Math.floor(losePcts.length / 2)] : 0;

const body = [
  '/**',
  ' * 第二关验收 seed 池 —— 由离线调优工具 tools/tune_pool.mjs 生成，请勿手改。',
  ' *',
  ' * 每个 seed 都满足：葫芦轮廓几何 / 压迫感五项 / 漏斗发牌证书 / 开局花色条件；',
  ' * 验收随机源下 random、greedy、greedy+10%失误、浅层优先 greedy 全不通关；',
  ' * 多种泛化随机源下 greedy 也不通关，失败进度集中在后半段。',
  ` * 生成耗时 ${ms}ms，扫描 ${tried} 个候选，几何通过 ${geoPass} 个，录取 ${pool.length} 个，`,
  ` * 失败进度中位 ${(med * 100).toFixed(1)}%。三带比例 ${BAND_RATIOS.join('/')}。`,
  ' *',
  ' * 运行时 generateLevel(2) 不传 seed 时从这里抽一个，单局生成仍是纯确定性、约 2ms。',
  ' */',
  'export const SEED_POOL = [',
  ...pool.map((s, i) => `  ${s}${i < pool.length - 1 ? ',' : ''}`),
  '];',
  '',
  '/** 从池里抽一个 seed。rand 可注入以复现（默认 Math.random）。 */',
  'export function pickPoolSeed(rand = Math.random) {',
  '  const n = SEED_POOL.length;',
  '  const i = Math.min(n - 1, Math.max(0, Math.floor(rand() * n)));',
  '  return SEED_POOL[i];',
  '}',
  '',
  'export const POOL_META = {',
  `  candidates: ${tried},`,
  `  geoPass: ${geoPass},`,
  `  accepted: ${pool.length},`,
  `  greedyProbes: ${NRNG},`,
  `  loseProgressMedian: ${med.toFixed(4)},`,
  `  generateMs: ${ms},`,
  '};',
  '',
].join('\n');

await writeFile(path.join(root, 'src/game/seed_pool.js'), body, 'utf8');
console.log(`扫描 ${tried} 个候选，几何通过 ${geoPass} 个，录取 ${pool.length} 个，耗时 ${ms}ms`);
console.log(`失败进度 min/med/max = ${losePcts[0]?.toFixed(3)} / ${med.toFixed(3)} / ${losePcts[losePcts.length - 1]?.toFixed(3)}`);
console.log(`写入 src/game/seed_pool.js（${Buffer.byteLength(body, 'utf8')} 字节）`);
console.log(`前 20 个 seed: ${pool.slice(0, 20).join(',')}`);
if (pool.length < 100) {
  console.error('池不足 100 个，请增大候选数后重跑');
  process.exit(1);
}
