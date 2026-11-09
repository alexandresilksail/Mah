/**
 * v2.0.0 —— 关卡生成 / 16 牌型分布 / 可解性证书 / 难度系统（纯 JS，零 DOM）。
 *
 * 相对 v1 的变化：
 *  · 两关都完整使用 16 种牌型；牌型数量由 LEVEL_MIX.groups（三消组数）驱动，
 *    每种张数必然是 3 的倍数，且总张数 = 布局实际牌数。
 *  · 第 1 关：开局 4 组紧邻三消（只用 4 种易识别牌型），后期按 span=2 拉开；
 *    第 2 关：按 order 位置切三带 25% / 30% / 45%，上带花色多且三张紧邻，
 *    中/下带 span=3 批次轮转，并把「牌型配额」与布局区域 bias 联动。
 *  · 可解性证书 = 沿几何剥离顺序 order 的真实槽位重放；verify() 带几何复核。
 *    solution 只保留在关卡数据里供测试 / 回放，UI 不暴露完整解题路径。
 *  · 机器人策略移到 robots.js（六种），这里保留同名导出做兼容。
 *
 * 保留的硬契约：generateLevel(level, seed, opt) 签名、返回字段名、
 * refreshBlocked / isCovered / countVisible / coverRatioOf、Game 实例字段。
 */
import {
  TILE_W, TILE_H, TILE_AREA, OVERLAP_THRESHOLD, SLOT_CAPACITY,
  LEVEL_SPEC, LEVEL_MIX, BAND_RATIOS, FUNNEL, DIFFICULTY,
  levelParams, clampDifficulty,
} from './config.js';
import { suitsFor, TYPE_IDS, TYPE_COUNT } from './tiles.js';
import { mixFor, validateRegistry } from './tile_types.js';
import { makeRng, randomSeed } from './rng.js';
import { pickPoolSeed } from './seed_pool.js';
import { templateFor } from './layout_templates.js';
import {
  generateLayout, peelOrder, overlapArea, isBlocked,
  buildBlockerGraph, regionStats, crossOcclusionStats, sameLayerOverlapCount,
} from './layout.js';
import {
  replayTypes, simulateRobot, simulatePlayer, runDifficultySuite, ROBOT_MODES,
} from './robots.js';

export { replayTypes, simulateRobot, simulatePlayer, runDifficultySuite, ROBOT_MODES };

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;
const align3 = (v) => Math.round(v / 3) * 3;

/* ==================== 牌型配额与三带序列 ==================== */

/**
 * 按「剩余配额 + 区域偏好」挑一个牌型。
 * 保证最终每种牌型恰好用掉 mix[i] 个三消组，不多不少。
 */
function pickGroupType(remaining, preferred, rng, usedOpening) {
  let best = -1;
  for (let k = 0; k < preferred.length; k++) {
    const i = preferred[k];
    if (remaining[i] > 0 && !usedOpening[i]) { best = i; break; }
  }
  if (best < 0) {
    let max = 0;
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] > max && !usedOpening[i]) { max = remaining[i]; best = i; }
    }
  }
  if (best < 0) {
    for (let i = 0; i < remaining.length; i++) if (remaining[i] > 0) { best = i; break; }
  }
  if (best < 0) best = 0;
  remaining[best] -= 1;
  return TYPE_IDS[best];
}

/** 把 [start,end) 段按 span 批次填入：每批 span 个组，同组三张间距 = span */
function fillBatches(types, start, end, span, groupSlots, pick, rng) {
  void rng;
  const batchLen = 3 * span;
  let p = start;
  while (p + batchLen <= end) {
    for (let g = 0; g < span; g++) {
      const t = pick(groupSlots.length);
      for (let k = 0; k < 3; k++) types[p + k * span + g] = t;
      groupSlots.push({ start: p + g, type: t });
    }
    p += batchLen;
  }
  while (p + 3 <= end) {
    const t = pick(groupSlots.length);
    for (let k = 0; k < 3; k++) types[p + k] = t;
    groupSlots.push({ start: p, type: t });
    p += 3;
  }
  for (let i = p; i < end; i++) if (types[i] === undefined) types[i] = TYPE_IDS[0];
}

/** 同花色紧邻对数：越小说明牌型越分散、越需要规划槽位 */
function adjacency(types) {
  let n = 0;
  for (let i = 1; i < types.length; i++) if (types[i] === types[i - 1]) n++;
  return n;
}

