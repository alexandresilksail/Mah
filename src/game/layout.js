/**
 * 单堆几何（纯 JS，零 DOM 依赖）。
 *
 * ── 第 3 轮：第 2 关改成「葫芦轮廓」 ────────────────────────────────
 * · 层张数基准 54/48/44/36/22/12/6（总和 222），每层按 seed 在 ±2 内浮动，
 *   最后归一化回 222；不再所有 seed 共用一张写死的 plan 表。
 * · 参考列数 9/9/10/10/7/5/3；第 2、3 层是「肚子」，
 *   包围盒宽度 ≥ 第 0 层宽度 + TILE_W/2，且不超出 BOARD_BAND。
 * · 第 5、6 层是完整无缺口矩形、水平居中；第 4 层填充率 ≥85%；
 *   第 0–3 层填充率 80%~90%，每层边缘至少 2 处缺口，不是长方形。
 * · 同层坐标 = 层原点 + (u·TILE_W, v·TILE_H)，同层相交面积恒为 0。
 * · 层原点只取 0 / 半格（x: 0 或 LATTICE_X，y: 0 或 LATTICE_Y），
 *   逐层固定交替，**没有任何随机抖动**；所有坐标落在半格晶格上。
 * · 每张非底层牌必须与下一层至少一张牌相交面积 > 10%（有支撑）。
 * · 缺口用「删除法」挑：优先删掉对下层覆盖没有贡献的格点，
 *   于是底层几乎全被压住，亮牌集中在顶部（压迫感指标由构造保证）。
 *
 * 对外函数：
 *   generateLayout(seed, opt)      → [{ id, x, y, layer, z }]
 *   generateEasyLayout(seed, opt)  → 第 1 关薄壳（保持上一版几何，不动）
 *   planForSeed(seed)              → 第 2 关按 seed 浮动的层计划 + 网格
 *   peelOrder(cards, rand)         → 合法全消除顺序，波内随机打散，附 .waves
 *   pressureStats(cards)           → 压迫感五项指标 + 遮挡图最长链
 *   countComponents / overlapArea / isBlocked / buildBlockerGraph /
 *   hasSupport / isHalfLattice
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
  LAYER_SHAPE,
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

/** 遮挡判定（几何定义）：存在 z 更高的牌与本牌相交面积 > 阈值 */
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

/** 所有坐标是否都落在半格晶格上 */
export function isHalfLattice(cards) {
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (Math.abs(c.x / LATTICE_X - Math.round(c.x / LATTICE_X)) > 1e-9) return false;
    if (Math.abs(c.y / LATTICE_Y - Math.round(c.y / LATTICE_Y)) > 1e-9) return false;
  }
  return true;
}

/** 「谁压住谁」的图。blockers[lo] = 压住 lo 的更高 z 的牌；dependents[hi] = 被 hi 压住的牌 */
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

/** 矩形各外扩 pad 像素后的连通分量数（相交即连边，并查集） */
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
      if (Math.abs(a.x - b.x) < W2 && Math.abs(a.y - b.y) < H2) union(i, j);
    }
  }
  let roots = 0;
  for (let i = 0; i < n; i++) if (find(i) === i) roots++;
  return roots;
}

/**
 * 压迫感统计（test.js / tune_pool.mjs 共用）。
 *  · freeRatio        ：开局可点牌 / 总数
 *  · topShare         ：可点牌里第 4–6 层的占比
 *  · bottomCovered    ：第 0–1 层被压住的比例
 *  · avgPressDepth    ：平均「压住该牌的牌数」= blockers[id].length 的均值
 *  · longestChain     ：遮挡图（DAG，低 z → 高 z）最长链的节点数 = 7 层叠满
 *  · free / byLayer   ：明细，供发牌用
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
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    pressSum += g.blockers[c.id].length;
    if (g.blockers[c.id].length === 0) free.push(c);
  }
  const bottom = cards.filter((c) => c.layer <= 1);
  const bottomCovered = bottom.filter((c) => g.blockers[c.id].length > 0).length;
  const topFree = free.filter((c) => c.layer >= 4).length;
  return {
    total: cards.length,
    free: free.length,
    freeRatio: cards.length ? free.length / cards.length : 0,
    topShare: free.length ? topFree / free.length : 0,
    bottomCovered: bottom.length ? bottomCovered / bottom.length : 1,
    avgPressDepth: cards.length ? pressSum / cards.length : 0,
    longestChain,
    freeIds: free.map((c) => c.id),
    graph: g,
  };
}

/**
 * 模拟剥离顺序：反复取出当前「未被遮挡」的牌，得到一条合法的全消除顺序。
 * 同一波可点牌之间用随机 key 打散，不按 z、不按坐标。
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

/* ==================== 第 2 关：葫芦轮廓 ==================== */

