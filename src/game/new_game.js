/**
 * createNewGame() —— 全项目**唯一**的新牌局生成入口（第三阶段）。
 *
 * 所有真正的新开局（应用重启后开始 / 标题页重新开始 / 失败后重开 /
 * 进入下一关 / 开始新一轮 / 键盘 r / ?lv= 调试）都必须调用这里。
 * 禁止任何入口再自行拼 generateLevel + 档位 + seed。
 *
 * 流程（本轮第 2 节口径）：识别关卡 → 读本关最近 5 局 → 选合法档位（≠ 上一局）→
 * 新 seed → 生成牌局 → 计算签名 → **与最近 5 局算 layoutSimilarity** →
 * sim ≥ 0.60 或 geometrySignature 完全相同即视为重复，换 seed 重生成 →
 * 完整校验 → 唯一 gameId → 保存历史 → 返回游戏实例。
 *
 * 几何现在由 seed 程序化生成（第 1 节），所以「同一档位换 seed 几何不变」的
 * 旧假设被彻底删除：不再有按 (level,difficultyId) 缓存几何签名的预筛逻辑，
 * 判定完全基于**真实生成结果**。
 *
 * 重试上限 50 次；仍不合格抛 GenerationFailureError，绝不自动接受重复牌局。
 */
import { profilesFor, profileFor, rollProfile, LEVEL_COUNT } from './config.js';
import { generateLevel, validateLevel, verify } from './generator.js';
import { pickPoolSeed } from './seed_pool.js';
import { calculateLayoutSignature, layoutSimilarity, SIMILARITY_THRESHOLD } from './layout_signature.js';
import {
  GENERATION_REASONS, previousFrom, appendHistory, makeGameId,
  checkAgainstRecent, historyFor, HISTORY_LIMIT,
} from './recent_games.js';
import { sameLayerOverlapCount, isHalfLattice } from './layout.js';
import { readBuildInfo } from './build_info.js';

export const MAX_ATTEMPTS = 50;
export { HISTORY_LIMIT };

function indexOf(arr, v) {
  for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i;
  return -1;
}
function isArray(v) {
  return Object.prototype.toString.call(v) === '[object Array]';
}
function strings(arr) {
  if (!isArray(arr)) return null;
  var out = [];
  for (var i = 0; i < arr.length; i++) out.push(arr[i]);
  return out;
}
/** IE8 没有 Date.prototype.toISOString，手写 UTC 字符串 */
function isoNow() {
  var d = new Date();
  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = '0' + s;
    return s;
  }
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1, 2) + '-' + pad(d.getUTCDate(), 2) +
    'T' + pad(d.getUTCHours(), 2) + ':' + pad(d.getUTCMinutes(), 2) + ':' +
    pad(d.getUTCSeconds(), 2) + '.' + pad(d.getUTCMilliseconds(), 3) + 'Z';
}
function compact(arr) {
  var out = [];
  for (var i = 0; i < arr.length; i++) if (arr[i]) out.push(arr[i]);
  return out;
}

/** 明确的生成失败错误（带真实失败原因，便于报告与调试面板显示） */
export function GenerationFailureError(message, detail) {
  this.name = 'GenerationFailureError';
  this.message = message;
  this.detail = detail || {};
}
GenerationFailureError.prototype.toString = function () {
  return this.name + ': ' + this.message;
};

/**
 * 历史记录里只有签名与 seed，没有牌面坐标；但几何现在**完全由 seed 决定**
 * （第 1 节），所以可以按 (level, difficultyId, seed) 精确重放出一模一样的牌面，
 * 用来算 layoutSimilarity。结果按「关卡|档位|seed」缓存，避免 50 次重试里
 * 反复重放同一批历史牌局。
 *
 * 只缓存牌面数组，不缓存 data 对象（data 里有 _graph 等大结构，且会被
 * 后续流程当「本局」使用）。
 */
var layoutCache = {};
var layoutCacheSize = 0;
var LAYOUT_CACHE_MAX = 128;

function layoutOfRecord(record) {
  var key = record.level + '|' + record.difficultyId + '|' + record.seed;
  if (Object.prototype.hasOwnProperty.call(layoutCache, key)) return layoutCache[key];
  var cards = null;
  try {
    var d = generateLevel(record.level, record.seed, { profile: record.difficultyId });
    if (d && d.cards && d.cards.length === record.totalTiles) cards = d.cards;
  } catch (e) {
    cards = null; // 重放失败（例如档位表已变）→ 该条历史不参与相似度判定
  }
  if (layoutCacheSize > LAYOUT_CACHE_MAX) { layoutCache = {}; layoutCacheSize = 0; }
  layoutCache[key] = cards;
  layoutCacheSize++;
  return cards;
}