/**
 * 在「证书仍然通过」的前提下打散花色序列（难度模型核心）。
 * 每次交换两张不同花色后：
 *   1) replayTypes 必须仍通过 → 至少存在一条完整通关路径，绝不制造死局；
 *   2) 用固定的贪心探针跑一局，只有「不更容易通关且失败进度更靠后」才保留。
 * 于是难度来自「牌型与可点顺序错配、需要规划底槽」，不是加牌数或随机死局。
 */
function scrambleSequence(types, lo, hi, rng, ctx) {
  const probeCards = ctx.cards.map((c) => ({ ...c, state: 'board' }));
  const probeById = {};
  for (let i = 0; i < probeCards.length; i++) probeById[probeCards[i].id] = probeCards[i];
  const setType = (pos) => {
    const c = probeById[ctx.order[pos]];
    if (c) c.type = types[pos];
  };
  for (let p = 0; p < types.length; p++) setType(p);
  const probeData = { cards: probeCards, _graph: ctx.graph };
  // 多个探针随机源，避免针对单一验收 RNG 过拟合（与 v1 的爬山思路一致）
  const probeSeeds = [
    (ctx.seed ^ 0x13579bdf) >>> 0,
    (ctx.seed ^ 0x2468ace0) >>> 0,
  ];
  const score = () => {
    let sum = 0;
    for (let k = 0; k < probeSeeds.length; k++) {
      const r = simulateRobot(probeData, makeRng(probeSeeds[k]), { mode: 'greedy' });
      sum += (r.win ? 1000 : 0) + (1 - r.pct) * 100;
    }
    return sum;
  };
  let best = score();
  const attempts = ctx.scrambleAttempts === undefined ? 16 : ctx.scrambleAttempts;
  for (let a = 0; a < attempts; a++) {
    const i = rng.int(lo, hi - 1);
    let j = Math.max(lo, Math.min(hi - 1, i + rng.int(-18, 18)));
    if (i === j || types[i] === types[j]) continue;
    const t = types[i];
    types[i] = types[j];
    types[j] = t;
    if (!replayTypes(types).ok) {
      const u = types[i]; types[i] = types[j]; types[j] = u;
      continue;
    }
    setType(i); setType(j);
    const s = score();
    if (s <= best) best = s;
    else {
      const u = types[i]; types[i] = types[j]; types[j] = u;
      setType(i); setType(j);
    }
  }
  return { adjacency: adjacency(types), greedyProbeScore: best };
}

/**
 * 生成花色序列。
 *  · 三带边界对齐 3 的倍数：n=240 → 60 / 132 / 240；n=48 → 12 / 27 / 48。
 *  · 上带 span=1（三张紧邻，同时可点）；中/下带 span=span(level)。
 *  · 每个组按「该组第一张牌所在区域」的 bias 挑牌型，实现牌型分布与布局联动。
 */
