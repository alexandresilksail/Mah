/**
 * 布局生成（纯 JS，零 DOM 依赖）。
 *
 * ── 第 4 步：簇模板，而不是"整体网格墙" ──────────────────────────
 * 每局随机取 3~5 个簇，每个簇随机选 T 字形 / 回字形 / 锥子形模板之一，
 * 随机落在主堆安全区里，簇与簇的边缘允许互相压叠。
 * 模板只定义**簇的轮廓与中心点**，不是整个盘面的形状。
 *
 * 簇内部逐层堆叠：相邻层的平移偏移从
 *   {(W/2,H/2), (0,H/2), (W/2,0), (-W/2,H/2)}
 * 中随机选（W = TILE_W，H = TILE_H），个别牌再叠 ±TILE_W/4 的小抖动。
 * 所有牌矩形必须完整落在画布安全区内（越界直接丢弃）。
 * 同一层内的牌重叠面积不得超过 OVERLAP_THRESHOLD（超过就重采样抖动）。
 *
 * 对外主函数 generateLayout(seed) 返回 [{id, x, y, layer, cluster}]，
 * 数量严格等于目标张数：不足继续增补簇内牌，超出裁掉最高层边缘牌。
 */
import {
  TILE_W,
  TILE_H,
  TILE_AREA,
  OVERLAP_THRESHOLD,
  MAIN_ZONE,
  SIDE_ZONES,
  SIDE_QUEUES,
  SIDE_QUEUE_LEN,
  SIDE_STEP_Y,
  SIDE_PITCH_X,
  SIDE_PITCH_Y,
  LEVEL_SPEC,
  LAYOUTS,
} from './config.js';
import { makeRng, randomSeed } from './rng.js';

/** 同层格距：比牌面各多 6px，保证同层零重叠 */
const GRID_X = TILE_W + 6;
const GRID_Y = TILE_H + 6;

/** 层间平移偏移的四选一集合（严格按规范写死为半张牌的组合） */
export const LAYER_OFFSETS = [
  [TILE_W / 2, TILE_H / 2],
  [0, TILE_H / 2],
  [TILE_W / 2, 0],
  [-TILE_W / 2, TILE_H / 2],
];

/** 三种簇模板的标识（测试会统计 50 个种子下是否三种都用到了） */
export const CLUSTER_TEMPLATES = ['T', 'ring', 'cone'];

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

/* ==================== 几何工具 ==================== */

/** 两张牌矩形的相交面积 */
export function overlapArea(a, b) {
  const ix = Math.min(a.x + TILE_W, b.x + TILE_W) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + TILE_H, b.y + TILE_H) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}

/**
 * 遮挡判定（几何定义，不是层数比较）：
 * 存在 z 更高且仍在盘面的牌，与本牌相交面积 > TILE_AREA * OVERLAP_THRESHOLD。
 * @param {object} card
 * @param {Array} alive 当前仍在盘面（state === 'board'）的牌
 */
export function isBlocked(card, alive) {
  for (let i = 0; i < alive.length; i++) {
    const o = alive[i];
    if (o === card || o.z <= card.z) continue;
    if (overlapArea(card, o) > THRESH_AREA) return true;
  }
  return false;
}

/**
 * 预先建好「谁压住谁」的图，peelOrder 用拓扑剥离，避免 O(N^3)。
 * blockers[c.id] = 压住 c 的更高 z 的牌 id 数组。
 * dependents[o.id] = 被 o 压住的牌 id 数组。
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
 * 模拟剥离顺序：反复取出当前「未被遮挡」的牌，得到一条合法的全消除顺序。
 * 每一步取的牌在取走的那一瞬间一定没有被任何留在盘面的牌压住，
 * 所以按 order 依次点牌是一条真实存在的通关路径（槽位约束另由花色分配保证）。
 *
 * @param {Array} cards 全部牌
 * @param {Function} rand 随机源（同层多张可点时用来打散，默认取 z 最高）
 * @returns {Array} card id 的全序数组
 */
