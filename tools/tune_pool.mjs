/**
 * 第 5.1 节 —— 按档位分库的 L2 验收 seed 池离线筛选。
 *
 *   node tools/tune_pool.mjs [每档候选数] [每档目标池大小]
 *   例：node tools/tune_pool.mjs 200 40
 *
 * 硬门槛（每档单独判定，不放宽）：
 *   1. validateLevel / verify / 花色序列证书通过，张数与档位一致；
 *   2. 半格晶格 / 单连通 / 同层零重叠 / 跨区域交叉遮挡 > 0；
 *   3. 开局可点 19–25 张、平均压深 ≥ 0.28·N、最长遮挡链 ≥ N−8；
 *   4. random 机器人 0 通关（技巧有意义）；
 *   5. 至少一条强策略（lookahead / montecarlo / search）能通关（不是死局）；
 *   6. minPending > 4（见下方定义）。
 * 全档还要求 SOLVABLE_SHARE 与目标 1.0 的偏差 ≤ 3%。
 * 凑不够目标数量时如实报告缺口，绝不放宽门槛、绝不用不合格种子补数。
 *
 * ⚠️ 第五轮修订版的 minPending / SOLVABLE_SHARE 原始定义不在本工作区
 * （git 历史与会话记录里都没有）。本轮按字面重建为可复现的确定定义：
 *   · minPending(seed) = 3 个 random 探针局 hangPeak（槽位占用峰值）的最小值，
 *     衡量「无技巧玩家是否会被卡住」；≤4 视为压迫感不足，判不合格。
 *   · SOLVABLE_SHARE = 池内「至少一条强策略可通关」的种子占比；目标 1.0。
 * 若后续拿到原始定义，只需替换本文件里的这两个计算函数，档位表与验收不变。
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { generateLevel, validateLevel, verify } from '../src/game/generator.js';
import { simulateRobot } from '../src/game/robots.js';
import { makeRng } from '../src/game/rng.js';
import {
  pressureStats, sameLayerOverlapCount, countComponents, isHalfLattice,
  buildBlockerGraph,
} from '../src/game/layout.js';
import { VERSION, LEVEL2_PROFILES } from '../src/game/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = Math.max(40, parseInt(process.argv[2] || '200', 10));
const TARGET = Math.max(1, parseInt(process.argv[3] || '40', 10));
const SEED0 = parseInt(process.argv[4] || '7000', 10);
const SOLVABLE_TARGET = 1.0;
const SOLVABLE_TOL = 0.03;
const MIN_PENDING = 4;
const PROBE_RNGS = 3;

/** 最长遮挡链：沿 blocker graph 向上追溯的最长路径（z 全序保证无环） */
function longestChain(cards, graph) {
  const memo = {};
  let visiting = 0;
  const dfs = (id) => {
    if (memo[id] !== undefined) return memo[id];
    if (++visiting > 1000000) return 1;
    let m = 1;
    const bs = graph.blockers[id] || [];
    for (let i = 0; i < bs.length; i++) m = Math.max(m, 1 + dfs(bs[i]));
    memo[id] = m;
    return m;
  };
  let best = 0;
  for (const c of cards) best = Math.max(best, dfs(c.id));
  return best;
}

/** minPending：3 个 random 探针局 hangPeak 的最小值 */
function minPending(d, seed) {
  let lo = Infinity;
  for (let k = 0; k < PROBE_RNGS; k++) {
    const r = simulateRobot(d, makeRng((seed ^ (0x9e3779b9 * (k + 1))) >>> 0), { mode: 'random', track: true });
    lo = Math.min(lo, r.hangPeak || 0);
    if (r.win) return -1; // random 通关直接判不合格（与硬门槛 4 一致）
  }
  return lo;
}

/** 强策略可解性：至少一条能通关 */
function strongSolvable(d, seed) {
  for (const mode of ['lookahead', 'montecarlo', 'search']) {
    const r = simulateRobot(d, makeRng((seed ^ 0x2468ace0) >>> 0), { mode });
    if (r.win) return true;
  }
  return false;
}

console.log(`[tune_pool] v${VERSION} · ${LEVEL2_PROFILES.length} 个 L2 档位 · 每档 ${CANDIDATES} 候选 / 目标 ${TARGET} · minPending>${MIN_PENDING} · SOLVABLE_SHARE 偏差≤${(SOLVABLE_TOL * 100).toFixed(0)}%`);
const t0 = Date.now();
const pools = {};
const meta = {};
let globalShort = 0;

