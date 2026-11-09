/**
 * v2.0.0 —— 两关布局生成（纯 JS，零 DOM 依赖）。
 *
 * 相对 v1 的根本变化：删除葫芦单堆，改为 layout_templates.js 的独立模板：
 *  · 第 1 关 L1_TUTORIAL：3 层紧凑金字塔，教学但不无脑；
 *  · 第 2 关 L2_MULTI_ZONE：主堆 7 层 + 左右各 3 层盲盒 + 底部 2 层保留区，
 *    共 15 个互不相同的全局堆叠层（layer），每个区域在坐标上互相咬合，
 *    因此不同区域之间存在真实的交叉遮挡，而不是各自独立的牌堆。
 *
 * 不变的几何硬契约：
 *  · 坐标全落在 (LATTICE_X, LATTICE_Y) = (33,44) 半格晶格上，零随机抖动；
 *  · 同层相交面积恒为 0（每个全局层号只属于一个区域的一层）；
 *  · 非底层牌必须被「更低层」的至少一张牌以 >10% 面积支撑；
 *  · 遮挡 = 存在 z 更高的牌与本牌相交面积 > 阈值；
 *  · z 全序：layer 升序 → y 升序 → x 升序，与 generator.assignZ 完全一致。
 *
 * 对外函数（保持旧导出名 + 新增 v2 统计）：
 *   generateLayout(seed, opt) / generateEasyLayout / planForSeed
 *   overlapArea / isBlocked / hasSupport / isHalfLattice / buildBlockerGraph
 *   countComponents / pressureStats / peelOrder
 *   regionStats / crossOcclusionStats / sameLayerOverlapCount / layoutReport
 */
import {
  TILE_W, TILE_H, TILE_AREA, LATTICE_X, LATTICE_Y,
  OVERLAP_THRESHOLD, BOARD_BAND, CONNECT_PAD,
  LAYER_SHAPE, LEVEL_SPEC,
} from './config.js';
import { makeRng, randomSeed } from './rng.js';
import { templateFor, validateTemplate } from './layout_templates.js';

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

/* ==================== 按 seed 浮动的层计划 ==================== */

/**
 * 第 2 关主堆层计划：基准 ±2 浮动后归一化回主堆总张数。
 * 模板的 grids 是容量上限，缺口数量随 seed 变化 —— 不是固定答案。
 */
export function planForSeed(seed) {
  const base = LAYER_SHAPE.planBase.slice();
  const total = base.reduce((a, b) => a + b, 0);
  const rng = makeRng(((seed >>> 0) ^ 0x5eedc0de) >>> 0);
  for (let attempt = 0; attempt < 200; attempt++) {
    const delta = [];
    for (let i = 0; i < base.length; i++) delta.push(rng.int(-LAYER_SHAPE.planJitter, LAYER_SHAPE.planJitter));
    let err = delta.reduce((a, b) => a + b, 0);
    let guard = 0;
    while (err !== 0 && guard++ < 300) {
      const i = rng.int(0, base.length - 1);
      const step = err > 0 ? -1 : 1;
      if (Math.abs(delta[i] + step) <= LAYER_SHAPE.planJitter) { delta[i] += step; err += step; }
    }
    if (err !== 0) continue;
    const plan = base.map((b, i) => b + delta[i]);
    const grids = LAYER_SHAPE.colsBase.map((cols, i) => ({ cols, rows: Math.ceil(plan[i] / cols) }));
    let ok = true;
    for (let i = 0; i < plan.length; i++) {
      if (plan[i] > grids[i].cols * grids[i].rows || plan[i] < 1) ok = false;
    }
    if (!ok) continue;
    return { plan, grids, delta, total };
  }
  return { plan: base.slice(), grids: LAYER_SHAPE.colsBase.map((cols, i) => ({ cols, rows: Math.ceil(base[i] / cols) })), delta: base.map(() => 0), total };
}

/* ==================== 模板展开 ==================== */