export function buildFunnelSequence(n, waves, suits, cfg, rng, ctx) {
  void waves;
  void suits;
  const level = ctx.level;
  const spec = LEVEL_MIX[level <= 1 ? 1 : 2];
  const topEnd = Math.max(3, Math.min(n - 6, align3(Math.round(n * BAND_RATIOS[0]))));
  const midEnd = Math.min(n - 3, topEnd + Math.max(3, align3(Math.round(n * BAND_RATIOS[1]))));
  const span = level === 1 ? 2 : Math.max(1, Math.min(3, (cfg && cfg.MID_SPAN) || FUNNEL.MID_SPAN));
  const remaining = mixFor(level);
  const tpl = templateFor(level);
  const biasByRegion = {};
  for (let zi = 0; zi < tpl.zones.length; zi++) biasByRegion[tpl.zones[zi].name] = tpl.zones[zi].bias;
  const order = ctx.order;
  const byId = ctx.byId;
  const usedOpening = {};
  for (let i = 0; i < TYPE_COUNT; i++) usedOpening[i] = false;

  // 第 1 关开局强制 4 种易识别牌型；第 2 关开局至少 10 种不同牌型
  const openingN = level === 1 ? spec.openingGroups : Math.min(10, Math.floor(topEnd / 3));
  const preferredFor = (pos) => {
    const c = byId[order[pos]];
    return (c && biasByRegion[c.region]) || biasByRegion.core || [];
  };
  let openingCount = 0;
  const pick = () => {
    // 组的第一张位置由 fillBatches 通过 groupSlots.length 推算不可靠，
    // 这里用「已分配组数」映射到对应位置
    return null;
  };
  void pick;

  const types = new Array(n);
  const groupSlots = [];
  const makePick = (forceDistinct) => () => {
    const pos = groupSlots.length * 3 < topEnd ? groupSlots.length * 3 : topEnd + (groupSlots.length - topEnd / 3) * 3;
    let type;
    if (forceDistinct && openingCount < openingN) {
      const pref = level === 1 ? spec.easyFirst : TYPE_IDS.slice();
      const idxPool = [];
      for (let i = 0; i < TYPE_IDS.length; i++) if (!usedOpening[i] && remaining[i] > 0) idxPool.push(i);
      const shuffled = rng.shuffle(idxPool);
      // 第一关优先用 easyFirst；第二关随机取不同种
      let chosen = -1;
      if (level === 1) {
        for (let i = 0; i < pref.length; i++) {
          const idx = TYPE_IDS.indexOf(pref[i]);
          if (idx >= 0 && !usedOpening[idx] && remaining[idx] > 0) { chosen = idx; break; }
        }
      }
      if (chosen < 0 && shuffled.length) chosen = shuffled[0];
      if (chosen >= 0) {
        usedOpening[chosen] = true;
        remaining[chosen] -= 1;
        type = TYPE_IDS[chosen];
        openingCount++;
      }
    }
    if (!type) {
      const pref = preferredFor(Math.min(n - 1, pos));
      type = pickGroupType(remaining, pref, rng, usedOpening);
    }
    return type;
  };

  // 上带：第 1 关三张紧邻（教学正反馈）；第 2 关同样用 span 批次，
  // 但强制前 10 组是 10 种不同牌型，于是开局可点牌花色多、却不能无脑连点。
  if (level === 1) {
    for (let p = 0; p + 3 <= topEnd; p += 3) {
      const t = makePick(true)();
      for (let k = 0; k < 3; k++) types[p + k] = t;
      groupSlots.push({ start: p, type: t });
    }
  } else {
    fillBatches(types, 0, topEnd, span, groupSlots, makePick(true), rng);
  }
  // 中带 / 下带：批次轮转；组内三张间距 = span，槽位峰值 = 3·span - 3（≤6）
  const pickMid = makePick(false);
  const pickBottom = makePick(false);
  fillBatches(types, topEnd, midEnd, span, groupSlots, pickMid, rng);
  fillBatches(types, midEnd, n, span, groupSlots, pickBottom, rng);

  // 证书约束下的打散：随机交换两张不同花色，只要 replayTypes 仍通过就保留。
  // 目的是让「同一时刻可点的牌」与「槽里已有的牌」不再高度同花色，
  // 从而提高对底槽空间的规划要求，而不是靠增加牌数或制造死局。
  let scramble = null;
  if (level === 2) scramble = scrambleSequence(types, topEnd, n, rng, ctx);
  for (let i = 0; i < n; i++) if (types[i] === undefined) types[i] = TYPE_IDS[0];

  let cert = replayTypes(types);
  let degraded = false;
  if (!cert.ok) {
    // 证书失败时退回「全部紧邻三消」的安全序列（每种张数仍为 3 的倍数）
    const safe = new Array(n);
    const safeRemaining = mixFor(level);
    for (let p = 0; p < n; p += 3) {
      let idx = -1;
      for (let i = 0; i < safeRemaining.length; i++) if (safeRemaining[i] > 0) { idx = i; break; }
      if (idx < 0) idx = 0;
      safeRemaining[idx] -= 1;
      const t = TYPE_IDS[idx];
      for (let k = 0; k < 3 && p + k < n; k++) safe[p + k] = t;
    }
    cert = replayTypes(safe);
    degraded = true;
    for (let i = 0; i < n; i++) types[i] = safe[i];
  }
  const topKinds = {};
  for (let i = 0; i < topEnd; i++) topKinds[types[i]] = 1;
  let topKindCount = 0;
  for (const k in topKinds) if (Object.prototype.hasOwnProperty.call(topKinds, k)) topKindCount++;
  return {
    types,
    bands: { top: [0, topEnd], mid: [topEnd, midEnd], bottom: [midEnd, n] },
    cert,
    degraded,
    topKinds: topKindCount,
    scramble,
    params: { topEnd, midEnd, span, ratios: BAND_RATIOS.slice(), level },
  };
}

/* ==================== 关卡构造 ==================== */

