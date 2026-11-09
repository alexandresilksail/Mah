/**
 * 关卡生成（纯 JS，零 DOM）。
 *
 * ── 第 5 步：反向生成，而不是随机撒花色 ────────────────────────────
 * 1. 在布局上跑 peelOrder()：反复取当前「未被遮挡」的牌，得到一条合法的全消除
 *    顺序 order[0..N-1]。这一步是纯几何的，与花色无关。
 * 2. 把 order 切成 74 个三元组，每组分配同一花色，15 种花色的组数相差 ≤1
 *    （14 种各 5 组、1 种 4 组 → 每种 15 或 12 张，全部是 3 的倍数）。
 * 3. 三元组在 order 上的**间距**决定难度：
 *    · 诱饵区：DECOY_GROUPS 组三张紧邻，开局就能连续凑齐，让玩家前期顺利；
 *    · 中段：TRAP_GROUPS 之外的组小幅拉开；
 *    · 陷阱区：TRAP_GROUPS 组目标跨度 TRAP_SPAN，第一张较浅、第三张埋在
 *      order 最深处，且因为 order 是按几何剥离顺序取的，三个成员必然来自
 *      不同深度 / 不同簇。玩家先收到一堆「1~2 张的半成品」，槽位被塞满。
 * 4. 预算调度器 SLOT_BUDGET 保证：沿 order 重放时，槽里同时挂着的牌永远
 *    ≤ 6 张 → **这条通关路径真实存在**，不是纸面可解。
 *
 * 侧堆同样走这条 order：队列深处（depth 大）的牌要一层层吐出来，天然落在
 * order 后段，于是陷阱花色自然沉在侧堆深处，不需要额外的特判。
 */
import {
  TILE_W,
  TILE_H,
  TILE_AREA,
  OVERLAP_THRESHOLD,
  SLOT_CAPACITY,
  LEVEL_SPEC,
  DIFFICULTY,
  levelParams,
} from './config.js';
import { TYPE_LIST } from './tiles.js';
import { makeRng, randomSeed } from './rng.js';
import {
  generateLayout,
  generateSidePiles,
  generateEasyLayout,
  peelOrder,
  overlapArea,
  isBlocked,
  buildBlockerGraph,
  CLUSTER_TEMPLATES,
} from './layout.js';

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

/* ==================== 组序列（显式四段） ==================== */

/**
 * 给 order 的每个位置分配一个「三元组编号」。seq 长度 = n，每个组号恰好出现 3 次。
 *
 * 不用"随机撒花色"，也不用"逐组调度"——后者会把中段也交错开，导致死局提前到
 * 50% 进度。这里把 order 切成四段，结构一眼可查：
 *
 *   段 A  前 165 张（55 组）   诱饵 15 组 + 中段 40 组，每组三张**严格紧邻**
 *                              → 前 74% 一路顺风，玩家以为自己在赢
 *   段 B  4 张                  4 个长期陷阱组的**第一张**（较浅，约 74% 进度）
 *                              → 槽里从此常驻 4 张半成品
 *   段 C  45 张（15 组）       普通陷阱组，连续三消，但玩家只剩 3 格周转
 *   段 D  8 张                  4 个长期组各收第二、三张（成对 g,g）
 *                              → 第三张埋在 order 最深处，被多个簇交叉压住
 *
 * 槽内峰值：段 A = 2；段 B 后 = 4；段 C 每组 4→5→6→7(立即三消)→4；
 * 段 D 4→5→3→4→2→3→1→2→0。**任何一步都不会停在 7 格且未消除**，
 * 所以这条 order 是真实存在的通关路径（verify 会用真实槽位规则重放）。
 *
 * 三个难度参数：
 *   DECOY_GROUPS 段 A 里用「3 种花色」的组数（越大前期越顺）
 *   TRAP_SPAN    段 B+C+D 的总张数（越大长期组第一张越浅、跨度越大）
 *   LONG_TRAP    长期挂单张的组数（越大槽位越紧，≤ SLOT_BUDGET-2）
 */
