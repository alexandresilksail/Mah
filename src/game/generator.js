/**
 * 漏斗发牌 + 难度验收（纯 JS，零 DOM）。
 *
 * ── 本轮重做 ──────────────────────────────────────────────────────
 * 1. 单堆几何由 layout.js 给出（第 2 关葫芦轮廓）；先用 peelOrder() 算出
 *    一条合法的全消除顺序 order[0..N-1]，同一波可点牌之间随机打散。
 * 2. 按 order **位置**分三带（BAND_RATIOS = 25% / 30% / 45%，段长对齐 3）：
 *      上带（容易消、花色多）：≥12 种花色，同花色三张紧邻 → 同时可点；
 *                              开局可点牌里花色 ≥10 种、≥6 种各有 ≥3 张。
 *      中带（乱、开始耗道具）：每组三张间距拉开到 span=3 的批次轮转，
 *                              部分组的成员自然落进下带边界之后。
 *      下带（牌多、暗藏死局）：同花色三张在批次内被拉远，末批三张的
 *                              「最后一张」正好落在 order 最深处。
 * 3. 可解性证书：沿 order 重放（真实槽位规则），槽位始终未满 7 且最终清空；
 *    同时挂起的花色 ≤6（span=3 时峰值 3）。verify() 用带几何的重放复核。
 * 4. 难度调优仍是方案 b：tools/tune_pool.mjs 离线筛 seed 池；
 *    生成期爬山（方案 a）保留为可选项，HILL_STEPS 默认 0。
 * 5. 每种花色的张数必然是 3 的倍数（每个组恰好 3 张同花色）。
 */
import {
  TILE_W,
  TILE_H,
  TILE_AREA,
  OVERLAP_THRESHOLD,
  SLOT_CAPACITY,
  LEVEL_SPEC,
  FUNNEL,
  BAND_RATIOS,
  levelParams,
} from './config.js';
import { suitsFor } from './tiles.js';
import { makeRng, randomSeed } from './rng.js';
import { pickPoolSeed } from './seed_pool.js';
import {
  generateLayout,
  peelOrder,
  overlapArea,
  isBlocked,
  buildBlockerGraph,
} from './layout.js';

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

/* ==================== 花色序列的证书 ==================== */

/**
 * 只重放花色序列（不看几何，O(n)）：真实槽位规则，同花色满 3 张立刻消除。
 * 返回 { ok, peak }：ok = 全程槽位 < SLOT_CAPACITY 且最终全部清空。
 */
export function replayTypes(types) {
  const count = {};
  let slot = 0;
  let peak = 0;
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    const n = (count[t] || 0) + 1;
    slot += 1;
    if (n >= 3) {
      count[t] = n - 3;
      slot -= 3;
    } else {
      count[t] = n;
    }
    if (slot >= SLOT_CAPACITY) return { ok: false, peak };
    if (slot > peak) peak = slot;
  }
  for (const k in count) {
    if (Object.prototype.hasOwnProperty.call(count, k) && count[k] !== 0) {
      return { ok: false, peak };
    }
  }
  return { ok: slot === 0, peak };
}

/* ==================== 漏斗三带构造 ==================== */

const align3 = (v) => Math.round(v / 3) * 3;

/**
 * 用一个「轮转指针」给每个三元组分配花色，保证池内每种花色被用到的组数尽量均衡，
 * 且同一种花色的总张数始终是 3 的倍数。
 */
function suitPicker(pool, rng) {
  const used = {};
  for (let i = 0; i < pool.length; i++) used[pool[i]] = 0;
  const order = rng.shuffle(pool.slice());
  return () => {
    let best = order[0];
    for (let i = 1; i < order.length; i++) {
      if (used[order[i]] < used[best]) best = order[i];
    }
    used[best] += 1;
    return best;
  };
}

/**
 * 在一个连续段里按「批次」生成花色。
 * 每批 span 个组 × 3 张 = 3·span 个位置，组内三张的 order 间距 = span。
 * span=3 时每批 9 张、3 种花色，沿 order 的槽位峰值 = 6（常停在 5~6 格）。
 * span=1 时就是三张紧邻三消，峰值 = 2。
 * 段长必须是 3 的倍数（调用前已对齐），因此每段都能被完整填满、每种花色 3 的倍数张。
 */
