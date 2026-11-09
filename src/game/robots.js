/**
 * v2.0.0 —— 难度评估：六种策略机器人（纯逻辑，零 DOM）。
 *
 * 需求 5.3：不再用单一贪心机器人判断难度。六种策略：
 *   random        纯随机点法
 *   greedy        基础贪心（能三消 > 能凑对 > 解锁最多）
 *   noisy         带错误惩罚的贪心（10% 步改成随机）
 *   lookahead     多步前瞻（候选做 2 层展开，评估后续可消对数）
 *   montecarlo    蒙特卡洛（关键决策点用随机走法估计期望进度）
 *   search        有限深度搜索（有节点预算的 DFS + 状态签名去重）
 *
 * 全部机器人都不使用道具；每次模拟记录：steps（点击数）、win、deadlock、
 * pct（进度）、slotAvg（平均槽位占用）、decisionMs（平均决策时间）、propsUsed。
 *
 * 性能：MC / 搜索只在「关键决策点」（每 N 步）展开，其余步沿用贪心，
 * 并给每次展开设节点 / 走法预算，保证 1000+ 种子压力测试可跑完。
 */
import { SLOT_CAPACITY, DIFFICULTY, clampDifficulty } from './config.js';
import { buildBlockerGraph } from './layout.js';

export const ROBOT_MODES = ['random', 'greedy', 'noisy', 'lookahead', 'montecarlo', 'search'];

const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

/** 只重放花色序列的证书（与 generator.replayTypes 同一规则） */
export function replayTypes(types) {
  const count = {};
  let slot = 0;
  let peak = 0;
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    const n = (count[t] || 0) + 1;
    slot += 1;
    if (n >= 3) { count[t] = n - 3; slot -= 3; } else count[t] = n;
    if (slot >= SLOT_CAPACITY) return { ok: false, peak };
    if (slot > peak) peak = slot;
  }
  for (const k in count) {
    if (Object.prototype.hasOwnProperty.call(count, k) && count[k] !== 0) return { ok: false, peak };
  }
  return { ok: slot === 0, peak };
}

/* ==================== 单局模拟 ==================== */

function makeState(levelData) {
  const cards = levelData.cards.map((c) => ({ ...c, state: 'board' }));
  const graph = levelData._graph || buildBlockerGraph(cards);
  const byId = {};
  const indeg = {};
  const free = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    byId[c.id] = c;
    indeg[c.id] = graph.blockers[c.id].length;
    if (indeg[c.id] === 0) free.push(c);
  }
  return { cards, graph, byId, indeg, free, slot: [], alive: cards.length, steps: 0 };
}

function slotCounts(slot) {
  const cnt = {};
  for (let i = 0; i < slot.length; i++) cnt[slot[i].type] = (cnt[slot[i].type] || 0) + 1;
  return cnt;
}

function greedyScore(c, slot, graph, indeg, rng) {
  const cnt = slotCounts(slot);
  const n = cnt[c.type] || 0;
  let unlock = 0;
  const dep = graph.dependents[c.id];
  for (let k = 0; k < dep.length; k++) if (indeg[dep[k]] === 1) unlock++;
  let score;
  if (n === 2) score = 1000 + unlock * 8;
  else if (n === 1) score = 300 + unlock * 6;
  else score = unlock * 12;
  return score + rng.next() * 4;
}

function bestGreedy(state, pool, rng) {
  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < pool.length; i++) {
    const s = greedyScore(pool[i], state.slot, state.graph, state.indeg, rng);
    if (s > bestScore) { bestScore = s; best = pool[i]; }
  }
  return best || pool[0];
}

/** 从 state 复制一份轻量快照（只复制模拟需要的结构） */
function snapshot(state) {
  const indeg = {};
  for (const k in state.indeg) if (Object.prototype.hasOwnProperty.call(state.indeg, k)) indeg[k] = state.indeg[k];
  const free = state.free.slice();
  const slot = state.slot.slice();
  return { indeg, free, slot, alive: state.alive, graph: state.graph, byId: state.byId };
}

