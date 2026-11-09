/**
 * 单堆几何（纯 JS，零 DOM 依赖）。
 *
 * ── 本轮重做的硬规则 ──────────────────────────────────────────────
 * · 两关都只有一个牌堆：没有侧堆、没有多簇、没有簇间压叠、没有任何 x/y 随机抖动。
 * · 同层牌坐标 = 该层原点 + (i·TILE_W, j·TILE_H)，所以同层两两相交面积恒为 0。
 * · 层原点 = 上一层原点 + 从 LAYER_OFFSETS 里按 seed 随机选的错位向量，
 *   用整数半格单位累加，于是所有坐标都落在 (LATTICE_X, LATTICE_Y) 晶格上。
 * · 每层用「随机生长」在晶格上取一个 4-邻接连通团块，边缘自然留缺口，不是方块。
 * · 每张非底层牌必须与下一层至少一张牌相交面积 > 牌面积 × OVERLAP_THRESHOLD（有支撑）。
 * · 所有牌矩形完整落在 BOARD_BAND 内，牌堆整体居中（平移量也是半格整数倍）。
 *
 * 对外函数：
 *   generateLayout(seed, opt)      → [{ id, x, y, layer }]
 *   generateEasyLayout(seed, opt)  → 第 1 关的薄壳（转发到 generateLayout）
 *   peelOrder(cards, rand)         → 合法全消除顺序，波内随机打散，附 .waves
 *   countComponents(cards, pad)    → 矩形各外扩 pad 后的连通分量数
 *   overlapArea / isBlocked / buildBlockerGraph / hasSupport / isHalfLattice
 */
import {
  TILE_W,
  TILE_H,
  TILE_AREA,
  LATTICE_X,
  LATTICE_Y,
  OVERLAP_THRESHOLD,
  BOARD_BAND,
  BOARD_CX,
  BOARD_CY,
  CONNECT_PAD,
  LEVEL_SPEC,
  LAYER_OFFSETS,
} from './config.js';
import { makeRng, randomSeed } from './rng.js';

export { LAYER_OFFSETS };

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

/* ==================== 几何工具 ==================== */

/** 两张牌矩形的相交面积（a/b 只需 x、y） */
export function overlapArea(a, b) {
  const ix = Math.min(a.x + TILE_W, b.x + TILE_W) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + TILE_H, b.y + TILE_H) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}

/**
 * 遮挡判定（几何定义，不是层数比较）：
 * 存在 z 更高且仍在盘面的牌，与本牌相交面积 > TILE_AREA × OVERLAP_THRESHOLD。
 */
export function isBlocked(card, alive) {
  for (let i = 0; i < alive.length; i++) {
    const o = alive[i];
    if (o === card || o.z <= card.z) continue;
    if (overlapArea(card, o) > THRESH_AREA) return true;
  }
  return false;
}

/** 非底层牌的支撑：下一层至少有一张牌与它相交面积 > 阈值 */
export function hasSupport(card, lower) {
  for (let i = 0; i < lower.length; i++) {
    if (overlapArea(card, lower[i]) > THRESH_AREA) return true;
  }
  return false;
}

/** 所有坐标是否都落在半格晶格上（全局基准为 0，坐标均为整数） */
export function isHalfLattice(cards) {
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (Math.abs(c.x / LATTICE_X - Math.round(c.x / LATTICE_X)) > 1e-9) return false;
    if (Math.abs(c.y / LATTICE_Y - Math.round(c.y / LATTICE_Y)) > 1e-9) return false;
  }
  return true;
}

/**
 * 预先建好「谁压住谁」的图。
 * blockers[c.id] = 压住 c 的更高 z 的牌 id 数组；dependents[o.id] = 被 o 压住的牌 id 数组。
 */
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

/**
 * 矩形各外扩 pad 像素后的连通分量数。
 * 相交（含边界接触）即连一条边；用并查集数根。
 */
export function countComponents(cards, pad = CONNECT_PAD) {
  const n = cards.length;
  if (n === 0) return 0;
  const parent = new Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };
  const W2 = TILE_W + pad * 2;
  const H2 = TILE_H + pad * 2;
  for (let i = 0; i < n; i++) {
    const a = cards[i];
    for (let j = i + 1; j < n; j++) {
      const b = cards[j];
      const dx = Math.abs((a.x - pad) - (b.x - pad));
      const dy = Math.abs((a.y - pad) - (b.y - pad));
      if (dx < W2 && dy < H2) union(i, j);
    }
  }
  let roots = 0;
  for (let i = 0; i < n; i++) if (find(i) === i) roots++;
  return roots;
}