function fillBatches(types, start, end, span, pick) {
  const batchLen = 3 * span;
  let p = start;
  while (p + batchLen <= end) {
    const batchSuits = [];
    for (let g = 0; g < span; g++) batchSuits.push(pick());
    for (let t = 0; t < 3; t++) {
      for (let g = 0; g < span; g++) types[p + t * span + g] = batchSuits[g];
    }
    p += batchLen;
  }
  while (p < end) {
    const t = pick();
    for (let k = 0; k < 3 && p + k < end; k++) types[p + k] = t;
    p += 3;
  }
}

/**
 * 第 2 关漏斗：按 order **位置**分三带（BAND_RATIOS 25 / 30 / 45）。
 *
 * · 上带 [0,topEnd)：19 个紧邻三消组，花色从 ≥12 种的池里轮转。
 *   开局可点的牌就是 order 的第一波，它们几乎全在上带里，
 *   于是「不同花色 ≥10 种、≥6 种各有 ≥3 张」自然成立。
 * · 中带 [topEnd,midEnd)：span=3 的批次轮转，组内三张间距 3；
 *   中带尾部那一批会跨过 midEnd，于是同一组的成员落进下带。
 * · 下带 [midEnd,n)：同样 span=3 轮转，但花色全放开（15 种），
 *   末批三组的第 3 张正好落在 order 最深处 ——「最后一张埋在最深处」。
 *   批内同时挂起的花色只有 3 种（≤6），证书稳定通过。
 *
 * 段长全部是 3 的倍数，每个组恰好 3 张同花色 → 每种花色张数必然 %3==0。
 * 构造完用 replayTypes() 复核证书；不通过则降级为全紧邻三消的安全序列。
 */
export function buildFunnelSequence(n, waves, suits, cfg, rng) {
  const c = cfg || FUNNEL;
  void waves;
  const topEnd = Math.max(3, Math.min(n - 6, align3(Math.round(n * BAND_RATIOS[0]))));
  const midEnd = Math.min(n - 3, topEnd + Math.max(3, align3(Math.round(n * BAND_RATIOS[1]))));
  const span = Math.max(1, Math.min(3, c.MID_SPAN));
  const sh = rng.shuffle(suits.slice());
  const topN = Math.max(12, Math.min(c.TOP_SUIT_MIN, suits.length));
  const topSuits = sh.slice(0, Math.min(topN, sh.length));

  const types = new Array(n);
  // 上带：三张紧邻，花色在 12 种里轮转（19 组 → 12 种各 1~2 组）
  for (let p = 0; p < topEnd; p += 3) {
    const t = topSuits[Math.floor(p / 3) % topSuits.length];
    types[p] = t;
    if (p + 1 < n) types[p + 1] = t;
    if (p + 2 < n) types[p + 2] = t;
  }
  // 中带 / 下带：批次轮转，组内三张间距 = span；花色池放开到全部 15 种
  const pickMid = suitPicker(suits, rng);
  fillBatches(types, topEnd, midEnd, span, pickMid);
  const pickBottom = suitPicker(sh, rng);
  fillBatches(types, midEnd, n, span, pickBottom);

  for (let i = 0; i < n; i++) {
    if (types[i] === undefined) types[i] = suits[i % suits.length];
  }

  let cert = replayTypes(types);
  if (!cert.ok) {
    const safe = new Array(n);
    const safePick = suitPicker(suits, rng);
    fillBatches(safe, 0, n, 1, safePick);
    cert = replayTypes(safe);
    return {
      types: safe,
      bands: { top: [0, topEnd], mid: [topEnd, midEnd], bottom: [midEnd, n] },
      cert,
      degraded: true,
      params: { topN: topSuits.length, span, topEnd, midEnd, ratios: BAND_RATIOS.slice() },
    };
  }
  return {
    types,
    bands: { top: [0, topEnd], mid: [topEnd, midEnd], bottom: [midEnd, n] },
    cert,
    degraded: false,
    params: { topN: topSuits.length, span, topEnd, midEnd, ratios: BAND_RATIOS.slice() },
  };
}

/**
 * 第 1 关漏斗：order 前 9 张只用 3 种花色（各 3 张紧邻），
 * 其余 15 张用另外 5 种花色（共 8 种、每种恰好 3 张）。
 */