function baseCard(src) {
  return {
    id: src.id,
    x: src.x,
    y: src.y,
    w: TILE_W,
    h: TILE_H,
    layer: src.layer,
    region: src.region,
    zoneLayer: src.zoneLayer,
    z: src.z,
    type: TYPE_IDS[0],
    state: 'board',
    blocked: false,
    vx: null,
    vy: null,
    vScale: 1,
    appearAt: 0,
  };
}

/** 绘制顺序 = z 全序：layer 升序 → y 升序 → x 升序 */
function assignZ(cards) {
  const sorted = cards.slice().sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < sorted.length; i++) sorted[i].z = i;
}

function layerMeta(cards, layers) {
  const out = [];
  for (let li = 0; li < layers; li++) {
    const list = cards.filter((c) => c.layer === li);
    let ox = 360, oy = 500;
    if (list.length) {
      ox = list[0].x; oy = list[0].y;
      for (let i = 1; i < list.length; i++) {
        if (list[i].x < ox) ox = list[i].x;
        if (list[i].y < oy) oy = list[i].y;
      }
    }
    out.push({ li, ox, oy, n: list.length });
  }
  return out;
}

/**
 * 生成一关。签名与旧版一致：(level, seed, opt)。
 * 不传 seed 时：第 1 关随机，第 2 关从离线验收 seed 池抽（方案 b 不变）。
 */
export function generateLevel(level, seed, opt = {}) {
  const lv = level <= 1 ? 1 : 2;
  const s = (seed === undefined ? (lv === 1 ? randomSeed() : pickPoolSeed()) : seed) >>> 0;
  const rng = makeRng(s);
  const p = levelParams(level, () => rng.next());
  const cfg = { ...FUNNEL, ...(opt.funnel || {}) };
  p.funnel = cfg;
  const suits = suitsFor(p.level); // 16 种，两关一致
  const src = generateLayout(s, { level: p.level, plan: opt.plan || p.plan });
  const cards = src.map(baseCard);
  assignZ(cards);
  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  const graph = buildBlockerGraph(cards);
  const order = peelOrder(cards, () => rng.next());
  const funnel = buildFunnelSequence(cards.length, order.waves, suits, cfg, rng, {
    level: p.level, order, byId, cards, graph, seed: s,
  });
  const typeSeq = funnel.types;
  for (let i = 0; i < order.length; i++) {
    const c = byId[order[i]];
    if (c) c.type = typeSeq[i];
  }
  refreshBlocked(cards);
  const visible = cards.reduce((n, c) => n + (c.state === 'board' && !c.blocked ? 1 : 0), 0);
  const typeCounts = {};
  for (let i = 0; i < cards.length; i++) typeCounts[cards[i].type] = (typeCounts[cards[i].type] || 0) + 1;

  return {
    cards,
    layers: layerMeta(cards, p.layers),
    solution: order.slice(),
    order,
    waves: order.waves,
    bands: funnel.bands,
    funnelParams: funnel.params,
    typeSeq: typeSeq.slice(),
    typeCounts,
    certificate: replayTypes(typeSeq),
    degraded: funnel.degraded,
    topKinds: funnel.topKinds,
    params: p,
    seed: s,
    mode: p.mode,
    visible,
    scramble: funnel.scramble,
    _graph: graph,
    regions: regionStats(cards),
    crossOcclusion: crossOcclusionStats(cards),
  };
}

/* ==================== 五项自动检查（需求 4.3） ==================== */

