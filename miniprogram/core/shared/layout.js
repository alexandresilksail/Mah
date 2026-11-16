/**
 * 牌桌几何工具（纯 JS，零 DOM）。
 *
 * 本轮（第 1.1 节）**删除整条静态模板路径**：
 *   · 不再有 layout_templates.js / TEMPLATES / templateFor / validateTemplate；
 *   · 不再有 generateLayout / generateEasyLayout / planForSeed / layoutReport；
 *   · 「同一档位换 seed 几何必须相同」的旧假设彻底作废 —— 几何现在完全由
 *     layout_profiles.js 按 seed 程序化生成（每层 seed 生长的连通团块）。
 *
 * 本文件只保留**几何判定原语**，它们与布局怎么生成无关，是生成器、机器人、
 * 校验器、离线种子池工具共用的唯一实现：
 *   overlapArea / isBlocked / hasSupport / isHalfLattice
 *   buildBlockerGraph / countComponents / sameLayerOverlapCount / crossOcclusionStats
 *   regionStats / pressureStats / peelOrder
 *
 * 不变的几何硬契约：
 *   · 坐标全落在 (LATTICE_X, LATTICE_Y) = (33,44) 半格晶格上，零随机抖动；
 *   · 同层相交面积恒为 0（每个全局层号只属于一个区域的一层）；
 *   · 非底层牌必须被「更低层」的至少一张牌以 >10% 面积支撑；
 *   · 遮挡 = 存在 z 更高的牌与本牌相交面积 > 阈值；
 *   · z 全序：layer 升序 → y 升序 → x 升序，与 generator.assignZ 完全一致。
 */
import {
  TILE_W, TILE_H, TILE_AREA, LATTICE_X, LATTICE_Y,
  OVERLAP_THRESHOLD, CONNECT_PAD,
} from './config.js';

export const LAYER_OFFSETS = [[1, 1], [0, 1], [1, 0]];

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

/* ==================== 几何工具 ==================== */

export function overlapArea(a, b) {
  const ix = Math.min(a.x + TILE_W, b.x + TILE_W) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + TILE_H, b.y + TILE_H) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}

export function isBlocked(card, alive) {
  for (let i = 0; i < alive.length; i++) {
    const o = alive[i];
    if (o === card || o.z <= card.z) continue;
    if (overlapArea(card, o) > THRESH_AREA) return true;
  }
  return false;
}

/** 支撑：任意更低层的一张牌与它相交面积 > 阈值即可（允许跨区域支撑） */
export function hasSupport(card, lower) {
  for (let i = 0; i < lower.length; i++) {
    if (overlapArea(card, lower[i]) > THRESH_AREA) return true;
  }
  return false;
}

export function isHalfLattice(cards) {
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (Math.abs(c.x / LATTICE_X - Math.round(c.x / LATTICE_X)) > 1e-9) return false;
    if (Math.abs(c.y / LATTICE_Y - Math.round(c.y / LATTICE_Y)) > 1e-9) return false;
  }
  return true;
}

/** 谁压住谁：blockers[lo] = 压住它的更高 z 牌；dependents[hi] = 被它压住的牌 */
export function buildBlockerGraph(cards) {
  const blockers = {};
  const dependents = {};
  for (let i = 0; i < cards.length; i++) {
    blockers[cards[i].id] = [];
    dependents[cards[i].id] = [];
  }
  for (let i = 0; i < cards.length; i++) {
    const a = cards[i];
    for (let j = i + 1; j < cards.length; j++) {
      const b = cards[j];
      if (overlapArea(a, b) <= THRESH_AREA) continue;
      const lo = a.z < b.z ? a : b;
      const hi = a.z < b.z ? b : a;
      blockers[lo.id].push(hi.id);
      dependents[hi.id].push(lo.id);
    }
  }
  return { blockers, dependents };
}

/** 矩形外扩 pad 后的连通分量数 */
export function countComponents(cards, pad = CONNECT_PAD) {
  const n = cards.length;
  if (n === 0) return 0;
  const parent = new Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const find = (x) => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  const union = (a, b) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };
  const W2 = TILE_W + pad * 2;
  const H2 = TILE_H + pad * 2;
  for (let i = 0; i < n; i++) {
    const a = cards[i];
    for (let j = i + 1; j < n; j++) {
      const b = cards[j];
      if (Math.abs(a.x - b.x) < W2 && Math.abs(a.y - b.y) < H2) union(i, j);
    }
  }
  let roots = 0;
  for (let i = 0; i < n; i++) if (find(i) === i) roots++;
  return roots;
}

/** 同层重叠对数（必须为 0） */
export function sameLayerOverlapCount(cards) {
  let n = 0;
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].layer !== cards[j].layer) continue;
      if (overlapArea(cards[i], cards[j]) > 0) n++;
    }
  }
  return n;
}