export function buildGroupSequence(n, rng, cfg) {
  const c = cfg || DIFFICULTY;
  const G = n / 3;
  const decoy = Math.min(c.DECOY_GROUPS, G - 1);
  // 陷阱区张数对齐到 3 的倍数：它等于 3 × 陷阱组数
  let spanCards = Math.round((c.TRAP_SPAN === undefined ? 57 : c.TRAP_SPAN) / 3) * 3;
  spanCards = Math.max(12, Math.min(spanCards, n - decoy * 3 - 12));
  const trap = spanCards / 3;
  const LONG = Math.max(1, Math.min(c.LONG_TRAP === undefined ? 4 : c.LONG_TRAP, trap - 1));
  const plain = trap - LONG;
  const mid = G - decoy - trap;

  const segA = (G - trap) * 3;
  const segB = LONG;
  const segC = plain * 3;
  const segD = LONG * 2;

  const seq = new Array(n);
  let g = 0;
  // 段 A：连续三消
  for (let k = 0; k < G - trap; k++) {
    const id = g++;
    seq[k * 3] = id;
    seq[k * 3 + 1] = id;
    seq[k * 3 + 2] = id;
  }
  // 段 B：长期组的第一张
  const longIds = [];
  for (let k = 0; k < LONG; k++) {
    const id = g++;
    longIds.push(id);
    seq[segA + k] = id;
  }
  // 段 C：普通陷阱组，紧邻三张
  for (let k = 0; k < plain; k++) {
    const id = g++;
    const p = segA + segB + k * 3;
    seq[p] = id;
    seq[p + 1] = id;
    seq[p + 2] = id;
  }
  // 段 D：长期组第二、三张成对，收第二张后立刻三消，绝不把槽撑到 7 格
  for (let k = 0; k < LONG; k++) {
    const p = segA + segB + segC + k * 2;
    seq[p] = longIds[k];
    seq[p + 1] = longIds[k];
  }

  const cls = [];
  for (let i = 0; i < G; i++) {
    if (i < decoy) cls.push('decoy');
    else if (i < decoy + mid) cls.push('mid');
    else if (i < decoy + mid + LONG) cls.push('trap-long');
    else cls.push('trap');
  }
  seq.violations = 0;
  seq.decoyGroups = decoy;
  seq.trapGroups = trap;
  seq.midGroups = mid;
  seq.longTrap = LONG;
  seq.groupClass = cls;
  seq.structure = { segA, segB, segC, segD, longFirstAt: segA, longLastAt: n - 1 };
  seq.difficulty = c;
  // rng 保留参数位：同结构的花色池仍由它打乱
  void rng;
  return seq;
}

/**
 * 组 → 花色：按「组在 order 中第一次出现的位置」分三段，逐段放开花色池。
 *   · 诱饵段（前 DECOY_GROUPS 组）：只用 3 种花色 → 开局随便点也不会被 7 格卡死
 *     （3 种 × 2 + 1 = 7，第 7 张必然凑成三消）；
 *   · 中段：9 种花色，混合拉远；
 *   · 陷阱段（最后 TRAP_GROUPS 组）：15 种花色全开，第三张埋在最深处。
 * 15 种花色一定全部出现，且每组恰好 3 张 → 每种花色的总数必然是 3 的倍数。
 * 池内轮转 + 段内配额修正，让各花色的组数尽量接近（差 ≤1 的目标）。
 */
function groupSuits(count, rng, seq, firstPos, cfg) {
  const ids = [];
  for (let i = 0; i < Math.min(15, TYPE_LIST.length); i++) ids.push(TYPE_LIST[i].id);
  if (count <= ids.length) return rng.shuffle(ids).slice(0, count);

  const sh = rng.shuffle(ids);
  const byFirst = [];
  for (let g = 0; g < count; g++) byFirst.push(g);
  byFirst.sort((a, b) => (firstPos[a] === undefined ? 9999 : firstPos[a]) - (firstPos[b] === undefined ? 9999 : firstPos[b]));
  const decoy = seq.decoyGroups || 0;
  const trap = seq.trapGroups || 0;
  const mid = Math.max(0, count - decoy - trap);

  // 三段花色池互不重叠，池大小按「阶段组数 / 5」动态分配，
  // 于是每种花色分到 4 或 5 组（组数相差 ≤1，张数必然是 3 的倍数）。
  // 默认 15/40/19 → 3 / 8 / 4 种花色。
  // cfg.DECOY_SUITS / cfg.TRAP_SUITS 可显式覆盖（难度调参入口）。
  const d = cfg || {};
  const n0 = Math.max(1, Math.min(6, d.DECOY_SUITS === undefined ? Math.round(decoy / 5) : d.DECOY_SUITS));
  const n2 = Math.max(1, Math.min(13, d.TRAP_SUITS === undefined ? Math.round(trap / 5) : d.TRAP_SUITS));
  const n1 = Math.max(1, 15 - n0 - n2);
  const decoySuits = sh.slice(0, n0);
  const midSuits = sh.slice(n0, n0 + n1);
  const trapSuits = sh.slice(n0 + n1, n0 + n1 + n2);

  const out = new Array(count);
  const used = {};
  for (let i = 0; i < sh.length; i++) used[sh[i]] = 0;

  const put = (g, pool) => {
    // 池内挑「当前用得最少」的花色，均衡到 4 / 5 组
    let best = pool[0];
    for (let k = 0; k < pool.length; k++) {
      if (used[pool[k]] < used[best]) best = pool[k];
    }
    out[g] = best;
    used[best]++;
  };
  for (let k = 0; k < count; k++) {
    const g = byFirst[k];
    if (k < decoy) put(g, decoySuits);
    else if (k < decoy + mid) put(g, midSuits);
    else put(g, trapSuits);
  }
  return out;
}

