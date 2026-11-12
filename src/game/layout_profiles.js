/**
 * seed 驱动布局生成器（本轮重做 · 第 1.1–1.5 节）。
 *
 * 与上一轮的根本区别：**几何由 seed 程序化生成，档位只管规模**。
 * 档位只决定三件事：主堆层数（profile.layers）、总牌数（mainCount + queueCount）、
 * 牌种类数（profile.types）。坐标一律由 seed 生长，同一档位换 seed 必然是不同几何。
 *
 * 不变的几何硬契约：
 *  · 半格晶格：x 是 33 的整数倍、y 是 44 的整数倍；
 *  · 同层整格对齐、零重叠：同一层内格点间距 = (66, 88)，即一个整牌；
 *  · z 全序 = layer 升序 → y 升序 → x 升序（与 generator.assignZ 一致）；
 *  · 主堆必须完整落在 BOARD_BAND 内，且包围盒 ≥ 560 × 440 px。
 *
 * 第二关主堆（沙漏轮廓）：
 *  · 每层是一个由 seed 随机生长的**连通团块**：从该层中心格出发，向邻格随机扩张
 *    直到凑够张数，扩张概率偏向中心，于是边缘自然留缺口（连通性由生长方式保证）；
 *  · 宽度包络：顶部 25% 的层 3–5 列、中段 36% 的层 8–10 列（肚子）、
 *    底部 39% 的核心层限制在中心约 5×4 格内并互相叠压；
 *  · 层中心在核心中心 ±1.5 格内随机游走，层间错位向量从
 *    {(W/2,H/2), (0,H/2), (W/2,0)} 取（= config.LAYER_OFFSETS）。
 *
 * 盲盒队列（第 1.3 节）：主堆下方，左右各 2 条（一竖一横），共 44 张。
 * 每条链的牌按半格步进扇形叠放，链内 z 递增，于是**只有队首（链尾那张）可点**，
 * 其余被前一张以 >10% 面积压住 —— 纯几何实现，不需要额外的规则分支。
 * 队列整体再做 ±1 格的 seed 偏移。
 */
import {
  TILE_W, TILE_H, LATTICE_X, LATTICE_Y, OVERLAP_THRESHOLD, TILE_AREA,
  BOARD_BAND, layerPlanFor,
} from './config.js';
import { makeRng } from './rng.js';
import { countComponents } from './layout.js';

const QUEUE = 44;
/** 第 1.5 节：第二关开局可点牌区间 */
export const VISIBLE_MIN = 19;
export const VISIBLE_MAX = 25;

/* ==================== 版面预算（半格晶格） ==================== */

/** 牌左上角可用范围：x ∈ [33, 627]（627+66=693 ≤ 700），y ∈ [220, 792]（792+88=880 ≤ 918） */
const X_MIN = 33;
const X_MAX = 627;
const Y_MIN = 220;
const Y_MAX = 792;
/** 主堆纵向区间：最低一行 572，于是包围盒高度 = 572+88-220 = 440 ≥ 440 */
const STACK_TOP = 220;
const STACK_BOTTOM = 572;
/** 队列竖向链从 528 起（7 张，528..792），所以主堆在 528 以下只能占用中间列 */
const QUEUE_COL_GUARD_Y = 528;
/** 主堆在 528..572 这一带必须避开的边列（留给队列竖向链） */
const MARGIN_COLS = [33, 627];

const clamp = (v, lo, hi) => (v < lo ? lo : (v > hi ? hi : v));

/* ==================== 每层的网格尺寸 ==================== */

/**
 * 按「段位列数包络 + 缺口比例」挑一个 (cols, rows)：
 * 在允许的列数范围内，选缺口比例最接近 11% 的组合（规格 1.2 的 8–15%）。
 */
function pickGrid(rng, need, colsLo, colsHi, rowsMax) {
  const cands = [];
  for (let cols = colsLo; cols <= colsHi; cols++) {
    for (let rows = 1; rows <= rowsMax; rows++) {
      const cap = cols * rows;
      if (cap < need) continue;
      const gaps = (cap - need) / cap;
      cands.push({ cols, rows, gaps, score: Math.abs(gaps - 0.11) });
    }
  }
  if (!cands.length) {
    const cols = colsLo;
    return { cols, rows: Math.ceil(need / cols), gaps: 0, score: 9 };
  }
  let best = cands[0];
  for (let i = 1; i < cands.length; i++) if (cands[i].score < best.score) best = cands[i];
  const ties = cands.filter((c) => Math.abs(c.score - best.score) < 1e-6);
  return ties[rng.int(0, ties.length - 1)];
}

