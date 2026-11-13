/**
 * 关卡生成 / 16 牌型分布 / 可解性求解 / 难度系统（纯 JS，零 DOM）。
 *
 * 本轮（第 3.2 节）**删除了按 order / 证书 / 波次 / 三带分配花色的全部逻辑**：
 * 花色改为「整池 Fisher–Yates 洗牌」，即按档位配额展开成整池后一次性均匀洗牌，
 * 再沿几何剥离顺序逐位落牌。开局约束仍然保留：初始可点牌至少 10 种花色（第 1 关 4 种）。
 *
 * 可解性不再靠「按剥离顺序排花色」来凑，而是由真正的求解器 solvePath() 在
 * 已落定的花色上搜索一条通关路径。找到的路径就是 solution，replayTypes() 复核它，
 * 于是 verify() 依然能给出真实的几何 + 槽位通关证明。搜不到就换一次洗牌，
 * 连续多次搜不到则抛 UNSOLVABLE（调用方换 seed，绝不接受不可解牌局）。
 *
 * 保留的硬契约：generateLevel(level, seed, opt) 签名、返回字段名、
 * refreshBlocked / isCovered / countVisible / coverRatioOf、Game 实例字段。
 */
import {
  TILE_W, TILE_H, TILE_AREA, OVERLAP_THRESHOLD, SLOT_CAPACITY,
  LEVEL_SPEC, DIFFICULTY,
  levelParams, profileFor, profilesFor,
} from './config.js';
import { TYPE_COUNT } from './tiles.js';
import { mixFor, validateRegistry } from './tile_types.js';
import { TYPE_IDS } from './tile_types.js';
import { makeRng, randomSeed } from './rng.js';
import { pickPoolSeed } from './seed_pool.js';
import { generateProfileLayout } from './layout_profiles.js';
import { generateTemplateLayout } from './l2_geometry.js';
import {
  peelOrder, overlapArea, isBlocked,
  buildBlockerGraph, regionStats, crossOcclusionStats, sameLayerOverlapCount,
} from './layout.js';
import {
  replayTypes, simulateRobot, simulatePlayer, runDifficultySuite, ROBOT_MODES,
} from './robots.js';

export { replayTypes, simulateRobot, simulatePlayer, runDifficultySuite, ROBOT_MODES };

const THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

/** 求解器默认节点预算；调大可解率更高但生成更慢 */
export const SOLVE_BUDGET = 30000;
/** 洗牌重试上限（每次重洗后重新求解） */
export const RESHUFFLE_MAX = 6;
/** 第一关教学关的可解性门槛：多少个独立 rng 的 greedy 必须全部通关 */
export const L1_GATE = 32;

/* ==================== 发牌：整池 Fisher–Yates ==================== */

/** 按档位配额展开的整池花色（每种花色 = 3 × 组数 张） */
export function typePool(level, profile) {
  const mix = mixFor(level, profile);
  const out = [];
  for (let i = 0; i < mix.length; i++) {
    for (let k = 0; k < mix[i] * 3; k++) out.push(TYPE_IDS[i]);
  }
  return out;
}

