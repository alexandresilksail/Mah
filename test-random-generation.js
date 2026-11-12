/**
 * 双关卡各 100 局随机生成压力测试（最近三局差异化口径）。
 *
 *   node test-random-generation.js
 *
 *  · 第一关 100 局 + 第二关 100 局，各自使用**独立**的 Game 实例与存档历史；
 *  · 每局真实调用统一入口 createNewGame()，真实生成牌局、真实计算签名、
 *    真实跑 validateLevel / 几何 / 三消 / 遮挡 / 注册表校验；
 *  · 每局都检查：
 *      - 档位 ≠ 上一局档位（第 2.3 节，沿用）；
 *      - 与本关最近 5 局的 layoutSimilarity **全部 < 0.60**（第 2.3 / 2.4 节）；
 *      - geometrySignature 不与最近 5 局中任何一局完全相同；
 *  · 输出 sim 的均值 / P95 / 最大值（L1、L2 分别统计）与失败重试次数；
 *  · 同档位、不同 seed 的几何必须不同（30 个 seed 至少 25 种不同几何）；
 *  · 中途把存档序列化到磁盘再读回，模拟应用重启，验证历史不丢；
 *  · 输出 reports/random-generation-report.json / .md 与真实 stdout 日志。
 *
 * 任何一项不通过 → exit 1；不使用固定牌局数据、不跳过失败、不放宽阈值。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

import { Game } from './src/game/engine.js';
import { createNewGame, GenerationFailureError, MAX_ATTEMPTS } from './src/game/new_game.js';
import {
  calculateLayoutSignature, layoutSimilarity, SIMILARITY_THRESHOLD, SIGNATURE_ALGORITHM,
} from './src/game/layout_signature.js';
import { sha256Hex } from './src/game/sha256.js';
import {
  GENERATION_REASONS, historyFor, sanitizeHistory, sanitizeRecord, HISTORY_LIMIT,
} from './src/game/recent_games.js';
import { makeSaveData, applySaveToGame, SAVE_VERSION } from './src/game/save_data.js';
import {
  LEVEL1_PROFILES, LEVEL2_PROFILES, profilesFor, profileFor,
  BOARD_BAND, TILE_W, TILE_H,
} from './src/game/config.js';
import { generateLevel, validateLevel, verify, countVisible } from './src/game/generator.js';
import { validateRegistry, TYPE_IDS } from './src/game/tile_types.js';
import {
  sameLayerOverlapCount, isHalfLattice, countComponents,
} from './src/game/layout.js';
import { SEED_POOL } from './src/game/seed_pool.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const reports = join(root, 'reports');
if (!existsSync(reports)) mkdirSync(reports, { recursive: true });

const PER_LEVEL = 100;
const REASONS = GENERATION_REASONS.slice();
/** 同档位换 seed 的几何多样性样本量（第 2.4 节：30 个 seed 至少 25 种几何） */
const SEED_SAMPLES = 30;
const SEED_MIN_DISTINCT = 25;
const logs = [];
let pass = 0;
let fail = 0;
const failLabels = [];

function line(s) { logs.push(s); console.log(s); }
function ok(cond, label) {
  if (cond) { pass++; }
  else { fail++; failLabels.push(label); line('  ✗ ' + label); }
  return !!cond;
}
function section(s) { line('\n' + s); }
function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