export function peelOrder(cards, rand) {
  const g = buildBlockerGraph(cards);
  const indeg = {};
  const byId = {};
  const alive = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    byId[c.id] = c;
    indeg[c.id] = g.blockers[c.id].length;
    alive.push(c);
  }
  const free = [];
  for (let i = 0; i < cards.length; i++) {
    if (indeg[cards[i].id] === 0) free.push(cards[i]);
  }
  const order = [];
  const r = rand || Math.random;
  while (free.length) {
    // 按「剥离波次」成批取：当前所有可点的牌同属一波，波内按 z 降序排，
    // 波内任意顺序都合法（它们互不遮挡），所以这仍是一条严格可解的全序。
    // 好处是 order 的前缀恰好就是「开局可点的那批牌」—— 花色分配的前段
    // 于是真的落在玩家一上来就能点到的牌上，而不是散在盘面深处。
    const batch = free.slice();
    free.length = 0;
    const key = {};
    for (let i = 0; i < batch.length; i++) key[batch[i].id] = r();
    // 波内按 z 降序（塔顶先走），同 z 用随机 key 打散，保证可复现。
    batch.sort((a, b) => b.z - a.z || b.y - a.y || key[a.id] - key[b.id]);
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
  // 理论上不会剩下：blockers 一定是 z 更高的牌，不可能成环。
  // 真出现了（比如浮点边界），把剩下的按 z 降序补进 order，保证返回全序。
  if (order.length < cards.length) {
    const seen = {};
    for (let i = 0; i < order.length; i++) seen[order[i]] = 1;
    const rest = cards.filter((c) => !seen[c.id]).sort((a, b) => b.z - a.z);
    for (let i = 0; i < rest.length; i++) order.push(rest[i].id);
  }
  return order;
}

/* ==================== 簇模板 ==================== */

/**
 * 模板只决定轮廓与中心点：返回某一层应该放哪些格点（以 GRID 为单位的相对坐标）。
 * li = 0 是最底层，layers 是簇的总层数。
 */
function templateCells(kind, li, layers, rng) {
  const cells = [];
  if (kind === 'T') {
    // T 字形：横梁 + 竖柄；越往上横梁越短
    const half = Math.max(1, 2 - Math.floor(li / 2));
    for (let u = -half; u <= half; u++) cells.push([u, 0]);
    const stem = Math.max(1, 3 - Math.floor(li / 2));
    for (let v = 1; v <= stem; v++) cells.push([0, v]);
    return cells;
  }
  if (kind === 'ring') {
    // 回字形：3×3 外圈 8 格，中心留空；高层收成 4 角
    const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    const edges = [[0, -1], [-1, 0], [1, 0], [0, 1]];
    const keepEdges = li < Math.ceil(layers / 2);
    const out = corners.slice();
    if (keepEdges) out.push.apply(out, edges);
    return out;
  }
  // cone：锥子形，中间高四周低 —— 底层 4×3，每上一层削掉一圈外沿
  const shrink = Math.min(1, li);
  for (let v = -1 + shrink; v <= 1 - shrink; v++) {
    for (let u = -2 + shrink; u <= 2 - shrink; u++) cells.push([u, v]);
  }
  if (!cells.length) cells.push([0, 0]);
  return cells;
}

/** 单个簇生成候选牌 */
function buildCluster(clusterId, rng, maxLayer) {
  const kind = CLUSTER_TEMPLATES[rng.int(0, CLUSTER_TEMPLATES.length - 1)];
  const layers = Math.min(maxLayer, rng.int(4, maxLayer));
  // 中心点：主堆安全区内随机，但要留出簇的最大半径
  const halfW = GRID_X * 2 + TILE_W / 2;
  const halfH = GRID_Y * 1.5 + TILE_H / 2;
  const loX = MAIN_ZONE.left + halfW * 0.35;
  const hiX = MAIN_ZONE.right - TILE_W - halfW * 0.35;
  const loY = MAIN_ZONE.top + halfH * 0.55;
  const hiY = MAIN_ZONE.bottom - TILE_H - halfH * 0.55;
  const cx = loX + rng.next() * Math.max(1, hiX - loX);
  const cy = loY + rng.next() * Math.max(1, hiY - loY);

  const out = [];
  let ox = 0;
  let oy = 0;
  for (let li = 0; li < layers; li++) {
    if (li > 0) {
      const d = LAYER_OFFSETS[rng.int(0, LAYER_OFFSETS.length - 1)];
      ox += d[0];
      oy += d[1];
    }
    const cells = templateCells(kind, li, layers, rng);
    for (let k = 0; k < cells.length; k++) {
      const u = cells[k][0];
      const v = cells[k][1];
      // 个别牌叠加 ±TILE_W/4 的小抖动，打破规整格点感
      const jx = (rng.next() - 0.5) * 2 * (TILE_W / 4);
      const jy = (rng.next() - 0.5) * 2 * (TILE_W / 4);
      const x = cx + ox + u * GRID_X + jx;
      const y = cy + oy + v * GRID_Y + jy;
      out.push({ x, y, layer: li, cluster: clusterId, kind, cx, cy, u, v });
    }
  }
  return out;
}