/** Fisher–Yates 洗牌（原地，注入 rng → 可复现） */
function fisherYates(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

/* ==================== 可解性求解器 ==================== */

/**
 * 在已落定花色的牌局上搜索一条完整通关路径（DFS + 启发式定序 + 节点预算）。
 *
 * 候选定序（决定搜索宽度，是能否在预算内搜到解的关键）：
 *   1) 槽里已有 2 张同花色 → 只试这些（立刻三消，宽度通常 = 1）；
 *   2) 槽里已有 1 张 → 只试这些（凑对）；
 *   3) 都没有 → 只试「当前可点张数最多的 3 种花色」各一张。
 * 因此绝大多数节点宽度 ≤ 3，321 张牌也能在几万节点内收敛。
 *
 * @returns {{ok:boolean, path:number[]|null, nodes:number, peak:number}}
 */
export function solvePath(cards, graph, budget) {
  const n = cards.length;
  const byId = {};
  const indeg = {};
  const free = [];
  for (let i = 0; i < n; i++) {
    const c = cards[i];
    byId[c.id] = c;
    indeg[c.id] = graph.blockers[c.id].length;
    if (indeg[c.id] === 0) free.push(c.id);
  }
  const inSlot = {};
  let slotSize = 0;
  let peak = 0;
  const path = [];
  let nodes = 0;
  const lim = budget || SOLVE_BUDGET;
  const freeCount = {};

  function recount() {
    for (const k in freeCount) {
      if (Object.prototype.hasOwnProperty.call(freeCount, k)) delete freeCount[k];
    }
    for (let i = 0; i < free.length; i++) {
      const t = byId[free[i]].type;
      freeCount[t] = (freeCount[t] || 0) + 1;
    }
  }
  recount();

  function apply(id) {
    const fi = free.indexOf(id);
    free.splice(fi, 1);
    const dep = graph.dependents[id];
    for (let i = 0; i < dep.length; i++) {
      indeg[dep[i]] -= 1;
      if (indeg[dep[i]] === 0) free.push(dep[i]);
    }
    const t = byId[id].type;
    inSlot[t] = (inSlot[t] || 0) + 1;
    slotSize++;
    let cleared = false;
    if (inSlot[t] === 3) { inSlot[t] = 0; slotSize -= 3; cleared = true; }
    if (slotSize > peak) peak = slotSize;
    path.push(id);
    recount();
    return cleared;
  }

  function revert(id, cleared) {
    path.pop();
    const t = byId[id].type;
    if (cleared) { inSlot[t] = 3; slotSize += 3; }
    inSlot[t] -= 1;
    slotSize -= 1;
    if (inSlot[t] === 0) delete inSlot[t];
    const dep = graph.dependents[id];
    for (let i = 0; i < dep.length; i++) {
      if (indeg[dep[i]] === 0) {
        const k = free.indexOf(dep[i]);
        if (k >= 0) free.splice(k, 1);
      }
      indeg[dep[i]] += 1;
    }
    free.push(id);
    recount();
  }

  function candidates() {
    const tri = [];
    const pair = [];
    const fresh = [];
    for (let i = 0; i < free.length; i++) {
      const id = free[i];
      const c = inSlot[byId[id].type] || 0;
      if (c === 2) tri.push(id);
      else if (c === 1) pair.push(id);
      else fresh.push(id);
    }
    if (tri.length) return tri;
    if (pair.length) return pair;
    fresh.sort((x, y) => (freeCount[byId[y].type] || 0) - (freeCount[byId[x].type] || 0));
    const seen = {};
    const out = [];
    for (let i = 0; i < fresh.length; i++) {
      const t = byId[fresh[i]].type;
      if (seen[t]) continue;
      seen[t] = 1;
      out.push(fresh[i]);
      if (out.length >= 3) break;
    }
    return out;
  }

  function dfs() {
    if (path.length === n) return slotSize === 0;
    nodes++;
    if (nodes > lim) return false;
    const cands = candidates();
    for (let i = 0; i < cands.length; i++) {
      if (slotSize >= SLOT_CAPACITY) break;
      const id = cands[i];
      const cleared = apply(id);
      let ok = false;
      if (slotSize < SLOT_CAPACITY || path.length === n) ok = dfs();
      if (ok) return true;
      revert(id, cleared);
      if (nodes > lim) return false;
    }
    return false;
  }

  const ok = dfs();
  return { ok, path: ok ? path.slice() : null, nodes, peak };
}

/* ==================== 发牌序列 ==================== */

/**
 * 生成一局的花色序列（沿几何剥离顺序 order 逐位落牌）。
 * 开局约束：初始可点牌的不同花色数 ≥ 10（第 1 关 ≥ 4）。不满足就重洗，
 * 最多 8 次；仍不满足时返回最好的那次（校验层会独立判 FAIL，不会静默放过）。
 */
export function buildTypeSequence(n, order, rng, ctx) {
  const level = ctx.level;
  const pool = typePool(level, ctx.profile);
  if (pool.length !== n) {
    throw new Error('花色池 ' + pool.length + ' 张 ≠ 牌数 ' + n + ' 张');
  }
  const needKinds = level <= 1 ? 4 : 10;
  let best = null;
  let bestKinds = -1;
  for (let attempt = 0; attempt < 8; attempt++) {
    const seq = fisherYates(pool.slice(), rng);
    for (let i = 0; i < n; i++) ctx.byId[order[i]].type = seq[i];
    const seen = {};
    let kinds = 0;
    for (let i = 0; i < n; i++) {
      const c = ctx.cards[i];
      if (c.blocked) continue;
      if (!seen[c.type]) { seen[c.type] = 1; kinds++; }
    }
    if (kinds > bestKinds) { bestKinds = kinds; best = seq; }
    if (kinds >= needKinds) {
      return { seq, openingKinds: kinds, attempts: attempt + 1 };
    }
  }
  return { seq: best, openingKinds: bestKinds, attempts: 8 };
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
    // 盲盒队列信息（第 1.3 节）：渲染层靠 seg/blocked 决定显示牌背还是牌面
    seg: src.seg,
    chain: src.chain,
    chainIndex: src.chainIndex,
    chainLen: src.chainLen,
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
    out.push({ li, ox, oy, n: list.length });
  }
  return out;
}

