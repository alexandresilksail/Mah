/**
 * 连续 200 局随机生成压力测试（第九阶段）。
 *
 *   node test-random-generation.js
 *
 *  · 第一关 100 局 + 第二关 100 局，各自使用**独立**的 Game 实例与存档历史；
 *  · 每局真实调用统一入口 createNewGame()，真实生成牌局、真实计算签名、
 *    真实跑 validateLevel / verify / 几何 / 三消 / 遮挡 / 注册表校验；
 *  · 每局都检查「总牌数 + 布局签名 + 几何签名」与本关最近三局同时不同；
 *  · 中途把存档序列化到磁盘再读回，模拟应用重启，验证历史不丢；
 *  · 三种重新开局 reason 在 100 局里轮换覆盖；
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
import { calculateLayoutSignature, SIGNATURE_ALGORITHM } from './src/game/layout_signature.js';
import { sha256Hex } from './src/game/sha256.js';
import {
  GENERATION_REASONS, historyFor, sanitizeHistory, sanitizeRecord, HISTORY_LIMIT,
} from './src/game/recent_games.js';
import { makeSaveData, applySaveToGame } from './src/game/save_data.js';
import {
  LEVEL1_PROFILES, LEVEL2_PROFILES, profilesFor, profileFor,
  BOARD_BAND, TILE_W, TILE_H,
} from './src/game/config.js';
import { generateLevel, validateLevel, verify } from './src/game/generator.js';
import { validateRegistry, TYPE_IDS } from './src/game/tile_types.js';
import { sameLayerOverlapCount, isHalfLattice } from './src/game/layout.js';
import { SEED_POOL } from './src/game/seed_pool.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const reports = join(root, 'reports');
if (!existsSync(reports)) mkdirSync(reports, { recursive: true });

const PER_LEVEL = 100;
const REASONS = GENERATION_REASONS.slice();
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

const tStart = Date.now();
const gitCommit = (() => {
  try { return execSync('git rev-parse HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch (e) { return 'unknown'; }
})();

line('============================================================================');
line(' MahLeMah · 连续 200 局随机生成压力测试（真实运行）');
line(' commit=' + gitCommit + ' start=' + new Date().toISOString());
line('============================================================================');

/* ---------- 0. 基础组件自检 ---------- */
section('[0] 签名算法 / 注册表 / 配置自检');
ok(sha256Hex('abc') === createHash('sha256').update('abc', 'utf8').digest('hex'),
  '同步 SHA-256 与 node:crypto 一致');
ok(validateRegistry().ok, '16 种牌型注册表完整');
ok(LEVEL1_PROFILES.length === 4 && LEVEL2_PROFILES.length === 10, '档位表 4 + 10 个预设');
ok(MAX_ATTEMPTS === 50, '生成重试上限 = 50');
ok(REASONS.length === 4, '4 种 generationReason 已定义');

// 签名稳定性：同档位换 seed 几何签名必须相同，不同档位必须不同
const sigCases = {};
for (const lv of [1, 2]) {
  const a = calculateLayoutSignature(generateLevel(lv, 1111, { profile: 0 }));
  const b = calculateLayoutSignature(generateLevel(lv, 2222, { profile: 0 }));
  const c = calculateLayoutSignature(generateLevel(lv, 1111, { profile: 1 }));
  ok(a.geometrySignature === b.geometrySignature,
    `L${lv} 同档位换 seed 的几何签名相同（不能把 seed 当布局）`);
  ok(a.geometrySignature !== c.geometrySignature, `L${lv} 不同档位的几何签名不同`);
  ok(a.layoutSignature.length === 64 && a.algorithm === SIGNATURE_ALGORITHM,
    `L${lv} 布局签名为 64 位 SHA-256`);
  sigCases[lv] = { a, b, c };
}
ok(sanitizeRecord({ gameId: 'x' }) === null, '损坏历史记录被丢弃而不是抛异常');
ok(sanitizeHistory([null, 1, 'x']).length === 0, '历史数组含脏数据时不崩溃');
ok(historyFor({ level1RecentGames: [{ gameId: 'bad' }] }, 2).length === 0,
  'L2 不读取 L1 的历史（关卡隔离）');

