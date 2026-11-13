/**
 * createNewGame() —— 全项目**唯一**的新牌局生成入口（第三阶段）。
 *
 * 所有真正的新开局（应用重启后开始 / 标题页重新开始 / 失败后重开 /
 * 进入下一关 / 开始新一轮 / 键盘 r / ?lv= 调试）都必须调用这里。
 * 禁止任何入口再自行拼 generateLevel + 档位 + seed。
 *
 * 流程：识别关卡 → 分流。
 *   · 第一关（完全冻结）：读本关最近 3 局 → 选合法档位（≠ 上一局，且牌数不与
 *     最近 3 局冲突）→ 新 seed → 生成真实牌局 → 计算基于坐标/层级/牌面位置/
 *     遮挡关系的布局签名 → 与最近 3 局同时比较 **总牌数 / 布局签名 /
 *     几何相似度（layoutSimilarity）** → 任一不合格换 seed → 完整校验 →
 *     唯一 gameId → 保存历史 → 返回游戏实例。
 *   · 第二关（本轮）：50 套结构模板 + 本关最近 10 局历史 → 模板级排除 +
 *     几何级（结构签名 / 平移镜像归一化签名 / 真实牌面相似度）双重去重。
 * 不把「seed 不同」或「牌面顺序不同」当成布局不同；所有判定都基于真实生成结果。
 *
 * 几何现在由 seed 程序化生成（第 1 节），所以「同一档位换 seed 几何不变」的
 * 旧假设被彻底删除：不再有按 (level,difficultyId) 缓存几何签名的预筛逻辑，
 * 判定完全基于**真实生成结果**。
 *
 * 重试上限 50 次；仍不合格抛 GenerationFailureError（含 CONFIG_CONFLICT 诊断），
 * 绝不自动接受重复牌局，也不增删牌来伪造牌数差异。
 */
import { profilesFor, profileFor, rollProfile, LEVEL_COUNT } from './config.js';
import { generateLevel, validateLevel, verify } from './generator.js';
import { pickPoolSeed } from './seed_pool.js';
import { calculateLayoutSignature, layoutSimilarity, SIMILARITY_THRESHOLD } from './layout_signature.js';
import { structureFields, structureSimilarity, mainStackCards } from './l2_structure.js';
import { L2_TEMPLATE_IDS } from './l2_templates.js';
import {
  availableTemplateIds, usedTemplateIds, checkL2DualDedup,
  L2_SIMILARITY_THRESHOLD, L2_DEDUP_ALGORITHM,
} from './l2_recent.js';
import {
  GENERATION_REASONS, previousFrom, appendHistory, makeGameId,
  checkAgainstRecent, historyFor, HISTORY_LIMIT, L2_HISTORY_LIMIT,
  historyLimitFor,
} from './recent_games.js';
import { sameLayerOverlapCount, isHalfLattice } from './layout.js';
import { readBuildInfo } from './build_info.js';

export const MAX_ATTEMPTS = 50;
export { HISTORY_LIMIT, L2_HISTORY_LIMIT, historyLimitFor };

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

/**
 * 「合法档位」= 档位 ≠ 上一局，且该档位的**真实总牌数**不与最近三局任一局相同。
 * 只用于决定搜索顺序（先试能通过的档位），绝不用来放宽后面的判定。
 * 返回空数组 = 配置冲突（现有档位的牌数种类不足以撑起三局差异化），
 * 调用方会如实报告，不会去增删牌数伪造差异。
 */
function legalDifficultyIds(level, current, bannedTiles) {
  var pool = profilesFor(level);
  var out = [];
  for (var i = 0; i < pool.length; i++) {
    var p = pool[i];
    if (p.id === current) continue;
    var tiles = p.mainCount + p.queueCount;
    if (indexOf(bannedTiles, tiles) >= 0) continue;
    out.push(p.id);
  }
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
  l2LayoutCache = {};
  l2LayoutCacheSize = 0;
}