/** 层段：顶部 25% / 中段 36% / 底部核心 39% */
function segmentOf(li, N) {
  const n1 = Math.max(1, Math.round(N * 0.25));
  const n2 = Math.max(1, Math.round(N * 0.36));
  if (li < n1) return 'top';
  if (li < n1 + n2) return 'mid';
  return 'core';
}

const ENVELOPE = {
  top: { colsLo: 3, colsHi: 5, rowsMax: 4 },
  mid: { colsLo: 8, colsHi: 10, rowsMax: 2 },
  core: { colsLo: 4, colsHi: 5, rowsMax: 4 },
};

/**
 * 在一层 cols×rows 的网格里，从中心格向邻格随机生长出 need 个**连通**格子。
 * 扩张概率按 1/(1+d²) 偏向中心，于是边缘自然留下随机缺口。
 */
function growBlob(rng, need, cols, rows) {
  const cap = cols * rows;
  if (need > cap) return null;
  const picked = new Array(cap).fill(false);
  const cells = [];
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const startC = clamp(Math.round(cx + (rng.next() - 0.5) * 1.2), 0, cols - 1);
  const startR = clamp(Math.round(cy + (rng.next() - 0.5) * 1.2), 0, rows - 1);
  const key = (c, r) => r * cols + c;
  const inFrontier = {};
  let frontier = [];
  const pushN = (c, r) => {
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    if (picked[key(c, r)]) return;
    const k = key(c, r);
    if (inFrontier[k]) return;
    inFrontier[k] = true;
    frontier.push([c, r]);
  };
  picked[key(startC, startR)] = true;
  cells.push([startC, startR]);
  pushN(startC - 1, startR); pushN(startC + 1, startR);
  pushN(startC, startR - 1); pushN(startC, startR + 1);

  while (cells.length < need && frontier.length) {
    let totalW = 0;
    const w = new Array(frontier.length);
    for (let i = 0; i < frontier.length; i++) {
      const dx = frontier[i][0] - cx;
      const dy = frontier[i][1] - cy;
      w[i] = 1 / (1 + dx * dx + dy * dy);
      totalW += w[i];
    }
    let r = rng.next() * totalW;
    let pickI = frontier.length - 1;
    for (let i = 0; i < frontier.length; i++) {
      r -= w[i];
      if (r <= 0) { pickI = i; break; }
    }
    const cell = frontier[pickI];
    frontier = frontier.slice(0, pickI).concat(frontier.slice(pickI + 1));
    delete inFrontier[key(cell[0], cell[1])];
    picked[key(cell[0], cell[1])] = true;
    cells.push(cell);
    pushN(cell[0] - 1, cell[1]); pushN(cell[0] + 1, cell[1]);
    pushN(cell[0], cell[1] - 1); pushN(cell[0], cell[1] + 1);
  }
  return cells.length === need ? cells : null;
}

/**
 * 中段层专用：**整行铺满**的带状团块（第 1.2 节「中段 8–10 列」是视觉宽度包络）。
 *
 * 若直接用 growBlob，中心偏置会让边缘列留空 —— 实测网格 8–10 列时实际只占 6–9 列，
 * 沙漏的中段收不出应有的宽度。这里先铺满一整行（cols 个列各一格，天然 4 邻接连通），
 * 再把余量从中心向两侧补到另一行（上下相邻，仍保持连通）。
 */
function buildBand(rng, need, cols, rows) {
  const cap = cols * rows;
  if (need > cap) return null;
  const r0 = rng.int(0, rows - 1);
  const cells = [];
  for (let c = 0; c < cols && cells.length < need; c++) cells.push([c, r0]);
  if (cells.length === need) return cells;
  if (rows <= 1) return null;
  const other = 1 - r0;
  const mid = (cols - 1) / 2;
  const order = [];
  for (let c = 0; c < cols; c++) order.push(c);
  order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  let oi = 0;
  while (cells.length < need) {
    cells.push([order[oi % cols], other]);
    oi++;
    if (oi > cap) return null;
  }
  return cells;
}