/** 花色落位：seq 决定 order 的每个位置属于哪一组，groupSuit 决定该组的花色 */
function assignBySequence(cards, order, seq, rng) {
  const firstPos = {};
  for (let i = 0; i < order.length; i++) {
    if (firstPos[seq[i]] === undefined) firstPos[seq[i]] = i;
  }
  const suits = groupSuits(order.length / 3, rng, seq, firstPos, seq.difficulty);
  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  for (let i = 0; i < order.length; i++) {
    const c = byId[order[i]];
    if (c) c.type = suits[seq[i]];
  }
  return suits;
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
    cluster: src.cluster,
    kind: src.kind || 'main',
    side: !!src.side,
    sideIndex: src.sideIndex === undefined ? -1 : src.sideIndex,
    queue: src.queue === undefined ? -1 : src.queue,
    depth: src.depth === undefined ? 0 : src.depth,
    cx: src.cx === undefined ? 0 : src.cx,
    cy: src.cy === undefined ? 0 : src.cy,
    z,
    type: TYPE_LIST[0].id,
    state: 'board',
    blocked: false,
    vx: null,
    vy: null,
    vScale: 1,
    appearAt: 0,
  };
}

/** 绘制顺序 = z 全序：主堆按 layer 升序 / y 升序 / x 升序，侧堆整体最后。 */
function assignZ(cards) {
  const sorted = cards.slice().sort((a, b) => {
    if (a.side !== b.side) return a.side ? 1 : -1;
    return a.layer - b.layer || a.y - b.y || a.x - b.x;
  });
  for (let i = 0; i < sorted.length; i++) sorted[i].z = i;
}

function layerMeta(cards) {
  const out = [];
  for (let li = 0; li < LEVEL_SPEC[2].layers; li++) {
    const list = cards.filter((c) => !c.side && c.layer === li);
    let ox = 360;
    let oy = 500;
    if (list.length) {
      ox = list[0].x;
      oy = list[0].y;
      for (let i = 1; i < list.length; i++) {
        if (list[i].x < ox) ox = list[i].x;
        if (list[i].y < oy) oy = list[i].y;
      }
    }
    out.push({ li, ox, oy, c: 4, r: 3, n: list.length });
  }
  return out;
}

function finish(data, p, seed, rng, extra) {
  const cards = data.cards;
  assignZ(cards);
  const order = peelOrder(cards, () => rng.next());
  const seq = extra.seq;
  const suits = assignBySequence(cards, order, seq, rng);
  refreshBlocked(cards);
  const visible = cards.filter((c) => !c.blocked).length;
  const groups = {};
  for (let i = 0; i < seq.length; i++) groups[seq[i]] = (groups[seq[i]] || 0) + 1;
  return {
    cards,
    layers: layerMeta(cards),
    solution: order.slice(),
    order,
    groupSequence: seq,
    groupSuits: suits,
    params: p,
    seed: seed >>> 0,
    mode: p.mode,
    visible,
    templates: data.templates || [],
    phases: p.phases,
    relaxed: 0,
    seqViolations: seq.violations || 0,
    ...extra.out,
  };
}