/** 层原点相位（单位 px）：x 只取 0 或半格，y 逐层 0 / 半格交替 —— 零抖动 */
const PHASE_X = [0, 0, LATTICE_X, LATTICE_X, LATTICE_X, LATTICE_X, 0];
const PHASE_Y = [0, LATTICE_Y, 0, LATTICE_Y, 0, LATTICE_Y, 0];

/**
 * 为某一层挑 (cols, rows)：
 *  · 第 0–3 层：填充率 80%~90%，且至少能留 2 个边缘缺口；
 *  · 第 4 层：填充率 ≥85%；
 *  · 第 5、6 层：完整矩形（cols*rows === n），水平居中；
 *  · 第 2、3 层（肚子）：宽度 ≥ 第 0 层宽度 + bellyExtraPx；
 *  · 第 0、1 层列数 ≤9，否则肚子不可能更宽；
 *  · 所有层都放得进 BOARD_BAND 的宽度。
 */
function chooseGrid(n, li) {
  const base = LAYER_SHAPE.colsBase[li];
  const out = [];
  for (let cols = Math.max(2, base - 3); cols <= 10; cols++) {
    if (cols * TILE_W > BOARD_BAND.right - BOARD_BAND.left) continue;
    // 第 0/1 层固定 9 列、第 2/3 层固定 10 列：
    // 上层只比下层多出半格（33px）才有支撑，多出一整列就会悬空。
    if (li <= 1 && cols !== 9) continue;
    if ((li === 2 || li === 3) && cols !== 10) continue;
    // 半格错位下 n 行上层最多能支撑 n+1 行下层：第 5、6 层行数必须收住，
    // 否则顶层外沿会出现「悬空牌」（没有下一层支撑）。
    const maxRows = li === 6 ? 2 : li === 5 ? 3 : 7;
    for (let rows = li >= 5 ? 2 : 1; rows <= maxRows; rows++) {
      const cells = cols * rows;
      if (n > cells) continue;
      const fill = n / cells;
      let ok;
      if (li >= 5) ok = cells === n;
      else if (li === 4) ok = fill >= LAYER_SHAPE.topFillMin && fill <= 1;
      else ok = fill >= LAYER_SHAPE.fillMin && fill <= LAYER_SHAPE.fillMax &&
        cells - n >= LAYER_SHAPE.minEdgeGaps;
      if (!ok) continue;
      // 第 0–4 层倾向宽（压住下层、减少底层亮牌）；
      // 第 5、6 层倾向窄而矮（顶层简单，让第 4 层露出足够亮牌）。
      const score = li >= 5
        ? Math.abs(cols - base) * 4 + cols * 3 + Math.abs(rows - 2) * 3
        : Math.abs(cols - base) * 6 - cols * 1.5 + Math.abs(rows - Math.round(n / cols / 0.85)) * 0.4;
      out.push({ cols, rows, cells, fill, score });
    }
  }
  out.sort((a, b) => a.score - b.score);
  return out[0] || null;
}

/**
 * 按 seed 生成层计划：每层在基准 ±2 内浮动，总和严格 222；
 * 只有每层都能找到合规网格、且肚子宽度达标才接受，否则重新采样。
 */