/* ==================== 主堆 ==================== */

/**
 * 生成主堆：每层独立生长一个连通团块。
 * 层中心沿纵向从顶部游走到核心，横向做随机游走，
 * 层间再叠加 {(W/2,H/2),(0,H/2),(W/2,0)} 的错位向量。
 * opts.pinLeft / pinRight 指定的层会被平移到对应边缘（只平移列号，不改形状），
 * 用来保证包围盒宽度稳定 ≥ 560。
 */
function buildMainStack(rng, plan, opts) {
  const N = plan.length;
  const out = [];
  let px = rng.int(0, 1);
  let py = rng.int(0, 1);
  let cxs = 330;
  for (let li = 0; li < N; li++) {
    const need = plan[li];
    const seg = opts.segment(li, N);
    const env = opts.envelope[seg];
    const grid = pickGrid(rng, need, env.colsLo, env.colsHi, env.rowsMax);
    const cols = grid.cols;
    const rows = grid.rows;
    let blob = seg === 'mid'
      ? buildBand(rng, need, cols, rows)
      : growBlob(rng, need, cols, rows);
    if (!blob) throw new Error('团块生长失败：' + need + '/' + cols + 'x' + rows);

    // 纵向目标：层号线性推进（沙漏轮廓由 plan 决定，这里只负责摆放）
    const t = N > 1 ? li / (N - 1) : 0;
    const baseCy = opts.topCy + (opts.botCy - opts.topCy) * t;
    const jitterY = (rng.next() - 0.5) * opts.walkY;
    const blockH = (rows - 1) * TILE_H;
    let oy = Math.round((baseCy + jitterY - blockH / 2) / LATTICE_Y) * LATTICE_Y + py * LATTICE_Y;
    oy = clamp(oy, opts.yMin, opts.yMax - blockH);

    // 横向：中心随机游走 + 层间错位向量
    cxs += (rng.next() - 0.5) * opts.walkX;
    cxs = clamp(cxs, opts.cxMin, opts.cxMax);
    const blockW = (cols - 1) * TILE_W;
    let loX = opts.xMin;
    let hiX = opts.xMax - blockW;
    // 走到队列竖向链所在的高度时，主堆必须让开左右边列
    if (oy + blockH >= QUEUE_COL_GUARD_Y && opts.guardMargins) {
      loX = Math.max(loX, MARGIN_COLS[0] + TILE_W);
      hiX = Math.min(hiX, MARGIN_COLS[1] - TILE_W);
    }
    if (hiX < loX) { loX = opts.xMin; hiX = opts.xMax - blockW; }

    let ox;
    const pin = li === opts.pinLeft ? 'left' : (li === opts.pinRight ? 'right' : '');
    if (pin) {
      // 把团块平移到该层网格的对应侧（只平移列号，形状与连通性不变）
      let minC = cols;
      let maxC = -1;
      for (let i = 0; i < blob.length; i++) {
        if (blob[i][0] < minC) minC = blob[i][0];
        if (blob[i][0] > maxC) maxC = blob[i][0];
      }
      const shift = pin === 'left' ? -minC : (cols - 1 - maxC);
      if (shift) blob = blob.map((p) => [p[0] + shift, p[1]]);
      ox = pin === 'left' ? opts.xMin : opts.xMax - blockW;
    } else {
      ox = Math.round((cxs - blockW / 2) / LATTICE_X) * LATTICE_X + px * LATTICE_X;
      ox = Math.round((ox - loX) / opts.xAlign) * opts.xAlign + loX;
      ox = clamp(ox, loX, hiX);
    }
    ox = clamp(ox, opts.xMin, opts.xMax - blockW);
    ox = Math.round(ox / LATTICE_X) * LATTICE_X;

    for (let i = 0; i < blob.length; i++) {
      out.push({
        x: ox + blob[i][0] * TILE_W,
        y: oy + blob[i][1] * TILE_H,
        layer: li,
        region: opts.region,
        zoneLayer: li,
        seg,
        gridW: cols,
        gridH: rows,
        gaps: grid.gaps,
        pinned: pin || '',
      });
    }
    // 层间错位向量：{(W/2,H/2), (0,H/2), (W/2,0)}
    const off = opts.offsets[rng.int(0, opts.offsets.length - 1)];
    px = (px + off[0]) % 2;
    py = (py + off[1]) % 2;
  }
  return out;
}