/* ---------- 1. 两关各 100 局 ---------- */
const results = {
  1: { level: 1, games: [], retries: 0, failures: 0, failureCases: [], elapsedMs: 0, restartVerified: false },
  2: { level: 2, games: [], retries: 0, failures: 0, failureCases: [], elapsedMs: 0, restartVerified: false },
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
  labels.push(ok(verify(d), `L${level} 几何可解性 verify 通过`));
  // 16 种注册表 + 三消规则
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
  // 遮挡标记与几何一致
  let blockerOk = true;
  const g = d._graph;
  for (const c of cards) {
    if ((g.blockers[c.id] || []).length > 0 !== !!c.blocked) { blockerOk = false; break; }
  }
  labels.push(ok(blockerOk, `L${level} blocked 标记与遮挡图一致`));
  // 可操作性
  labels.push(ok(d.visible > 0, `L${level} 存在可点牌（无明显无法操作布局）`));
  if (level === 2) labels.push(ok(d.visible >= 19 && d.visible <= 25, `L2 开局可点 19–25 张（实测 ${d.visible}）`));
  // 签名可复算
  const again = calculateLayoutSignature(d);
  labels.push(ok(again.layoutSignature === rec.layoutSignature &&
    again.geometrySignature === rec.geometrySignature &&
    again.distributionSignature === rec.distributionSignature,
  `L${level} 布局签名可从实际牌局数据复算`));
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
  `L${level} 新记录已写入本关历史且不超过 3 条`));
  const other = level === 1 ? 2 : 1;
  const otherList = historyFor(r.nextSave, other);
  labels.push(ok(otherList.length === 0, `L${level} 未写入 L${other} 的历史`));
  // meta / 调试面板真实数据
  labels.push(ok(!!r.game.meta && r.game.meta.gameId === rec.gameId &&
    r.game.meta.totalTiles === rec.totalTiles &&
    r.game.meta.layoutSignature === rec.layoutSignature,
  `L${level} game.meta 是真实运行数据`));
  labels.push(ok(r.meta.checks.tileCountCheck === 'PASS' && r.meta.checks.layoutCheck === 'PASS' &&
    r.meta.checks.difficultyCheck === 'PASS' && r.meta.checks.historyCheck === 'PASS',
  `L${level} 四项检查均为 PASS`));
  return labels.every(Boolean);
}

for (const level of [1, 2]) {
  const R = results[level];
  const t0 = Date.now();
  // 每关独立实例与独立存档对象
  const game = new Game(null);
  let save = { v: 3, level: level, best: 1, level1RecentGames: [], level2RecentGames: [] };
  game.saveState = save;
  section(`[${level}] 第 ${level} 关连续 ${PER_LEVEL} 局（独立历史）`);

  for (let i = 0; i < PER_LEVEL; i++) {
    const before = historyFor(save, level);
    const beforeTiles = before.map((x) => x.totalTiles);
    const beforeSigs = before.map((x) => x.layoutSignature);
    const beforeGeom = before.map((x) => x.geometrySignature);
    const currentDifficulty = level === 1 ? game.profile.l1 : game.profile.l2;
    const reason = REASONS[i % REASONS.length];
    let r;
    try {
      r = createNewGame({ level, generationReason: reason, game, save, rand: Math.random });
    } catch (e) {
      R.failures++;
      R.failureCases.push({ index: i + 1, error: String(e && e.message), detail: e && e.detail });
      ok(false, `L${level} #${i + 1} 必须成功生成（实际抛错）`);
      continue;
    }

    // 滚动窗口：与本关最近三局同时不同（生成前的历史）
    ok(beforeTiles.indexOf(r.record.totalTiles) < 0,
      `L${level} #${i + 1} 牌数不同于本关最近三局 [${beforeTiles.join(',')}]`);
    ok(beforeSigs.indexOf(r.record.layoutSignature) < 0,
      `L${level} #${i + 1} 布局签名不同于本关最近三局`);
    ok(beforeGeom.indexOf(r.record.geometrySignature) < 0,
      `L${level} #${i + 1} 几何签名不同于本关最近三局（位置/层级/遮挡确实改变）`);
    ok(r.record.difficultyId !== currentDifficulty,
      `L${level} #${i + 1} 难度档位已重新选择`);
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
      generationTime: r.elapsedMs,
      validationResult: r.record.validationResult,
      attempts: r.attempts,
      retries: r.retries,
      visible: r.data.visible,
      recentTileCounts: beforeTiles,
      checks: r.meta.checks,
      generatedAt: r.record.generatedAt,
    });
    save = r.nextSave;
    game.saveState = save;

    // 中途模拟应用重启：序列化到磁盘 → 丢弃内存 → 重新读回
    if (i === Math.floor(PER_LEVEL / 2) - 1) {
      writeFileSync(snapshotPath, JSON.stringify(save), 'utf8');
      const reloaded = JSON.parse(readFileSync(snapshotPath, 'utf8'));
      const restoredGame = new Game(null);
      applySaveToGame(restoredGame, reloaded);
      const hist = historyFor(restoredGame.saveState, level);
      ok(hist.length === 3 && hist.every((x) => !!sanitizeRecord(x)),
        `L${level} 模拟应用重启后最近三局历史仍然有效（${hist.length} 条）`);
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
        ok(hist.map((x) => x.totalTiles).indexOf(after.record.totalTiles) < 0 &&
          hist.map((x) => x.geometrySignature).indexOf(after.record.geometrySignature) < 0,
        `L${level} 重启后首个新局仍与重启前最近三局同时不同`);
        R.restartVerified = true;
        // 把这一局也纳入 gameId 唯一性集合（它是额外生成的第 101 局）
        allGameIds.push(after.record.gameId);
        line(`   重启模拟：恢复 ${hist.length} 条历史，额外生成 1 局 reason=application_restart，牌数 ${after.record.totalTiles}`);
      }
    }
  }
  R.elapsedMs = Date.now() - t0;
  line(`   L${level} 完成 ${R.games.length}/${PER_LEVEL} 局 · 重试 ${R.retries} 次 · 失败 ${R.failures} 次 · 耗时 ${R.elapsedMs} ms`);
}