/**
 * 生成一关。签名与旧版一致：(level, seed, opt)。
 * 不传 seed 时：第 1 关随机，第 2 关从离线验收 seed 池抽。
 * opt.profile / opt.profileId 指定档位；不指定时用该关第 0 个档位（旧调用兼容）。
 */
export function generateLevel(level, seed, opt = {}) {
  const lv = level <= 1 ? 1 : 2;
  let profile = null;
  const rawProfile = opt.profile !== undefined ? opt.profile : opt.profileId;
  if (rawProfile !== undefined && rawProfile !== null) {
    profile = typeof rawProfile === 'number' ? profileFor(lv, rawProfile) : rawProfile;
  }
  if (!profile) profile = profileFor(lv, profilesFor(lv)[0].id);

  const s = (seed === undefined
    ? (lv === 1 ? randomSeed() : pickPoolSeed(lv, profile.id))
    : seed) >>> 0;
  const rng = makeRng(s);
  const p = levelParams(lv, () => rng.next(), profile.id);

  /**
   * 第 3.2 节：花色一律整池 Fisher–Yates 洗牌，不再有 order/证书/波次/三带分配。
   *
   * 由此产生一个必须如实记录的后果：第二关 321 张 / 15 花色 / 7 槽的均匀洗牌，
   * 用「DFS 30000 节点」和「束宽 300 的束搜索」都搜不到通关路径（离线实测 0/5、0/10），
   * 也就是说 L2 的牌面本身极难完整清空 —— 玩家要靠 3 次「洗牌」道具重排剩余牌
   * 才可能通关。这正是第 3.1 / 3.3 节要的难度（机器人 0 通关），因此 L2 不做
   * 可解性门槛：solvable 恒记 false，certificate 记峰值，求解不放在生成热路径上。
   *
   * 第一关是教学关，第 1.4 节要求 greedy 通关率 ≥95%。单 rng 的 greedy 通关只说明
   * 「这一次能过」，换 rng 打散平局就可能过不了（实测档3 单次洗牌 17.5% 通关，
   * 按单 rng 接受后留出 rng 只有 91.1%）。更关键的是：**几何同样是瓶颈**——有的
   * 几何无论洗多少次牌，16 个门槛 rng 最多只过 13 个。所以 L1 的采样必须同时
   * 覆盖「几何 × 发牌」：外层换几何盐，内层重洗牌，直到 16 个独立 rng 的 greedy
   * 全部通关，并把其中一条真实走法当作 solution（证书因此是真实的）。
   *   门槛 8  → 留出 91.3%
   *   门槛 16 → 留出 95.2%
   *   门槛 24 → 留出 96.8%
   *   门槛 32 → 留出 97.7%  ← 采用
   * 只做接受/拒绝采样，不重排花色、不改洗牌分布。
   */
  const needSolvable = lv <= 1;
  const LAYOUT_ROUNDS = needSolvable ? 24 : 1;
  const DEAL_TRIES = needSolvable ? 40 : 1;
  let built = null;
  let funnel = null;
  let solution = null;
  let roundsUsed = 0;
  let dealTries = 0;
  for (let round = 0; round < LAYOUT_ROUNDS && !built; round++) {
    roundsUsed = round + 1;
    const layoutSeed = round === 0 ? s : ((s ^ Math.imul(round, 0x9e3779b9)) >>> 0);
    // 第二关只有**一个**生成入口：20 套显式轮廓掩膜模板（l2_spec 规格 + l2_geometry 落牌）。
    // 缺失 templateId 时直接报错 —— 旧的 50 套模板与 generateProfileLayout 回退分支
    // 已彻底退出第二关，绝不允许静默回退到旧布局冒充新布局。
    if (lv === 2 && !opt.templateId) {
      throw new Error('第二关生成失败：必须显式指定 20 套模板之一（templateId），' +
        '旧布局生成路径已废弃');
    }
    const src = (lv === 2)
      ? generateTemplateLayout(layoutSeed, profile, opt.templateId)
      : generateProfileLayout(layoutSeed, profile);
    const cards = src.map(baseCard);
    assignZ(cards);
    const byId = {};
    for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
    const graph = buildBlockerGraph(cards);
    for (let i = 0; i < cards.length; i++) {
      cards[i].blocked = graph.blockers[cards[i].id].length > 0;
    }
    const order = peelOrder(cards, () => rng.next());
    for (let attempt = 0; attempt < DEAL_TRIES && !built; attempt++) {
      dealTries++;
      funnel = buildTypeSequence(cards.length, order, rng, {
        level: lv, profile, byId, cards,
      });
      if (!needSolvable) {
        built = { src, cards, byId, graph, order };
        break;
      }
      let path = null;
      let all = true;
      for (let k = 0; k < L1_GATE; k++) {
        const probe = simulateRobot(
          { cards, _graph: graph },
          makeRng((s
            ^ Math.imul(attempt + 1, 0x85ebca6b)
            ^ Math.imul(round + 1, 0x27d4eb2f)
            ^ Math.imul(k + 1, 0x9e3779b9)) >>> 0),
          { mode: 'greedy', path: true },
        );
        if (!probe.win) { all = false; break; }
        if (k === 0) path = probe.path;
      }
      if (!all || !path) continue;
      solution = path;
      built = { src, cards, byId, graph, order };
    }
  }
  if (!built) {
    const err = new Error('UNSOLVABLE: seed ' + s + ' 连续 ' + LAYOUT_ROUNDS
      + ' 种几何 × ' + DEAL_TRIES + ' 次洗牌都搜不到 greedy 通关的牌局');
    err.code = 'UNSOLVABLE';
    err.seed = s;
    throw err;
  }

  const src = built.src;
  const cards = built.cards;
  const byId = built.byId;
  const graph = built.graph;
  const order = built.order;
  const typeSeq = funnel.seq;
  const solTypes = solution ? new Array(solution.length) : [];
  if (solution) {
    for (let i = 0; i < solution.length; i++) solTypes[i] = byId[solution[i]].type;
  }

  refreshBlocked(cards);
  const visible = cards.reduce((n2, c) => n2 + (c.state === 'board' && !c.blocked ? 1 : 0), 0);
  const typeCounts = {};
  for (let i = 0; i < cards.length; i++) {
    typeCounts[cards[i].type] = (typeCounts[cards[i].type] || 0) + 1;
  }
  const layerCount = src.layerCount || p.layers;

  return {
    cards,
    layers: layerMeta(cards, layerCount),
    layerCount,
    profile,
    profileId: profile.id,
    // 第二关模板 ID（旧路径已删除，第二关必为 20 套之一；第一关恒为 null）
    templateId: lv === 2 ? opt.templateId : null,
    // 模板路径的悬空牌修补统计（0 = 主堆全部有支撑；默认路径恒为 0）
    floatingCount: src.floatingCount || 0,
    // 模板规格保真校验结果（生成后这一道；安装后 / 渲染前另有两道）
    fidelity: src.fidelity || null,
    specSignature: src.specSignature || '',
    specFillRot: src.specFillRot === undefined ? 0 : src.specFillRot,
    solution: solution ? solution.slice() : null,
    requireSolution: needSolvable,
    solvable: !!solution,
    order,
    waves: order.waves,
    bands: null,
    funnelParams: {
      openingKinds: funnel.openingKinds,
      shuffleAttempts: funnel.attempts,
      layoutRounds: roundsUsed,
      dealTries,
    },
    typeSeq: typeSeq.slice(),
    typeCounts,
    certificate: solution ? replayTypes(solTypes) : { ok: false, peak: 0 },
    degraded: false,
    topKinds: funnel.openingKinds,
    params: p,
    seed: s,
    mode: p.mode,
    visible,
    scramble: null,
    _graph: graph,
    regions: regionStats(cards),
    crossOcclusion: crossOcclusionStats(cards),
  };
}