function generateEasy(p, seed, rng) {
  const src = generateEasyLayout(seed, { startId: 0 });
  const cards = src.map((s) => baseCard(s, 0));
  // 18 张 / 6 组：按剥离顺序连续三张一组，每种花色正好 3 张。
  // 前 6 张是塔顶（z 最高）→ 两组完整三消，开局就能连着消，10 秒内可通关。
  const seq = new Array(cards.length);
  for (let i = 0; i < cards.length; i++) seq[i] = Math.floor(i / 3);
  seq.violations = 0;
  seq.decoyGroups = 2;
  seq.trapGroups = 0;
  seq.groupClass = ['decoy', 'decoy', 'mid', 'mid', 'mid', 'mid'];
  return finish(
    { cards, templates: ['grid'] },
    p,
    seed,
    rng,
    { seq, out: { groups: 6 } }
  );
}

function generateHard(p, seed, rng, cfg) {
  const main = generateLayout(seed, { target: LEVEL_SPEC[2].mainCount, layers: LEVEL_SPEC[2].layers });
  const templates = (main.templates || []).slice();
  const side = generateSidePiles(seed, {
    perSide: LEVEL_SPEC[2].sideCount,
    startId: main.length,
  });
  const cards = main.map((s) => baseCard(s, 0)).concat(side.map((s) => baseCard(s, 0)));
  const seq = buildGroupSequence(cards.length, rng, cfg || DIFFICULTY);
  return finish(
    { cards, templates },
    p,
    seed,
    rng,
    {
      seq,
      out: {
        groups: cards.length / 3,
        mainCount: main.length,
        sideCount: side.length,
      },
    }
  );
}

/**
 * 生成一关。签名与旧版完全一致：(level, seed, opt)。
 * opt.types / opt.phases 仍保留为调参入口（phases 可覆盖 DECOY/TRAP 组数）。
 */
export function generateLevel(level, seed = randomSeed(), opt = {}) {
  const s = seed >>> 0;
  const rng = makeRng(s);
  const p = levelParams(level, () => rng.next());
  if (opt.types) p.types = opt.types;

  // 调参入口：opt.difficulty 直接覆盖难度参数；opt.phases 兼容旧版（张数 → 组数）
  let cfg = DIFFICULTY;
  if (opt.difficulty || (opt.phases && p.level === 2)) {
    const d = {};
    if (opt.difficulty) {
      for (const k in opt.difficulty) {
        if (Object.prototype.hasOwnProperty.call(opt.difficulty, k)) d[k] = opt.difficulty[k];
      }
    }
    if (opt.phases && p.level === 2) {
      if (opt.phases.decoy !== undefined) d.DECOY_GROUPS = Math.round(opt.phases.decoy / 3);
      // phases.trap 是「张数」，正好就是新调度器里的 TRAP_SPAN（陷阱区总张数）
      if (opt.phases.trap !== undefined) d.TRAP_SPAN = Math.round(opt.phases.trap / 3) * 3;
      if (opt.phases.span !== undefined) d.TRAP_SPAN = Math.round(opt.phases.span / 3) * 3;
    }
    cfg = { ...DIFFICULTY, ...d };
    p.difficulty = cfg;
  }
  // seed 记进日志：任何一局都能用同一个 seed 精确复现（opt.log=true 时打印）
  if (opt.log === true && typeof console !== 'undefined' && console.info) {
    console.info(`[level] level=${p.level} seed=${s} cards=${p.cardCount} mode=${p.mode}`);
  }
  return p.level === 1 ? generateEasy(p, s, rng) : generateHard(p, s, rng, cfg);
}

/* ==================== 遮挡（单一几何定义） ==================== */

/**
 * 重新计算遮挡。判定只认「z 更高 + 相交面积 > 面积×阈值」。
 * 第二参数 L 保留仅为兼容旧调用，内部一律读 TILE_W / TILE_H 常量。
 */