/** 跨区域遮挡对数：不同 region 的两张牌，一张压住另一张 */
export function crossOcclusionStats(cards) {
  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  const g = buildBlockerGraph(cards);
  let pairs = 0;
  const regions = {};
  for (const id in g.blockers) {
    if (!Object.prototype.hasOwnProperty.call(g.blockers, id)) continue;
    const lo = byId[id];
    for (let k = 0; k < g.blockers[id].length; k++) {
      const hi = byId[g.blockers[id][k]];
      if (lo && hi && lo.region !== hi.region) {
        pairs++;
        const key = lo.region + '<' + hi.region;
        regions[key] = (regions[key] || 0) + 1;
      }
    }
  }
  return { pairs, regions };
}

/** 区域统计：张数、开局可点数、层数 */
export function regionStats(cards) {
  const g = buildBlockerGraph(cards);
  const out = {};
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (!out[c.region]) out[c.region] = { cards: 0, free: 0, layers: {}, minLayer: 99, maxLayer: -1 };
    const r = out[c.region];
    r.cards++;
    if (g.blockers[c.id].length === 0) r.free++;
    r.layers[c.layer] = (r.layers[c.layer] || 0) + 1;
    if (c.layer < r.minLayer) r.minLayer = c.layer;
    if (c.layer > r.maxLayer) r.maxLayer = c.layer;
  }
  return out;
}

/**
 * 压迫感统计（test.js / tune_pool.mjs 共用）。
 *  freeRatio / topShare / bottomCovered / avgPressDepth / longestChain
 */
export function pressureStats(cards) {
  const g = buildBlockerGraph(cards);
  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  const sorted = cards.slice().sort((a, b) => b.z - a.z);
  const depth = {};
  let longestChain = 0;
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    let m = 0;
    const bl = g.blockers[c.id];
    for (let k = 0; k < bl.length; k++) if ((depth[bl[k]] || 0) > m) m = depth[bl[k]];
    depth[c.id] = m + 1;
    if (m + 1 > longestChain) longestChain = m + 1;
  }
  let pressSum = 0;
  const free = [];
  let maxLayer = 0;
  for (let i = 0; i < cards.length; i++) if (cards[i].layer > maxLayer) maxLayer = cards[i].layer;
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    pressSum += g.blockers[c.id].length;
    if (g.blockers[c.id].length === 0) free.push(c);
  }
  const bottom = cards.filter((c) => c.layer <= 1);
  const bottomCovered = bottom.filter((c) => g.blockers[c.id].length > 0).length;
  const topFree = free.filter((c) => c.layer >= maxLayer - 2).length;
  return {
    total: cards.length,
    free: free.length,
    freeRatio: cards.length ? free.length / cards.length : 0,
    topShare: free.length ? topFree / free.length : 0,
    bottomCovered: bottom.length ? bottomCovered / bottom.length : 1,
    avgPressDepth: cards.length ? pressSum / cards.length : 0,
    longestChain,
    maxLayer,
    freeIds: free.map((c) => c.id),
    graph: g,
  };
}

/** 剥离顺序：反复取当前未遮挡牌，得到合法全消除顺序；波内随机打散 */
export function peelOrder(cards, rand) {
  const g = buildBlockerGraph(cards);
  const indeg = {};
  const byId = {};
  let free = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    byId[c.id] = c;
    indeg[c.id] = g.blockers[c.id].length;
    if (indeg[c.id] === 0) free.push(c);
  }
  const order = [];
  const waves = [];
  const r = rand || Math.random;
  while (free.length) {
    const batch = free.slice();
    free = [];
    const key = {};
    for (let i = 0; i < batch.length; i++) key[batch[i].id] = r();
    batch.sort((a, b) => key[a.id] - key[b.id]);
    waves.push([order.length, order.length + batch.length]);
    for (let i = 0; i < batch.length; i++) order.push(batch[i].id);
    for (let i = 0; i < batch.length; i++) {
      const dep = g.dependents[batch[i].id];
      for (let k = 0; k < dep.length; k++) {
        const d = dep[k];
        indeg[d] -= 1;
        if (indeg[d] === 0) free.push(byId[d]);
      }
    }
  }
  if (order.length < cards.length) {
    const seen = {};
    for (let i = 0; i < order.length; i++) seen[order[i]] = 1;
    const rest = cards.filter((c) => !seen[c.id]).sort((a, b) => b.z - a.z);
    if (rest.length) waves.push([order.length, order.length + rest.length]);
    for (let i = 0; i < rest.length; i++) order.push(rest[i].id);
  }
  order.waves = waves;
  return order;
}