/**
 * 模拟剥离顺序：反复取出当前「未被遮挡」的牌，得到一条合法的全消除顺序。
 * 每一步取的牌在取走那一瞬间没有被任何留在盘面的牌压住，因此按 order 依次点牌
 * 是一条真实存在的通关路径（槽位约束由花色分配的可解性证书保证）。
 *
 * 「同一波可点牌之间随机打散」：波内用随机 key 排序，不按 z、不按坐标，
 * 于是前段 order 只是一批同时可点牌的随机排列，而不是自上而下的固定顺序。
 *
 * @returns {Array} card id 的全序数组，附 .waves = [[start,end), ...]
 */
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
  // 理论上不会剩下（blockers 一定是 z 更高的牌，不可能成环）。真出现了按 z 降序补齐。
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

/* ==================== 单堆布局 ==================== */

/**
 * 在晶格上随机生长一个 4-邻接连通团块。
 * 候选格必须：未选 + 完整落在 BOARD_BAND 内 + （非底层时）被下一层支撑。
 * 每次从边界候选里随机取一个，因此团块边缘自然留缺口，不会长成规整方块。
 */
function growCluster(target, u0, v0, lower, ox, oy, rng) {
  const key = (u, v) => u + ',' + v;
  const chosen = new Map();
  const inFrontier = {};
  const frontier = [];

  const rectOf = (u, v) => ({ x: ox + u * TILE_W, y: oy + v * TILE_H });
  const inBounds = (u, v) => {
    const r = rectOf(u, v);
    return (
      r.x >= BOARD_BAND.left &&
      r.x + TILE_W <= BOARD_BAND.right &&
      r.y >= BOARD_BAND.top &&
      r.y + TILE_H <= BOARD_BAND.bottom
    );
  };
  const supported = (u, v) => {
    if (lower.length === 0) return true;
    return hasSupport(rectOf(u, v), lower);
  };
  const valid = (u, v) => !chosen.has(key(u, v)) && inBounds(u, v) && supported(u, v);

  const pushFrontier = (u, v) => {
    const nb = [[u + 1, v], [u - 1, v], [u, v + 1], [u, v - 1]];
    for (let i = 0; i < nb.length; i++) {
      const a = nb[i][0];
      const b = nb[i][1];
      const k = key(a, b);
      if (inFrontier[k] || chosen.has(k)) continue;
      if (inBounds(a, b) && supported(a, b)) {
        inFrontier[k] = 1;
        frontier.push({ u: a, v: b });
      }
    }
  };
  const add = (u, v) => {
    chosen.set(key(u, v), { u, v });
    pushFrontier(u, v);
  };

  // 种子：优先用中心格；若不满足支撑，就在附近找一个合法格
  let seed = null;
  for (let ring = 0; ring <= 4 && !seed; ring++) {
    for (let du = -ring; du <= ring && !seed; du++) {
      for (let dv = -ring; dv <= ring; dv++) {
        if (Math.max(Math.abs(du), Math.abs(dv)) !== ring) continue;
        if (valid(u0 + du, v0 + dv)) {
          seed = { u: u0 + du, v: v0 + dv };
          break;
        }
      }
    }
  }
  if (!seed) seed = { u: u0, v: v0 };
  add(seed.u, seed.v);

  // 随机生长
  let guard = 0;
  while (chosen.size < target && frontier.length && guard++ < target * 60) {
    const idx = rng.int(0, frontier.length - 1);
    const cand = frontier[idx];
    frontier[idx] = frontier[frontier.length - 1];
    frontier.pop();
    delete inFrontier[key(cand.u, cand.v)];
    if (!valid(cand.u, cand.v)) continue;
    add(cand.u, cand.v);
  }

  // 确定性补足：frontier 耗尽（或边界/支撑挡住）时，扫描中心附近的合法空格。
  // 数量必须精确等于层计划，所以这一步不能省。
  if (chosen.size < target) {
    for (let ring = 1; chosen.size < target && ring <= 12; ring++) {
      const candidates = [];
      for (let du = -ring; du <= ring; du++) {
        for (let dv = -ring; dv <= ring; dv++) {
          if (Math.max(Math.abs(du), Math.abs(dv)) !== ring) continue;
          const u = seed.u + du;
          const v = seed.v + dv;
          if (valid(u, v)) candidates.push({ u, v });
        }
      }
      // 同环内用 rng 打散，仍保持「边缘有缺口」的观感
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        const t = candidates[i];
        candidates[i] = candidates[j];
        candidates[j] = t;
      }
      for (let i = 0; i < candidates.length && chosen.size < target; i++) {
        add(candidates[i].u, candidates[i].v);
      }
    }
  }

  const out = [];
  chosen.forEach((c) => out.push(c));
  return out;
}