/** 越界裁剪：矩形必须完整落在安全区里 */
function inside(c) {
  return (
    c.x >= MAIN_ZONE.left &&
    c.x + TILE_W <= MAIN_ZONE.right &&
    c.y >= MAIN_ZONE.top &&
    c.y + TILE_H <= MAIN_ZONE.bottom
  );
}

/**
 * 同层不得互相重叠超过阈值；越界的牌也在这里挡掉。
 * 留 3% 余量：坐标最终会 round 到 2 位小数，边界擦线的两张牌四舍五入后
 * 可能刚好越过 0.10（实测过 0.10005）。宁可少放一张，也不能踩线。
 */
const SAME_LAYER_LIMIT = THRESH_AREA * 0.97;
function sameLayerOk(c, acc) {
  if (!inside(c)) return false;
  for (let i = 0; i < acc.length; i++) {
    const o = acc[i];
    if (o.layer !== c.layer) continue;
    if (overlapArea(c, o) > SAME_LAYER_LIMIT) return false;
  }
  return true;
}

/**
 * 主堆布局。
 * @param {number} seed 可复现随机种子
 * @param {object} opt  { target: 目标张数（默认 150）, layers: 层数（默认 7） }
 * @returns {Array} [{id, x, y, layer, cluster}]
 */
export function generateLayout(seed, opt) {
  const o = opt || {};
  const target = o.target === undefined ? LEVEL_SPEC[2].mainCount : o.target;
  const layers = o.layers === undefined ? LEVEL_SPEC[2].layers : o.layers;
  const rng = makeRng((seed === undefined ? randomSeed() : seed) >>> 0);
  const acc = [];
  const kinds = {};

  // 每局 3~5 个簇；不足目标张数时继续增补簇内牌（最多再加 10 个簇）
  const baseClusters = rng.int(3, 5);
  let clusterId = 0;
  for (let round = 0; round < baseClusters + 10 && acc.length < target; round++) {
    const cand = buildCluster(clusterId, rng, layers);
    kinds[cand.length ? cand[0].kind : '?'] = 1;
    for (let i = 0; i < cand.length && acc.length < target; i++) {
      const c = cand[i];
      // 抖动可能撞上同层兄弟：重采样最多 4 次，仍不行就丢这张
      let ok = sameLayerOk(c, acc);
      for (let t = 0; t < 4 && !ok; t++) {
        c.x += (rng.next() - 0.5) * TILE_W;
        c.y += (rng.next() - 0.5) * TILE_H;
        ok = sameLayerOk(c, acc);
      }
      if (ok) acc.push(c);
    }
    clusterId++;
  }

  // 超出目标：裁掉「最高层的边缘牌」（layer 降序、离簇中心距离降序）
  if (acc.length > target) {
    acc.sort((a, b) => {
      if (b.layer !== a.layer) return b.layer - a.layer;
      const da = Math.abs(a.x - a.cx) + Math.abs(a.y - a.cy);
      const db = Math.abs(b.x - b.cx) + Math.abs(b.y - b.cy);
      return db - da;
    });
    acc.length = target;
  }

  // 仍不足：在已有簇中心附近补牌（仍受越界 + 同层不重叠约束）
  let guard = 0;
  while (acc.length < target && guard++ < target * 40) {
    const base = acc.length ? acc[rng.int(0, acc.length - 1)] : null;
    const li = base ? base.layer : 0;
    const c = {
      x: (base ? base.x : (MAIN_ZONE.left + MAIN_ZONE.right) / 2) + (rng.next() - 0.5) * GRID_X * 3,
      y: (base ? base.y : (MAIN_ZONE.top + MAIN_ZONE.bottom) / 2) + (rng.next() - 0.5) * GRID_Y * 3,
      layer: li,
      cluster: base ? base.cluster : 0,
      kind: base ? base.kind : 'T',
      cx: base ? base.cx : 0,
      cy: base ? base.cy : 0,
    };
    if (sameLayerOk(c, acc)) acc.push(c);
  }

  // 统一编号，返回规范要求的字段
  acc.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  const out = [];
  for (let i = 0; i < acc.length; i++) {
    out.push({
      id: i,
      x: Math.round(acc[i].x * 100) / 100,
      y: Math.round(acc[i].y * 100) / 100,
      layer: acc[i].layer,
      cluster: acc[i].cluster,
      kind: acc[i].kind,
    });
  }
  out.templates = Object.keys(kinds);
  return out;
}

/* ==================== 侧堆 ==================== */