/* ==================== 盲盒队列 ==================== */

/**
 * 四条链：左右各一条竖向（7 张）+ 一条横向（15 张），共 44 张。
 *
 * 布局约束（第 1.3 节，硬约束）：
 *   · 四条链占据**互不重叠**的矩形区，链与链之间至少留 0 格缝隙，
 *     否则一条链的队首会被另一条链压住 → 盲盒永远翻不开；
 *   · 竖向链放在主堆两侧边列（x=33 / x=627，占 x∈[33,99] 与 [627,693]）；
 *   · 横向链只允许落在两条竖向链之间（x∈[99,627]，15 张跨 462px 正好填满），
 *     且上下错开一档（y=616 与 y=748，各自 ±1 格）；
 *   · 链内每张牌单独占一个 layer，z 沿链递增 → 链尾那张是唯一可点的队首。
 *
 * 「队列位置由 seed 做 ±1 格偏移」（第 1.3 节）：偏移量由 seed 决定，但方向
 * 受邻居约束——竖向链只能向上偏（否则越出 BOARD_BAND 下沿），左侧横链只能
 * 向上偏、右侧横链只能向下偏（否则两条横链会相撞）。四种组合 × 两条竖向
 * 各自独立抽取，因此不同 seed 的队列位置确实不同，且永远不会互相压死。
 */
const QUEUE_SHAPE = [
  { name: 'queueLeftV', dir: 'v', x: 33, y: 528, dy: [0, -1], n: 7 },
  { name: 'queueRightV', dir: 'v', x: 627, y: 528, dy: [0, -1], n: 7 },
  { name: 'queueLeftH', dir: 'h', x: 99, y: 616, dy: [0, -1], n: 15 },
  { name: 'queueRightH', dir: 'h', x: 99, y: 748, dy: [0, 1], n: 15 },
];

function buildQueue(rng, baseLayer, scale) {
  const out = [];
  let layer = baseLayer;
  let total = 0;
  for (let qi = 0; qi < QUEUE_SHAPE.length; qi++) {
    const q = QUEUE_SHAPE[qi];
    const n = Math.max(1, Math.round(q.n * scale));
    const spanX = q.dir === 'h' ? (n - 1) * LATTICE_X : 0;
    const spanY = q.dir === 'v' ? (n - 1) * LATTICE_Y : 0;
    const step = q.dy[rng.int(0, q.dy.length - 1)];
    const bx = clamp(q.x, X_MIN, X_MAX - spanX);
    const by = clamp(q.y + step * LATTICE_Y, Y_MIN, Y_MAX - spanY);
    for (let k = 0; k < n; k++) {
      out.push({
        x: q.dir === 'h' ? bx + k * LATTICE_X : bx,
        y: q.dir === 'v' ? by + k * LATTICE_Y : by,
        layer: layer++,
        region: q.name,
        zoneLayer: qi,
        seg: 'queue',
        chain: qi,
        chainIndex: k,
        chainLen: n,
        gridW: 1,
        gridH: 1,
        gaps: 0,
        pinned: '',
      });
      total++;
    }
  }
  return { cards: out, total, layers: layer - baseLayer };
}

/* ==================== 几何验收工具 ==================== */

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

function overlapArea(a, b) {
  const ix = Math.min(a.x + TILE_W, b.x + TILE_W) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + TILE_H, b.y + TILE_H) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}

/** 开局可点张数：没有被任何 z 更高的牌以 >10% 面积压住的牌 */
export function countVisible(cards) {
  let n = 0;
  for (let i = 0; i < cards.length; i++) {
    const a = cards[i];
    let blocked = false;
    for (let j = 0; j < cards.length; j++) {
      if (i === j) continue;
      const b = cards[j];
      if (b.z <= a.z) continue;
      if (overlapArea(a, b) > THRESH_AREA) { blocked = true; break; }
    }
    if (!blocked) n++;
  }
  return n;
}