function buildEasySequence(n, suits, rng) {
  const types = new Array(n);
  const sh = rng.shuffle(suits.slice());
  const top = sh.slice(0, 3);
  const rest = sh.slice(3, 8);
  // 上带 9 张：3 组紧邻三消
  for (let g = 0; g < 3; g++) {
    for (let k = 0; k < 3; k++) types[g * 3 + k] = top[g];
  }
  // 其余 15 张：5 种花色，按「2 组一批」轮转，组内三张间距 2
  let p = 9;
  let gi = 0;
  while (p + 6 <= n) {
    const s0 = rest[gi % rest.length];
    const s1 = rest[(gi + 1) % rest.length];
    gi += 2;
    for (const t of [s0, s1, s0, s1, s0, s1]) types[p++] = t;
  }
  while (p < n) {
    const t = rest[gi % rest.length];
    gi++;
    for (let k = 0; k < 3 && p < n; k++) types[p++] = t;
  }
  // 修正每种花色的张数为 3 的倍数
  const cnt = {};
  for (let i = 0; i < n; i++) cnt[types[i]] = (cnt[types[i]] || 0) + 1;
  for (const t in cnt) {
    if (!Object.prototype.hasOwnProperty.call(cnt, t)) continue;
    let need = (3 - (cnt[t] % 3)) % 3;
    while (need > 0) {
      // 找一个出现次数不是 3 倍数的花色，改成它
      let donor = null;
      for (const d in cnt) {
        if (d !== t && cnt[d] % 3 !== 0) { donor = d; break; }
      }
      if (!donor) break;
      for (let i = n - 1; i >= 9 && need > 0; i--) {
        if (types[i] === donor) { types[i] = t; cnt[donor]--; cnt[t]++; need--; }
      }
      if (need > 0) break;
    }
  }
  const cert = replayTypes(types);
  if (!cert.ok) {
    const safe = new Array(n);
    for (let i = 0; i < n; i += 3) {
      const t = sh[Math.floor(i / 3) % sh.length];
      safe[i] = t;
      if (i + 1 < n) safe[i + 1] = t;
      if (i + 2 < n) safe[i + 2] = t;
    }
    return {
      types: safe,
      bands: { top: [0, 9], mid: [9, Math.min(18, n)], bottom: [Math.min(18, n), n] },
      cert: replayTypes(safe),
      degraded: true,
      params: { topN: 3, span: 2, K: 0, aEnd: 9, bEnd: 18, tailStart: n },
    };
  }
  return {
    types,
    bands: { top: [0, 9], mid: [9, Math.min(18, n)], bottom: [Math.min(18, n), n] },
    cert,
    degraded: false,
    params: { topN: 3, span: 2, K: 0, aEnd: 9, bEnd: 18, tailStart: n },
  };
}

/* ==================== 机器人模拟 ==================== */

/**
 * 机器人模拟（纯逻辑，无 DOM，不使用任何道具）。
 *   mode='random' ：随机点一张可点牌。
 *   mode='greedy' ：优先点能立刻消除 / 凑成对的牌，其次点能解锁最多牌的牌。
 *                   o.noise=0.1 即 greedy + 10% 失误（10% 步改成随机点）。
 *   mode='shallow'：浅层优先 —— 只在当前可点牌里「最靠近表面的一层」
 *                   （layer 最大）中选择，再用贪心评分。
 * 返回 { win, deadlock, steps, cleared, total, pct }。
 */
