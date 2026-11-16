/**
 * 布局签名（第四阶段）——从**实际生成的牌局数据**计算，绝不从 seed 推导。
 *
 * 三个签名各自独立、可复算：
 *  · geometrySignature  : 坐标 / 层级 / 区域 / z 全序 / 遮挡关系 / 可操作区，
 *                          与洗牌完全无关。**几何由 seed 程序化生成**，同档位换
 *                          seed 必须得到不同几何（这正是本轮第 1 节的前提）。
 *  · distributionSignature : 与布局相关的牌型分布（每种牌型张数 + 沿 z 全序的
 *                          牌型序列）。只换花色排列会改它，不改几何。
 *  · layoutSignature    : SHA-256(geometrySignature + distributionSignature)，
 *                          即需求 §5 要求的「至少纳入布局相关牌型分布信息」的主签名。
 *
 * 差异化判定同时检查 layoutSignature 与 geometrySignature：
 * 这样即使牌型排列变了（layoutSignature 变化），只要位置/层级/遮挡结构没变，
 * 仍会被 geometrySignature 判为「同一布局」而拒绝（需求 4.3 的显式禁止项）。
 * 第 2.2 节再补一个**数值相似度** layoutSimilarity(a,b) ∈ [0,1]：
 * 签名只回答「是否完全相同」，相似度回答「有多像」，用于「五局内 layout 不能
 * 相同」的阈值判定（sim ≥ 0.60 视为重复）。
 *
 * 稳定性保证：
 *  · 只读取白名单字段，显式构造字符串，不受对象属性顺序影响；
 *  · 排除 state / vx / vy / vScale / appearAt / hover / fx 等渲染与临时字段；
 *  · 所有列表先按确定性键排序；
 *  · 与 sha256.js 共用同一份同步 SHA-256，浏览器（含 IE8）与 Node 结果一致。
 */
import { sha256Hex } from './sha256.js';
import { TYPE_IDS } from './tile_types.js';

export const SIGNATURE_ALGORITHM = 'MAH-LAYOUT-SIG-v1/SHA-256';
export const GEOMETRY_ALGORITHM = 'MAH-GEOM-v1/SHA-256';
export const DISTRIBUTION_ALGORITHM = 'MAH-DIST-v1/SHA-256';

function num(v) {
  var n = Number(v);
  return isFinite(n) ? n : 0;
}
function str(v) {
  return v === undefined || v === null ? '' : String(v);
}
function cmpStr(a, b) {
  return a < b ? -1 : (a > b ? 1 : 0);
}
/** 一张牌的稳定坐标键：只纳入几何，不含花色/状态 */
function coordKey(c) {
  return [num(c.x), num(c.y), num(c.layer), str(c.region), num(c.zoneLayer), num(c.z)].join(':');
}
function sortCards(cards) {
  return cards.slice().sort(function (a, b) {
    return num(a.layer) - num(b.layer) ||
      num(a.y) - num(b.y) ||
      num(a.x) - num(b.x) ||
      cmpStr(str(a.region), str(b.region)) ||
      num(a.z) - num(b.z);
  });
}

/**
 * @param {object} data generateLevel() 的返回值（或等价结构）
 * @returns {object} 签名与统计；字段固定，可直接 JSON 序列化进历史记录 / 调试面板
 */