/* ---------- 2. 汇总统计 ---------- */
section('[2] 汇总与重复检查');
ok(allGameIds.length === (PER_LEVEL * 2 + 2) && new Set(allGameIds).size === allGameIds.length,
  `全部 gameId 唯一（${allGameIds.length} 个）`);
for (const level of [1, 2]) {
  const R = results[level];
  ok(R.games.length === PER_LEVEL, `L${level} 完成 100 局`);
  ok(R.failures === 0, `L${level} 生成失败 0 次`);
  ok(R.restartVerified, `L${level} 重启后历史有效`);
  // 滚动窗口重复检查（每局与前 3 局比）
  let tileRepeat = 0, sigRepeat = 0, geomRepeat = 0;
  for (let i = 0; i < R.games.length; i++) {
    const w = R.games.slice(Math.max(0, i - 3), i);
    if (w.some((x) => x.totalTiles === R.games[i].totalTiles)) tileRepeat++;
    if (w.some((x) => x.layoutSignature === R.games[i].layoutSignature)) sigRepeat++;
    if (w.some((x) => x.geometrySignature === R.games[i].geometrySignature)) geomRepeat++;
  }
  ok(tileRepeat === 0, `L${level} 最近三局牌数重复 0 次`);
  ok(sigRepeat === 0, `L${level} 最近三局布局签名重复 0 次`);
  ok(geomRepeat === 0, `L${level} 最近三局几何签名重复 0 次`);
  R.rolling = { tileRepeat, sigRepeat, geomRepeat };
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
  ok(cnt >= 25, `reason=${reason} 已真实生成 ${cnt} 局`);
}
// 真实「失败重开」：造一个失败局面后走统一入口
{
  const g = new Game(null);
  let save = { v: 3, level1RecentGames: [], level2RecentGames: [] };
  const first = createNewGame({ level: 1, generationReason: 'new_game', game: g, save, rand: Math.random });
  save = first.nextSave;
  g.status = 'lose';
  const afterFail = createNewGame({ level: 1, generationReason: 'failure_restart', game: g, save, rand: Math.random });
  ok(afterFail.record.gameId !== first.record.gameId &&
    afterFail.record.totalTiles !== first.record.totalTiles &&
    afterFail.record.geometrySignature !== first.record.geometrySignature,
  '真实失败重开生成了不同牌数与不同布局的新局');
}
// 50 次上限失败路径：把 4 个 L1 档位的牌数全部列为排除项，且只给 3 次机会
{
  const g = new Game(null);
  const tiles = LEVEL1_PROFILES.map((p) => p.mainCount + p.queueCount);
  let threw = false;
  try {
    createNewGame({
      level: 1, generationReason: 'new_game', game: g,
      save: { level1RecentGames: [] }, previousTileCounts: tiles,
      maxAttempts: 3, rand: Math.random,
    });
  } catch (e) {
    threw = e instanceof GenerationFailureError;
    ok(threw && e.detail.reason === 'MAX_ATTEMPTS_EXCEEDED' && e.detail.attempts === 3,
      '50 次仍不合格时抛出明确的 GenerationFailureError（此处用 3 次复现）');
    ok(e.detail.failures.length === 3, '失败原因逐次记录，未自动接受重复牌局');
  }
  ok(threw, '配置被占满时不接受重复牌局');
}

