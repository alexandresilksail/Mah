/**
 * v2.0.0 —— 第 2 关验收 seed 池离线筛选（方案 b：离线扫描 + 运行时查表）。
 *
 *   node tools/tune_pool.mjs [候选数] [目标池大小] [贪心探针数] [起始 seed]
 *   例：node tools/tune_pool.mjs 3000 120 3
 *
 * ── 为什么不再用「greedy 通关率 ≤20%」当硬门槛 ──────────────────────
 * 需求 5.1：单一机器人通关率不能直接代表真实玩家难度。并且在 SLOT_CAPACITY=7、
 * 波次剥离顺序下，开局可点的 ~23 张牌正好是 order 的前 23 位；证书要求这
 * 23 张牌的槽位峰值 ≤6，数学上必然有约 6 组「三张同花色同时可点」。
 * 拥有全部牌面信息的贪心机器人因此必然高通关率 —— 只能证明关卡可解，
 * 不能证明关卡简单。v1 用它做硬门槛，6000 个候选只录取 1 个，是模型错误。
 *
 * ── v2 模型 ────────────────────────────────────────────────────────
 * 硬门槛（保证合法、公平、可解，不放宽）：
 *   1. 16 种牌型全出现、每种张数 %3==0、总数 240、证书 + verify 通过；
 *   2. 半格晶格 / 单连通 / 同层零重叠 / 跨区域交叉遮挡 > 0；
 *   3. 压迫感：开局可点 15~45 张、平均压深 ≥3、底层被压 ≥85%、可点花色 ≥8；
 *   4. 随机机器人 0 通关（技巧有意义）；
 *   5. lookahead / montecarlo / search 至少一条能通关（不是不可解死局）。
 * 排序指标（复合难度指数，越高越难且仍公平）：
 *   naiveFailure 0.30 + mistakeGap 0.20 + lateDeath 0.20
 *   + pressure 0.15 + diversity 0.15
 * 扫描全部候选后取前 TARGET 个，输出 src/game/seed_pool.js。
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { generateLevel, validateLevel, verify } from '../src/game/generator.js';
import { simulateRobot } from '../src/game/robots.js';
import { makeRng } from '../src/game/rng.js';
import { pressureStats, sameLayerOverlapCount, countComponents, isHalfLattice } from '../src/game/layout.js';
import { VERSION, LEVEL_SPEC, DIFFICULTY } from '../src/game/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = Math.max(50, parseInt(process.argv[2] || '3000', 10));
const TARGET = Math.max(10, parseInt(process.argv[3] || '120', 10));
const PROBES = Math.max(2, parseInt(process.argv[4] || '3', 10));
const SEED0 = parseInt(process.argv[5] || '7000', 10);
const W = DIFFICULTY.pool.weights;
const CACHE = path.join(root, '.build', 'pool_candidates.json');
const RANK_ONLY = process.argv.includes('--rank-only');

const t0 = Date.now();
let passed = [];
let checked = 0, certPass = 0, geoPass = 0;
const reject = { generate: 0, cert: 0, geometry: 0, pressure: 0, freeKinds: 0, random: 0, strong: 0 };

/** 复合难度指数：权重全部来自 DIFFICULTY.pool.weights，便于离线重排不需要重跑机器人 */
function indexOf(x) {
  return W.naiveFailure * x.naiveFailure + W.mistakeGap * x.mistakeGap
    + W.lateDeath * x.lateDeath + W.pressure * x.pressureV + W.diversity * x.diversity;
}

console.log(`[tune_pool] v${VERSION} 扫描 ${CANDIDATES} 候选 · 目标池 ${TARGET} · 探针 ${PROBES} · 模型=复合难度指数`);

