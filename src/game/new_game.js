/**
 * createNewGame() —— 全项目**唯一**的新牌局生成入口（第三阶段）。
 *
 * 所有真正的新开局（应用重启后开始 / 标题页重新开始 / 失败后重开 /
 * 进入下一关 / 开始新一轮 / 键盘 r / ?lv= 调试）都必须调用这里。
 * 禁止任何入口再自行拼 generateLevel + 档位 + seed。
 *
 * 流程严格按需求：识别关卡 → 读本关最近三局 → 选合法档位 → 新 seed →
 * 生成牌局 → 实际总牌数 → 布局签名 → 与本关最近三局对比 → 重复则重生成 →
 * 完整校验 → 唯一 gameId → 保存历史 → 返回游戏实例。
 *
 * 重试上限 50 次；仍不合格抛 GenerationFailureError，绝不自动接受重复牌局。
 */
import { profilesFor, profileFor, rollProfile, LEVEL_COUNT } from './config.js';
import { generateLevel, validateLevel, verify } from './generator.js';
import { pickPoolSeed } from './seed_pool.js';
import { calculateLayoutSignature } from './layout_signature.js';
import {
  GENERATION_REASONS, previousFrom, appendHistory, makeGameId,
  checkAgainstRecent, historyFor,
} from './recent_games.js';
import { sameLayerOverlapCount, isHalfLattice } from './layout.js';
import { readBuildInfo } from './build_info.js';

export const MAX_ATTEMPTS = 50;
export const HISTORY_LIMIT = 3;

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
 * 同一档位的几何签名与 seed 无关（layout_profiles.js 只用 profile 决定形状）。
 * 这里按 (level, difficultyId) 缓存一次，供「确定性兜底」预筛合法档位，
 * 避免 50 次重试靠运气。缓存的是**实际生成结果**，不是凭空推测的坐标。
 */
var geoCache = {};
function geometryOfProfile(level, id) {
  var key = level + '-' + id;
  if (geoCache[key]) return geoCache[key];
  var d = generateLevel(level, (0x5eed0000 + id * 7919) >>> 0, { profile: id });
  var sig = calculateLayoutSignature(d);
  var v = {
    totalTiles: d.cards.length,
    geometrySignature: sig.geometrySignature,
  };
  geoCache[key] = v;
  return v;
}

/** 与最近三局都不冲突的档位集合（牌数 + 几何 + 当前档位三重预筛） */
function legalProfileIds(level, recent, current, prev) {
  var usedTiles = prev.previousTileCounts.slice();
  var usedGeom = prev.previousGeometries.slice();
  var list = profilesFor(level);
  var out = [];
  var fallback = [];
  for (var i = 0; i < list.length; i++) {
    var id = list[i].id;
    var g = geometryOfProfile(level, id);
    if (indexOf(usedTiles, g.totalTiles) >= 0) continue;
    if (indexOf(usedGeom, g.geometrySignature) >= 0) continue;
    fallback.push(id);
    if (id !== current) out.push(id);
  }
  if (out.length) return out;
  if (fallback.length) return fallback;
  // 极端（配置全部被历史占满）：返回全档位，让真实签名检查决定，不放宽任何判定
  var all = [];
  for (var j = 0; j < list.length; j++) all.push(list[j].id);
  return all;
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
      // 后段：确定性兜底，从「与最近三局不冲突」的合法档位集合里抽，
      // 避免 L1 只有 4 档时纯随机把 50 次机会浪费掉（不是放宽判定）
      var legal = legalProfileIds(level, recent, current, prev);
      var r2 = rand();
      if (!(r2 >= 0) || r2 >= 1) r2 = 0;
      difficultyId = legal[Math.min(legal.length - 1, Math.floor(r2 * legal.length))];
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
    // 显式传入的排除集合同样生效（真实判定，不是摆设）
    if (indexOf(prev.previousTileCounts, totalTiles) >= 0) checks.tileCountDifferent = false;
    if (indexOf(prev.previousSignatures, sig.layoutSignature) >= 0) checks.layoutDifferent = false;
    if (indexOf(prev.previousGeometries, sig.geometrySignature) >= 0) checks.geometryDifferent = false;
    if (indexOf(prev.previousSeeds, seed) >= 0) checks.seedFresh = false;
    checks.difficultyValid = difficultyValid;

    if (!checks.tileCountDifferent || !checks.layoutDifferent ||
        !checks.geometryDifferent || !checks.seedFresh || !difficultyValid) {
      failures.push({
        attempt: attempts, difficultyId: difficultyId, seed: seed,
        totalTiles: totalTiles, layoutSignature: sig.layoutSignature,
        geometrySignature: sig.geometrySignature,
        reason: 'RECENT_CONFLICT',
        failedChecks: compact([
          !checks.tileCountDifferent ? 'TILE_COUNT' : '',
          !checks.layoutDifferent ? 'LAYOUT_SIGNATURE' : '',
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
    try { verifyOk = !!verify(data); } catch (e) { verifyOk = false; }
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

    var previousThreeChecks = [];
    for (var i = 0; i < recent.length; i++) {
      previousThreeChecks.push({
        gameId: recent[i].gameId,
        totalTiles: recent[i].totalTiles,
        layoutSignature: recent[i].layoutSignature,
        geometrySignature: recent[i].geometrySignature,
        tileCountCheck: recent[i].totalTiles !== totalTiles ? 'PASS' : 'FAIL',
        layoutCheck: recent[i].layoutSignature !== sig.layoutSignature &&
          recent[i].geometrySignature !== sig.geometrySignature ? 'PASS' : 'FAIL',
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
      previousThreeChecks: previousThreeChecks,
      checks: {
        tileCountCheck: checks.tileCountDifferent ? 'PASS' : 'FAIL',
        layoutCheck: (checks.layoutDifferent && checks.geometryDifferent) ? 'PASS' : 'FAIL',
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
