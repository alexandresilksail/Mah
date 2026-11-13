/**
 * 第 3.3 节 —— 按档位分库的 L2 验收 seed 池离线筛选。
 *
 *   node tools/tune_pool.mjs [每档候选数] [每档目标池大小] [起始 seed]
 *   例：node tools/tune_pool.mjs 120 40
 *
 * 硬门槛（每档单独判定，不放宽）：
 *   1. generateLevel 不抛异常，validateLevel 通过（第二关整池均匀洗牌后不再要求
 *      存在完整解，所以**不再**用 verify / certificate 当门槛，见第 3.2 节说明）；
 *   2. 张数与档位一致；半格晶格 / **主堆单连通** / 同层零重叠 / 跨区域交叉遮挡 > 0；
 *   3. 开局可点 19–25 张、平均压深 ≥ 0.28·N、最长遮挡链 ≥ N−8（第 3.4 节）；
 *   4. **第 3.3 节新增**：该种子上 5 种机器人合计通关数为 0
 *      （greedy / noisy / lookahead / montecarlo / search；random 一并跑，
 *       一并要求 0，但它只作为基线参考）。
 *
 * 凑不够目标数量时如实报告缺口，绝不放宽门槛、绝不用不合格种子补数。
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { generateLevel, validateLevel } from '../src/game/generator.js';
import { simulateRobot, ROBOT_MODES } from '../src/game/robots.js';
import { makeRng } from '../src/game/rng.js';
import {
  pressureStats, sameLayerOverlapCount, countComponents, isHalfLattice,
  buildBlockerGraph,
} from '../src/game/layout.js';
import { VERSION, LEVEL2_PROFILES } from '../src/game/config.js';
import { L2_TEMPLATE_IDS } from '../src/game/l2_templates.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = Math.max(40, parseInt(process.argv[2] || '120', 10));
const TARGET = Math.max(1, parseInt(process.argv[3] || '40', 10));
const SEED0 = parseInt(process.argv[4] || '7000', 10);

/** 入池判定用的 5 种机器人（第 3.3 节）；random 只做基线统计 */
const GATE_ROBOTS = ['greedy', 'noisy', 'lookahead', 'montecarlo', 'search'];