/**
 * 左右两个侧堆，每堆 SIDE_QUEUES 个竖向队列、每队列 SIDE_QUEUE_LEN 张。
 * 队列内牌沿 y 露边 13px、z 逐张递增 —— 于是 k 与 k+1 的几何交集达 82%，
 * 每张牌都被紧邻的更高 z 牌压住，只有队首（z 最高）可点。
 * 「只有最前一张可点」因此仍然是**纯几何遮挡**，没有额外的规则分支。
 */
export function generateSidePiles(seed, opt) {
  const o = opt || {};
  const perSide = o.perSide === undefined ? LEVEL_SPEC[2].sideCount : o.perSide;
  const rng = makeRng(((seed === undefined ? randomSeed() : seed) >>> 0) ^ 0x5bf03635);
  const out = [];
  let id = o.startId === undefined ? 0 : o.startId;

  for (let s = 0; s < SIDE_ZONES.length; s++) {
    const zone = SIDE_ZONES[s];
    const cols = 2;
    const rows = Math.ceil(SIDE_QUEUES / cols);
    let made = 0;
    for (let q = 0; q < SIDE_QUEUES && made < perSide; q++) {
      const col = q % cols;
      const row = Math.floor(q / cols);
      const baseX = zone.left + col * SIDE_PITCH_X;
      const baseY = zone.top + row * SIDE_PITCH_Y;
      const len = Math.min(SIDE_QUEUE_LEN, perSide - made);
      for (let k = 0; k < len; k++) {
        out.push({
          id: id++,
          x: baseX,
          y: baseY + k * SIDE_STEP_Y,
          layer: k,
          cluster: 100 + s * 10 + q,
          kind: 'side',
          side: true,
          sideIndex: s,
          queue: q,
          depth: k,
        });
        made++;
      }
    }
    // 队列数不够放满 36 张时，把剩余牌继续往已有队列深处塞
    let guard = 0;
    while (made < perSide && guard++ < 500) {
      const q = made % SIDE_QUEUES;
      const col = q % cols;
      const row = Math.floor(q / cols);
      const k = SIDE_QUEUE_LEN + Math.floor(made / SIDE_QUEUES);
      const y = zone.top + row * SIDE_PITCH_Y + k * SIDE_STEP_Y;
      if (y + TILE_H > zone.bottom) break;
      out.push({
        id: id++,
        x: zone.left + col * SIDE_PITCH_X,
        y,
        layer: Math.min(6, k),
        cluster: 100 + s * 10 + q,
        kind: 'side',
        side: true,
        sideIndex: s,
        queue: q,
        depth: k,
      });
      made++;
    }
  }
  return out;
}

/* ==================== 教学关 ==================== */

/**
 * 第 1 关：底层 4×3 = 12 张规整网格；顶层 6 张压在相邻底牌的接缝上，
 * 相对底层错开 (TILE_W/2, TILE_H/2)，形成半错位的两层堆叠。
 */
export function generateEasyLayout(seed, opt) {
  const o = opt || {};
  const L = LAYOUTS[1];
  const spec = LEVEL_SPEC[1];
  const rng = makeRng(((seed === undefined ? randomSeed() : seed) >>> 0) ^ 0x1f2e3d4c);
  const out = [];
  let id = o.startId === undefined ? 0 : o.startId;

  const bw = (spec.bottom.c - 1) * L.pitchX + TILE_W;
  const bh = (spec.bottom.r - 1) * L.pitchY + TILE_H;
  const ox = Math.round((720 - bw) / 2);
  const oy = Math.round((MAIN_ZONE.top + MAIN_ZONE.bottom) / 2 - bh / 2);

  for (let r = 0; r < spec.bottom.r; r++) {
    for (let c = 0; c < spec.bottom.c; c++) {
      out.push({
        id: id++,
        x: ox + c * L.pitchX,
        y: oy + r * L.pitchY,
        layer: 0,
        cluster: 0,
        kind: 'grid',
        cx: c,
        cy: r,
      });
    }
  }
  // 顶层 2 列 × 3 行：x / y 各偏移半个牌宽 / 半个牌高（严格 = TILE_W/2, TILE_H/2），
  // 于是每张顶层牌正好骑在底层四张牌的接缝上，交集都远超 OVERLAP_THRESHOLD。
  const tx = ox + L.staggerX;
  const ty = oy + L.staggerY;
  for (let r = 0; r < spec.top.r; r++) {
    for (let c = 0; c < spec.top.c; c++) {
      out.push({
        id: id++,
        x: tx + c * L.pitchX * 2,
        y: ty + r * L.pitchY,
        layer: 1,
        cluster: 1,
        kind: 'grid-top',
        cx: c,
        cy: r,
      });
    }
  }
  // 教学关不需要随机，但保留 rng 位以便将来加微抖动
  void rng;
  return out;
}