export function planForSeed(seed) {
  const base = LAYER_SHAPE.planBase;
  const total = base.reduce((a, b) => a + b, 0);
  const rng = makeRng((((seed >>> 0) ^ 0x5eedc0de) >>> 0));
  for (let attempt = 0; attempt < 500; attempt++) {
    const delta = [];
    for (let i = 0; i < base.length; i++) delta.push(rng.int(-LAYER_SHAPE.planJitter, LAYER_SHAPE.planJitter));
    let err = delta.reduce((a, b) => a + b, 0);
    let guard = 0;
    while (err !== 0 && guard++ < 300) {
      const i = rng.int(0, base.length - 1);
      const step = err > 0 ? -1 : 1;
      if (Math.abs(delta[i] + step) <= LAYER_SHAPE.planJitter) {
        delta[i] += step;
        err += step;
      }
    }
    if (err !== 0) continue;
    const plan = base.map((b, i) => b + delta[i]);
    if (plan.reduce((a, b) => a + b, 0) !== total) continue;
    const grids = [];
    let ok = true;
    for (let li = 0; li < plan.length; li++) {
      const g = chooseGrid(plan[li], li);
      if (!g) { ok = false; break; }
      grids.push(g);
    }
    if (!ok) continue;
    const w0 = grids[0].cols * TILE_W;
    if (grids[2].cols * TILE_W < w0 + LAYER_SHAPE.bellyExtraPx) continue;
    if (grids[3].cols * TILE_W < w0 + LAYER_SHAPE.bellyExtraPx) continue;
    return { plan, grids, delta };
  }
  // 兜底（理论上到不了）：基准表 + 固定网格
  const plan = base.slice();
  const grids = plan.map((n, li) => chooseGrid(n, li) || { cols: 9, rows: Math.ceil(n / 9), cells: 9 * Math.ceil(n / 9), fill: n / (9 * Math.ceil(n / 9)) });
  return { plan, grids, delta: plan.map(() => 0) };
}

function inBand(x, y) {
  return x >= BOARD_BAND.left && x + TILE_W <= BOARD_BAND.right &&
    y >= BOARD_BAND.top && y + TILE_H <= BOARD_BAND.bottom;
}

/**
 * 构造一层：先列出所有「有支撑、在安全区内」的格点，
 * 再用删除法挑缺口 —— 优先删掉对下层覆盖贡献为 0 的格点，
 * 并强制至少 2 个缺口落在边界（不能是完整长方形）。
 */