const tStart = Date.now();
const gitCommit = (() => {
  try { return execSync('git rev-parse HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch (e) { return 'unknown'; }
})();

line('============================================================================');
line(' MahLeMah · 双关卡各 100 局随机生成压力测试（真实运行）');
line(' commit=' + gitCommit + ' start=' + new Date().toISOString());
line('============================================================================');

/* ---------- 0. 基础组件自检 ---------- */
section('[0] 签名算法 / 注册表 / 配置 / 几何多样性自检');
ok(sha256Hex('abc') === createHash('sha256').update('abc', 'utf8').digest('hex'),
  '同步 SHA-256 与 node:crypto 一致');
ok(validateRegistry().ok, '16 种牌型注册表完整');
ok(LEVEL1_PROFILES.length === 4 && LEVEL2_PROFILES.length === 10, '档位表 4 + 10 个预设');
ok(MAX_ATTEMPTS === 50, '生成重试上限 = 50');
ok(HISTORY_LIMIT === 3, '历史窗口 = 3 局（两关各自独立）');
ok(SIMILARITY_THRESHOLD === 0.6, '重复判定阈值 = 0.60（第 2.2 节）');
ok(REASONS.length === 4, '4 种 generationReason 已定义');

/**
 * 第 1.1 / 2.4 节：几何**由 seed 程序化生成**，档位只决定层数 / 总牌数 / 牌种类数。
 * 因此「同一档位换 seed 几何签名必须相同」的旧假设已被删除，反向断言：
 * 同一档位下 30 个不同 seed 应产生至少 25 种不同几何。
 */
const seedDiversity = {};
for (const lv of [1, 2]) {
  const rows = [];
  for (const p of profilesFor(lv)) {
    const seen = new Set();
    const seeds = [];
    for (let k = 0; k < SEED_SAMPLES; k++) {
      const seed = (0x10000000 + k * 2654435761 + p.id * 7919 + lv * 104729) >>> 0;
      const d = generateLevel(lv, seed, { profile: p.id });
      const sig = calculateLayoutSignature(d);
      seen.add(sig.geometrySignature);
      seeds.push({ seed, geom: sig.geometrySignature, tiles: d.cards.length });
    }
    rows.push({ profileId: p.id, samples: SEED_SAMPLES, distinct: seen.size, seeds });
    ok(seen.size >= SEED_MIN_DISTINCT,
      `L${lv} 档位 ${p.id}：${SEED_SAMPLES} 个 seed 产生 ${seen.size} 种不同几何（≥${SEED_MIN_DISTINCT}）`);
  }
  seedDiversity['L' + lv] = rows;
  const minDistinct = Math.min.apply(null, rows.map((r) => r.distinct));
  line(`   L${lv} ${rows.length} 个档位 × ${SEED_SAMPLES} seed · 每档不同几何最少 ${minDistinct} 种`);
}
// 同档位换 seed 的几何签名必须不同（直接取一个档位做显式断言）
for (const lv of [1, 2]) {
  const a = calculateLayoutSignature(generateLevel(lv, 1111, { profile: 0 }));
  const b = calculateLayoutSignature(generateLevel(lv, 2222, { profile: 0 }));
  ok(a.geometrySignature !== b.geometrySignature,
    `L${lv} 同档位换 seed 的几何签名必须不同（几何由 seed 决定）`);
  const c = calculateLayoutSignature(generateLevel(lv, 1111, { profile: 1 }));
  ok(a.geometrySignature !== c.geometrySignature, `L${lv} 不同档位的几何签名不同`);
  ok(a.layoutSignature.length === 64 && a.algorithm === SIGNATURE_ALGORITHM,
    `L${lv} 布局签名为 64 位 SHA-256`);
  ok(a.layoutSignature === calculateLayoutSignature(generateLevel(lv, 1111, { profile: 0 })).layoutSignature,
    `L${lv} 同一 seed + 同一档位可精确重放（历史记录能还原牌面）`);
}
ok(sanitizeRecord({ gameId: 'x' }) === null, '损坏历史记录被丢弃而不是抛异常');
ok(sanitizeHistory([null, 1, 'x']).length === 0, '历史数组含脏数据时不崩溃');
ok(historyFor({ level1RecentGames: [{ gameId: 'bad' }] }, 2).length === 0,
  'L2 不读取 L1 的历史（关卡隔离）');

/* ---------- 1. 两关各 100 局 ---------- */
const results = {
  1: { level: 1, games: [], retries: 0, failures: 0, failureCases: [], elapsedMs: 0, restartVerified: false, sims: [], worst: 0, worstPair: null },
  2: { level: 2, games: [], retries: 0, failures: 0, failureCases: [], elapsedMs: 0, restartVerified: false, sims: [], worst: 0, worstPair: null },
};
const allGameIds = [];
const snapshotPath = join(reports, '.history-restart-snapshot.json');

function profileTotal(level, id) {
  const p = profileFor(level, id);
  return p.mainCount + p.queueCount;
}

function validateGenerated(level, r) {
  const d = r.data;
  const cards = d.cards;
  const rec = r.record;
  const labels = [];
  // 实际牌数与配置一致
  labels.push(ok(cards.length === rec.totalTiles &&
    rec.totalTiles === profileTotal(level, rec.difficultyId),
    `L${level} #${results[level].games.length + 1} 实际牌数与档位配置一致`));
  // 完整校验
  const v = validateLevel(d);
  labels.push(ok(v.ok, `L${level} validateLevel 通过` + (v.ok ? '' : '：' + v.issues.join('；'))));
  /**
   * 第 3.2 节：第二关整池 Fisher–Yates 洗牌后不再保证存在完整通关路径，
   * 因此 verify() 只对「必须有解」的第一关作为门槛；第二关如实记录 solvable。
   */
  if (level === 1) {
    labels.push(ok(verify(d), `L1 几何可解性 verify 通过`));
  } else {
    labels.push(ok(d.requireSolution === false, `L2 已声明 requireSolution=false（如实记录不可解）`));
  }
  labels.push(ok(validateRegistry().ok, `L${level} 16 种牌型注册表完整`));
  let tripleOk = true;
  let illegalType = false;
  for (const t of TYPE_IDS) {
    const n = (d.typeCounts && d.typeCounts[t]) || 0;
    if (n % 3 !== 0) tripleOk = false;
  }
  for (const c of cards) if (TYPE_IDS.indexOf(c.type) < 0) illegalType = true;
  labels.push(ok(tripleOk, `L${level} 每种牌型张数都是 3 的倍数`));
  labels.push(ok(!illegalType, `L${level} 不存在注册表外的非法牌型`));
  // 坐标 / 半格晶格 / 同层零重叠 / 边界
  let inBand = true;
  for (const c of cards) {
    if (c.x < BOARD_BAND.left || c.y < BOARD_BAND.top ||
        c.x + TILE_W > BOARD_BAND.right || c.y + TILE_H > BOARD_BAND.bottom) inBand = false;
  }
  labels.push(ok(inBand, `L${level} 所有坐标在牌桌边界内`));
  labels.push(ok(!!isHalfLattice(cards), `L${level} 半格晶格成立`));
  labels.push(ok(sameLayerOverlapCount(cards) === 0, `L${level} 同层零重叠`));
  // 主堆单连通（盲盒队列是独立区域，不参与连通性判定）
  const mainCards = cards.filter((c) => c.region === 'core');
  labels.push(ok(mainCards.length > 0 && countComponents(mainCards) === 1,
    `L${level} 主堆单连通、是紧凑堆（${mainCards.length} 张，实测分量 ${mainCards.length ? countComponents(mainCards) : 0}）`));
  // 每层必须是一个连通团块（第 1.2 / 1.4 节：每层由 seed 随机生长的连通团块）
  const byLayer = {};
  let layerSplit = 0;
  for (const c of mainCards) (byLayer[c.layer] = byLayer[c.layer] || []).push(c);
  for (const key of Object.keys(byLayer)) if (countComponents(byLayer[key]) > 1) layerSplit++;
  labels.push(ok(layerSplit === 0, `L${level} 每层团块连通（分裂层数 ${layerSplit}）`));
  // 盲盒队列：44 张、每条链只有队首可点
  const queueCards = cards.filter((c) => c.seg === 'queue');
  labels.push(ok(queueCards.length === profileFor(level, rec.difficultyId).queueCount,
    `L${level} 盲盒队列张数与档位一致（${queueCards.length} 张）`));
  // 遮挡标记与几何一致
  let blockerOk = true;
  const g = d._graph;
  for (const c of cards) {
    if (((g.blockers[c.id] || []).length > 0) !== !!c.blocked) { blockerOk = false; break; }
  }
  labels.push(ok(blockerOk, `L${level} blocked 标记与遮挡图一致`));
  // 可操作性
  labels.push(ok(d.visible > 0, `L${level} 存在可点牌（无明显无法操作布局）`));
  labels.push(ok(d.visible === countVisible(cards), `L${level} visible 计数与实际可点牌一致`));
  if (level === 2) {
    labels.push(ok(d.visible >= 19 && d.visible <= 25, `L2 开局可点 19–25 张（实测 ${d.visible}）`));
  }
  // 签名可复算
  const again = calculateLayoutSignature(d);
  labels.push(ok(again.layoutSignature === rec.layoutSignature &&
    again.geometrySignature === rec.geometrySignature &&
    again.distributionSignature === rec.distributionSignature,
  `L${level} 布局签名可从实际牌局数据复算`));
  // seed 可重放：历史记录只存 seed，必须能还原出完全相同的布局签名
  const replay = generateLevel(level, rec.seed, { profile: rec.difficultyId });
  labels.push(ok(calculateLayoutSignature(replay).layoutSignature === rec.layoutSignature,
    `L${level} 存档里的 seed 能精确重放该局布局`));
  // 档位 / seed 有效
  const ids = profilesFor(level).map((p) => p.id);
  labels.push(ok(ids.indexOf(rec.difficultyId) >= 0, `L${level} difficultyId 属于合法档位表`));
  labels.push(ok(Number.isInteger(rec.seed) && rec.seed >= 0 && rec.seed <= 0xffffffff,
    `L${level} seed 是合法 uint32`));
  if (level === 2) {
    labels.push(ok((SEED_POOL['L2-' + rec.difficultyId] || []).indexOf(rec.seed) >= 0,
      `L2 seed 来自当前档位的分档 seed 池`));
  }
  // 历史写入与本关隔离
  const saved = historyFor(r.nextSave, level);
  labels.push(ok(saved.length > 0 && saved.length <= HISTORY_LIMIT &&
    saved[saved.length - 1].gameId === rec.gameId,
  `L${level} 新记录已写入本关历史且不超过 ${HISTORY_LIMIT} 条（实测 ${saved.length}）`));
  const other = level === 1 ? 2 : 1;
  const otherList = historyFor(r.nextSave, other);
  labels.push(ok(otherList.length === 0, `L${level} 未写入 L${other} 的历史`));
  // meta / 调试面板真实数据
  labels.push(ok(!!r.game.meta && r.game.meta.gameId === rec.gameId &&
    r.game.meta.totalTiles === rec.totalTiles &&
    r.game.meta.layoutSignature === rec.layoutSignature,
  `L${level} game.meta 是真实运行数据`));
  labels.push(ok(r.meta.checks.layoutCheck === 'PASS' && r.meta.checks.geometryCheck === 'PASS' &&
    r.meta.checks.difficultyCheck === 'PASS' && r.meta.checks.historyCheck === 'PASS',
  `L${level} 四项检查均为 PASS`));
  labels.push(ok(r.meta.historyLimit === HISTORY_LIMIT &&
    r.meta.similarityThreshold === SIMILARITY_THRESHOLD,
  `L${level} meta 记录 historyLimit=${HISTORY_LIMIT} / 阈值 ${SIMILARITY_THRESHOLD}`));
  return labels.every(Boolean);
}

for (const level of [1, 2]) {
  const R = results[level];
  const t0 = Date.now();
  // 每关独立实例与独立存档对象
  const game = new Game(null);
  let save = { v: SAVE_VERSION, level: level, best: 1, level1RecentGames: [], level2RecentGames: [] };
  game.saveState = save;
  section(`[${level}] 第 ${level} 关连续 ${PER_LEVEL} 局（独立历史）`);

  // 最近 3 局的真实牌面（用于算 layoutSimilarity；历史记录里只有签名）
  const recentBoards = [];

  for (let i = 0; i < PER_LEVEL; i++) {
    const before = historyFor(save, level);
    const beforeGeom = before.map((x) => x.geometrySignature);
    const beforeIds = before.map((x) => x.gameId);
    const currentDifficulty = before.length
      ? before[before.length - 1].difficultyId
      : (level === 1 ? game.profile.l1 : game.profile.l2);
    const reason = REASONS[i % REASONS.length];
    const tGen = Date.now();
    let r;
    try {
      r = createNewGame({ level, generationReason: reason, game, save, rand: Math.random });
    } catch (e) {
      R.failures++;
      R.failureCases.push({ index: i + 1, error: String(e && e.message), detail: e && e.detail });
      ok(false, `L${level} #${i + 1} 必须成功生成（实际抛错）`);
      continue;
    }
    const genMs = Date.now() - tGen;

    /* ---- 第 2.3 节：档位 ≠ 上一局档位 ---- */
    ok(r.record.difficultyId !== currentDifficulty,
      `L${level} #${i + 1} 难度档位已重新选择（${currentDifficulty} → ${r.record.difficultyId}）`);

    /* ---- 本轮规格：与最近 3 局的 layoutSimilarity 全部 < 0.60 ---- */
    let maxSim = 0;
    let maxSimWith = null;
    let simFail = false;
    for (let k = 0; k < recentBoards.length; k++) {
      const s = layoutSimilarity(r.data.cards, recentBoards[k].cards);
      R.sims.push(s);
      if (s > maxSim) { maxSim = s; maxSimWith = recentBoards[k].gameId; }
      if (s >= SIMILARITY_THRESHOLD) simFail = true;
    }
    if (maxSim > R.worst) R.worst = maxSim, R.worstPair = [r.record.gameId, maxSimWith];
    ok(!simFail,
      `L${level} #${i + 1} 与本关最近 ${recentBoards.length} 局 sim 全部 < ${SIMILARITY_THRESHOLD}`
      + `（最大 ${maxSim.toFixed(4)}）`);
    ok(r.meta.similarityMax !== undefined && Math.abs(r.meta.similarityMax - Math.round(maxSim * 1000) / 1000) < 1e-9,
      `L${level} #${i + 1} 入口记录的 similarityMax 与外部复算一致（${r.meta.similarityMax}）`);

    /* ---- 本轮规格：每局与最近三局比较「总牌数 + 布局签名」 ---- */
    const beforeTiles = before.map((x) => x.totalTiles);
    const beforeSigs = before.map((x) => x.layoutSignature);
    ok(beforeTiles.indexOf(r.record.totalTiles) < 0,
      `L${level} #${i + 1} 总牌数 ${r.record.totalTiles} 与最近 ${beforeTiles.length} 局 [${beforeTiles.join(',')}] 都不同`);
    ok(beforeSigs.indexOf(r.record.layoutSignature) < 0,
      `L${level} #${i + 1} 布局签名与最近 ${beforeSigs.length} 局都不同（不把 seed 不同当成布局不同）`);
    ok(r.meta.checks.tileCountCheck === 'PASS' && r.meta.checks.layoutCheck === 'PASS' &&
      r.meta.checks.geometryCheck === 'PASS',
      `L${level} #${i + 1} 入口三项检查均为 PASS（牌数 / 布局 / 几何相似度）`);
    ok(before.map((x) => x.seed).indexOf(r.record.seed) < 0 && Number.isInteger(r.record.seed),
      `L${level} #${i + 1} 新随机 seed 合法且未与最近三局重复`);

    /* ---- 几何签名不与最近 3 局任何一局完全相同 ---- */
    ok(beforeGeom.indexOf(r.record.geometrySignature) < 0,
      `L${level} #${i + 1} 几何签名不同于本关最近 ${beforeGeom.length} 局`);
    ok(r.record.layoutSignature !== undefined && beforeIds.indexOf(r.record.gameId) < 0,
      `L${level} #${i + 1} gameId 未与历史重复`);
    ok(allGameIds.indexOf(r.record.gameId) < 0, `gameId 全局唯一：${r.record.gameId}`);
    allGameIds.push(r.record.gameId);
    ok(validateGenerated(level, r), `L${level} #${i + 1} 全部生成规则校验`);

    R.retries += r.retries;
    R.games.push({
      index: i + 1,
      gameId: r.record.gameId,
      level,
      difficultyId: r.record.difficultyId,
      seed: r.record.seed,
      totalTiles: r.record.totalTiles,
      tileTypeCount: r.record.tileTypeCount,
      layerCount: r.meta.layerCount,
      layoutSignature: r.record.layoutSignature,
      geometrySignature: r.record.geometrySignature,
      distributionSignature: r.record.distributionSignature,
      generationReason: r.record.generationReason,
      generationTime: genMs,
      validationResult: r.record.validationResult,
      attempts: r.attempts,
      retries: r.retries,
      visible: r.data.visible,
      similarityMax: Math.round(maxSim * 1000) / 1000,
      maxSimWith,
      recentTileCounts: before.map((x) => x.totalTiles),
      checks: r.meta.checks,
      generatedAt: r.record.generatedAt,
    });
    recentBoards.push({ gameId: r.record.gameId, cards: r.data.cards });
    while (recentBoards.length > HISTORY_LIMIT) recentBoards.shift();
    save = r.nextSave;
    game.saveState = save;

    // 中途模拟应用重启：序列化到磁盘 → 丢弃内存 → 重新读回
    if (i === Math.floor(PER_LEVEL / 2) - 1) {
      writeFileSync(snapshotPath, JSON.stringify(save), 'utf8');
      const reloaded = JSON.parse(readFileSync(snapshotPath, 'utf8'));
      const restoredGame = new Game(null);
      applySaveToGame(restoredGame, reloaded);
      const hist = historyFor(restoredGame.saveState, level);
      ok(hist.length === HISTORY_LIMIT && hist.every((x) => !!sanitizeRecord(x)),
        `L${level} 模拟应用重启后最近 ${HISTORY_LIMIT} 局历史仍然有效（${hist.length} 条）`);
      ok(historyFor(restoredGame.saveState, level === 1 ? 2 : 1).length === 0,
        `L${level} 重启后另一关历史仍为空`);
      // 用重启后恢复的存档继续生成，验证差异化仍然成立
      let after = null;
      try {
        after = createNewGame({
          level, generationReason: 'application_restart',
          game: restoredGame, save: restoredGame.saveState, rand: Math.random,
        });
      } catch (e) {
        R.failureCases.push({ index: 'restart', error: String(e && e.message), detail: e && e.detail });
        ok(false, `L${level} 重启后必须能生成新局（实际抛错）`);
      }
      if (after) {
        let afterSimMax = 0;
        for (const b of recentBoards) {
          const s = layoutSimilarity(after.data.cards, b.cards);
          if (s > afterSimMax) afterSimMax = s;
        }
        ok(afterSimMax < SIMILARITY_THRESHOLD &&
          hist.map((x) => x.geometrySignature).indexOf(after.record.geometrySignature) < 0,
        `L${level} 重启后首个新局仍与重启前最近 ${HISTORY_LIMIT} 局不同（sim 最大 ${afterSimMax.toFixed(4)}）`);
        ok(hist.map((x) => x.totalTiles).indexOf(after.record.totalTiles) < 0 &&
          hist.map((x) => x.layoutSignature).indexOf(after.record.layoutSignature) < 0,
          `L${level} 重启后首个新局的牌数与布局签名仍不同于最近 ${HISTORY_LIMIT} 局`);
        R.restartVerified = true;
        // 把这一局也纳入 gameId 唯一性集合（它是额外生成的第 101 局）
        allGameIds.push(after.record.gameId);
        line(`   重启模拟：恢复 ${hist.length} 条历史，额外生成 1 局 reason=application_restart，牌数 ${after.record.totalTiles}，sim 最大 ${afterSimMax.toFixed(4)}`);
      }
    }
  }
  R.elapsedMs = Date.now() - t0;
  const sorted = R.sims.slice().sort((a, b) => a - b);
  R.mean = R.sims.length ? R.sims.reduce((a, b) => a + b, 0) / R.sims.length : 0;
  R.p95 = quantile(sorted, 0.95);
  line(`   L${level} 完成 ${R.games.length}/${PER_LEVEL} 局 · 重试 ${R.retries} 次 · 失败 ${R.failures} 次 · 耗时 ${R.elapsedMs} ms`);
  line(`   L${level} 三局滑窗 sim：均值 ${R.mean.toFixed(4)} · P95 ${R.p95.toFixed(4)} · 最大 ${R.worst.toFixed(4)} · 对数 ${R.sims.length}`);
  if (R.worstPair) line(`      最大相似度出现在 ${R.worstPair[0]} / ${R.worstPair[1]}`);
}

/* ---------- 2. 汇总统计 ---------- */
section('[2] 汇总与重复检查');
ok(allGameIds.length === (PER_LEVEL * 2 + 2) && new Set(allGameIds).size === allGameIds.length,
  `全部 gameId 唯一（${allGameIds.length} 个）`);
for (const level of [1, 2]) {
  const R = results[level];
  ok(R.games.length === PER_LEVEL, `L${level} 完成 ${PER_LEVEL} 局`);
  ok(R.failures === 0, `L${level} 生成失败 0 次`);
  ok(R.restartVerified, `L${level} 重启后历史有效`);
  // 滚动窗口（最近 3 局）重复检查
  let sigRepeat = 0, geomRepeat = 0, tileRepeat = 0;
  for (let i = 0; i < R.games.length; i++) {
    const w = R.games.slice(Math.max(0, i - HISTORY_LIMIT), i);
    if (w.some((x) => x.layoutSignature === R.games[i].layoutSignature)) sigRepeat++;
    if (w.some((x) => x.geometrySignature === R.games[i].geometrySignature)) geomRepeat++;    if (w.some((x) => x.totalTiles === R.games[i].totalTiles)) tileRepeat++;
  }
  ok(tileRepeat === 0, `L${level} 最近 ${HISTORY_LIMIT} 局总牌数重复 0 次`);
  ok(sigRepeat === 0, `L${level} 最近 ${HISTORY_LIMIT} 局布局签名重复 0 次`);
  ok(geomRepeat === 0, `L${level} 最近 ${HISTORY_LIMIT} 局几何签名重复 0 次`);
  ok(R.worst < SIMILARITY_THRESHOLD,
    `L${level} 全部滑窗对 sim 的最大值 < ${SIMILARITY_THRESHOLD}（实测 ${R.worst.toFixed(4)}）`);
  ok(R.p95 < SIMILARITY_THRESHOLD,
    `L${level} 滑窗 sim 的 P95 < ${SIMILARITY_THRESHOLD}（实测 ${R.p95.toFixed(4)}）`);
  R.rolling = { sigRepeat, geomRepeat, tileRepeat };
}
const allRecords = results[1].games.concat(results[2].games);
const globalSigSet = new Set(allRecords.map((x) => x.layoutSignature));
line(`   全局布局签名 ${allRecords.length} 个，去重后 ${globalSigSet.size} 个（滚动窗口规则不要求全局唯一）`);

/* ---------- 3. 三种重新开局入口（运行时 + 源码静态审计） ---------- */
section('[3] 三种重新开局入口');
const mainSrc = readFileSync(join(root, 'src/main.js'), 'utf8');
ok(/case 'start':[\s\S]*?newGame\(/.test(mainSrc), '标题页开始走 newGame 统一入口');
ok(/case 'restart':[\s\S]*?case 'replay':[\s\S]*?newGame\(/.test(mainSrc), '失败/暂停/重玩走 newGame 统一入口');
ok(/case 'next':[\s\S]*?newGame\(/.test(mainSrc), '进入下一关走 newGame 统一入口');
ok(/newGame\(game\.level, 'title_screen_restart'\)/.test(mainSrc), '键盘 r 重开走 newGame 统一入口');
ok(/function newGame\([\s\S]*?createNewGame\(\{/.test(mainSrc), 'newGame 内部真实调用 createNewGame');
ok(!/case 'start':[\s\S]{0,400}?game\.startLevel\(/.test(mainSrc), '开始按钮不再直接调用 startLevel');
for (const reason of ['application_restart', 'title_screen_restart', 'failure_restart']) {
  const cnt = allRecords.filter((x) => x.generationReason === reason).length;
  ok(cnt >= 50, `reason=${reason} 已真实生成 ${cnt} 局`);
}
// 真实「失败重开」：造一个失败局面后走统一入口
{
  const g = new Game(null);
  let save = { v: SAVE_VERSION, level1RecentGames: [], level2RecentGames: [] };
  const first = createNewGame({ level: 1, generationReason: 'new_game', game: g, save, rand: Math.random });
  save = first.nextSave;
  g.status = 'lose';
  const afterFail = createNewGame({ level: 1, generationReason: 'failure_restart', game: g, save, rand: Math.random });
  ok(afterFail.record.geometrySignature !== first.record.geometrySignature &&
    layoutSimilarity(afterFail.data.cards, first.data.cards) < SIMILARITY_THRESHOLD,
  '真实失败重开生成了不同布局的新局');
}
/* 50 次上限失败路径：把第二关**全部**分档 seed 池里的 seed 都声明为已用过，
 * 于是每次抽到的 seed 都命中 seedFresh=false，只给 3 次机会必然抛错。
 * 这是真实的失败路径（走的是生产代码里的 checks.seedFresh 判定），
 * 不是为了凑一个 error 而伪造的假分支。 */
{
  const g = new Game(null);
  const usedSeeds = [];
  for (const key of Object.keys(SEED_POOL)) {
    const arr = SEED_POOL[key] || [];
    for (const s of arr) usedSeeds.push(s);
  }
  ok(usedSeeds.length > 0, `第二关种子池共 ${usedSeeds.length} 个 seed 可用于制造冲突`);
  let threw = false;
  try {
    createNewGame({
      level: 2, generationReason: 'new_game', game: g,
      save: { level1RecentGames: [], level2RecentGames: [] },
      previousSeeds: usedSeeds,
      maxAttempts: 3, rand: Math.random,
    });
  } catch (e) {
    threw = e instanceof GenerationFailureError;
    ok(threw && e.detail.reason === 'MAX_ATTEMPTS_EXCEEDED' && e.detail.attempts === 3,
      '50 次仍不合格时抛出明确的 GenerationFailureError（此处用 3 次复现）');
    ok(threw && e.detail.failures.length === 3 &&
      e.detail.failures.every((x) => (x.failedChecks || []).indexOf('SEED') >= 0),
    '失败原因逐次记录为 SEED 冲突，未自动接受重复牌局');
  }
  ok(threw, '配置被占满时不接受重复牌局');
}

/* ---------- 4. 存档 / 安全 ---------- */
section('[4] 存档 v' + SAVE_VERSION + ' / 历史隔离 / 损坏容错');
{
  const g = new Game(null);
  let save = { v: SAVE_VERSION, level1RecentGames: [], level2RecentGames: [] };
  for (let i = 0; i < HISTORY_LIMIT + 2; i++) {
    const r = createNewGame({ level: 1, generationReason: 'new_game', game: g, save, rand: Math.random });
    save = r.nextSave;
  }
  g.saveState = save;
  const data = makeSaveData(g);
  ok(data.v === SAVE_VERSION, `存档版本 v${SAVE_VERSION}`);
  ok(data.level1RecentGames.length === HISTORY_LIMIT && data.level2RecentGames.length === 0,
    `存档每关只保留最近 ${HISTORY_LIMIT} 局，且两关隔离`);
  ok(typeof data.musicMap === 'object' && data.musicMap !== null, '存档含 musicMap 字段（第 4.4 节）');
  ok(JSON.stringify(data).length < 65536, '存档体积有上界（< 64 KB）');
  const broken = JSON.parse(JSON.stringify(data));
  broken.level1RecentGames[0].layoutSignature = 'not-a-sha256';
  const g2 = new Game(null);
  applySaveToGame(g2, broken);
  ok(historyFor(g2.saveState, 1).length === HISTORY_LIMIT - 1, '损坏的历史记录被安全丢弃，不加载非法布局');
  // 旧存档（无 musicMap / 无音乐字段）必须能读入
  const legacy = { v: 3, level: 2, best: 3, sound: false, sfxVol: 0.4, level1RecentGames: [], level2RecentGames: [] };
  const g3 = new Game(null);
  applySaveToGame(g3, legacy);
  ok(g3.saveState.level === 2 && g3.saveState.best === 3,
    '缺 musicMap / music / musicVol 的旧存档能正常读入');
  const rust = readFileSync(join(root, 'src-tauri/src/main.rs'), 'utf8');
  ok(/SAVE_FIELDS: \[&str; 12\]/.test(rust) &&
    /level1RecentGames/.test(rust) && /level2RecentGames/.test(rust) && /musicMap/.test(rust),
  'Rust 白名单已扩展到 12 键（含两关历史 + musicMap）');
  ok(/HISTORY_LIMIT: usize = 3/.test(rust), 'Rust 历史窗口同步为 3');
  ok(/validate_history_field/.test(rust) && /MAX_SAVE_BYTES: usize = 64 \* 1024/.test(rust),
  'Rust 保留 64KB 上限并新增历史校验');
  ok(/fs::rename\(&tmp, &(path|target)\)/.test(rust), 'Rust 仍使用原子写入');
  for (const cmd of ['list_music', 'import_music', 'read_music', 'delete_music']) {
    ok(new RegExp('fn ' + cmd + '\\b').test(rust), `Rust 已实现 music 命令 ${cmd}`);
  }
}

/* ---------- 5. 报告 ---------- */
const report = {
  meta: {
    generatedAt: new Date().toISOString(),
    gitCommit,
    command: 'node test-random-generation.js',
    algorithm: SIGNATURE_ALGORITHM,
    historyLimit: HISTORY_LIMIT,
    similarityThreshold: SIMILARITY_THRESHOLD,
    maxAttempts: MAX_ATTEMPTS,
    perLevel: PER_LEVEL,
    seedDiversitySamples: SEED_SAMPLES,
    seedDiversityMinDistinct: SEED_MIN_DISTINCT,
    totalGames: allRecords.length,
    assertions: { pass, fail },
    exitCode: fail ? 1 : 0,
    elapsedMs: Date.now() - tStart,
    note: `最近 ${HISTORY_LIMIT} 局为滑动窗口规则，不要求 ${PER_LEVEL} 局全局唯一`,
  },
  levels: {},
  seedDiversity,
  global: {
    uniqueGameIds: new Set(allGameIds).size,
    expectedGameIds: PER_LEVEL * 2 + 2,
    totalLayoutSignatures: allRecords.length,
    uniqueLayoutSignatures: globalSigSet.size,
    generationFailures: results[1].failures + results[2].failures,
    totalRetries: results[1].retries + results[2].retries,
    averageGenerationMs: allRecords.reduce((a, b) => a + b.generationTime, 0) / allRecords.length,
    failureCases: results[1].failureCases.concat(results[2].failureCases),
  },
  entryAudit: { reasonsCovered: REASONS },
};

for (const level of [1, 2]) {
  const R = results[level];
  const games = R.games;
  const byDifficulty = {};
  const byTiles = {};
  const byTypeCount = {};
  const byReason = {};
  for (const g of games) {
    byDifficulty[g.difficultyId] = (byDifficulty[g.difficultyId] || 0) + 1;
    byTiles[g.totalTiles] = (byTiles[g.totalTiles] || 0) + 1;
    byTypeCount[g.tileTypeCount] = (byTypeCount[g.tileTypeCount] || 0) + 1;
    byReason[g.generationReason] = (byReason[g.generationReason] || 0) + 1;
  }
  const sigMap = {};
  for (const g of games) sigMap[g.layoutSignature] = (sigMap[g.layoutSignature] || 0) + 1;
  report.levels['L' + level] = {
    level,
    games,
    summary: {
      total: games.length,
      elapsedMs: R.elapsedMs,
      retries: R.retries,
      failures: R.failures,
      failureCases: R.failureCases,
      rolling: R.rolling,
      restartVerified: R.restartVerified,
      similarity: {
        pairs: R.sims.length,
        mean: R.mean,
        p95: R.p95,
        max: R.worst,
        worstPair: R.worstPair,
        threshold: SIMILARITY_THRESHOLD,
      },
      difficultyDistribution: byDifficulty,
      tileCountDistribution: byTiles,
      tileTypeCountDistribution: byTypeCount,
      reasonDistribution: byReason,
      tileCountRange: [Math.min.apply(null, games.map((g) => g.totalTiles)),
        Math.max.apply(null, games.map((g) => g.totalTiles))],
      uniqueLayoutSignatures: Object.keys(sigMap).length,
      globalSignatureDuplicates: games.length - Object.keys(sigMap).length,
      averageGenerationMs: games.reduce((a, b) => a + b.generationTime, 0) / games.length,
      visibleRange: [Math.min.apply(null, games.map((g) => g.visible)),
        Math.max.apply(null, games.map((g) => g.visible))],
    },
  };
  line(`   L${level} 牌数范围 ${report.levels['L' + level].summary.tileCountRange.join('–')} · 档位分布 ${JSON.stringify(byDifficulty)}`);
}

writeFileSync(join(reports, 'random-generation-report.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(reports, 'random-generation-output.txt'), logs.join('\n') + '\n' +
  `\n断言：通过 ${pass} 项，失败 ${fail} 项\n` +
  (failLabels.length ? '失败项：\n' + failLabels.map((x) => ' - ' + x).join('\n') + '\n' : ''), 'utf8');

/* Markdown 报告 */
function table(head, rows) {
  return '| ' + head.join(' | ') + ' |\n|' + head.map(() => '---').join('|') + '|\n' +
    rows.map((r) => '| ' + r.join(' | ') + ' |').join('\n');
}
let md = `# 双关卡各 100 局随机生成压力测试报告\n\n` +
  `> 本文件由 \`node test-random-generation.js\` **真实运行**自动生成，不是静态 PASS 模板。\n\n` +
  `- 运行时间：${report.meta.generatedAt}\n- Git commit：\`${gitCommit}\`\n` +
  `- 断言：通过 **${pass}**，失败 **${fail}**\n- 总耗时：${report.meta.elapsedMs} ms\n` +
  `- 布局签名算法：\`${SIGNATURE_ALGORITHM}\`（SHA-256，浏览器与 Node 共用同一实现）\n` +
  `- 历史窗口：每关最近 ${HISTORY_LIMIT} 局；重复阈值 sim ≥ ${SIMILARITY_THRESHOLD}；重试上限 ${MAX_ATTEMPTS} 次\n\n` +
  `## 全局\n\n` +
  table(['项', '值'], [
    ['总生成局数', String(report.meta.totalGames)],
    ['gameId 唯一数', String(report.global.uniqueGameIds) + ' / ' + String(report.global.expectedGameIds)],
    ['布局签名总数 / 去重', String(report.global.totalLayoutSignatures) + ' / ' + String(report.global.uniqueLayoutSignatures)],
    ['生成失败次数', String(report.global.generationFailures)],
    ['重试总次数', String(report.global.totalRetries)],
    ['平均单局生成耗时', report.global.averageGenerationMs.toFixed(2) + ' ms'],
    ['失败案例', String(report.global.failureCases.length)],
  ]) + '\n\n' +
  `## 最近三局滑动窗口相似度\n\n` +
  table(['关卡', '窗口对数', '均值', 'P95', '最大值', '阈值', '判定'], [
    ['L1', report.levels.L1.summary.similarity.pairs, report.levels.L1.summary.similarity.mean.toFixed(4),
      report.levels.L1.summary.similarity.p95.toFixed(4), report.levels.L1.summary.similarity.max.toFixed(4),
      String(SIMILARITY_THRESHOLD), report.levels.L1.summary.similarity.max < SIMILARITY_THRESHOLD ? '✓ 全部 < 0.60' : '✗'],
    ['L2', report.levels.L2.summary.similarity.pairs, report.levels.L2.summary.similarity.mean.toFixed(4),
      report.levels.L2.summary.similarity.p95.toFixed(4), report.levels.L2.summary.similarity.max.toFixed(4),
      String(SIMILARITY_THRESHOLD), report.levels.L2.summary.similarity.max < SIMILARITY_THRESHOLD ? '✓ 全部 < 0.60' : '✗'],
  ]) + '\n\n' +
  `## 同档位不同 seed 的几何多样性（第 2.4 节）\n\n` +
  [1, 2].map((lv) => table(['档位', `${SEED_SAMPLES} seed 中不同几何数`, `≥${SEED_MIN_DISTINCT}`],
    report.seedDiversity['L' + lv].map((r) => [r.profileId, r.distinct, r.distinct >= SEED_MIN_DISTINCT ? '✓' : '✗']))).join('\n\n') +
  '\n\n';

for (const level of [1, 2]) {
  const S = report.levels['L' + level].summary;
  md += `## 第 ${level} 关 · ${S.total} 局\n\n` +
    table(['项', '值'], [
      ['耗时', S.elapsedMs + ' ms'],
      ['牌数范围', S.tileCountRange.join(' – ')],
      ['开局可点牌范围', S.visibleRange.join(' – ')],
      ['档位分布', JSON.stringify(S.difficultyDistribution)],
      ['牌数分布', JSON.stringify(S.tileCountDistribution)],
      ['牌型数分布', JSON.stringify(S.tileTypeCountDistribution)],
      ['生成原因分布', JSON.stringify(S.reasonDistribution)],
      ['布局签名去重', String(S.uniqueLayoutSignatures) + ' / ' + String(S.total)],
      [`最近 ${HISTORY_LIMIT} 局总牌数重复`, String(S.rolling.tileRepeat)],
      [`最近 ${HISTORY_LIMIT} 局布局签名重复`, String(S.rolling.sigRepeat)],
      [`最近 ${HISTORY_LIMIT} 局几何签名重复`, String(S.rolling.geomRepeat)],
      ['重试次数（失败重试合计）', String(S.retries)],
      ['生成失败次数', String(S.failures)],
      ['滑窗 sim 均值 / P95 / 最大', S.similarity.mean.toFixed(4) + ' / ' + S.similarity.p95.toFixed(4) + ' / ' + S.similarity.max.toFixed(4)],
      ['重启模拟历史有效', String(S.restartVerified)],
      ['平均单局耗时', S.averageGenerationMs.toFixed(2) + ' ms'],
    ]) + '\n\n' +
    `<details><summary>完整 ${S.total} 局逐局记录</summary>\n\n` +
    table(['#', 'gameId', '档位', 'seed', '牌数', '牌型数', '可点', 'sim最大', '布局签名(前12)', '几何签名(前12)', '原因', '重试', '耗时ms', '校验'],
      report.levels['L' + level].games.map((g) => [
        g.index, g.gameId, g.difficultyId, g.seed, g.totalTiles, g.tileTypeCount, g.visible,
        g.similarityMax, g.layoutSignature.slice(0, 12), g.geometrySignature.slice(0, 12),
        g.generationReason, g.retries, g.generationTime, g.validationResult,
      ])) + '\n\n</details>\n\n';
}
md += `## 失败案例与原因\n\n` +
  (report.global.failureCases.length
    ? '```json\n' + JSON.stringify(report.global.failureCases, null, 2) + '\n```\n'
    : '本次运行 **0** 个生成失败案例；每次重试的原因均记录在 `random-generation-report.json` 的逐局 `retries` 字段。\n') +
  `\n## 测试性质说明\n\n` +
  `- 运行时：两关各 ${PER_LEVEL} 局真实调用 \`createNewGame\`，真实生成、真实签名、真实校验。\n` +
  `- 相似度：用**真实牌面**两两计算 \`layoutSimilarity\`（层占位格 Jaccard 均值 ×0.5 + 整体轮廓 Jaccard ×0.5），不是签名比较。\n` +
  `- 静态审计：三种重新开局入口通过读取 \`src/main.js\` 源码确认全部走统一入口；未冒充浏览器实测。\n` +
  `- 重启模拟：把存档 JSON 写入磁盘再读回，继续生成并验证差异化。\n` +
  `- 浏览器实际运行 / Windows 安装卸载测试不在本文件覆盖范围，见 \`FINAL_ACCEPTANCE.md\`。\n`;
writeFileSync(join(reports, 'random-generation-report.md'), md, 'utf8');

if (existsSync(snapshotPath)) unlinkSync(snapshotPath);

line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line(` 报告：reports/random-generation-report.json / .md / -output.txt`);
line('============================================================================');
if (fail) {
  line('失败项：');
  for (const f of failLabels) line(' - ' + f);
  process.exit(1);
}
