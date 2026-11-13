import { L2_TEMPLATE_IDS } from './l2_templates.js';

/**
 * 最近牌局历史（两关各自独立、重启后仍有效）。
 *
 * 硬规则：
 *  · level1RecentGames / level2RecentGames **完全隔离**，一关绝不读另一关的历史；
 *  · 第一关窗口冻结为 3 局（HISTORY_LIMIT = 3，本轮不改）；
 *    第二关独立维护最近 10 局（L2_HISTORY_LIMIT = 10，本轮规格）；
 *    historyLimitFor(level) 是唯一的窗口取值入口，不再各自写数字；
 *  · 字段白名单化，损坏记录静默丢弃而非让游戏崩溃；
 *  · 全部是纯函数，读写都不碰 DOM / localStorage，方便 Node 做真实往返测试；
 *  · 存档整体一次性替换写入（localStorage.setItem / Rust 原子 rename），
 *    不存在「历史半写入」——要么整份存档生效，要么整份不生效。
 *
 * 兼容性：v1–v4 旧存档里的第二关记录只有 RECORD_FIELDS 的 12 个字段；
 * L2_RECORD_FIELDS 新增的 3 个字段是**可选**的，缺字段的旧记录仍然合法，
 * 只是不参与模板级/等价几何级判定（由重放的真实牌面兜底）。
 */
export const HISTORY_LIMIT = 3;
export const L2_HISTORY_LIMIT = 10;

export function historyLimitFor(level) {
  return level <= 1 ? HISTORY_LIMIT : L2_HISTORY_LIMIT;
}

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

/** 第二关记录新增字段（模板级 + 几何级双重去重的持久化依据） */
export const L2_EXTRA_FIELDS = [
  'templateId', 'structureSignature', 'canonicalGeometrySignature',
];

export const L2_RECORD_FIELDS = RECORD_FIELDS.concat(L2_EXTRA_FIELDS);

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

/**
 * 单条记录白名单化 + 类型/范围校验；非法返回 null（不抛异常）。
 * @param raw   原始记录
 * @param level 可选，所属关卡；不传时取 raw.level（缺省按第一关处理）。
 *              第一关窗口/字段完全冻结；第二关额外接受 3 个可选新字段。
 */
export function sanitizeRecord(raw, level) {
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
  var lv = level === 2 ? 2 : (level === 1 ? 1 : (raw.level === 2 ? 2 : 1));
  var fields = lv === 2 ? L2_RECORD_FIELDS : RECORD_FIELDS;
  var out = {};
  for (var i = 0; i < RECORD_FIELDS.length; i++) out[RECORD_FIELDS[i]] = raw[RECORD_FIELDS[i]];
  if (lv === 2) {
    for (var j = 0; j < L2_EXTRA_FIELDS.length; j++) {
      var k = L2_EXTRA_FIELDS[j];
      var v = raw[k];
      if (v === undefined || v === null || v === '') continue; // 旧档缺字段：合法
      if (k === 'templateId') {
        if (!isStr(v, 32) || L2_TEMPLATE_IDS.indexOf(v) < 0) return null;
      } else if (!isHex64(v)) {
        return null;
      }
      out[k] = v;
    }
  }
  return out;
}

/** 任意输入 → 至多 historyLimitFor(level) 条合法记录（保留最新，顺序 = 由旧到新） */
export function sanitizeHistory(raw, level) {
  if (!isArray(raw)) return [];
  var lv = level === 2 ? 2 : 1;
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    var r = sanitizeRecord(raw[i], lv);
    if (r) out.push(r);
  }
  var limit = historyLimitFor(lv);
  if (out.length > limit) out = out.slice(out.length - limit);
  return out;
}

export function historyFor(save, level) {
  return sanitizeHistory(isObject(save) ? save[historyKey(level)] : null, level);
}

/** 返回一份新的存档对象（不改入参），只追加当前关卡的历史 */
export function appendHistory(save, level, record) {
  var clean = sanitizeRecord(record, level);
  var base = {};
  if (isObject(save)) {
    for (var k in save) if (Object.prototype.hasOwnProperty.call(save, k)) base[k] = save[k];
  }
  if (!clean) return base;
  var key = historyKey(level);
  var list = historyFor(base, level);
  list.push(clean);
  var limit = historyLimitFor(level);
  if (list.length > limit) list = list.slice(list.length - limit);
  base[key] = list;
  return base;
}

/** 从本关历史派生四项「上一批」输入；每关独立，不串关 */
export function previousFrom(save, level) {
  var list = historyFor(save, level);
  var gameIds = [], seeds = [], signatures = [], geometries = [], tileCounts = [];
  var templateIds = [], structures = [], canonicals = [];
  for (var i = 0; i < list.length; i++) {
    gameIds.push(list[i].gameId);
    seeds.push(list[i].seed);
    signatures.push(list[i].layoutSignature);
    geometries.push(list[i].geometrySignature);
    tileCounts.push(list[i].totalTiles);
    templateIds.push(list[i].templateId || '');
    structures.push(list[i].structureSignature || '');
    canonicals.push(list[i].canonicalGeometrySignature || '');
  }
  return {
    recent: list,
    previousGameIds: gameIds,
    previousSeeds: seeds,
    previousSignatures: signatures,
    previousGeometries: geometries,
    previousTileCounts: tileCounts,
    previousTemplateIds: templateIds,
    previousStructureSignatures: structures,
    previousCanonicalSignatures: canonicals,
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

/** 最近三局差异化检查：牌数 / 布局签名 / 几何签名 / seed / gameId（真实数据） */
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