function buildLayer(li, n, grid, lower, upperRects, rng) {
  const { cols, rows } = grid;
  const px = PHASE_X[li];
  const py = PHASE_Y[li];
  const wantLeft = BOARD_CX - (cols * TILE_W) / 2;
  const wantTop = BOARD_CY - (rows * TILE_H) / 2;
  const u0 = Math.round((wantLeft - px) / TILE_W);
  const v0 = Math.round((wantTop - py) / TILE_H);
  const rectOf = (u, v) => ({ x: px + u * TILE_W, y: py + v * TILE_H });

  const all = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = u0 + c;
      const v = v0 + r;
      const rect = rectOf(u, v);
      if (!inBand(rect.x, rect.y)) continue;
      if (lower.length && !hasSupport(rect, lower)) continue;
      all.push({ u, v, c, r, rect, edge: r === 0 || r === rows - 1 || c === 0 || c === cols - 1 });
    }
  }
  if (all.length < n) {
    if (globalThis.__LAYOUT_DEBUG) console.log(`[buildLayer] li=${li} all=${all.length} < n=${n} (grid ${cols}x${rows})`);
    return null;
  }
  // 四边都必须有牌，否则包围盒会缩水、填充率说法就不成立
  const hasLeft = all.some((g) => g.c === 0);
  const hasRight = all.some((g) => g.c === cols - 1);
  const hasTop = all.some((g) => g.r === 0);
  const hasBottom = all.some((g) => g.r === rows - 1);
  if (!hasLeft || !hasRight || !hasTop || !hasBottom) {
    if (globalThis.__LAYOUT_DEBUG) console.log(`[buildLayer] li=${li} 缺边 ${hasLeft}/${hasRight}/${hasTop}/${hasBottom}`);
    return null;
  }

  // 下层每张牌被「本层」压住的次数（只统计本层格点）
  const cover = new Map();
  for (let k = 0; k < lower.length; k++) cover.set(lower[k].id, 0);
  for (let i = 0; i < all.length; i++) {
    for (let k = 0; k < lower.length; k++) {
      if (overlapArea(all[i].rect, lower[k]) > THRESH_AREA) {
        cover.set(lower[k].id, cover.get(lower[k].id) + 1);
      }
    }
  }
  // 本层同时要为「上一层」提供支撑：上层每个格点至少需要一个本层格点相交 >10%
  const coverUp = upperRects.map(() => 0);
  for (let i = 0; i < all.length; i++) {
    for (let k = 0; k < upperRects.length; k++) {
      if (overlapArea(all[i].rect, upperRects[k]) > THRESH_AREA) coverUp[k]++;
    }
  }
  // 删除代价 = 会让多少下层牌失去遮挡 + 会让多少上层格点失去支撑（后者权重更高）
  for (let i = 0; i < all.length; i++) {
    let cost = 0;
    for (let k = 0; k < lower.length; k++) {
      if (overlapArea(all[i].rect, lower[k]) > THRESH_AREA && cover.get(lower[k].id) <= 1) cost++;
    }
    for (let k = 0; k < upperRects.length; k++) {
      if (overlapArea(all[i].rect, upperRects[k]) > THRESH_AREA && coverUp[k] <= 1) cost += 3;
    }
    all[i].cost = cost;
    all[i].jitter = rng.next();
  }

  const gaps = all.length - n;
  const remove = new Set();
  if (li >= 5) {
    // 第 5、6 层必须完整无缺口
    if (gaps !== 0) return null;
  } else {
    const byCost = all.slice().sort((a, b) => a.cost - b.cost || a.jitter - b.jitter);
    // 先保证至少 2 个边缘缺口（在代价最低的边缘格点里挑）
    const edgeFirst = byCost.filter((g) => g.edge).slice(0, Math.min(LAYER_SHAPE.minEdgeGaps, gaps));
    for (const g of edgeFirst) remove.add(g.u + ',' + g.v);
    for (let i = 0; i < byCost.length && remove.size < gaps; i++) {
      const g = byCost[i];
      // 不允许把四条边整条删空
      if (g.c === 0 && all.filter((a) => a.c === 0 && !remove.has(a.u + ',' + a.v)).length <= 1) continue;
      if (g.c === cols - 1 && all.filter((a) => a.c === cols - 1 && !remove.has(a.u + ',' + a.v)).length <= 1) continue;
      if (g.r === 0 && all.filter((a) => a.r === 0 && !remove.has(a.u + ',' + a.v)).length <= 1) continue;
      if (g.r === rows - 1 && all.filter((a) => a.r === rows - 1 && !remove.has(a.u + ',' + a.v)).length <= 1) continue;
      remove.add(g.u + ',' + g.v);
    }
    // 极端情况下四边保护让缺口不够，就按代价顺序强制补齐
    for (let i = 0; i < byCost.length && remove.size < gaps; i++) remove.add(byCost[i].u + ',' + byCost[i].v);
  }
  const chosen = all.filter((g) => !remove.has(g.u + ',' + g.v));
  if (chosen.length !== n) return null;
  return chosen.map((g) => ({ x: g.rect.x, y: g.rect.y, layer: li, u: g.u, v: g.v }));
}

/**
 * 第 2 关主布局。返回的 cards 带 id / z（z 与 generator.assignZ 同一套顺序）。
 * 构造后检查压迫感，不合格就换一组缺口随机顺序重来；最多 14 次，取最接近目标的一次。
 */