/* ==================== 单次构建 ==================== */

function buildOnce(rngSeed, profile) {
  const rng = makeRng(rngSeed >>> 0);
  const plan = layerPlanFor(profile);
  const N = plan.length;
  const isL1 = profile.queueCount === 0;
  let out;

  if (isL1) {
    // 第 1.4 节：第一关同样由 seed 生成紧凑堆，列数 5–7 随机、每层团块随机生长。
    // 层数 / 牌数仍按档位。
    //
    // 形状参数直接决定教学关的 greedy 通关率（第 1.4 节 ≥95%，第 3.2 节要求
    // 花色用整池均匀洗牌，所以只能调形状）。实测档3（48 张 / 16 花色各 3 张 / 7 槽）
    // 的 greedy 通关率与开局可点张数强相关：
    //   可点 20–23 → 0%    24–27 → 14%    28–31 → 44%    32–35 → 62%    36+ → 100%
    // 原因是 16 种花色各恰好 3 张时，槽位里挂着半个对子就必须马上找到第三张；
    // 可点牌越多，凑成三消的机会越多。因此第一关的层比第二关扁（rowsMax 4），
    // 层间纵向间距随层数线性拉开（150px/层），可点张数稳定落在 32–44。
    out = buildMainStack(rng, plan, {
      region: 'core',
      segment: () => 'l1',
      envelope: { l1: { colsLo: 5, colsHi: 7, rowsMax: 4 } },
      topCy: 240,
      botCy: 240 + 150 * (N - 1),
      yMin: Y_MIN,
      yMax: Y_MAX,
      // 第 2 节「五局内布局不能相同」：第一关牌少，若把横向中心钉在 280–380，
      // 不同 seed 会生成几乎重合的团块（实测同档位相似度均值 0.646、最大 1.000），
      // 五局窗口内根本凑不出足够不同的布局。因此横向中心放开到整幅牌桌，
      // 随机游走步长也放大到 1.6 格。
      xMin: X_MIN,
      xMax: X_MAX,
      cxMin: X_MIN + 132,
      cxMax: X_MAX - 132,
      walkX: 1.6 * LATTICE_X,
      walkY: 1.0 * LATTICE_Y,
      xAlign: TILE_W,
      guardMargins: false,
      pinLeft: -1,
      pinRight: -1,
      offsets: [[0, 1], [1, 0], [1, 1]],
    });
  } else {
    const n1 = Math.max(1, Math.round(N * 0.25));
    const n2 = Math.max(1, Math.round(N * 0.36));
    const midEnd = Math.min(N, n1 + n2) - 1;
    out = buildMainStack(rng, plan, {
      region: 'core',
      segment: segmentOf,
      envelope: ENVELOPE,
      topCy: 280,
      botCy: 480,
      yMin: STACK_TOP,
      yMax: STACK_BOTTOM,
      xMin: X_MIN,
      xMax: X_MAX,
      cxMin: 330 - 1.5 * LATTICE_X,
      cxMax: 330 + 1.5 * LATTICE_X,
      walkX: 0.6 * LATTICE_X,
      walkY: 0.6 * LATTICE_Y,
      xAlign: TILE_W,
      guardMargins: true,
      // 中段首尾两层分别钉在左右极限 → 包围盒宽度恒为 xMax+66-xMin = 660 ≥ 560
      pinLeft: n1,
      pinRight: midEnd,
      offsets: [[1, 1], [0, 1], [1, 0]],
    });
    const sumMain = plan.reduce((a, b) => a + b, 0);
    if (out.length !== sumMain) {
      throw new Error('主堆张数 ' + out.length + ' ≠ ' + sumMain);
    }
    const q = buildQueue(rng, N, profile.queueCount / QUEUE);
    if (q.total !== profile.queueCount) {
      throw new Error('队列张数 ' + q.total + ' ≠ 档位 ' + profile.queueCount);
    }
    out = out.concat(q.cards);
    out.layerCount = N + q.layers;
  }

  // 半格晶格 / 版面边界硬校验
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (c.x % LATTICE_X !== 0 || c.y % LATTICE_Y !== 0) {
      throw new Error('坐标 (' + c.x + ',' + c.y + ') 不在半格晶格上');
    }
    if (c.x < BOARD_BAND.left || c.y < BOARD_BAND.top ||
        c.x + TILE_W > BOARD_BAND.right || c.y + TILE_H > BOARD_BAND.bottom) {
      throw new Error('坐标 (' + c.x + ',' + c.y + ') 越出牌桌');
    }
  }
  const expect = profile.mainCount + profile.queueCount;
  if (out.length !== expect) {
    throw new Error('布局张数 ' + out.length + ' ≠ 档位 ' + expect);
  }
  // z 全序：layer 升序 → y 升序 → x 升序
  out.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < out.length; i++) {
    out[i].id = i;
    out[i].z = i;
  }
  if (!out.layerCount) {
    let maxLayer = 0;
    for (let i = 0; i < out.length; i++) if (out[i].layer > maxLayer) maxLayer = out[i].layer;
    out.layerCount = maxLayer + 1;
  }
  return out;
}