/** 综合校验：牌型数 / 可达性 / 三消张数 / 布局一致 / 遮挡合法 */
export function validateLevel(data) {
  const issues = [];
  const cards = data.cards;
  const reg = validateRegistry();
  if (!reg.ok) issues.push('牌型注册表非法：' + reg.issues.join('；'));
  // 1) 16 种牌型全部出现
  const seen = {};
  for (let i = 0; i < cards.length; i++) seen[cards[i].type] = 1;
  const kinds = [];
  for (const k in seen) if (Object.prototype.hasOwnProperty.call(seen, k)) kinds.push(k);
  if (kinds.length !== TYPE_COUNT) issues.push(`牌型数 ${kinds.length} ≠ 16`);
  // 2) 每种张数 %3 == 0 且 > 0
  for (let i = 0; i < TYPE_IDS.length; i++) {
    const n = cards.reduce((a, c) => a + (c.type === TYPE_IDS[i] ? 1 : 0), 0);
    if (n === 0 || n % 3 !== 0) issues.push(`${TYPE_IDS[i]} 张数 ${n} 不是 3 的倍数`);
  }
  // 3) 总数与布局一致
  if (cards.length !== LEVEL_SPEC[data.params.level].cardCount) {
    issues.push(`牌数 ${cards.length} ≠ 规格 ${LEVEL_SPEC[data.params.level].cardCount}`);
  }
  // 4) 所有牌都在几何剥离顺序里（可达）
  const inOrder = {};
  for (let i = 0; i < data.order.length; i++) inOrder[data.order[i]] = 1;
  let unreachable = 0;
  for (let i = 0; i < cards.length; i++) if (!inOrder[cards[i].id]) unreachable++;
  if (unreachable) issues.push(`${unreachable} 张牌不在剥离顺序里`);
  // 5) 遮挡合法：同层零重叠、被压牌确实被更高 z 牌覆盖、证书与几何 verify
  if (sameLayerOverlapCount(cards) !== 0) issues.push('存在同层重叠');
  const g = data._graph || buildBlockerGraph(cards);
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const blocked = g.blockers[c.id].length > 0;
    if (blocked !== !!c.blocked) { issues.push(`牌 ${c.id} blocked 标记与几何不一致`); break; }
  }
  if (!data.certificate.ok) issues.push('花色序列证书失败');
  if (!verify(data)) issues.push('几何可解性 verify 失败');
  return {
    ok: issues.length === 0,
    issues,
    kinds: kinds.length,
    typeCounts: data.typeCounts,
    total: cards.length,
    visible: data.visible,
  };
}

/* ==================== 遮挡（单一几何定义） ==================== */

export function refreshBlocked(cards, L) {
  void L;
  const alive = cards.filter((c) => c.state === 'board');
  for (let i = 0; i < alive.length; i++) alive[i].blocked = isBlocked(alive[i], alive);
  return alive;
}

export function countVisible(cards, L) {
  refreshBlocked(cards, L);
  return cards.reduce((n, c) => n + (c.state === 'board' && !c.blocked ? 1 : 0), 0);
}

export function coverRatioOf(card, cards, L) {
  void L;
  let keep = 1;
  for (let i = 0; i < cards.length; i++) {
    const o = cards[i];
    if (o === card || o.z <= card.z || o.state === 'cleared') continue;
    const ix = overlapArea(card, o);
    if (ix <= 0) continue;
    keep *= 1 - Math.min(1, ix / TILE_AREA);
  }
  return 1 - keep;
}

export function isCovered(card, alive) {
  return isBlocked(card, alive);
}

/* ==================== 可解性证书（带几何） ==================== */

export function verify(levelData) {
  const cards = levelData.cards.map((c) => ({ ...c, state: 'board', blocked: false }));
  const graph = levelData._graph || buildBlockerGraph(cards);
  const byId = {};
  const indeg = {};
  for (let i = 0; i < cards.length; i++) {
    byId[cards[i].id] = cards[i];
    indeg[cards[i].id] = graph.blockers[cards[i].id].length;
  }
  const order = levelData.solution || [];
  const slot = [];
  for (let k = 0; k < order.length; k++) {
    const c = byId[order[k]];
    if (!c || c.state !== 'board' || indeg[c.id] !== 0) return false;
    c.state = 'slot';
    const dep = graph.dependents[c.id];
    for (let i = 0; i < dep.length; i++) indeg[dep[i]] -= 1;
    slot.push(c);
    const cnt = {};
    for (let i = 0; i < slot.length; i++) cnt[slot[i].type] = (cnt[slot[i].type] || 0) + 1;
    let hit = null;
    for (const t in cnt) {
      if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) { hit = t; break; }
    }
    if (hit !== null) {
      let need = 3;
      for (let i = 0; i < slot.length && need > 0; i++) {
        if (slot[i].type === hit) { slot[i].state = 'cleared'; slot.splice(i, 1); i--; need--; }
      }
    }
    if (slot.length >= SLOT_CAPACITY) return false;
  }
  return cards.every((c) => c.state === 'cleared') && slot.length === 0;
}

/** 兼容旧工具：生成期爬山开关（v2 默认关闭，难度靠离线 seed 池） */
export function hillClimb(types, ctx, rng, steps, probes) {
  void ctx; void rng; void steps; void probes;
  return { types: types.slice(), greedyRate: 0 };
}