export function calculateLayoutSignature(data) {
  var cards = (data && data.cards) || [];
  var graph = (data && data._graph) || null;
  var sorted = sortCards(cards);
  var byId = {};
  var i;
  for (i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];

  /* ---- 1. 每张牌的标准化坐标 / 层级 / 实际位置 ---- */
  var cardLines = [];
  var playable = [];
  var blocked = [];
  for (i = 0; i < sorted.length; i++) {
    var c = sorted[i];
    cardLines.push([
      num(c.x), num(c.y), num(c.w), num(c.h), num(c.layer),
      str(c.region), num(c.zoneLayer), num(c.z),
    ].join(','));
    if (c.blocked) blocked.push(coordKey(c));
    else playable.push(coordKey(c));
  }

  /* ---- 2. 遮挡关系：blockers 以「被遮挡牌的坐标键」表示，稳定排序 ---- */
  var edgeLines = [];
  if (graph && graph.blockers) {
    for (i = 0; i < cards.length; i++) {
      var c2 = cards[i];
      var bs = graph.blockers[c2.id] || [];
      var keys = [];
      for (var j = 0; j < bs.length; j++) {
        var b = byId[bs[j]];
        if (b) keys.push(coordKey(b));
      }
      keys.sort(cmpStr);
      edgeLines.push(coordKey(c2) + '>' + keys.join('&'));
    }
  }
  edgeLines.sort(cmpStr);

  /* ---- 3. 层结构 / 区域结构（实际布局结构） ---- */
  var layerMap = {};
  var regionMap = {};
  for (i = 0; i < sorted.length; i++) {
    var c3 = sorted[i];
    var li = num(c3.layer);
    if (!layerMap[li]) layerMap[li] = { n: 0, minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    var L = layerMap[li];
    L.n++;
    if (num(c3.x) < L.minX) L.minX = num(c3.x);
    if (num(c3.y) < L.minY) L.minY = num(c3.y);
    if (num(c3.x) > L.maxX) L.maxX = num(c3.x);
    if (num(c3.y) > L.maxY) L.maxY = num(c3.y);
    var rk = str(c3.region);
    regionMap[rk] = (regionMap[rk] || 0) + 1;
  }
  var layerKeys = [];
  for (var lk in layerMap) if (Object.prototype.hasOwnProperty.call(layerMap, lk)) layerKeys.push(lk);
  layerKeys.sort(function (a, b) { return Number(a) - Number(b); });
  var layerLines = [];
  for (i = 0; i < layerKeys.length; i++) {
    var q = layerMap[layerKeys[i]];
    layerLines.push([layerKeys[i], q.n, q.minX, q.minY, q.maxX, q.maxY].join(','));
  }
  var regionKeys = [];
  for (var rk2 in regionMap) if (Object.prototype.hasOwnProperty.call(regionMap, rk2)) regionKeys.push(rk2);
  regionKeys.sort(cmpStr);
  var regionLines = [];
  for (i = 0; i < regionKeys.length; i++) regionLines.push(regionKeys[i] + ':' + regionMap[regionKeys[i]]);

  var geometryInput = [
    GEOMETRY_ALGORITHM,
    'n=' + cards.length,
    'cards=' + cardLines.join('|'),
    'edges=' + edgeLines.join('|'),
    'playable=' + playable.join('|'),
    'blocked=' + blocked.join('|'),
    'layers=' + layerLines.join('|'),
    'regions=' + regionLines.join('|'),
  ].join('\n');
  var geometrySignature = sha256Hex(geometryInput);

  /* ---- 4. 与布局相关的牌型分布（独立哈希，不冒充几何） ---- */
  var counts = {};
  var typeLines = [];
  for (i = 0; i < TYPE_IDS.length; i++) {
    var n = 0;
    for (var k = 0; k < cards.length; k++) if (cards[k].type === TYPE_IDS[i]) n++;
    counts[TYPE_IDS[i]] = n;
    typeLines.push(i + ':' + TYPE_IDS[i] + ':' + n);
  }
  var typeSeq = [];
  for (i = 0; i < sorted.length; i++) typeSeq.push(str(sorted[i].type));
  var distributionSignature = sha256Hex([
    DISTRIBUTION_ALGORITHM,
    'counts=' + typeLines.join('|'),
    'byZ=' + typeSeq.join(','),
  ].join('\n'));

  var layoutSignature = sha256Hex([
    SIGNATURE_ALGORITHM,
    geometrySignature,
    distributionSignature,
  ].join('|'));

  var usedKinds = 0;
  for (i = 0; i < TYPE_IDS.length; i++) if (counts[TYPE_IDS[i]] > 0) usedKinds++;

  return {
    algorithm: SIGNATURE_ALGORITHM,
    layoutSignature,
    geometrySignature,
    distributionSignature,
    tileCount: cards.length,
    layerCount: layerKeys.length,
    regionCount: regionKeys.length,
    tileTypeCount: usedKinds,
    playableCount: playable.length,
    blockedCount: blocked.length,
    typeCounts: counts,
    regionSignature: sha256Hex(regionLines.join('|')),
  };
}

/** 便捷：三个关键签名组成的可比较元组 */
export function signatureTuple(sig) {
  return {
    layoutSignature: sig.layoutSignature,
    geometrySignature: sig.geometrySignature,
    distributionSignature: sig.distributionSignature,
    tileCount: sig.tileCount,
  };
}

/* ==================== 布局相似度（第 2.2 节） ==================== */

/** 一张牌占的格子键（半格晶格坐标，忽略层号） */
function cellKey(c) {
  return num(c.x) + ',' + num(c.y);
}

/**
 * 把牌组拆成「每层占位格集合 + 整体轮廓占位格集合」。
 * @returns {{layers: object[], silhouette: object, cells: number}}
 */
export function layoutShape(cards) {
  var list = cards || [];
  var layers = [];
  var silhouette = {};
  var cells = 0;
  for (var i = 0; i < list.length; i++) {
    var c = list[i];
    var li = num(c.layer);
    var k = cellKey(c);
    if (!layers[li]) layers[li] = {};
    if (!layers[li][k]) { layers[li][k] = 1; cells++; }
    silhouette[k] = 1;
  }
  return { layers: layers, silhouette: silhouette, cells: cells };
}

/** Jaccard：交集 / 并集；两边都空返回 0（调用方负责是否忽略） */
function jaccard(a, b) {
  var inter = 0;
  var uni = 0;
  var k;
  for (k in a) {
    if (!Object.prototype.hasOwnProperty.call(a, k)) continue;
    uni++;
    if (b[k]) inter++;
  }
  for (k in b) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
    if (!a[k]) uni++;
  }
  if (!uni) return 0;
  return inter / uni;
}