/** 仅供测试：清空重放缓存 */
export function clearLayoutCache() {
  layoutCache = {};
  layoutCacheSize = 0;
}

var locked = false;

/**
 * @param {object} opts
 *   level              目标关卡（1/2）
 *   generationReason   application_restart | title_screen_restart | failure_restart | new_game
 *   game               Game 实例（注入，避免模块循环依赖）
 *   save               当前存档对象（含 level1RecentGames / level2RecentGames）
 *   previousGameIds / previousSeeds / previousSignatures / previousTileCounts
 *                      可选，显式覆盖本关历史派生的排除集合（测试隔离用）
 *   rand               可注入随机源
 *   maxAttempts        仅测试可覆盖，仍被夹在 1..50
 * @returns {{game, data, record, nextSave, meta, checks, attempts, failures, elapsedMs}}
 * @throws {GenerationFailureError} 50 次仍无法生成合格牌局
 */
export function createNewGame(opts) {
  if (locked) {
    throw new GenerationFailureError('生成入口被并发重入（已拒绝）', { reason: 'CONCURRENT_GENERATION' });
  }
  locked = true;
  try {
    return createNewGameInner(opts);
  } finally {
    locked = false;
  }
}

function createNewGameInner(opts) {
  var o = opts || {};
  var level = o.level === 2 ? 2 : 1;
  if (level > LEVEL_COUNT) level = LEVEL_COUNT;
  var reason = o.generationReason || 'new_game';
  if (indexOf(GENERATION_REASONS, reason) < 0) {
    throw new GenerationFailureError('非法 generationReason: ' + reason, { reason: 'BAD_REASON' });
  }
  var game = o.game;
  if (!game) {
    throw new GenerationFailureError('createNewGame 需要注入 game 实例', { reason: 'NO_GAME_INSTANCE' });
  }
  var rand = typeof o.rand === 'function' ? o.rand : Math.random;
  var save = o.save && typeof o.save === 'object' ? o.save : {};
  var maxAttempts = o.maxAttempts === undefined ? MAX_ATTEMPTS : o.maxAttempts;
  if (!(maxAttempts >= 1)) maxAttempts = 1;
  if (maxAttempts > MAX_ATTEMPTS) maxAttempts = MAX_ATTEMPTS;

  var prev = previousFrom(save, level); // 只读本关历史，绝不串关
  var recent = prev.recent;
  var externalIds = strings(o.previousGameIds);
  var externalSeeds = strings(o.previousSeeds);
  var externalSigs = strings(o.previousSignatures);
  var externalTiles = strings(o.previousTileCounts);
  if (externalIds) prev.previousGameIds = externalIds;
  if (externalSeeds) prev.previousSeeds = externalSeeds;
  if (externalSigs) prev.previousSignatures = externalSigs;
  if (externalTiles) prev.previousTileCounts = externalTiles;

  var current = o.currentDifficulty;
  if (current === undefined || current === null) {
    // 应用重启后 game.profile 只是构造默认值，不能代表「上一局」。
    // 以本关历史里最后一局的 difficultyId 为准，才能保证「≠ 当前档位」
    // 与差异化窗口一致；历史为空时才回退到实例上的档位。
    if (recent.length && typeof recent[recent.length - 1].difficultyId === 'number') {
      current = recent[recent.length - 1].difficultyId;
    } else {
      current = level <= 1 ? game.profile.l1 : game.profile.l2;
    }
  }
  var build = readBuildInfo();
  var t0 = Date.now();
  var attempts = 0;
  var failures = [];

  while (attempts < maxAttempts) {
    attempts++;
    var difficultyId;
    if (attempts <= 12) {
      // 前段：按权重随机重抽，排除当前档位
      difficultyId = rollProfile(level, rand, current);
    } else {
      // 后段：确定性轮换所有「≠ 上一局档位」的档位，避免 L1 只有 4 档时
      // 纯随机把 50 次机会浪费掉（只换搜索顺序，不放宽任何判定）
      var pool = profilesFor(level);
      var ring = [];
      for (var pi = 0; pi < pool.length; pi++) if (pool[pi].id !== current) ring.push(pool[pi].id);
      if (!ring.length) { for (var pj = 0; pj < pool.length; pj++) ring.push(pool[pj].id); }
      difficultyId = ring[attempts % ring.length];
    }

    var profile = profileFor(level, difficultyId);
    var difficultyValid = profile.id === difficultyId && difficultyId !== current;

    // 新 seed：第 2 关从**当前档位自己的** seed 池抽；第 1 关用真随机
    var seed;
    if (level <= 1) {
      var rs = rand();
      if (!(rs >= 0) || rs >= 1) rs = 0;
      seed = ((Math.floor(rs * 0xffffffff) ^ (Date.now() + attempts * 104729)) >>> 0);
    } else {
      seed = pickPoolSeed(level, difficultyId, rand) >>> 0;
    }

    var data;
    try {
      data = generateLevel(level, seed, { profile: difficultyId });
    } catch (e) {
      failures.push({ attempt: attempts, difficultyId: difficultyId, seed: seed, reason: 'GENERATE_THREW', detail: String(e && e.message) });
      continue;
    }
    var sig = calculateLayoutSignature(data);
    var totalTiles = data.cards.length;

    var checks = checkAgainstRecent(recent, {
      totalTiles: totalTiles,
      layoutSignature: sig.layoutSignature,
      geometrySignature: sig.geometrySignature,
      seed: seed,
      gameId: '',
    });

    /**
     * 第 2.3 节：新牌局与本关最近 5 局任意一局
     *   sim ≥ 0.60  → 重复
     *   geometrySignature 完全相同 → 重复
     * 两者任一命中都必须换 seed 重生成，不得自动接受。
     */
    var recentChecks = [];
    var maxSim = 0;
    var dupGeometry = false;
    var dupIndex = -1;
    for (var ri = 0; ri < recent.length; ri++) {
      var rec = recent[ri];
      var replay = layoutOfRecord(rec);
      var sim = replay ? layoutSimilarity(data.cards, replay) : 0;
      var sameGeom = rec.geometrySignature === sig.geometrySignature;
      if (sameGeom) dupGeometry = true;
      if (sim > maxSim) maxSim = sim;
      if (sim >= SIMILARITY_THRESHOLD && dupIndex < 0) dupIndex = ri;
      recentChecks.push({
        gameId: rec.gameId,
        difficultyId: rec.difficultyId,
        totalTiles: rec.totalTiles,
        layoutSignature: rec.layoutSignature,
        geometrySignature: rec.geometrySignature,
        similarity: Math.round(sim * 1000) / 1000,
        similar: sim >= SIMILARITY_THRESHOLD,
        sameGeometry: sameGeom,
        replayOk: !!replay,
      });
    }
    checks.similarityMax = Math.round(maxSim * 1000) / 1000;
    checks.layoutDifferent = maxSim < SIMILARITY_THRESHOLD;
    checks.geometryDifferent = !dupGeometry;
    checks.difficultyValid = difficultyValid;
    // 显式传入的排除集合同样生效（真实判定，不是摆设）
    if (indexOf(prev.previousSignatures, sig.layoutSignature) >= 0) checks.layoutDifferent = false;
    if (indexOf(prev.previousSeeds, seed) >= 0) checks.seedFresh = false;

    if (!checks.layoutDifferent || !checks.geometryDifferent ||
        !checks.seedFresh || !difficultyValid) {
      failures.push({
        attempt: attempts, difficultyId: difficultyId, seed: seed,
        totalTiles: totalTiles, layoutSignature: sig.layoutSignature,
        geometrySignature: sig.geometrySignature,
        similarityMax: checks.similarityMax,
        reason: 'RECENT_CONFLICT',
        failedChecks: compact([
          !checks.layoutDifferent ? 'LAYOUT_SIMILARITY' : '',
          !checks.geometryDifferent ? 'GEOMETRY_SIGNATURE' : '',
          !checks.seedFresh ? 'SEED' : '',
          !difficultyValid ? 'DIFFICULTY' : '',
        ]),
      });
      continue;
    }

    // 完整校验：注册表 / 三消 / 遮挡 / 几何 / 证书 / 可操作性
    var validation = validateLevel(data);
    var verifyOk = false;
    try {
      // 第 3.2 节：第二关整池均匀洗牌后极难有完整解，verify() 只对
      // 「必须有解」的关卡（第一关）作为门槛；第二关如实记录 solvable。
      verifyOk = data.requireSolution === false ? true : !!verify(data);
    } catch (e) { verifyOk = false; }
    var geometryOk = sameLayerOverlapCount(data.cards) === 0 && !!isHalfLattice(data.cards);
    var playableOk = data.visible > 0 && sig.playableCount > 0;
    if (!validation.ok || !verifyOk || !geometryOk || !playableOk) {
      failures.push({
        attempt: attempts, difficultyId: difficultyId, seed: seed,
        totalTiles: totalTiles, reason: 'VALIDATION_FAILED',
        issues: validation.issues.slice(),
        verifyOk: verifyOk, geometryOk: geometryOk, playableOk: playableOk,
      });
      continue;
    }

    // 通过全部检查 → 生成唯一牌局编号 → 保存历史 → 返回游戏实例
    var gameId = makeGameId(level, reason, rand);
    if (indexOf(prev.previousGameIds, gameId) >= 0) {
      failures.push({ attempt: attempts, reason: 'GAME_ID_COLLISION', gameId: gameId });
      continue;
    }
    var generatedAt = isoNow();
    var record = {
      gameId: gameId,
      level: level,
      difficultyId: difficultyId,
      seed: seed,
      totalTiles: totalTiles,
      tileTypeCount: sig.tileTypeCount,
      layoutSignature: sig.layoutSignature,
      geometrySignature: sig.geometrySignature,
      distributionSignature: sig.distributionSignature,
      generatedAt: generatedAt,
      generationReason: reason,
      validationResult: 'PASS',
    };
    var nextSave = appendHistory(save, level, record);
    var savedList = historyFor(nextSave, level);
    var historySaved = savedList.length > 0 && savedList[savedList.length - 1].gameId === gameId;
    checks.historySaved = historySaved;
    if (!historySaved) {
      failures.push({ attempt: attempts, reason: 'HISTORY_WRITE_FAILED', gameId: gameId });
      continue;
    }

    var previousRecentChecks = [];
    for (var i = 0; i < recentChecks.length; i++) {
      var rc = recentChecks[i];
      previousRecentChecks.push({
        gameId: rc.gameId,
        difficultyId: rc.difficultyId,
        totalTiles: rc.totalTiles,
        layoutSignature: rc.layoutSignature,
        geometrySignature: rc.geometrySignature,
        similarity: rc.similarity,
        simCheck: rc.similar && rc.replayOk ? 'FAIL' : 'PASS',
        geometryCheck: rc.sameGeometry ? 'FAIL' : 'PASS',
      });
    }

    var meta = {
      gameId: gameId,
      buildVersion: build.buildVersion,
      gitCommit: build.gitCommit,
      sourceHash: build.sourceHash,
      buildTimestamp: build.buildTimestamp,
      level: level,
      difficultyId: difficultyId,
      seed: seed,
      totalTiles: totalTiles,
      tileTypeCount: sig.tileTypeCount,
      layerCount: sig.layerCount,
      layoutSignature: sig.layoutSignature,
      geometrySignature: sig.geometrySignature,
      distributionSignature: sig.distributionSignature,
      generatedAt: generatedAt,
      generationReason: reason,
      historyLimit: HISTORY_LIMIT,
      similarityThreshold: SIMILARITY_THRESHOLD,
      similarityMax: checks.similarityMax,
      previousRecentChecks: previousRecentChecks,
      // 兼容旧调试面板字段名（内容已改为最多 HISTORY_LIMIT 条）
      previousThreeChecks: previousRecentChecks,
      checks: {
        similarityMax: checks.similarityMax,
        layoutCheck: checks.layoutDifferent ? 'PASS' : 'FAIL',
        geometryCheck: checks.geometryDifferent ? 'PASS' : 'FAIL',
        difficultyCheck: difficultyValid ? 'PASS' : 'FAIL',
        historyCheck: historySaved ? 'PASS' : 'FAIL',
      },
      attempts: attempts,
      retries: attempts - 1,
      validation: { ok: validation.ok, kinds: validation.kinds, total: validation.total, visible: validation.visible },
    };

    // 写入 Game 实例：只安装一次生成结果，不再二次生成
    if (typeof game.installLevelData === 'function') {
      var key = level <= 1 ? 'l1' : 'l2';
      game.profile[key] = difficultyId;
      game.installLevelData(data, meta);
    } else {
      throw new GenerationFailureError('game 实例缺少 installLevelData', { reason: 'BAD_GAME_INSTANCE' });
    }

    return {
      game: game,
      data: data,
      signature: sig,
      record: record,
      nextSave: nextSave,
      meta: meta,
      checks: checks,
      attempts: attempts,
      retries: attempts - 1,
      failures: failures,
      elapsedMs: Date.now() - t0,
    };
  }

  throw new GenerationFailureError(
    '第 ' + level + ' 关连续 ' + attempts + ' 次未能生成满足「牌数 + 布局差异化」的合法牌局',
    {
      reason: 'MAX_ATTEMPTS_EXCEEDED',
      level: level,
      generationReason: reason,
      attempts: attempts,
      recent: recent,
      previousTileCounts: prev.previousTileCounts,
      previousSignatures: prev.previousSignatures,
      failures: failures,
    }
  );
}