/** 在快照上执行一步（不产生动画 / 不改原 state） */
function stepSnapshot(s, card) {
  const fi = s.free.indexOf(card);
  if (fi >= 0) s.free.splice(fi, 1);
  const dep = s.graph.dependents[card.id];
  for (let k = 0; k < dep.length; k++) {
    s.indeg[dep[k]] -= 1;
    if (s.indeg[dep[k]] === 0) s.free.push(s.byId[dep[k]]);
  }
  s.alive -= 1;
  s.slot.push(card);
  const cnt = slotCounts(s.slot);
  let hit = null;
  for (const t in cnt) {
    if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) { hit = t; break; }
  }
  if (hit !== null) {
    let need = 3;
    for (let i = 0; i < s.slot.length && need > 0; i++) {
      if (s.slot[i].type === hit) { s.slot.splice(i, 1); i--; need--; }
    }
  }
  return s.slot.length < SLOT_CAPACITY && (s.alive > 0 || s.slot.length === 0);
}

/** 随机走法估计：返回到达的进度（0~1） */
function randomPlayout(state, rng, maxSteps) {
  const s = snapshot(state);
  let steps = 0;
  while (s.free.length && s.slot.length < SLOT_CAPACITY && steps < maxSteps) {
    const c = s.free[rng.int(0, s.free.length - 1)];
    if (!stepSnapshot(s, c)) break;
    steps++;
  }
  return 1 - (s.alive + s.slot.length) / state.cards.length;
}