/** 最长遮挡链：沿 blocker graph 向上追溯的最长路径（z 全序保证无环） */
function longestChain(cards, graph) {
  const memo = {};
  const dfs = (id) => {
    if (memo[id] !== undefined) return memo[id];
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

/** 6 种机器人各跑一局，返回每种是否通关 */
function robotWins(d, seed) {
  const wins = {};
  for (let i = 0; i < ROBOT_MODES.length; i++) {
    const mode = ROBOT_MODES[i];
    const r = simulateRobot(d, makeRng((seed ^ Math.imul(i + 1, 0x9e3779b9)) >>> 0), { mode });
    wins[mode] = r.win ? 1 : 0;
  }
  return wins;
}

console.log(`[tune_pool] v${VERSION} · ${LEVEL2_PROFILES.length} 个 L2 档位 · 每档 ${CANDIDATES} 候选 / 目标 ${TARGET} · 入池条件：5 种机器人合计通关 0`);
const t0 = Date.now();
const pools = {};
const meta = {};
let globalShort = 0;

for (const p of LEVEL2_PROFILES) {
  const key = 'L2-' + p.id;
  const accepted = [];
  const reject = {
    generate: 0, validate: 0, geometry: 0, visible: 0, pressure: 0, chain: 0, robot: 0,
  };
  const robotTotals = {};
  for (let i = 0; i < ROBOT_MODES.length; i++) robotTotals[ROBOT_MODES[i]] = 0;
  const tStart = Date.now();
  for (let i = 0; i < CANDIDATES; i++) {
    const seed = (SEED0 + p.id * 1000003 + i * 2654435761) >>> 0;
    let d;
    try {
      // 第二关按 seed 稳定地挑一套模板（与生成器口径一致：同一 seed 永远同一套）
      const tid = L2_TEMPLATE_IDS[(seed >>> 0) % L2_TEMPLATE_IDS.length];
      d = generateLevel(2, seed, { profile: p.id, templateId: tid });
    } catch (e) { reject.generate++; continue; }
    const v = validateLevel(d);
    if (!v.ok) { reject.validate++; continue; }
    if (d.cards.length !== p.mainCount + p.queueCount) { reject.validate++; continue; }
    // 主堆必须单连通；盲盒队列是独立区域（四条链），不参与「单连通」判定
    const mainCards = d.cards.filter((c) => c.region === 'core');
    if (!isHalfLattice(d.cards) || sameLayerOverlapCount(d.cards) !== 0
      || mainCards.length !== p.mainCount || countComponents(mainCards) !== 1) {
      reject.geometry++; continue;
    }
    if (!d.crossOcclusion || d.crossOcclusion.pairs <= 0) { reject.geometry++; continue; }
    if (d.visible < 19 || d.visible > 25) { reject.visible++; continue; }
    const ps = pressureStats(d.cards);
    if (ps.avgPressDepth < 0.28 * p.layers) { reject.pressure++; continue; }
    const chain = longestChain(d.cards, d._graph || buildBlockerGraph(d.cards));
    if (chain < p.layers - 8) { reject.chain++; continue; }
    const wins = robotWins(d, seed);
    let gateWins = 0;
    for (let k = 0; k < GATE_ROBOTS.length; k++) gateWins += wins[GATE_ROBOTS[k]];
    robotTotals.random += wins.random;
    for (let k = 0; k < GATE_ROBOTS.length; k++) robotTotals[GATE_ROBOTS[k]] += wins[GATE_ROBOTS[k]];
    if (gateWins !== 0) { reject.robot++; continue; }
    accepted.push({
      seed, chain, visible: d.visible,
      avgPressDepth: +ps.avgPressDepth.toFixed(2),
    });
  }
  const pool = accepted.slice(0, TARGET);
  pools[key] = pool.map((x) => x.seed);
  const short = TARGET - pool.length;
  if (short > 0) globalShort += short;
  meta[key] = {
    profileId: p.id, layers: p.layers, types: p.types,
    cards: p.mainCount + p.queueCount,
    candidates: CANDIDATES, gatePass: accepted.length, accepted: pool.length,
    target: TARGET, short,
    visibleRange: pool.length
      ? [Math.min.apply(null, pool.map((x) => x.visible)), Math.max.apply(null, pool.map((x) => x.visible))]
      : [],
    chainMin: pool.length ? Math.min.apply(null, pool.map((x) => x.chain)) : 0,
    chainNeed: p.layers - 8,
    avgPressDepthMin: pool.length ? Math.min.apply(null, pool.map((x) => x.avgPressDepth)) : 0,
    avgPressDepthNeed: +(0.28 * p.layers).toFixed(2),
    robotTotals,
    reject, ms: Date.now() - tStart,
  };
  console.log(`  ${key} N=${p.layers} T=${p.types} 合格 ${accepted.length} → 录取 ${pool.length}/${TARGET}${short ? ` 缺口 ${short}` : ''}`
    + ` · 遮挡链最小 ${meta[key].chainMin}（需≥${meta[key].chainNeed}）`
    + ` · 压深最小 ${meta[key].avgPressDepthMin}（需≥${meta[key].avgPressDepthNeed}）`
    + ` · 机器人通关 ${JSON.stringify(robotTotals)}`
    + ` · 耗时 ${(meta[key].ms / 1000).toFixed(1)}s`);
  if (short) console.log(`    淘汰分布 ${JSON.stringify(reject)}`);
}

const elapsed = Date.now() - t0;
const body = `/**
 * 第 2 关验收 seed 池 —— 由 tools/tune_pool.mjs 按档位离线生成，请勿手改。
 *
 * SEED_POOL['L2-<id>'] 与 LEVEL2_PROFILES 一一对应；运行时 generateLevel(2, seed, {profile})
 * 只从当前档位的池里抽 seed，绝不跨档位混用。
 * 每档生成耗时与合格种子数见 POOL_META；生成总耗时 ${elapsed} ms。
 *
 * 第 3.3 节入池条件（几何 × 发牌一起验，因为几何现在由 seed 生成）：
 *   开局可点 19–25、平均压深 ≥ 0.28·N、最长遮挡链 ≥ N−8、
 *   **该种子上 5 种机器人（greedy/noisy/lookahead/montecarlo/search）合计通关数 = 0**。
 * 第二关整池均匀洗牌后不再要求存在完整解（见 generator.js 的说明），
 * 因此入池不再看 verify / certificate。
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
  gateRobots: GATE_ROBOTS,
  profiles: meta,
}, null, 2)};
`;
writeFileSync(path.join(root, 'src/game/seed_pool.js'), body, 'utf8');
console.log(`[tune_pool] 总耗时 ${(elapsed / 1000).toFixed(1)}s · 总缺口 ${globalShort} · 写入 src/game/seed_pool.js`);
if (globalShort > 0) {
  console.error(`[tune_pool] 有 ${globalShort} 个合格种子缺口（如实报告，未放宽门槛、未用不合格种子补数）`);
}