/* ================================================================== */
/* 第二关：50 套模板 + 最近 10 局双重去重                              */
/* 第一关完全不走这里（createNewGameInner 在 level===2 时提前分流）。   */
/* ================================================================== */

/**
 * 第二关历史重放：按记录里的 (level, difficultyId, seed, templateId) 精确重建
 * 那一局的**真实牌面**，用于几何级相似度比较。旧档记录没有 templateId 时，
 * 按既有默认路径重放，保证旧存档仍然能被正确对比。
 * 缓存按 gameId 之外的确定性键保存，跨 100 局连续生成时每局只重放一次。
 */
var l2LayoutCache = {};
var l2LayoutCacheSize = 0;
var L2_LAYOUT_CACHE_MAX = 320;

function layoutOfRecordL2(record) {
  var key = '2|' + record.difficultyId + '|' + record.seed + '|' + (record.templateId || '-');
  if (Object.prototype.hasOwnProperty.call(l2LayoutCache, key)) return l2LayoutCache[key];
  var result = null;
  try {
    var opt = { profile: record.difficultyId };
    if (record.templateId) opt.templateId = record.templateId;
    var d = generateLevel(2, record.seed, opt);
    if (d && d.cards && d.cards.length === record.totalTiles) {
      result = { cards: d.cards, main: mainStackCards(d.cards) };
    }
  } catch (e) {
    result = null;
  }
  if (l2LayoutCacheSize > L2_LAYOUT_CACHE_MAX) { l2LayoutCache = {}; l2LayoutCacheSize = 0; }
  l2LayoutCache[key] = result;
  l2LayoutCacheSize++;
  return result;
}

/**
 * 第二关新牌局（唯一入口 createNewGame 的内部实现）。
 *
 * 每次尝试：从「最近 10 局用过的模板」之外的候选池里取一套模板 →
 * 选档位 → 从该档位 seed 池抽 seed → 生成**真实牌局** →
 * 计算基于坐标/层级/区域/轮廓/遮挡/可操作区的结构签名 →
 * 与最近 10 局重放出的真实牌面做双重去重判定 →
 * 完整校验 → 写入本关最近 10 局历史 → 返回。
 *
 * 重试上限 50 次；仍不合格抛 GenerationFailureError，绝不退回重复布局、
 * 绝不清空历史、绝不靠「换个 seed / 微调坐标」宣称布局不同。
 */