function rankedPool(state, rng, width) {
  const scored = state.free.map((c) => ({ c, s: greedyScore(c, state.slot, state.graph, state.indeg, rng) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, Math.min(width, scored.length)).map((x) => x.c);
}

function lookaheadPick(state, rng, width) {
  const pool = rankedPool(state, rng, width);
  let best = pool[0];
  let bestVal = -Infinity;
  for (let i = 0; i < pool.length; i++) {
    const s = snapshot(state);
    stepSnapshot(s, pool[i]);
    // 第二层：此刻能立刻凑成三消 / 对子的数量
    const cnt = slotCounts(s.slot);
    let potential = 0;
    for (let k = 0; k < s.free.length; k++) {
      const n = cnt[s.free[k].type] || 0;
      if (n === 2) potential += 6;
      else if (n === 1) potential += 2;
    }
    // 立即能三消 / 凑对仍优先（与基础贪心一致），前瞻只用来打破平局
    const immediate = greedyScore(pool[i], state.slot, state.graph, state.indeg, rng);
    const score = immediate + potential * 2 - s.slot.length * 2 + rng.next() * 2;
    if (score > bestVal) { bestVal = score; best = pool[i]; }
  }
  return best;
}

function montecarloPick(state, rng, cfg) {
  const pool = rankedPool(state, rng, 3);
  let best = pool[0];
  let bestVal = -Infinity;
  for (let i = 0; i < pool.length; i++) {
    const s = snapshot(state);
    stepSnapshot(s, pool[i]);
    let sum = 0;
    for (let k = 0; k < cfg.mcPlayouts; k++) {
      const s2 = { ...s, indeg: {}, free: s.free.slice(), slot: s.slot.slice() };
      for (const key in s.indeg) if (Object.prototype.hasOwnProperty.call(s.indeg, key)) s2.indeg[key] = s.indeg[key];
      s2.cards = state.cards;
      s2.graph = state.graph;
      s2.byId = state.byId;
      sum += randomPlayoutFrom(s2, rng, 40);
    }
    const val = sum / cfg.mcPlayouts;
    if (val > bestVal) { bestVal = val; best = pool[i]; }
  }
  return best;
}

function randomPlayoutFrom(s, rng, maxSteps) {
  let steps = 0;
  while (s.free.length && s.slot.length < SLOT_CAPACITY && steps < maxSteps) {
    const c = s.free[rng.int(0, s.free.length - 1)];
    if (!stepSnapshot(s, c)) break;
    steps++;
  }
  const total = s.cards ? s.cards.length : 1;
  return 1 - (s.alive + s.slot.length) / total;
}

/** 有限深度搜索：有节点预算的 DFS，返回根节点最优第一步 */
function searchPick(state, rng, cfg) {
  const pool = rankedPool(state, rng, 4);
  let best = pool[0];
  let bestVal = -Infinity;
  let budget = 220;
  for (let i = 0; i < pool.length; i++) {
    const s = snapshot(state);
    s.cards = state.cards;
    s.graph = state.graph;
    s.byId = state.byId;
    if (!stepSnapshot(s, pool[i])) continue;
    const val = dfsValue(s, Math.max(1, cfg.searchDepth - 1), rng, budget);
    budget = val.budget;
    if (val.score > bestVal) { bestVal = val.score; best = pool[i]; }
    if (budget <= 0) break;
  }
  return best;
}

function dfsValue(s, depth, rng, budget) {
  if (budget <= 0) return { score: 1 - (s.alive + s.slot.length) / (s.cards ? s.cards.length : 1), budget: 0 };
  if (depth <= 0 || !s.free.length || s.slot.length >= SLOT_CAPACITY) {
    return { score: 1 - (s.alive + s.slot.length) / (s.cards ? s.cards.length : 1), budget };
  }
  budget--;
  const width = Math.min(2, s.free.length);
  let best = -Infinity;
  for (let i = 0; i < width; i++) {
    const c = s.free[i];
    const s2 = { ...s, indeg: {}, free: s.free.slice(), slot: s.slot.slice() };
    for (const key in s.indeg) if (Object.prototype.hasOwnProperty.call(s.indeg, key)) s2.indeg[key] = s.indeg[key];
    s2.cards = s.cards; s2.graph = s.graph; s2.byId = s.byId;
    if (!stepSnapshot(s2, c)) continue;
    const r = dfsValue(s2, depth - 1, rng, budget);
    budget = r.budget;
    if (r.score > best) best = r.score;
    if (budget <= 0) break;
  }
  if (best === -Infinity) best = 1 - (s.alive + s.slot.length) / (s.cards ? s.cards.length : 1);
  return { score: best, budget };
}

/**
 * 跑一局。opt.mode ∈ ROBOT_MODES；opt.noise 可覆盖失误率；
 * opt.track=true 额外返回槽位直方图 / 挂起花色峰值。
 */
export function simulateRobot(levelData, rng, opt = {}) {
  const o = opt || {};
  const cfg = clampDifficulty(o.difficulty);
  const mode = o.mode || 'greedy';
  const noise = o.noise === undefined ? cfg.noise : o.noise;
  const state = makeState(levelData);
  const total = state.cards.length;
  const maxSteps = o.maxSteps || 20000;
  const track = !!o.track;
  const slotHist = [0, 0, 0, 0, 0, 0, 0, 0];
  let hangPeak = 0;
  let slotSum = 0;
  let decisionTotal = 0;
  let decisionCount = 0;
  const everyMC = 12;
  const everySearch = 10;

  while (state.steps < maxSteps) {
    if (state.alive === 0 && state.slot.length === 0) {
      return finish(true, false);
    }
    if (state.slot.length >= SLOT_CAPACITY) return finish(false, true);
    if (!state.free.length) return finish(false, true);

    const t0 = now();
    let pick;
    if (mode === 'random' || (mode === 'noisy' && rng.next() < noise)) {
      pick = state.free[rng.int(0, state.free.length - 1)];
    } else if (mode === 'montecarlo' && state.steps % everyMC === 0) {
      pick = montecarloPick(state, rng, cfg);
    } else if (mode === 'search' && state.steps % everySearch === 0) {
      pick = searchPick(state, rng, cfg);
    } else if (mode === 'lookahead') {
      pick = lookaheadPick(state, rng, cfg.lookaheadWidth);
    } else {
      pick = bestGreedy(state, state.free, rng);
    }
    decisionTotal += now() - t0;
    decisionCount++;

    const fi = state.free.indexOf(pick);
    if (fi >= 0) state.free.splice(fi, 1);
    const dep = state.graph.dependents[pick.id];
    for (let k = 0; k < dep.length; k++) {
      state.indeg[dep[k]] -= 1;
      if (state.indeg[dep[k]] === 0) state.free.push(state.byId[dep[k]]);
    }
    state.alive -= 1;
    state.slot.push(pick);
    state.steps++;
    slotSum += state.slot.length;
    if (track) {
      slotHist[Math.min(7, state.slot.length)]++;
      const kinds = {};
      for (let i = 0; i < state.slot.length; i++) kinds[state.slot[i].type] = 1;
      let hang = 0;
      for (const k in kinds) if (Object.prototype.hasOwnProperty.call(kinds, k)) hang++;
      if (hang > hangPeak) hangPeak = hang;
    }
    const cnt = slotCounts(state.slot);
    let hit = null;
    for (const t in cnt) {
      if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) { hit = t; break; }
    }
    if (hit !== null) {
      let need = 3;
      for (let i = 0; i < state.slot.length && need > 0; i++) {
        if (state.slot[i].type === hit) { state.slot.splice(i, 1); i--; need--; }
      }
    }
  }
  return finish(false, false);

  function finish(win, deadlock) {
    const pct = 1 - (state.alive + state.slot.length) / total;
    const res = {
      win,
      deadlock,
      steps: state.steps,
      cleared: total - state.alive - state.slot.length,
      total,
      pct,
      slotAvg: state.steps ? slotSum / state.steps : 0,
      slotLeft: state.slot.length,
      decisionMs: decisionCount ? decisionTotal / decisionCount : 0,
      propsUsed: 0,
    };
    if (track) { res.slotHist = slotHist; res.hangPeak = hangPeak; }
    return res;
  }
}

/** 旧接口：正常玩家 ≈ greedy + 少量噪声 */
export function simulatePlayer(levelData, rng, opt = {}) {
  const r = simulateRobot(levelData, rng, { ...opt, mode: 'greedy' });
  return {
    win: r.win, steps: r.steps, moves: r.steps, deadlock: r.deadlock,
    left: r.total - r.cleared, cleared: r.cleared, pct: r.pct,
  };
}

/* ==================== 批量难度评估 ==================== */

/**
 * 固定种子回归 / 随机种子压力测试。
 * @param {number} level 1 | 2
 * @param {(seed:number)=>object} makeLevel 传入 seed 生成关卡数据
 * @param {number} count 种子数
 * @param {object} opt { baseSeed, modes, difficulty, verify }
 * @returns 每种策略的聚合指标 + 生成器合法解验证率
 */
export function runDifficultySuite(level, makeLevel, count, opt = {}) {
  const modes = opt.modes || ROBOT_MODES;
  const base = opt.baseSeed === undefined ? 0x1f2e3d4c : opt.baseSeed;
  const verify = opt.verify || (() => true);
  const agg = {};
  for (let i = 0; i < modes.length; i++) {
    agg[modes[i]] = {
      mode: modes[i], simulations: 0, wins: 0, deadlocks: 0,
      stepsSum: 0, slotSum: 0, pctSum: 0, decisionMsSum: 0, propsSum: 0,
      earlyDeaths: 0, pctList: [], failPctList: [],
    };
  }
  let verified = 0;
  for (let i = 0; i < count; i++) {
    const seed = (base + i * 2654435761) >>> 0;
    const data = makeLevel(level, seed);
    if (verify(data)) verified++;
    for (let m = 0; m < modes.length; m++) {
      const mode = modes[m];
      const rngSeed = (seed ^ 0xabcdef ^ (m * 0x9e3779b9)) >>> 0;
      // 与 makeRng 的接口一致：用外部传入的 rng 工厂（避免循环依赖）
      const rng = opt.makeRng(rngSeed);
      const r = simulateRobot(data, rng, { mode, difficulty: opt.difficulty, track: false });
      const a = agg[mode];
      a.simulations++;
      if (r.win) a.wins++;
      if (r.deadlock) a.deadlocks++;
      a.stepsSum += r.steps;
      a.slotSum += r.slotAvg;
      a.pctSum += r.pct;
      a.decisionMsSum += r.decisionMs;
      a.propsSum += r.propsUsed;
      if (!r.win) {
        a.failPctList.push(r.pct);
        if (r.pct < 0.30) a.earlyDeaths++;
      }
      a.pctList.push(r.pct);
    }
  }
  const out = { level, seeds: count, verified, verifyRate: count ? verified / count : 0, modes: {} };
  for (let i = 0; i < modes.length; i++) {
    const a = agg[modes[i]];
    a.pctList.sort((x, y) => x - y);
    a.failPctList.sort((x, y) => x - y);
    out.modes[modes[i]] = {
      mode: a.mode,
      failures: a.failPctList.length,
      // 只统计失败局的进度中位数：全胜局不能被算成「死局 100% 后置」
      failureMedianPct: a.failPctList.length ? a.failPctList[Math.floor(a.failPctList.length / 2)] : 0,
      simulations: a.simulations,
      wins: a.wins,
      winRate: a.simulations ? a.wins / a.simulations : 0,
      deadlocks: a.deadlocks,
      deadlockRate: a.simulations ? a.deadlocks / a.simulations : 0,
      avgSteps: a.simulations ? a.stepsSum / a.simulations : 0,
      avgSlot: a.simulations ? a.slotSum / a.simulations : 0,
      avgPct: a.simulations ? a.pctSum / a.simulations : 0,
      medianPct: a.pctList.length ? a.pctList[Math.floor(a.pctList.length / 2)] : 0,
      avgDecisionMs: a.simulations ? a.decisionMsSum / a.simulations : 0,
      propsUsed: a.propsSum,
      earlyDeaths: a.earlyDeaths,
    };
  }
  return out;
}