export function simulateRobot(levelData, rng, opt = {}) {
  const o = opt || {};
  const mode = o.mode || 'greedy';
  const cards0 = levelData.cards;
  const total = cards0.length;
  const cards = cards0.map((c) => ({ ...c, state: 'board', blocked: false }));
  const graph = levelData._graph || buildBlockerGraph(cards);
  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  const indeg = {};
  for (let i = 0; i < cards.length; i++) indeg[cards[i].id] = graph.blockers[cards[i].id].length;

  const slot = [];
  let steps = 0;
  const maxSteps = o.maxSteps || 20000;
  // 只用于验收报告的「朴素点法槽位 / 挂起花色」统计，不改任何槽位规则
  const slotHist = [0, 0, 0, 0, 0, 0, 0, 0];
  let hangPeak = 0;
  const track = !!o.track;
  const result = (r) => (track ? { ...r, slotHist, hangPeak } : r);
  // 增量维护「当前可点牌」：初始为所有入度为 0 的牌，拿走一张后只把新解锁的牌补进来。
  // 爬山会调用上万次机器人模拟，这里省掉每步 O(n) 的全表扫描。
  const free = [];
  for (let i = 0; i < cards.length; i++) if (indeg[cards[i].id] === 0) free.push(cards[i]);
  let alive = total;
  const pctOf = () => (total - alive - slot.length) / total;

  while (steps < maxSteps) {
    if (alive === 0 && slot.length === 0) {
      return result({ win: true, deadlock: false, steps, cleared: total, total, pct: 1 });
    }
    if (slot.length >= SLOT_CAPACITY) {
      return result({ win: false, deadlock: true, steps, cleared: total - alive - slot.length, total, pct: pctOf() });
    }
    if (!free.length) {
      return result({ win: false, deadlock: true, stuck: true, steps, cleared: total - alive - slot.length, total, pct: pctOf() });
    }

    let pick;
    if (mode === 'random' || (o.noise && rng.next() < o.noise)) {
      pick = free[rng.int(0, free.length - 1)];
    } else {
      // 浅层优先：候选只取「最靠近表面」的那一层（layer 最大）
      let pool = free;
      if (mode === 'shallow') {
        let topLayer = -1;
        for (let i = 0; i < free.length; i++) if (free[i].layer > topLayer) topLayer = free[i].layer;
        pool = free.filter((c) => c.layer === topLayer);
        if (!pool.length) pool = free;
      }
      const cnt = {};
      for (let i = 0; i < slot.length; i++) cnt[slot[i].type] = (cnt[slot[i].type] || 0) + 1;
      let best = null;
      let bestScore = -Infinity;
      for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        const n = cnt[c.type] || 0;
        let unlock = 0;
        const dep = graph.dependents[c.id];
        for (let k = 0; k < dep.length; k++) if (indeg[dep[k]] === 1) unlock++;
        // 严格按规格的朴素贪心：能立刻消除 > 能凑成对 > 解锁最多牌。
        let score;
        if (n === 2) score = 1000 + unlock * 8;
        else if (n === 1) score = 300 + unlock * 6;
        else score = unlock * 12;
        score += rng.next() * 4;
        if (score > bestScore) { bestScore = score; best = c; }
      }
      pick = best;
    }

    pick.state = 'slot';
    alive -= 1;
    const fi = free.indexOf(pick);
    if (fi >= 0) free.splice(fi, 1);
    const dep = graph.dependents[pick.id];
    for (let k = 0; k < dep.length; k++) {
      indeg[dep[k]] -= 1;
      if (indeg[dep[k]] === 0) free.push(byId[dep[k]]);
    }
    slot.push(pick);
    steps++;
    if (track) {
      slotHist[Math.min(7, slot.length)]++;
      const kinds = {};
      for (let i = 0; i < slot.length; i++) kinds[slot[i].type] = 1;
      let hang = 0;
      for (const k in kinds) if (Object.prototype.hasOwnProperty.call(kinds, k)) hang++;
      if (hang > hangPeak) hangPeak = hang;
    }

    const cnt = {};
    for (let i = 0; i < slot.length; i++) cnt[slot[i].type] = (cnt[slot[i].type] || 0) + 1;
    let hit = null;
    for (const t in cnt) {
      if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) { hit = t; break; }
    }
    if (hit !== null) {
      let need = 3;
      for (let i = 0; i < slot.length && need > 0; i++) {
        if (slot[i].type === hit) {
          slot[i].state = 'cleared';
          slot.splice(i, 1);
          i--;
          need--;
        }
      }
    }
  }
  return result({ win: false, deadlock: false, timeout: true, steps, cleared: 0, total, pct: 0 });
}

/** 旧接口：模拟「正常玩家」，等价于 greedy + 少量噪声 */
export function simulatePlayer(levelData, rng, opt = {}) {
  const r = simulateRobot(levelData, rng, { ...opt, mode: 'greedy' });
  return {
    win: r.win,
    steps: r.steps,
    moves: r.steps,
    deadlock: r.deadlock,
    stuck: r.stuck,
    timeout: r.timeout,
    left: r.total - r.cleared,
    cleared: r.cleared,
    pct: r.pct,
  };
}

/* ==================== 生成期爬山（方案 a） ==================== */

/**
 * 固定几何与 order，反复交换两张牌的花色：
 *   · 先用 replayTypes() 证书确认仍可解；
 *   · 再用贪心机器人跑 HILL_PROBES 局估计通关率；
 *   · 通关率下降才保留交换。
 * 交换只在「同一剥离波」内进行，这样最能改变玩家实际可点牌的花色构成。
 */