/* ==================== 对外入口 ==================== */

/**
 * 生成一关的牌位。返回与旧版相同形状的数组（不含 z/id，由调用方统一编号），
 * 另在数组上挂 `layerCount` 供 generator 生成 layerMeta。
 *
 * 第二关额外做「开局可点 19–25 张」的几何验收：由同一个 seed 派生若干候选几何，
 * 取第一个落在区间内的；全部落不进去时返回偏差最小的那个（不会静默放宽——
 * createNewGame 与 test.js 都会独立复核这个区间）。
 */
export function generateProfileLayout(seed, profile) {
  if (!profile) throw new Error('generateProfileLayout 需要 profile');
  const base = ((seed >>> 0) ^ 0x50def1ce) >>> 0;
  if (profile.queueCount === 0) {
    /**
     * 第一关也是「紧凑堆」：层间纵向间距只有 150px，而层间随机游走
     * （walkY = 1.0 格）偶尔会把某一层推得太远，使整堆裂成 2 个互不相接的
     * 团块（实测 L1-1 档 27/60、L1-2 档 6/60 出现分裂）。这里同样做候选筛选：
     * 由同一 seed 派生候选，优先取整堆单连通的；全部不连通时取分量最少的。
     * 只换候选顺序，不改形状分布，也不放宽任何验收阈值。
     */
    const first = buildOnce(base, profile);
    if (countComponents(first) <= 1) return first;
    let best = first;
    let bestComp = countComponents(first);
    for (let k = 0; k < 15 && bestComp > 1; k++) {
      const cards = buildOnce((base ^ Math.imul(k + 1, 0x9e3779b9)) >>> 0, profile);
      const comp = countComponents(cards);
      if (comp < bestComp) { bestComp = comp; best = cards; }
    }
    return best;
  }

  let best = null;
  let bestScore = Infinity;
  for (let k = 0; k < 16; k++) {
    const cards = buildOnce((base ^ Math.imul(k + 1, 0x9e3779b9)) >>> 0, profile);
    const v = countVisible(cards);
    const score = v < VISIBLE_MIN ? VISIBLE_MIN - v : (v > VISIBLE_MAX ? v - VISIBLE_MAX : 0);
    if (score === 0) return cards;
    if (score < bestScore) { bestScore = score; best = cards; }
  }
  return best;
}

/** 档位布局说明（UI / 测试用） */
export function describeProfileLayout(profile) {
  const plan = layerPlanFor(profile);
  let maxPlan = 0;
  let minPlan = Infinity;
  for (let i = 0; i < plan.length; i++) {
    if (plan[i] > maxPlan) maxPlan = plan[i];
    if (plan[i] < minPlan) minPlan = plan[i];
  }
  return {
    profileId: profile.id,
    layers: profile.layers,
    types: profile.types,
    mainCount: profile.mainCount,
    queueCount: profile.queueCount,
    total: profile.mainCount + profile.queueCount,
    plan,
    planMax: maxPlan,
    planMin: minPlan,
    globalLayers: profile.layers + (profile.queueCount ? QUEUE_SHAPE.reduce((a, q) => a + q.n, 0) : 0),
  };
}

export { QUEUE_SHAPE };