/* ---------- 4. 存档 / 安全 ---------- */
section('[4] 存档 v3 / 历史隔离 / 损坏容错');
{
  const g = new Game(null);
  let save = { v: 3, level1RecentGames: [], level2RecentGames: [] };
  for (let i = 0; i < 4; i++) {
    const r = createNewGame({ level: 1, generationReason: 'new_game', game: g, save, rand: Math.random });
    save = r.nextSave;
  }
  g.saveState = save;
  const data = makeSaveData(g);
  ok(data.v === 3, '存档版本 v3');
  ok(data.level1RecentGames.length === 3 && data.level2RecentGames.length === 0,
    '存档每关只保留最近三局，且两关隔离');
  ok(JSON.stringify(data).length < 4096, '存档体积有上界（< 4 KB）');
  const broken = JSON.parse(JSON.stringify(data));
  broken.level1RecentGames[0].layoutSignature = 'not-a-sha256';
  const g2 = new Game(null);
  applySaveToGame(g2, broken);
  ok(historyFor(g2.saveState, 1).length === 2, '损坏的历史记录被安全丢弃，不加载非法布局');
  const rust = readFileSync(join(root, 'src-tauri/src/main.rs'), 'utf8');
  ok(/SAVE_FIELDS: \[&str; 11\]/.test(rust) &&
    /level1RecentGames/.test(rust) && /level2RecentGames/.test(rust),
  'Rust 白名单已扩展到 11 键含两关历史');
  ok(/validate_history_field/.test(rust) && /MAX_SAVE_BYTES: usize = 64 \* 1024/.test(rust),
  'Rust 保留 64KB 上限并新增历史校验');
  ok(/fs::rename\(&tmp, &path\)/.test(rust), 'Rust 仍使用原子写入');
}

/* ---------- 5. 报告 ---------- */
const report = {
  meta: {
    generatedAt: new Date().toISOString(),
    gitCommit,
    command: 'node test-random-generation.js',
    algorithm: SIGNATURE_ALGORITHM,
    historyLimit: HISTORY_LIMIT,
    maxAttempts: MAX_ATTEMPTS,
    perLevel: PER_LEVEL,
    totalGames: allRecords.length,
    assertions: { pass, fail },
    exitCode: fail ? 1 : 0,
    elapsedMs: Date.now() - tStart,
    note: '最近三局为滚动窗口规则，不要求 200 局全局牌数唯一',
  },
  levels: {},
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
let md = `# 连续 200 局随机生成压力测试报告\n\n` +
  `> 本文件由 \`node test-random-generation.js\` **真实运行**自动生成，不是静态 PASS 模板。\n\n` +
  `- 运行时间：${report.meta.generatedAt}\n- Git commit：\`${gitCommit}\`\n` +
  `- 断言：通过 **${pass}**，失败 **${fail}**\n- 总耗时：${report.meta.elapsedMs} ms\n` +
  `- 布局签名算法：\`${SIGNATURE_ALGORITHM}\`（SHA-256，浏览器与 Node 共用同一实现）\n` +
  `- 历史窗口：每关最近 ${HISTORY_LIMIT} 局；重试上限 ${MAX_ATTEMPTS} 次\n\n` +
  `## 全局\n\n` +
  table(['项', '值'], [
    ['总生成局数', String(report.meta.totalGames)],
    ['gameId 唯一数', String(report.global.uniqueGameIds) + ' / ' + String(report.global.expectedGameIds)],
    ['布局签名总数 / 去重', String(report.global.totalLayoutSignatures) + ' / ' + String(report.global.uniqueLayoutSignatures)],
    ['生成失败次数', String(report.global.generationFailures)],
    ['重试总次数', String(report.global.totalRetries)],
    ['平均单局生成耗时', report.global.averageGenerationMs.toFixed(2) + ' ms'],
    ['失败案例', String(report.global.failureCases.length)],
  ]) + '\n\n';

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
      ['最近三局牌数重复', String(S.rolling.tileRepeat)],
      ['最近三局布局签名重复', String(S.rolling.sigRepeat)],
      ['最近三局几何签名重复', String(S.rolling.geomRepeat)],
      ['重试次数', String(S.retries)],
      ['生成失败次数', String(S.failures)],
      ['重启模拟历史有效', String(S.restartVerified)],
      ['平均单局耗时', S.averageGenerationMs.toFixed(2) + ' ms'],
    ]) + '\n\n' +
    `<details><summary>完整 ${S.total} 局逐局记录</summary>\n\n` +
    table(['#', 'gameId', '档位', 'seed', '牌数', '牌型数', '可点', '布局签名(前12)', '几何签名(前12)', '原因', '重试', '耗时ms', '校验'],
      report.levels['L' + level].games.map((g) => [
        g.index, g.gameId, g.difficultyId, g.seed, g.totalTiles, g.tileTypeCount, g.visible,
        g.layoutSignature.slice(0, 12), g.geometrySignature.slice(0, 12),
        g.generationReason, g.retries, g.generationTime, g.validationResult,
      ])) + '\n\n</details>\n\n';
}
md += `## 失败案例与原因\n\n` +
  (report.global.failureCases.length
    ? '```json\n' + JSON.stringify(report.global.failureCases, null, 2) + '\n```\n'
    : '本次运行 **0** 个生成失败案例；每次重试的原因均记录在 \`random-generation-report.json\` 的逐局 \`retries\` 字段。\n') +
  `\n## 测试性质说明\n\n` +
  `- 运行时：两关各 100 局真实调用 \`createNewGame\`，真实生成、真实签名、真实校验。\n` +
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