function gourdLayout(seed, opt) {
  const { plan, grids } = planForSeed(seed >>> 0);
  const startId = opt.startId === undefined ? 0 : opt.startId;
  const baseRng = makeRng((((seed >>> 0) ^ 0x0b0a0d) >>> 0));
  const targets = { free: [0.14, 0.20], top: 0.40, bottom: 0.90, depth: 4.0, chain: 7 };
  // 预计算每一层的全部格点矩形，供下层挑缺口时保护「上层的支撑」
  const layerRects = grids.map((g, li) => {
    const px = PHASE_X[li];
    const py = PHASE_Y[li];
    const u0 = Math.round((BOARD_CX - (g.cols * TILE_W) / 2 - px) / TILE_W);
    const v0 = Math.round((BOARD_CY - (g.rows * TILE_H) / 2 - py) / TILE_H);
    const rects = [];
    for (let r = 0; r < g.rows; r++) {
      for (let c = 0; c < g.cols; c++) rects.push({ x: px + (u0 + c) * TILE_W, y: py + (v0 + r) * TILE_H });
    }
    return rects;
  });
  let best = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < 14; attempt++) {
    const rng = makeRng((baseRng.int(1, 0x7ffffffe) ^ (attempt * 2654435761)) >>> 0);
    const byLayer = [];
    let bad = false;
    for (let li = 0; li < plan.length; li++) {
      const lower = li > 0 ? byLayer[li - 1] : [];
      const upper = li + 1 < plan.length ? layerRects[li + 1] : [];
      const cells = buildLayer(li, plan[li], grids[li], lower, upper, rng);
      if (!cells) { bad = true; break; }
      byLayer.push(cells);
    }
    if (bad) continue;

    const cards = [];
    for (let li = 0; li < byLayer.length; li++) {
      for (let i = 0; i < byLayer[li].length; i++) cards.push({ ...byLayer[li][i] });
    }
    // 整体居中（平移量必须是半格整数倍），并 clamp 到不越界
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of cards) {
      minX = Math.min(minX, c.x); maxX = Math.max(maxX, c.x + TILE_W);
      minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y + TILE_H);
    }
    const kxMin = Math.ceil((BOARD_BAND.left - minX) / LATTICE_X);
    const kxMax = Math.floor((BOARD_BAND.right - maxX) / LATTICE_X);
    const kyMin = Math.ceil((BOARD_BAND.top - minY) / LATTICE_Y);
    const kyMax = Math.floor((BOARD_BAND.bottom - maxY) / LATTICE_Y);
    let kx = Math.round((BOARD_CX - (minX + maxX) / 2) / LATTICE_X);
    let ky = Math.round((BOARD_CY - (minY + maxY) / 2) / LATTICE_Y);
    kx = Math.max(kxMin, Math.min(kxMax, kx));
    ky = Math.max(kyMin, Math.min(kyMax, ky));
    const dx = kx * LATTICE_X;
    const dy = ky * LATTICE_Y;
    for (const c of cards) { c.x += dx; c.y += dy; }

    cards.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
    for (let i = 0; i < cards.length; i++) { cards[i].id = startId + i; cards[i].z = i; }
    const ps = pressureStats(cards);
    const score =
      Math.max(0, targets.free[0] - ps.freeRatio) * 100 +
      Math.max(0, ps.freeRatio - targets.free[1]) * 100 +
      Math.max(0, targets.top - ps.topShare) * 30 +
      Math.max(0, targets.bottom - ps.bottomCovered) * 40 +
      Math.max(0, targets.depth - ps.avgPressDepth) * 4 +
      Math.abs(targets.chain - ps.longestChain) * 20 +
      (countComponents(cards, CONNECT_PAD) !== 1 ? 1000 : 0) +
      (isHalfLattice(cards) ? 0 : 1000);
    if (score < bestScore) { bestScore = score; best = cards; }
    if (score === 0) break;
  }
  return best || [];
}

/* ==================== 第 1 关：保持上一版几何 ==================== */

/** 在晶格上随机生长一个 4-邻接连通团块（第 1 关专用，本轮不动） */
function growCluster(target, u0, v0, lower, ox, oy, rng) {
  const key = (u, v) => u + ',' + v;
  const chosen = new Map();
  const inFrontier = {};
  const frontier = [];
  const rectOf = (u, v) => ({ x: ox + u * TILE_W, y: oy + v * TILE_H });
  const inBounds = (u, v) => {
    const r = rectOf(u, v);
    return r.x >= BOARD_BAND.left && r.x + TILE_W <= BOARD_BAND.right &&
      r.y >= BOARD_BAND.top && r.y + TILE_H <= BOARD_BAND.bottom;
  };
  const supported = (u, v) => lower.length === 0 || hasSupport(rectOf(u, v), lower);
  const valid = (u, v) => !chosen.has(key(u, v)) && inBounds(u, v) && supported(u, v);
  const pushFrontier = (u, v) => {
    const nb = [[u + 1, v], [u - 1, v], [u, v + 1], [u, v - 1]];
    for (let i = 0; i < nb.length; i++) {
      const a = nb[i][0], b = nb[i][1], k = key(a, b);
      if (inFrontier[k] || chosen.has(k)) continue;
      if (inBounds(a, b) && supported(a, b)) { inFrontier[k] = 1; frontier.push({ u: a, v: b }); }
    }
  };
  const add = (u, v) => { chosen.set(key(u, v), { u, v }); pushFrontier(u, v); };
  let seedCell = null;
  for (let ring = 0; ring <= 4 && !seedCell; ring++) {
    for (let du = -ring; du <= ring && !seedCell; du++) {
      for (let dv = -ring; dv <= ring; dv++) {
        if (Math.max(Math.abs(du), Math.abs(dv)) !== ring) continue;
        if (valid(u0 + du, v0 + dv)) { seedCell = { u: u0 + du, v: v0 + dv }; break; }
      }
    }
  }
  if (!seedCell) seedCell = { u: u0, v: v0 };
  add(seedCell.u, seedCell.v);
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
  if (chosen.size < target) {
    for (let ring = 1; chosen.size < target && ring <= 12; ring++) {
      const candidates = [];
      for (let du = -ring; du <= ring; du++) {
        for (let dv = -ring; dv <= ring; dv++) {
          if (Math.max(Math.abs(du), Math.abs(dv)) !== ring) continue;
          const u = seedCell.u + du, v = seedCell.v + dv;
          if (valid(u, v)) candidates.push({ u, v });
        }
      }
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        const t = candidates[i]; candidates[i] = candidates[j]; candidates[j] = t;
      }
      for (let i = 0; i < candidates.length && chosen.size < target; i++) add(candidates[i].u, candidates[i].v);
    }
  }
  const out = [];
  chosen.forEach((c) => out.push(c));
  return out;
}