if (RANK_ONLY) {
  // 离线重排：复用上一次扫描的原始指标，只按当前权重重新打分，秒级完成
  if (!existsSync(CACHE)) {
    console.error(`[tune_pool] 缺少 ${CACHE}，请先完整扫描一次`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(CACHE, 'utf8'));
  passed = raw.list.map((x) => ({ ...x, score: indexOf(x) }));
  checked = raw.checked; certPass = raw.certPass; geoPass = raw.geoPass;
  console.log(`[tune_pool] --rank-only 复用 ${checked} 个候选的缓存指标 · 权重 ${JSON.stringify(W)}`);
} else {
for (let i = 0; i < CANDIDATES; i++) {
  const seed = (SEED0 + i * 2654435761) >>> 0;
  let d;
  try { d = generateLevel(2, seed); } catch (e) { reject.generate++; continue; }
  checked++;

  const v = validateLevel(d);
  if (!v.ok || !verify(d) || !d.certificate.ok) { reject.cert++; continue; }
  certPass++;
  if (d.cards.length !== LEVEL_SPEC[2].cardCount) { reject.cert++; continue; }
  if (!isHalfLattice(d.cards) || countComponents(d.cards) !== 1 || sameLayerOverlapCount(d.cards) !== 0) { reject.geometry++; continue; }
  if (d.crossOcclusion.pairs <= 0) { reject.geometry++; continue; }
  geoPass++;

  const ps = pressureStats(d.cards);
  if (d.visible < 15 || d.visible > 45) { reject.pressure++; continue; }
  if (ps.avgPressDepth < DIFFICULTY.pool.minAvgPressDepth || ps.bottomCovered < DIFFICULTY.pool.minBottomCovered) { reject.pressure++; continue; }
  const freeKind = {};
  for (let k = 0; k < ps.freeIds.length; k++) freeKind[d.cards[ps.freeIds[k]].type] = 1;
  let kindN = 0;
  for (const k in freeKind) if (Object.prototype.hasOwnProperty.call(freeKind, k)) kindN++;
  if (kindN < DIFFICULTY.pool.minFreeKinds) { reject.freeKinds++; continue; }

  const rnd = simulateRobot(d, makeRng((seed ^ 0xabcdef) >>> 0), { mode: 'random' });
  if (rnd.win) { reject.random++; continue; }

  // 探针：greedy / noisy 各 PROBES 个随机源
  let greedyWins = 0, noisyWins = 0, slotSum = 0, hangPeak = 0;
  const failPcts = [];
  for (let k = 0; k < PROBES; k++) {
    const pr = (seed ^ 0x13579bdf ^ (k * 0x9e3779b9)) >>> 0;
    const g = simulateRobot(d, makeRng(pr), { mode: 'greedy', track: true });
    if (g.win) greedyWins++; else failPcts.push(g.pct);
    slotSum += g.slotAvg;
    hangPeak = Math.max(hangPeak, g.hangPeak || 0);
    const n = simulateRobot(d, makeRng((pr ^ 0x55aa55aa) >>> 0), { mode: 'noisy' });
    if (n.win) noisyWins++; else failPcts.push(n.pct);
  }

  // 强策略可解性：至少一条能通关，避免把「随机死局」误判为高难度
  let strongWin = 0;
  const strongDetail = {};
  for (const mode of ['lookahead', 'montecarlo', 'search']) {
    const r = simulateRobot(d, makeRng((seed ^ 0x2468ace0) >>> 0), { mode });
    strongDetail[mode] = !!r.win;
    if (r.win) strongWin++;
  }
  if (strongWin === 0) { reject.strong++; continue; }

  const greedyRate = greedyWins / PROBES;
  const noisyRate = noisyWins / PROBES;
  const naiveFailure = 1 - noisyRate;
  const mistakeGap = Math.max(0, greedyRate - noisyRate);
  const lateDeath = failPcts.length ? failPcts.reduce((a, b) => a + b, 0) / failPcts.length : 1;
  const pressureV = Math.min(1, ps.avgPressDepth / 8) * 0.6 + Math.min(1, ps.bottomCovered) * 0.4;
  const diversity = Math.min(1, kindN / 14);
  const entry = {
    seed,
    greedyRate, noisyRate, lateDeath, kindN,
    naiveFailure, mistakeGap, pressureV, diversity,
    avgPressDepth: ps.avgPressDepth, bottomCovered: ps.bottomCovered,
    slotAvg: slotSum / PROBES, hangPeak, strongWin,
  };
  entry.score = indexOf(entry);
  passed.push(entry);
  if (checked % 500 === 0) {
    console.log(`  已检查 ${checked}/${CANDIDATES} · 通过硬门槛 ${passed.length} · 耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}
writeFileSync(CACHE, JSON.stringify({ checked, certPass, geoPass, list: passed }), 'utf8');
}

passed.sort((a, b) => b.score - a.score || a.seed - b.seed);
const pool = passed.slice(0, TARGET);
const elapsed = Date.now() - t0;

const avg = (key) => pool.length ? (pool.reduce((a, p) => a + p[key], 0) / pool.length) : 0;
const stat = {
  greedyWinRate: avg('greedyRate'), noisyWinRate: avg('noisyRate'),
  lateDeathProgress: avg('lateDeath'), freeKinds: avg('kindN'),
  avgPressDepth: avg('avgPressDepth'), bottomCovered: avg('bottomCovered'),
  slotAvg: avg('slotAvg'), hangPeak: avg('hangPeak'),
  difficultyIndex: avg('score'),
};

const body = `/**
 * 第 2 关验收 seed 池 —— 由 tools/tune_pool.mjs 离线生成，请勿手改。
 *
 * v${VERSION}：16 种牌型 / 240 张 / 多区域交叉遮挡 / 可解性证书 100%。
 * 难度模型 = 复合难度指数（naiveFailure / mistakeGap / lateDeath / pressure / diversity），
 * 不再使用「单一贪心通关率」作为硬门槛：证书在 7 槽位下必然产生约 6 组
 * 开局同花色三张，完整信息贪心机器人高通关率只证明可解，不代表真实玩家难度。
 * 扫描 ${checked} 个候选 · 证书通过 ${certPass} · 几何通过 ${geoPass} · 硬门槛通过 ${passed.length} · 录取 ${pool.length}。
 * 池内均值：greedy ${(stat.greedyWinRate * 100).toFixed(1)}% / noisy ${(stat.noisyWinRate * 100).toFixed(1)}% /
 * 失败进度 ${(stat.lateDeathProgress * 100).toFixed(1)}% / 开局花色 ${stat.freeKinds.toFixed(1)} /
 * 平均压深 ${stat.avgPressDepth.toFixed(2)} / 平均槽位 ${stat.slotAvg.toFixed(2)} / 难度指数 ${stat.difficultyIndex.toFixed(4)}。
 * 生成耗时 ${elapsed}ms。运行时 generateLevel(2) 不传 seed 时从这里抽。
 */
export const SEED_POOL = [
${pool.map((p) => '  ' + p.seed + ',').join('\n')}
];

export function pickPoolSeed(rand = Math.random) {
  const n = SEED_POOL.length;
  const i = Math.min(n - 1, Math.max(0, Math.floor(rand() * n)));
  return SEED_POOL[i];
}

export const POOL_META = {
  version: '${VERSION}',
  candidates: ${checked},
  certPass: ${certPass},
  geoPass: ${geoPass},
  gatePass: ${passed.length},
  accepted: ${pool.length},
  greedyProbes: ${PROBES},
  difficultyIndex: ${stat.difficultyIndex.toFixed(4)},
  greedyWinRate: ${stat.greedyWinRate.toFixed(4)},
  noisyWinRate: ${stat.noisyWinRate.toFixed(4)},
  lateDeathProgress: ${stat.lateDeathProgress.toFixed(4)},
  freeKinds: ${stat.freeKinds.toFixed(2)},
  avgPressDepth: ${stat.avgPressDepth.toFixed(3)},
  bottomCovered: ${stat.bottomCovered.toFixed(4)},
  slotAvg: ${stat.slotAvg.toFixed(3)},
  hangPeak: ${stat.hangPeak.toFixed(2)},
  generateMs: ${elapsed},
};
`;

writeFileSync(path.join(root, 'src/game/seed_pool.js'), body, 'utf8');
console.log(`[tune_pool] 扫描 ${checked} · 证书 ${certPass} · 几何 ${geoPass} · 硬门槛通过 ${passed.length} · 录取 ${pool.length} · 耗时 ${(elapsed / 1000).toFixed(1)}s`);
console.log(`[tune_pool] 淘汰分布 ${JSON.stringify(reject)}`);
console.log(`[tune_pool] 池内难度画像 greedy ${(stat.greedyWinRate * 100).toFixed(1)}% · noisy ${(stat.noisyWinRate * 100).toFixed(1)}% · 失败进度 ${(stat.lateDeathProgress * 100).toFixed(1)}% · 开局花色 ${stat.freeKinds.toFixed(1)} · 平均槽位 ${stat.slotAvg.toFixed(2)} · 挂起峰值 ${stat.hangPeak.toFixed(2)}`);
console.log(`[tune_pool] 难度指数 ${stat.difficultyIndex.toFixed(4)} → src/game/seed_pool.js`);
if (pool.length < TARGET) {
  console.error(`[tune_pool] 池不足 ${TARGET} 个，请增大候选数后重跑`);
  process.exit(1);
}