export function hillClimb(types, ctx, rng, steps, probes) {
  const { cards, graph, order, bands, seed } = ctx;
  void ctx.waves;
  let cur = types.slice();
  const probeData = { cards: cards.map((c) => ({ ...c })), _graph: graph };
  const byId = {};
  for (let i = 0; i < probeData.cards.length; i++) byId[probeData.cards[i].id] = probeData.cards[i];

  // 一组固定的探针随机源，刻意避开 test.js 验收用的 0xabcdef 异或源：
  // 调优的是「这关卡在多种典型贪心走法下的平均通关率」，不是针对验收那一局过拟合。
  const probeSeeds = [seed ^ 0x13579bdf, seed ^ 0x2468ace0, seed ^ 0x55aa55aa, seed ^ 0x0f0f0f0f];

  const evaluate = (seq) => {
    // seq 的下标是 order 位置，必须按 order 映射回牌对象，不能按下标直接赋
    for (let i = 0; i < seq.length; i++) {
      const c = byId[order[i]];
      if (c) c.type = seq[i];
    }
    let wins = 0;
    // 每次评估都从固定种子新建 rng，保证同一个 seq 的得分可复现、不同 seq 可比较
    for (let k = 0; k < probes; k++) {
      const pr = makeRng((probeSeeds[k % probeSeeds.length] ^ (k * 2654435761)) >>> 0);
      const r = simulateRobot(probeData, pr, { mode: 'greedy' });
      if (r.win) wins++;
    }
    return wins / probes;
  };
  let bestRate = evaluate(cur);
  // 只在中 / 底带交换：上带保持「3 种花色」的鸽巢安全区，前期绝对不会早死。
  const lo = bands ? bands.top[1] : 0;
  const hi = cur.length - 1;
  for (let s = 0; s < steps; s++) {
    const p = rng.int(lo, hi);
    const q = rng.int(lo, hi);
    if (p === q || cur[p] === cur[q]) continue;
    const cand = cur.slice();
    cand[p] = cur[q];
    cand[q] = cur[p];
    if (!replayTypes(cand).ok) continue;
    const rate = evaluate(cand);
    if (rate < bestRate) {
      cur = cand;
      bestRate = rate;
    }
  }
  return { types: cur, greedyRate: bestRate };
}

/* ==================== 关卡构造 ==================== */

function baseCard(src, z) {
  return {
    id: src.id,
    x: src.x,
    y: src.y,
    w: TILE_W,
    h: TILE_H,
    layer: src.layer,
    z,
    type: 'yaoji',
    state: 'board',
    blocked: false,
    vx: null,
    vy: null,
    vScale: 1,
    appearAt: 0,
  };
}

/** 绘制顺序 = z 全序：layer 升序 → y 升序 → x 升序（单堆，无侧堆分支） */
function assignZ(cards) {
  const sorted = cards.slice().sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < sorted.length; i++) sorted[i].z = i;
}

function layerMeta(cards, layers) {
  const out = [];
  for (let li = 0; li < layers; li++) {
    const list = cards.filter((c) => c.layer === li);
    let ox = 360;
    let oy = 500;
    let cx = 0;
    let cy = 0;
    if (list.length) {
      ox = list[0].x;
      oy = list[0].y;
      for (let i = 1; i < list.length; i++) {
        if (list[i].x < ox) ox = list[i].x;
        if (list[i].y < oy) oy = list[i].y;
      }
      cx = Math.round((Math.max.apply(null, list.map((c) => c.x)) + TILE_W - ox) / TILE_W);
      cy = Math.round((Math.max.apply(null, list.map((c) => c.y)) + TILE_H - oy) / TILE_H);
    }
    out.push({ li, ox, oy, c: cx, r: cy, n: list.length });
  }
  return out;
}

/**
 * 生成一关。签名与旧版完全一致：(level, seed, opt)。
 * opt.funnel 覆盖难度参数；opt.plan 覆盖层计划；opt.tune 覆盖爬山步数；
 * opt.types 覆盖花色数；opt.log 打印复现信息。
 */