function inBand(x, y) {
  return x >= BOARD_BAND.left && x + TILE_W <= BOARD_BAND.right &&
    y >= BOARD_BAND.top && y + TILE_H <= BOARD_BAND.bottom;
}

/** 把模板展开成「层规格」列表，按全局层号从小到大排序 */
function specsOf(tpl, seed) {
  const seedPlan = planForSeed(seed);
  // 按 seed 给主堆每层做 ±2 浮动，但必须同时满足「总和不变」与「不超过网格容量」。
  // 直接 clamp 会把向上的浮动截掉、导致总张数变少，所以先按容量收窄上界，
  // 再把残余误差在有余量的层之间抵消。
  const core = tpl.zones[0];
  const base = core.plan.slice();
  const caps = [];
  for (let i = 0; i < core.grids.length; i++) caps.push(core.grids[i].cols * core.grids[i].rows);
  const delta = seedPlan.delta.slice();
  let err = 0;
  for (let i = 0; i < delta.length; i++) {
    const maxUp = Math.min(LAYER_SHAPE.planJitter, caps[i] - base[i]);
    if (delta[i] > maxUp) delta[i] = maxUp;
    if (delta[i] < -LAYER_SHAPE.planJitter) delta[i] = -LAYER_SHAPE.planJitter;
    err += delta[i];
  }
  let guard = 0;
  while (err !== 0 && guard++ < 400) {
    const i = guard % delta.length;
    const maxUp = Math.min(LAYER_SHAPE.planJitter, caps[i] - base[i]);
    if (err > 0 && delta[i] > -LAYER_SHAPE.planJitter) { delta[i]--; err--; }
    else if (err < 0 && delta[i] < maxUp) { delta[i]++; err++; }
  }
  const specs = [];
  for (let zi = 0; zi < tpl.zones.length; zi++) {
    const z = tpl.zones[zi];
    for (let li = 0; li < z.plan.length; li++) {
      const grid = z.grids[li];
      const o = z.origin[li];
      const need = z.name === 'core' && tpl.level === 2
        ? Math.min(base[li] + delta[li], grid.cols * grid.rows)
        : z.plan[li];
      const cells = [];
      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          const x = o[0] + c * TILE_W;
          const y = o[1] + r * TILE_H;
          if (!inBand(x, y)) continue;
          cells.push({
            x, y, c, r,
            edge: r === 0 || r === grid.rows - 1 || c === 0 || c === grid.cols - 1,
            layer: z.stack[li],
            region: z.name,
            zoneLayer: li,
          });
        }
      }
      specs.push({
        zone: z, li, cells, need,
        layer: z.stack[li],
        gapsMode: z.gaps,
        cols: grid.cols,
        rows: grid.rows,
      });
    }
  }
  specs.sort((a, b) => a.layer - b.layer || a.zone.name.localeCompare(b.zone.name));
  return { specs, seedPlan };
}