function easyLayout(seed, opt) {
  const spec = LEVEL_SPEC[1];
  const plan = opt.plan || spec.plan;
  const startId = opt.startId === undefined ? 0 : opt.startId;
  const rng = makeRng((((seed === undefined ? randomSeed() : seed) >>> 0) ^ 0x1f2e3d4c) >>> 0);
  const origins = [{ kx: 0, ky: 0 }];
  for (let li = 1; li < plan.length; li++) {
    const d = LAYER_OFFSETS[rng.int(0, LAYER_OFFSETS.length - 1)];
    origins.push({ kx: origins[li - 1].kx + d[0], ky: origins[li - 1].ky + d[1] });
  }
  const byLayer = [];
  for (let li = 0; li < plan.length; li++) {
    const ox = origins[li].kx * LATTICE_X;
    const oy = origins[li].ky * LATTICE_Y;
    const u0 = Math.round((BOARD_CX - TILE_W / 2 - ox) / TILE_W);
    const v0 = Math.round((BOARD_CY - TILE_H / 2 - oy) / TILE_H);
    const lower = li > 0 ? byLayer[li - 1] : [];
    byLayer.push(growCluster(plan[li], u0, v0, lower, ox, oy, rng).map((cell) => ({
      x: ox + cell.u * TILE_W, y: oy + cell.v * TILE_H, u: cell.u, v: cell.v,
    })));
  }
  const cards = [];
  for (let li = 0; li < plan.length; li++) {
    for (const c of byLayer[li]) cards.push({ x: c.x, y: c.y, layer: li });
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of cards) {
    minX = Math.min(minX, c.x); maxX = Math.max(maxX, c.x + TILE_W);
    minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y + TILE_H);
  }
  const kx = Math.max(Math.ceil((BOARD_BAND.left - minX) / LATTICE_X),
    Math.min(Math.floor((BOARD_BAND.right - maxX) / LATTICE_X), Math.round((BOARD_CX - (minX + maxX) / 2) / LATTICE_X)));
  const ky = Math.max(Math.ceil((BOARD_BAND.top - minY) / LATTICE_Y),
    Math.min(Math.floor((BOARD_BAND.bottom - maxY) / LATTICE_Y), Math.round((BOARD_CY - (minY + maxY) / 2) / LATTICE_Y)));
  for (const c of cards) { c.x += kx * LATTICE_X; c.y += ky * LATTICE_Y; }
  cards.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < cards.length; i++) { cards[i].id = startId + i; cards[i].z = i; }
  return cards;
}

/** 单堆布局主函数。第 1 关走原有几何，第 2 关走葫芦轮廓。 */
export function generateLayout(seed, opt) {
  const o = opt || {};
  const s = seed === undefined ? randomSeed() : seed;
  if (o.level === 1) return easyLayout(s, o);
  return gourdLayout(s, o);
}

/** 第 1 关薄壳：保留旧导出名 */
export function generateEasyLayout(seed, opt) {
  return generateLayout(seed, { ...(opt || {}), level: 1 });
}