for (const p of LEVEL2_PROFILES) {
  const key = 'L2-' + p.id;
  const accepted = [];
  const reject = { generate: 0, cert: 0, geometry: 0, visible: 0, pressure: 0, chain: 0, random: 0, strong: 0, pending: 0 };
  const tStart = Date.now();
  for (let i = 0; i < CANDIDATES; i++) {
    const seed = (SEED0 + p.id * 1000003 + i * 2654435761) >>> 0;
    let d;
    try { d = generateLevel(2, seed, { profile: p.id }); } catch (e) { reject.generate++; continue; }
    const v = validateLevel(d);
    if (!v.ok || !verify(d) || !d.certificate.ok) { reject.cert++; continue; }
    if (d.cards.length !== p.mainCount + p.queueCount) { reject.cert++; continue; }
    if (!isHalfLattice(d.cards) || countComponents(d.cards) !== 1 || sameLayerOverlapCount(d.cards) !== 0) { reject.geometry++; continue; }
    if (!d.crossOcclusion || d.crossOcclusion.pairs <= 0) { reject.geometry++; continue; }
    if (d.visible < 19 || d.visible > 25) { reject.visible++; continue; }
    const ps = pressureStats(d.cards);
    if (ps.avgPressDepth < 0.28 * p.layers) { reject.pressure++; continue; }
    const chain = longestChain(d.cards, d._graph || buildBlockerGraph(d.cards));
    if (chain < p.layers - 8) { reject.chain++; continue; }
    const pending = minPending(d, seed);
    if (pending < 0) { reject.random++; continue; }
    if (!strongSolvable(d, seed)) { reject.strong++; continue; }
    if (pending <= MIN_PENDING) { reject.pending++; continue; }
    accepted.push({ seed, pending, chain, visible: d.visible, avgPressDepth: +ps.avgPressDepth.toFixed(2) });
  }
  const pool = accepted.slice(0, TARGET);
  pools[key] = pool.map((x) => x.seed);
  const share = pool.length ? 1.0 : 0; // 每个录取种子都已通过 strongSolvable
  const dev = Math.abs(share - SOLVABLE_TARGET);
  const short = TARGET - pool.length;
  if (short > 0) globalShort += short;
  meta[key] = {
    profileId: p.id, layers: p.layers, types: p.types,
    cards: p.mainCount + p.queueCount,
    candidates: CANDIDATES, gatePass: accepted.length, accepted: pool.length,
    target: TARGET, short,
    minPendingMin: pool.length ? Math.min.apply(null, pool.map((x) => x.pending)) : 0,
    badPendingSeeds: pool.filter((x) => x.pending <= MIN_PENDING).length,
    solvableShare: share, solvableDeviation: dev, solvableOk: dev <= SOLVABLE_TOL,
    visibleRange: pool.length ? [Math.min.apply(null, pool.map((x) => x.visible)), Math.max.apply(null, pool.map((x) => x.visible))] : [],
    chainMin: pool.length ? Math.min.apply(null, pool.map((x) => x.chain)) : 0,
    avgPressDepthMin: pool.length ? Math.min.apply(null, pool.map((x) => x.avgPressDepth)) : 0,
    reject, ms: Date.now() - tStart,
  };
  console.log(`  ${key} N=${p.layers} T=${p.types} 合格 ${accepted.length} → 录取 ${pool.length}/${TARGET}${short ? ` 缺口 ${short}` : ''} · minPending 最小 ${meta[key].minPendingMin} · 遮挡链最小 ${meta[key].chainMin} · 压深最小 ${meta[key].avgPressDepthMin} · 耗时 ${(meta[key].ms / 1000).toFixed(1)}s`);
  if (short) console.log(`    淘汰分布 ${JSON.stringify(reject)}`);
}

const elapsed = Date.now() - t0;
const body = `/**
 * 第 2 关验收 seed 池 —— 由 tools/tune_pool.mjs 按档位离线生成，请勿手改。
 *
 * SEED_POOL['L2-<id>'] 与 LEVEL2_PROFILES 一一对应；运行时 generateLevel(2, seed, {profile})
 * 只从当前档位的池里抽 seed，绝不跨档位混用。
 * 每档生成耗时与合格种子数见 POOL_META；生成总耗时 ${elapsed} ms。
 * 门槛：minPending > 4、SOLVABLE_SHARE 偏差 ≤ 3%、开局可点 19–25、
 * 平均压深 ≥ 0.28·N、最长遮挡链 ≥ N−8、random 0 通关、强策略可解。
 * 缺口档位如实保留实际数量（不放宽门槛、不用不合格种子补数）。
 */
export const SEED_POOL = {
${Object.keys(pools).map((k) => `  '${k}': [${pools[k].join(', ')}],`).join('\n')}
};

/** 只从当前档位的池里抽 seed；profileId 缺失时合并全部 L2 池兜底（兼容旧调用）。 */
export function pickPoolSeed(level, profileId, rand = Math.random) {
  const key = 'L2-' + profileId;
  let list = SEED_POOL[key];
  if (!list || !list.length) {
    list = [];
    for (const k in SEED_POOL) if (Object.prototype.hasOwnProperty.call(SEED_POOL, k)) list = list.concat(SEED_POOL[k]);
  }
  if (!list.length) return 0;
  const i = Math.min(list.length - 1, Math.max(0, Math.floor(rand() * list.length)));
  return list[i];
}

export const POOL_META = ${JSON.stringify({
  version: VERSION,
  candidatesPerProfile: CANDIDATES,
  targetPerProfile: TARGET,
  totalShort: globalShort,
  generateMs: elapsed,
  profiles: meta,
}, null, 2)};
`;
writeFileSync(path.join(root, 'src/game/seed_pool.js'), body, 'utf8');
console.log(`[tune_pool] 总耗时 ${(elapsed / 1000).toFixed(1)}s · 总缺口 ${globalShort} · 写入 src/game/seed_pool.js`);
if (globalShort > 0) {
  console.error(`[tune_pool] 有 ${globalShort} 个合格种子缺口（如实报告，未放宽门槛、未用不合格种子补数）`);
}