/** 挑缺口：优先删「对上层支撑贡献最低」的边缘格点，同时保留四边都有牌 */
function chooseGaps(spec, supported, upperCells, lowerCards, rng) {
  const gaps = supported.length - spec.need;
  if (gaps <= 0) return [];
  const coverUp = [];
  for (let i = 0; i < upperCells.length; i++) coverUp.push(0);
  for (let i = 0; i < supported.length; i++) {
    for (let k = 0; k < upperCells.length; k++) {
      if (overlapArea(supported[i], upperCells[k]) > THRESH_AREA) coverUp[k]++;
    }
  }
  const scored = supported.map((cell, idx) => {
    let cost = 0;
    for (let k = 0; k < upperCells.length; k++) {
      if (coverUp[k] <= 1 && overlapArea(cell, upperCells[k]) > THRESH_AREA) cost += 8;
    }
    for (let k = 0; k < lowerCards.length; k++) {
      if (overlapArea(cell, lowerCards[k]) > THRESH_AREA) cost += 0.2;
    }
    if (!cell.edge && spec.gapsMode === 'edge') cost += 2.5;
    return { idx, cell, cost, jitter: rng.next() };
  });
  scored.sort((a, b) => a.cost - b.cost || a.jitter - b.jitter);
  const removed = {};
  const keys = (cell) => cell.x + ',' + cell.y + ',' + cell.layer;
  const remainingBySide = () => {
    const left = [], right = [], top = [], bottom = [];
    for (let i = 0; i < supported.length; i++) {
      if (removed[keys(supported[i])]) continue;
      const c = supported[i];
      if (c.c === 0) left.push(c);
      if (c.c === spec.cols - 1) right.push(c);
      if (c.r === 0) top.push(c);
      if (c.r === spec.rows - 1) bottom.push(c);
    }
    return { left: left.length, right: right.length, top: top.length, bottom: bottom.length };
  };
  const out = [];
  for (let i = 0; i < scored.length && out.length < gaps; i++) {
    const cell = scored[i].cell;
    const k = keys(cell);
    if (removed[k]) continue;
    const sides = remainingBySide();
    // 不要把某一条边整条删空
    if ((cell.c === 0 && sides.left <= 1) || (cell.c === spec.cols - 1 && sides.right <= 1) ||
        (cell.r === 0 && sides.top <= 1) || (cell.r === spec.rows - 1 && sides.bottom <= 1)) continue;
    removed[k] = 1;
    out.push(k);
  }
  for (let i = 0; i < scored.length && out.length < gaps; i++) {
    const k = keys(scored[i].cell);
    if (removed[k]) continue;
    removed[k] = 1;
    out.push(k);
  }
  if (globalThis.__LAYOUT_DEBUG && spec.zone.name === 'core' && spec.li === 1) {
    const c748 = scored.filter((s) => s.cell.r === spec.rows - 1).map((s) => `${s.cell.x}:${s.cost.toFixed(1)}${removed[keys(s.cell)] ? '(删)' : ''}`);
    layoutTrace(`core#1 gaps=${gaps} upper=${upperCells.length} bottom=${c748.join(' ')}`);
  }
  return out;
}

/** 展开一次模板；返回带 id/z 的牌数组，失败返回 null */
function layoutTrace(msg) {
  if (globalThis.__LAYOUT_DEBUG) console.log('[layout] ' + msg);
}

function expandOnce(tpl, seed, rng) {
  const built = specsOf(tpl, seed);
  const specs = built.specs;
  const chosenAll = [];
  for (let si = 0; si < specs.length; si++) {
    const spec = specs[si];
    const lowerCards = chosenAll.filter((c) => c.layer < spec.layer);
    // 只保护「紧邻的后续 2 层」：更远的层还有别的中间层可提供支撑，
    // 把它们也算进 coverUp 会让本该保留的关键支撑点看起来「可删」。
    const upperCells = [];
    for (let sj = si + 1; sj < specs.length; sj++) {
      if (specs[sj].layer <= spec.layer || specs[sj].layer > spec.layer + 2) continue;
      for (let k = 0; k < specs[sj].cells.length; k++) upperCells.push(specs[sj].cells[k]);
    }
    const supported = spec.layer === 0
      ? spec.cells.slice()
      : spec.cells.filter((cell) => hasSupport(cell, lowerCards));
    if (supported.length < spec.need) {
      if (globalThis.__LAYOUT_DEBUG) {
        const bad = [];
        for (let k = 0; k < spec.cells.length; k++) {
          if (!hasSupport(spec.cells[k], lowerCards)) bad.push(spec.cells[k].x + ',' + spec.cells[k].y);
        }
        layoutTrace(`spec ${spec.zone.name}#${spec.li} layer=${spec.layer} 支撑不足 ${supported.length} < ${spec.need}；无支撑格点 ${bad.join(' | ')}；lower=${lowerCards.length}`);
      } else {
        layoutTrace(`spec ${spec.zone.name}#${spec.li} layer=${spec.layer} 支撑不足 ${supported.length} < ${spec.need}`);
      }
      return null;
    }
    const removed = chooseGaps(spec, supported, upperCells, lowerCards, rng);
    const keyOf = (c) => c.x + ',' + c.y + ',' + c.layer;
    const kept = supported.filter((c) => removed.indexOf(keyOf(c)) < 0);
    if (kept.length !== spec.need) {
      layoutTrace(`spec ${spec.zone.name}#${spec.li} 缺口选择后 ${kept.length} ≠ ${spec.need}`);
      return null;
    }
    for (let k = 0; k < kept.length; k++) {
      chosenAll.push({
        x: kept[k].x, y: kept[k].y, layer: kept[k].layer,
        region: kept[k].region, zoneLayer: kept[k].zoneLayer,
      });
    }
  }
  // 支撑复核：每张非底层牌必须被更低层的牌压住
  for (let i = 0; i < chosenAll.length; i++) {
    const c = chosenAll[i];
    if (c.layer === 0) continue;
    const lower = chosenAll.filter((o) => o.layer < c.layer);
    if (!hasSupport(c, lower)) {
      layoutTrace(`最终复核：${c.region} layer=${c.layer} @${c.x},${c.y} 无支撑`);
      return null;
    }
  }
  chosenAll.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < chosenAll.length; i++) { chosenAll[i].id = i; chosenAll[i].z = i; }
  if (sameLayerOverlapCount(chosenAll) !== 0) return null;
  return chosenAll;
}

