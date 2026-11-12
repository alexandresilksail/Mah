/**
 * 最近三局历史（第四阶段 4.4 / 第十二阶段）。
 *
 * 硬规则：
 *  · level1RecentGames / level2RecentGames **完全隔离**，一关绝不读另一关的历史；
 *  · 每关只保留最近 3 条，字段白名单化，损坏记录静默丢弃而非让游戏崩溃；
 *  · 全部是纯函数，读写都不碰 DOM / localStorage，方便 Node 做真实往返测试；
 *  · 存档整体一次性替换写入（localStorage.setItem / Rust 原子 rename），
 *    不存在「历史半写入」——要么整份存档生效，要么整份不生效。
 */
export const HISTORY_LIMIT = 3;

export const GENERATION_REASONS = [
  'application_restart',
  'title_screen_restart',
  'failure_restart',
  'new_game',
];

export const RECORD_FIELDS = [
  'gameId', 'level', 'difficultyId', 'seed', 'totalTiles', 'tileTypeCount',
  'layoutSignature', 'geometrySignature', 'distributionSignature',
  'generatedAt', 'generationReason', 'validationResult',
];

function isArray(v) {
  return Object.prototype.toString.call(v) === '[object Array]';
}
function isInt(v, lo, hi) {
  return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= lo && v <= hi;
}
function isStr(v, maxLen) {
  return typeof v === 'string' && v.length > 0 && v.length <= maxLen;
}
function isObject(v) {
  return !!v && typeof v === 'object' && !isArray(v);
}
function isHex64(v) {
  return typeof v === 'string' && v.length === 64 && /^[0-9a-f]{64}$/.test(v);
}

export function historyKey(level) {
  return level <= 1 ? 'level1RecentGames' : 'level2RecentGames';
}

/** 单条记录白名单化 + 类型/范围校验；非法返回 null（不抛异常） */
export function sanitizeRecord(raw) {
  if (!isObject(raw)) return null;
  if (!isStr(raw.gameId, 128)) return null;
  if (!isInt(raw.level, 1, 2)) return null;
  if (!isInt(raw.difficultyId, 0, 63)) return null;
  if (!isInt(raw.seed, 0, 4294967295)) return null;
  if (!isInt(raw.totalTiles, 1, 10000)) return null;
  if (!isInt(raw.tileTypeCount, 0, 16)) return null;
  if (!isHex64(raw.layoutSignature)) return null;
  if (!isHex64(raw.geometrySignature)) return null;
  if (!isHex64(raw.distributionSignature)) return null;
  if (!isStr(raw.generatedAt, 64)) return null;
  if (GENERATION_REASONS.indexOf(raw.generationReason) < 0) return null;
  if (raw.validationResult !== 'PASS' && raw.validationResult !== 'FAIL') return null;
  var out = {};
  for (var i = 0; i < RECORD_FIELDS.length; i++) out[RECORD_FIELDS[i]] = raw[RECORD_FIELDS[i]];
  return out;
}

/** 任意输入 → 至多 3 条合法记录（保留最新三条，顺序 = 由旧到新） */
export function sanitizeHistory(raw) {
  if (!isArray(raw)) return [];
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    var r = sanitizeRecord(raw[i]);
    if (r) out.push(r);
  }
  if (out.length > HISTORY_LIMIT) out = out.slice(out.length - HISTORY_LIMIT);
  return out;
}

export function historyFor(save, level) {
  return sanitizeHistory(isObject(save) ? save[historyKey(level)] : null);
}

/** 返回一份新的存档对象（不改入参），只追加当前关卡的历史 */
export function appendHistory(save, level, record) {
  var clean = sanitizeRecord(record);
  var base = {};
  if (isObject(save)) {
    for (var k in save) if (Object.prototype.hasOwnProperty.call(save, k)) base[k] = save[k];
  }
  if (!clean) return base;
  var key = historyKey(level);
  var list = historyFor(base, level);
  list.push(clean);
  if (list.length > HISTORY_LIMIT) list = list.slice(list.length - HISTORY_LIMIT);
  base[key] = list;
  return base;
}

/** 从本关历史派生四项「上一批」输入；每关独立，不串关 */
export function previousFrom(save, level) {
  var list = historyFor(save, level);
  var gameIds = [], seeds = [], signatures = [], geometries = [], tileCounts = [];
  for (var i = 0; i < list.length; i++) {
    gameIds.push(list[i].gameId);
    seeds.push(list[i].seed);
    signatures.push(list[i].layoutSignature);
    geometries.push(list[i].geometrySignature);
    tileCounts.push(list[i].totalTiles);
  }
  return {
    recent: list,
    previousGameIds: gameIds,
    previousSeeds: seeds,
    previousSignatures: signatures,
    previousGeometries: geometries,
    previousTileCounts: tileCounts,
  };
}

/** 单调递增的牌局编号：时间戳 + 全局计数 + 注入随机源，200 局内必然唯一 */
var idCounter = 0;
export function makeGameId(level, reason, rand) {
  idCounter++;
  var r = typeof rand === 'function' ? rand() : Math.random();
  if (!(r >= 0) || r >= 1) r = 0;
  var hex = Math.floor(r * 0xffffffff).toString(36);
  return 'g' + level + '-' + Date.now().toString(36) + '-' +
    idCounter.toString(36) + '-' + hex + '-' + reason;
}

/** 最近三局差异化检查（真实数据，不使用固定值） */
export function checkAgainstRecent(recent, candidate) {
  var tileList = [], sigList = [], geoList = [], seedList = [], idList = [];
  for (var i = 0; i < recent.length; i++) {
    tileList.push(recent[i].totalTiles);
    sigList.push(recent[i].layoutSignature);
    geoList.push(recent[i].geometrySignature);
    seedList.push(recent[i].seed);
    idList.push(recent[i].gameId);
  }
  return {
    tileCountDifferent: tileList.indexOf(candidate.totalTiles) < 0,
    layoutDifferent: sigList.indexOf(candidate.layoutSignature) < 0,
    geometryDifferent: geoList.indexOf(candidate.geometrySignature) < 0,
    seedFresh: seedList.indexOf(candidate.seed) < 0,
    gameIdUnique: idList.indexOf(candidate.gameId) < 0,
    recentTileCounts: tileList,
    recentLayoutSignatures: sigList,
    recentGeometrySignatures: geoList,
  };
}