function createLevel2Game(o) {
  var level = 2;
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

  var prev = previousFrom(save, level);
  var recent = prev.recent; // 本关最近 10 局，绝不读 L1 历史
  var bannedTemplates = usedTemplateIds(recent);
  // 仅测试隔离用：额外追加禁用模板（只能增加约束，绝不能放宽）
  if (isArray(o.bannedTemplateIds)) {
    for (var bi = 0; bi < o.bannedTemplateIds.length; bi++) {
      if (indexOf(bannedTemplates, o.bannedTemplateIds[bi]) < 0) {
        bannedTemplates.push(o.bannedTemplateIds[bi]);
      }
    }
  }
  var pool = [];
  for (var pi = 0; pi < L2_TEMPLATE_IDS.length; pi++) {
    if (indexOf(bannedTemplates, L2_TEMPLATE_IDS[pi]) < 0) pool.push(L2_TEMPLATE_IDS[pi]);
  }
  if (!pool.length) {
    throw new GenerationFailureError(
      '第二关 50 套模板已被最近 ' + recent.length + ' 局全部占用，无法生成不重复布局（未清空历史、未退回重复布局）',
      { reason: 'TEMPLATE_POOL_EXHAUSTED', level: 2, recent: recent, bannedTemplateIds: bannedTemplates }
    );
  }
  // Fisher–Yates 打乱候选顺序（只影响搜索顺序，不影响任何判定）
  for (var si = pool.length - 1; si > 0; si--) {
    var sj = rand();
    if (!(sj >= 0) || sj >= 1) sj = 0;
    var swap = Math.floor(sj * (si + 1));
    var tmp = pool[si]; pool[si] = pool[swap]; pool[swap] = tmp;
  }

  var current = o.currentDifficulty;
  if (current === undefined || current === null) {
    current = recent.length && typeof recent[recent.length - 1].difficultyId === 'number'
      ? recent[recent.length - 1].difficultyId : game.profile.l2;
  }
  var diffRing = [];
  {
    var dpool = profilesFor(2);
    for (var dp = 0; dp < dpool.length; dp++) if (dpool[dp].id !== current) diffRing.push(dpool[dp].id);
    if (!diffRing.length) diffRing.push(dpool[0].id);
  }

  var build = readBuildInfo();
  var t0 = Date.now();
  var attempts = 0;
  var failures = [];

  while (attempts < maxAttempts) {
    attempts++;
    var templateId = pool[(attempts - 1) % pool.length];
    var difficultyId = attempts <= 8
      ? rollProfile(2, rand, current)
      : diffRing[(attempts - 9) % diffRing.length];
    if (difficultyId === current) difficultyId = diffRing[0];
    var profile = profileFor(2, difficultyId);
    var difficultyValid = profile.id === difficultyId && difficultyId !== current;
    var seed = pickPoolSeed(2, difficultyId, rand) >>> 0;

    var data;
    try {
      data = generateLevel(2, seed, { profile: difficultyId, templateId: templateId });
    } catch (e) {
      failures.push({ attempt: attempts, templateId: templateId, difficultyId: difficultyId,
        seed: seed, reason: 'GENERATE_THREW', detail: String(e && e.message) });
      continue;
    }
    if (!data || data.templateId !== templateId) {
      failures.push({ attempt: attempts, reason: 'TEMPLATE_MISMATCH', templateId: templateId });
      continue;
    }
    var sig = calculateLayoutSignature(data);
    var st = structureFields(data);
    var totalTiles = data.cards.length;

    /* 几何级：与最近 10 局重放出的真实牌面逐个比较 */
    var recentChecks = [];
    var maxStructSim = 0;
    var maxLayoutSim = 0;
    var mainCards = mainStackCards(data.cards);
    for (var ri = 0; ri < recent.length; ri++) {
      var rec = recent[ri];
      var replay = layoutOfRecordL2(rec);
      var sSim = 0, lSim = 0;
      if (replay) {
        sSim = structureSimilarity(data.cards, replay.cards);
        lSim = layoutSimilarity(mainCards, replay.main);
      }
      if (sSim > maxStructSim) maxStructSim = sSim;
      if (lSim > maxLayoutSim) maxLayoutSim = lSim;
      recentChecks.push({
        gameId: rec.gameId,
        difficultyId: rec.difficultyId,
        templateId: rec.templateId || '',
        totalTiles: rec.totalTiles,
        layoutSignature: rec.layoutSignature,
        geometrySignature: rec.geometrySignature,
        structureSignature: rec.structureSignature || '',
        canonicalGeometrySignature: rec.canonicalGeometrySignature || '',
        structureSimilarity: Math.round(sSim * 1000) / 1000,
        layoutSimilarity: Math.round(lSim * 1000) / 1000,
        replayOk: !!replay,
      });
    }

    var dedup = checkL2DualDedup(recent, {
      templateId: templateId,
      structureSignature: st.structureSignature,
      canonicalGeometrySignature: st.canonicalGeometrySignature,
      geometrySignature: sig.geometrySignature,
      seed: seed,
      gameId: '',
      structureSimilarityMax: maxStructSim,
      layoutSimilarityMax: maxLayoutSim,
    });
    // 测试显式注入的排除集合同样真实生效
    var externalSigs = strings(o.previousSignatures);
    var externalSeeds = strings(o.previousSeeds);
    if (externalSigs && indexOf(externalSigs, sig.layoutSignature) >= 0) {
      dedup.checks.geometrySignatureDifferent = false;
      dedup.failedChecks.push('EXTERNAL_LAYOUT_SIGNATURE');
      dedup.pass = false;
    }
    if (externalSeeds && indexOf(externalSeeds, seed) >= 0) {
      dedup.checks.seedFresh = false;
      dedup.failedChecks.push('EXTERNAL_SEED');
      dedup.pass = false;
    }

    if (!dedup.pass || !difficultyValid) {
      failures.push({
        attempt: attempts, templateId: templateId, difficultyId: difficultyId,
        seed: seed, totalTiles: totalTiles,
        structureSignature: st.structureSignature,
        canonicalGeometrySignature: st.canonicalGeometrySignature,
        structureSimilarityMax: dedup.checks.structureSimilarityMax,
        layoutSimilarityMax: dedup.checks.layoutSimilarityMax,
        reason: 'RECENT_CONFLICT',
        failedChecks: dedup.failedChecks.concat(difficultyValid ? [] : ['DIFFICULTY']),
        equivalents: dedup.equivalents,
      });
      continue;
    }

    /* 完整校验：牌型 / 三消 / 遮挡 / 几何 / 可操作性 / 开局可点区间 / 悬空 */
    var validation = validateLevel(data);
    var verifyOk = data.requireSolution === false ? true : !!verify(data);
    var geometryOk = sameLayerOverlapCount(data.cards) === 0 && !!isHalfLattice(data.cards);
    var floatingOk = (data.floatingCount || 0) === 0;
    var playableOk = data.visible >= 19 && data.visible <= 25 && sig.playableCount > 0;
    if (!validation.ok || !verifyOk || !geometryOk || !floatingOk || !playableOk) {
      failures.push({
        attempt: attempts, templateId: templateId, difficultyId: difficultyId,
        seed: seed, totalTiles: totalTiles, reason: 'VALIDATION_FAILED',
        issues: validation.issues.slice(),
        verifyOk: verifyOk, geometryOk: geometryOk, floatingOk: floatingOk,
        playableOk: playableOk, visible: data.visible,
      });
      continue;
    }

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
      templateId: templateId,
      structureSignature: st.structureSignature,
      canonicalGeometrySignature: st.canonicalGeometrySignature,
    };
    var nextSave = appendHistory(save, level, record);
    var savedList = historyFor(nextSave, level);
    var historySaved = savedList.length > 0 && savedList[savedList.length - 1].gameId === gameId &&
      savedList[savedList.length - 1].templateId === templateId;
    if (!historySaved) {
      failures.push({ attempt: attempts, reason: 'HISTORY_WRITE_FAILED', gameId: gameId });
      continue;
    }

    var previousRecentChecks = [];
    for (var pi2 = 0; pi2 < recentChecks.length; pi2++) {
      var rc = recentChecks[pi2];
      previousRecentChecks.push({
        gameId: rc.gameId,
        difficultyId: rc.difficultyId,
        templateId: rc.templateId,
        totalTiles: rc.totalTiles,
        layoutSignature: rc.layoutSignature,
        structureSignature: rc.structureSignature,
        canonicalGeometrySignature: rc.canonicalGeometrySignature,
        similarity: rc.structureSimilarity,
        layoutSimilarity: rc.layoutSimilarity,
        simCheck: rc.replayOk && (rc.structureSimilarity >= L2_SIMILARITY_THRESHOLD ||
          rc.layoutSimilarity >= L2_SIMILARITY_THRESHOLD) ? 'FAIL' : 'PASS',
        geometryCheck: 'PASS',
        templateCheck: rc.templateId === templateId ? 'FAIL' : 'PASS',
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
      templateId: templateId,
      structureSignature: st.structureSignature,
      canonicalGeometrySignature: st.canonicalGeometrySignature,
      dedupAlgorithm: L2_DEDUP_ALGORITHM,
      generatedAt: generatedAt,
      generationReason: reason,
      historyLimit: historyLimitFor(level),
      similarityThreshold: L2_SIMILARITY_THRESHOLD,
      similarityMax: dedup.checks.structureSimilarityMax,
      layoutSimilarityMax: dedup.checks.layoutSimilarityMax,
      availableTemplateCount: dedup.checks.availableTemplateCount,
      usedTemplateIds: dedup.checks.usedTemplateIds,
      previousRecentChecks: previousRecentChecks,
      previousThreeChecks: previousRecentChecks,
      checks: {
        similarityMax: dedup.checks.structureSimilarityMax,
        templateCheck: dedup.checks.templateDifferent ? 'PASS' : 'FAIL',
        canonicalCheck: dedup.checks.canonicalDifferent ? 'PASS' : 'FAIL',
        structureCheck: dedup.checks.structureDifferent ? 'PASS' : 'FAIL',
        tileCountCheck: 'N/A（本轮 L2 按模板级 + 几何级去重，牌数按档位配置）',
        layoutCheck: dedup.checks.geometrySignatureDifferent ? 'PASS' : 'FAIL',
        geometryCheck: (dedup.checks.canonicalDifferent && dedup.checks.structureDifferent &&
          dedup.checks.similarityDifferent) ? 'PASS' : 'FAIL',
        similarityCheck: dedup.checks.similarityDifferent ? 'PASS' : 'FAIL',
        difficultyCheck: difficultyValid ? 'PASS' : 'FAIL',
        historyCheck: historySaved ? 'PASS' : 'FAIL',
      },
      attempts: attempts,
      retries: attempts - 1,
      validation: { ok: validation.ok, kinds: validation.kinds, total: validation.total, visible: validation.visible },
    };

    if (typeof game.installLevelData === 'function') {
      game.profile.l2 = difficultyId;
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
      checks: dedup.checks,
      attempts: attempts,
      retries: attempts - 1,
      failures: failures,
      elapsedMs: Date.now() - t0,
    };
  }

  throw new GenerationFailureError(
    '第 2 关连续 ' + attempts + ' 次未能生成满足「最近 ' + historyLimitFor(level) +
      ' 局模板级 + 几何级双重去重」的合法牌局（未清空历史、未接受重复布局）',
    {
      reason: 'MAX_ATTEMPTS_EXCEEDED',
      level: level,
      generationReason: reason,
      attempts: attempts,
      availableTemplateIds: pool,
      bannedTemplateIds: bannedTemplates,
      recent: recent,
      failures: failures,
    }
  );
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
  /**
   * 第二关走独立的「50 套模板 + 最近 10 局双重去重」路径。
   * 第一关完全冻结：下面原有的 createNewGameInner 主体逐字保留，
   * 只在 level===2 时提前分流，因此第一关的档位、seed、牌数、签名、
   * 相似度、历史窗口与校验逻辑不会受本轮任何改动影响。
   */
  if (o.level === 2) return createLevel2Game(o);
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

  // 最近三局（含测试显式注入的排除集合）里已经被占用的牌数
  var bannedTiles = [];
  for (var bi = 0; bi < prev.previousTileCounts.length; bi++) {
    if (indexOf(bannedTiles, prev.previousTileCounts[bi]) < 0) bannedTiles.push(prev.previousTileCounts[bi]);
  }
  for (var br = 0; br < recent.length; br++) {
    if (indexOf(bannedTiles, recent[br].totalTiles) < 0) bannedTiles.push(recent[br].totalTiles);
  }
  var legalRing = legalDifficultyIds(level, current, bannedTiles);
  var configConflict = legalRing.length === 0;
  var rotation = [];
  {
    var pool = profilesFor(level);
    for (var pi = 0; pi < pool.length; pi++) if (pool[pi].id !== current) rotation.push(pool[pi].id);
    if (!rotation.length) for (var pj = 0; pj < pool.length; pj++) rotation.push(pool[pj].id);
  }

  while (attempts < maxAttempts) {
    attempts++;
    var difficultyId;
    if (attempts <= 8) {
      // 前段：按权重随机重抽；若抽到的档位牌数与最近三局冲突，改从合法档位里挑
      difficultyId = rollProfile(level, rand, current);
      if (legalRing.length && indexOf(legalRing, difficultyId) < 0) {
        var rr = rand();
        if (!(rr >= 0) || rr >= 1) rr = 0;
        difficultyId = legalRing[Math.floor(rr * legalRing.length) % legalRing.length];
      }
    } else {
      // 后段：确定性轮换合法档位，避免 L1 只有 4 档时纯随机把 50 次机会浪费掉
      // （只换搜索顺序，不放宽任何判定）
      var ring = legalRing.length ? legalRing : rotation;
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
     * 本轮规格：新牌局与本关最近 3 局逐局比较
     *   · 总牌数相同           → 不合格
     *   · layoutSignature 相同 → 不合格
     *   · sim ≥ 0.60           → 几何高度相似，不合格
     *   · geometrySignature 相同 → 不合格
     * 相似度用历史记录的 (level, difficultyId, seed) 重放出的**真实牌面**计算，
     * 绝不把「seed 不同」直接当成布局不同。
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
    checks.similarityDifferent = maxSim < SIMILARITY_THRESHOLD;
    checks.geometrySignatureDifferent = !dupGeometry;
    checks.difficultyValid = difficultyValid;
    checks.configConflict = configConflict;
    // 显式传入的排除集合同样生效（真实判定，不是摆设）
    if (indexOf(prev.previousSignatures, sig.layoutSignature) >= 0) checks.layoutDifferent = false;
    if (indexOf(prev.previousSeeds, seed) >= 0) checks.seedFresh = false;
    if (indexOf(prev.previousTileCounts, totalTiles) >= 0) checks.tileCountDifferent = false;
    if (indexOf(prev.previousGeometries, sig.geometrySignature) >= 0) checks.geometryDifferent = false;

    if (!checks.tileCountDifferent || !checks.layoutDifferent ||
        !checks.similarityDifferent || !checks.geometrySignatureDifferent ||
        !checks.geometryDifferent || !checks.seedFresh || !difficultyValid) {
      failures.push({
        attempt: attempts, difficultyId: difficultyId, seed: seed,
        totalTiles: totalTiles, layoutSignature: sig.layoutSignature,
        geometrySignature: sig.geometrySignature,
        similarityMax: checks.similarityMax,
        configConflict: configConflict,
        reason: configConflict ? 'CONFIG_CONFLICT' : 'RECENT_CONFLICT',
        failedChecks: compact([
          !checks.tileCountDifferent ? 'TILE_COUNT' : '',
          !checks.layoutDifferent ? 'LAYOUT_SIGNATURE' : '',
          !checks.similarityDifferent ? 'GEOMETRY_SIMILARITY' : '',
          !checks.geometrySignatureDifferent ? 'GEOMETRY_SIGNATURE' : '',
          !checks.seedFresh ? 'SEED' : '',
          !difficultyValid ? 'DIFFICULTY' : '',
          configConflict ? 'CONFIG_CONFLICT' : '',
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
        tileCountCheck: checks.tileCountDifferent ? 'PASS' : 'FAIL',
        layoutCheck: checks.layoutDifferent ? 'PASS' : 'FAIL',
        geometryCheck: (checks.similarityDifferent && checks.geometrySignatureDifferent) ? 'PASS' : 'FAIL',
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
    '第 ' + level + ' 关连续 ' + attempts + ' 次未能生成满足「最近三局牌数 / 布局签名 / 几何相似度」的合法牌局' +
      (configConflict ? '（配置冲突：现有合法档位的牌数种类不足以撑起三局差异化，未伪造牌数）' : ''),
    {
      reason: configConflict ? 'CONFIG_CONFLICT' : 'MAX_ATTEMPTS_EXCEEDED',
      level: level,
      generationReason: reason,
      attempts: attempts,
      configConflict: configConflict,
      legalDifficultyIds: legalRing,
      bannedTileCounts: bannedTiles,
      recent: recent,
      previousTileCounts: prev.previousTileCounts,
      previousSignatures: prev.previousSignatures,
      failures: failures,
    }
  );
}