function generateFromTemplate(level, seed, opt) {
  const tpl = templateFor(level);
  const check = validateTemplate(tpl);
  if (!check.ok) throw new Error('布局模板非法：' + check.issues.join('；'));
  const s = (seed === undefined ? randomSeed() : seed) >>> 0;
  const baseRng = makeRng((s ^ 0x0b0a0d) >>> 0);
  for (let attempt = 0; attempt < 60; attempt++) {
    const rng = makeRng((baseRng.int(1, 0x7ffffffe) ^ (attempt * 2654435761)) >>> 0);
    const cards = expandOnce(tpl, s, rng);
    if (!cards) continue;
    if (cards.length !== tpl.cardCount) { layoutTrace(`张数 ${cards.length} ≠ ${tpl.cardCount}`); continue; }
    if (!isHalfLattice(cards)) { layoutTrace('非半格晶格'); continue; }
    const comp = countComponents(cards, CONNECT_PAD);
    if (comp !== 1) { layoutTrace(`连通分量 ${comp}`); continue; }
    const cross = crossOcclusionStats(cards);
    if (tpl.level === 2 && cross.pairs === 0) { layoutTrace('无交叉遮挡'); continue; }
    if (opt.startId !== undefined) {
      const d = opt.startId;
      for (let i = 0; i < cards.length; i++) { cards[i].id += d; cards[i].z += d; }
    }
    return cards;
  }
  throw new Error('布局模板展开失败：60 次尝试内无法满足支撑 / 连通 / 无同层重叠');
}

export function generateLayout(seed, opt) {
  const o = opt || {};
  return generateFromTemplate(o.level === 1 ? 1 : 2, seed, o);
}

export function generateEasyLayout(seed, opt) {
  return generateLayout(seed, { ...(opt || {}), level: 1 });
}

/** 文档 / 测试用的完整布局报告 */
export function layoutReport(cards) {
  const ps = pressureStats(cards);
  const rs = regionStats(cards);
  const cross = crossOcclusionStats(cards);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (c.x < minX) minX = c.x;
    if (c.x + TILE_W > maxX) maxX = c.x + TILE_W;
    if (c.y < minY) minY = c.y;
    if (c.y + TILE_H > maxY) maxY = c.y + TILE_H;
  }
  return {
    total: cards.length,
    bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
    regions: rs,
    crossOcclusion: cross,
    sameLayerOverlap: sameLayerOverlapCount(cards),
    components: countComponents(cards, CONNECT_PAD),
    halfLattice: isHalfLattice(cards),
    ...ps,
    graph: undefined,
    freeIds: undefined,
  };
}