/**
 * 布局相似度 sim ∈ [0,1]（纯函数，无副作用）。
 *
 *   sim = 0.5 × 各层占位格 Jaccard 的平均（两层都为空的层忽略，层按顶部对齐）
 *       + 0.5 × 整体轮廓 Jaccard（所有牌占位格的并集，忽略层号）
 *
 * 「层按顶部对齐」= 按 layer 索引一一对应（layer 0 对 layer 0、1 对 1 …），
 * 索引超出对方层数的层，对面视为空集（该层 Jaccard 记 0）。
 * 入参可以是牌组数组，也可以是 { cards: [...] }（generateLevel 的返回值）。
 */
export function layoutSimilarity(a, b) {
  var cardsA = a && a.cards ? a.cards : a;
  var cardsB = b && b.cards ? b.cards : b;
  if (!cardsA || !cardsB) return 0;
  var A = layoutShape(cardsA);
  var B = layoutShape(cardsB);
  var n = A.layers.length > B.layers.length ? A.layers.length : B.layers.length;
  var sum = 0;
  var used = 0;
  for (var i = 0; i < n; i++) {
    var la = A.layers[i] || {};
    var lb = B.layers[i] || {};
    var ea = false;
    var eb = false;
    var k;
    for (k in la) if (Object.prototype.hasOwnProperty.call(la, k)) { ea = true; break; }
    for (k in lb) if (Object.prototype.hasOwnProperty.call(lb, k)) { eb = true; break; }
    if (!ea && !eb) continue;
    sum += jaccard(la, lb);
    used++;
  }
  var layerSim = used ? sum / used : 0;
  var silhouetteSim = jaccard(A.silhouette, B.silhouette);
  return 0.5 * layerSim + 0.5 * silhouetteSim;
}

/** 判定阈值：sim ≥ 该值即视为「重复布局」（第 2.3 节） */
export const SIMILARITY_THRESHOLD = 0.6;