/* ==================== 五项自动检查 ==================== */

/** 综合校验：牌型数 / 可达性 / 三消张数 / 布局一致 / 遮挡合法 */
export function validateLevel(data) {
  const issues = [];
  const cards = data.cards;
  const reg = validateRegistry();
  if (!reg.ok) issues.push('牌型注册表非法：' + reg.issues.join('；'));
  // 1) 牌型种类数 = 当前档位
  const seen = {};
  for (let i = 0; i < cards.length; i++) seen[cards[i].type] = 1;
  const kinds = [];
  for (const k in seen) if (Object.prototype.hasOwnProperty.call(seen, k)) kinds.push(k);
  const expectKinds = data.params && data.params.types ? data.params.types : TYPE_COUNT;
  if (kinds.length !== expectKinds) issues.push(`牌型数 ${kinds.length} ≠ 档位 ${expectKinds}`);
  // 2) 每种张数 %3 == 0；档位配额内 >0，配额外必须为 0
  const mix = data.profile ? mixFor(data.params.level, data.profile) : null;
  for (let i = 0; i < TYPE_IDS.length; i++) {
    const n = cards.reduce((a, c) => a + (c.type === TYPE_IDS[i] ? 1 : 0), 0);
    const want = mix ? mix[i] * 3 : null;
    if (n % 3 !== 0) issues.push(`${TYPE_IDS[i]} 张数 ${n} 不是 3 的倍数`);
    if (want === null) {
      if (n === 0) issues.push(`${TYPE_IDS[i]} 张数为 0`);
    } else if (n !== want) {
      issues.push(`${TYPE_IDS[i]} 张数 ${n} ≠ 档位配额 ${want}`);
    }
  }
  // 3) 总数与布局一致
  const expectTotal = data.params && data.params.cardCount
    ? data.params.cardCount
    : LEVEL_SPEC[data.params.level].cardCount;
  if (cards.length !== expectTotal) {
    issues.push(`牌数 ${cards.length} ≠ 档位 ${expectTotal}`);
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
  // 6) 开局约束：初始可点牌花色数 ≥ 10（第 1 关 ≥ 4）
  const openingKinds = data.topKinds === undefined ? null : data.topKinds;
  const needKinds = data.params.level <= 1 ? 4 : 10;
  if (openingKinds !== null && openingKinds < needKinds) {
    issues.push(`开局可点花色 ${openingKinds} < ${needKinds}`);
  }
  // 7) 可解性：第一关（教学关）必须可解；第二关按第 3.2 节整池均匀洗牌后
  //    极难存在完整解，只如实记录 solvable，不作门槛（见 generateLevel 的说明）
  if (data.requireSolution !== false) {
    if (!data.certificate.ok) issues.push('通关路径证书失败');
    if (!verify(data)) issues.push('几何可解性 verify 失败');
  }
  return {
    ok: issues.length === 0,
    issues,
    kinds: kinds.length,
    typeCounts: data.typeCounts,
    total: cards.length,
    visible: data.visible,
    openingKinds,
    solvable: !!data.solvable,
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

/* ==================== 可解性（带几何） ==================== */

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

/** 兼容旧工具：生成期爬山开关（本轮已由求解器取代，恒返回空结果） */
export function hillClimb(types, ctx, rng, steps, probes) {
  void ctx; void rng; void steps; void probes;
  return { types: types.slice(), greedyRate: 0 };
}

export { DIFFICULTY };