export function generateLevel(level, seed, opt = {}) {
  // 运行时（不传 seed）第 2 关从验收 seed 池抽一个：方案 b 的落地点。
  // 传了 seed 就完全确定性复现（测试 / 调试 / 回放都走这条路）。
  const lv = level <= 1 ? 1 : 2;
  const s = (seed === undefined ? (lv === 1 ? randomSeed() : pickPoolSeed()) : seed) >>> 0;
  const rng = makeRng(s);
  const p = levelParams(level, () => rng.next());
  let cfg = { ...FUNNEL };
  if (opt.funnel) cfg = { ...cfg, ...opt.funnel };
  if (opt.tune !== undefined) cfg.HILL_STEPS = opt.tune;
  p.funnel = cfg;
  // 花色集合由 tiles.js 的两张显式清单给出，不再 TYPE_LIST.slice(0, types)
  const suits = opt.suits || suitsFor(p.level);
  if (opt.log === true && typeof console !== 'undefined' && console.info) {
    console.info(`[level] level=${p.level} seed=${s} cards=${p.cardCount} mode=${p.mode}`);
  }

  const src = generateLayout(s, { level: p.level, plan: opt.plan || p.plan });
  const cards = src.map((c) => baseCard(c, 0));
  assignZ(cards);

  const order = peelOrder(cards, () => rng.next());
  const waves = order.waves;
  const funnel = p.level === 1
    ? buildEasySequence(cards.length, suits, rng)
    : buildFunnelSequence(cards.length, waves, suits, cfg, rng);

  let typeSeq = funnel.types;
  let hill = null;
  if (p.level === 2 && cfg.HILL_STEPS > 0) {
    const graph = buildBlockerGraph(cards);
    hill = hillClimb(
      typeSeq,
      { cards, waves, graph, order, bands: funnel.bands, seed: s },
      rng,
      cfg.HILL_STEPS,
      cfg.HILL_PROBES
    );
    typeSeq = hill.types;
  }

  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  for (let i = 0; i < order.length; i++) {
    const c = byId[order[i]];
    if (c) c.type = typeSeq[i];
  }
  refreshBlocked(cards);
  const visible = cards.reduce((n, c) => n + (c.state === 'board' && !c.blocked ? 1 : 0), 0);

  return {
    cards,
    layers: layerMeta(cards, p.layers),
    solution: order.slice(),
    order,
    waves,
    bands: funnel.bands,
    funnelParams: funnel.params,
    typeSeq: typeSeq.slice(),
    certificate: replayTypes(typeSeq),
    degraded: funnel.degraded,
    hill: hill ? { greedyRate: hill.greedyRate, steps: cfg.HILL_STEPS, probes: cfg.HILL_PROBES } : null,
    params: p,
    seed: s,
    mode: p.mode,
    visible,
  };
}

/* ==================== 遮挡（单一几何定义） ==================== */

/** 重新计算遮挡。第二参数 L 保留仅为兼容旧调用，内部一律读 TILE_W / TILE_H 常量。 */
export function refreshBlocked(cards, L) {
  void L;
  const alive = cards.filter((c) => c.state === 'board');
  for (let i = 0; i < alive.length; i++) alive[i].blocked = isBlocked(alive[i], alive);
  return alive;
}

/** 开局可点的牌数（会顺带刷新 blocked） */
export function countVisible(cards, L) {
  refreshBlocked(cards, L);
  return cards.reduce((n, c) => n + (c.state === 'board' && !c.blocked ? 1 : 0), 0);
}

/** 单张牌被所有更高 z 牌的近似并集覆盖率（0~1），仅用于统计，不参与判定 */
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

/** 纯几何：一张牌当前是否被压住（供 engine / test 直接调用） */
export function isCovered(card, alive) {
  return isBlocked(card, alive);
}

/* ==================== 校验 ==================== */

/**
 * 可解性证书（带几何）：按 order 重放，确认每一步都可点、
 * 槽位始终未满 7、且全部清空。用 blocker graph 做 O(n) 的解锁判断。
 */
export function verify(levelData) {
  const cards = levelData.cards.map((c) => ({ ...c, state: 'board', blocked: false }));
  const graph = buildBlockerGraph(cards);
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
        if (slot[i].type === hit) {
          slot[i].state = 'cleared';
          slot.splice(i, 1);
          i--;
          need--;
        }
      }
    }
    if (slot.length >= SLOT_CAPACITY) return false;
  }
  return cards.every((c) => c.state === 'cleared') && slot.length === 0;
}