export function refreshBlocked(cards, L) {
  void L;
  const alive = cards.filter((c) => c.state === 'board');
  for (let i = 0; i < alive.length; i++) {
    alive[i].blocked = isBlocked(alive[i], alive);
  }
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
 * 教学关校验：按预置解法顺序回放，确认每一步都可点、槽位始终不满 7、全部清空。
 * 深渊关同样适用 —— 会验证反向生成的 order 是一条真实通关路径。
 */
export function verify(levelData) {
  const cards = levelData.cards.map((c) => ({ ...c, state: 'board', blocked: false }));
  refreshBlocked(cards);
  const order = levelData.solution || [];
  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  const slot = [];
  for (let k = 0; k < order.length; k++) {
    const c = byId[order[k]];
    if (!c || c.state !== 'board' || c.blocked) return false;
    c.state = 'slot';
    slot.push(c);
    refreshBlocked(cards);
    const cnt = {};
    for (let i = 0; i < slot.length; i++) cnt[slot[i].type] = (cnt[slot[i].type] || 0) + 1;
    let hit = null;
    for (const t in cnt) {
      if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) {
        hit = t;
        break;
      }
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

/* ==================== 机器人模拟 ==================== */

/**
 * 机器人模拟（纯逻辑，无 DOM）。
 *  mode = 'random'：在当前可点牌里随机点一张。
 *  mode = 'greedy'：优先点能立刻消除 / 能凑成对的牌，其次点能解锁最多牌的牌。
 * 返回 { win, deadlock, steps, cleared, total, pct }。
 */
export function simulateRobot(levelData, rng, opt = {}) {
  const o = opt || {};
  const mode = o.mode || 'greedy';
  const total = levelData.cards.length;
  const cards = levelData.cards.map((c) => ({ ...c, state: 'board', blocked: false }));
  const graph = buildBlockerGraph(cards);
  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  const indeg = {};
  for (let i = 0; i < cards.length; i++) indeg[cards[i].id] = graph.blockers[cards[i].id].length;
  refreshBlocked(cards);

  const slot = [];
  const taken = {};
  let steps = 0;
  const maxSteps = o.maxSteps || 20000;

  const freeCards = () => {
    const out = [];
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].state === 'board' && indeg[cards[i].id] === 0) out.push(cards[i]);
    }
    return out;
  };

  const countInSlot = () => {
    const m = {};
    for (let i = 0; i < slot.length; i++) m[slot[i].type] = (m[slot[i].type] || 0) + 1;
    return m;
  };

  while (steps < maxSteps) {
    let alive = 0;
    for (let i = 0; i < cards.length; i++) if (cards[i].state === 'board') alive++;
    if (alive === 0 && slot.length === 0) {
      return { win: true, deadlock: false, steps, cleared: total, total, pct: 1 };
    }
    if (slot.length >= SLOT_CAPACITY) {
      return { win: false, deadlock: true, steps, cleared: total - alive - slot.length, total, pct: (total - alive - slot.length) / total };
    }
    const free = freeCards();
    if (!free.length) {
      return { win: false, deadlock: true, stuck: true, steps, cleared: total - alive - slot.length, total, pct: (total - alive - slot.length) / total };
    }

    let pick;
    if (mode === 'random' || (o.noise && rng.next() < o.noise)) {
      pick = free[rng.int(0, free.length - 1)];
    } else {
      const cnt = countInSlot();
      let best = null;
      let bestScore = -Infinity;
      for (let i = 0; i < free.length; i++) {
        const c = free[i];
        const n = cnt[c.type] || 0;
        // 解锁潜力：拿走这张牌后会让多少张牌变成可点
        let unlock = 0;
        const dep = graph.dependents[c.id];
        for (let k = 0; k < dep.length; k++) {
          if (indeg[dep[k]] === 1) unlock++;
        }
        // 严格按规格的朴素贪心：能立刻消除 > 能凑成对 > 解锁最多牌。
        // 不额外加「槽位快满时回避新花色」这类全知惩罚 —— 那会让机器人
        // 比真人聪明，测出来的通关率就不是关卡难度而是模型强度了。
        let score;
        if (n === 2) score = 1000 + unlock * 8;
        else if (n === 1) score = 300 + unlock * 6;
        else score = unlock * 12;
        score += rng.next() * 4;
        if (score > bestScore) {
          bestScore = score;
          best = c;
        }
      }
      pick = best;
    }

    pick.state = 'slot';
    taken[pick.id] = 1;
    const dep = graph.dependents[pick.id];
    for (let k = 0; k < dep.length; k++) indeg[dep[k]] -= 1;
    slot.push(pick);
    steps++;

    const cnt = countInSlot();
    let hit = null;
    for (const t in cnt) {
      if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) {
        hit = t;
        break;
      }
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
  return { win: false, deadlock: false, timeout: true, steps, cleared: 0, total, pct: 0 };
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

export { CLUSTER_TEMPLATES };