/**
 * 单堆布局主函数。
 * @param {number} seed 可复现随机种子
 * @param {object} opt { level: 1|2, plan: 层计划数组, startId }
 * @returns {Array} [{ id, x, y, layer }]
 */
export function generateLayout(seed, opt) {
  const o = opt || {};
  const level = o.level === 1 ? 1 : 2;
  const spec = LEVEL_SPEC[level];
  const plan = o.plan || spec.plan;
  const layers = plan.length;
  const startId = o.startId === undefined ? 0 : o.startId;
  const rng = makeRng((((seed === undefined ? randomSeed() : seed) >>> 0) ^ (level === 1 ? 0x1f2e3d4c : 0)) >>> 0);

  // 层原点（半格单位），逐层累加随机错位向量
  const origins = [{ kx: 0, ky: 0 }];
  for (let li = 1; li < layers; li++) {
    const d = LAYER_OFFSETS[rng.int(0, LAYER_OFFSETS.length - 1)];
    origins.push({ kx: origins[li - 1].kx + d[0], ky: origins[li - 1].ky + d[1] });
  }

  const byLayer = [];
  for (let li = 0; li < layers; li++) {
    const ox = origins[li].kx * LATTICE_X;
    const oy = origins[li].ky * LATTICE_Y;
    // 每层的种子格都对准牌桌中心，于是自然「上窄下宽」且整堆居中
    const u0 = Math.round((BOARD_CX - TILE_W / 2 - ox) / TILE_W);
    const v0 = Math.round((BOARD_CY - TILE_H / 2 - oy) / TILE_H);
    const lower = li > 0 ? byLayer[li - 1] : [];
    const cells = growCluster(plan[li], u0, v0, lower, ox, oy, rng);
    byLayer.push(
      cells.map((cell) => ({
        x: ox + cell.u * TILE_W,
        y: oy + cell.v * TILE_H,
        u: cell.u,
        v: cell.v,
      }))
    );
  }

  const cards = [];
  for (let li = 0; li < layers; li++) {
    for (let i = 0; i < byLayer[li].length; i++) {
      cards.push({ x: byLayer[li][i].x, y: byLayer[li][i].y, layer: li });
    }
  }

  // 整体居中：平移量必须是半格整数倍，才能保持晶格；同时 clamp 到不越界
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].x < minX) minX = cards[i].x;
    if (cards[i].x > maxX) maxX = cards[i].x;
    if (cards[i].y < minY) minY = cards[i].y;
    if (cards[i].y > maxY) maxY = cards[i].y;
  }
  const cx = (minX + maxX + TILE_W) / 2;
  const cy = (minY + maxY + TILE_H) / 2;
  const kxMin = Math.ceil((BOARD_BAND.left - minX) / LATTICE_X);
  const kxMax = Math.floor((BOARD_BAND.right - maxX - TILE_W) / LATTICE_X);
  const kyMin = Math.ceil((BOARD_BAND.top - minY) / LATTICE_Y);
  const kyMax = Math.floor((BOARD_BAND.bottom - maxY - TILE_H) / LATTICE_Y);
  let kx = Math.round((BOARD_CX - cx) / LATTICE_X);
  let ky = Math.round((BOARD_CY - cy) / LATTICE_Y);
  kx = Math.max(kxMin, Math.min(kxMax, kx));
  ky = Math.max(kyMin, Math.min(kyMax, ky));
  const dx = kx * LATTICE_X;
  const dy = ky * LATTICE_Y;
  for (let i = 0; i < cards.length; i++) {
    cards[i].x += dx;
    cards[i].y += dy;
  }

  // 统一编号：layer 升序 → y 升序 → x 升序（绘制顺序也是这一套）
  cards.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < cards.length; i++) cards[i].id = startId + i;
  return cards;
}

/**
 * 第 1 关薄壳：保留旧导出名，实际走同一套单堆晶格几何。
 * 24 张 / 3 层 / 12+8+4。
 */
export function generateEasyLayout(seed, opt) {
  const o = { ...(opt || {}), level: 1 };
  return generateLayout(seed, o);
}
