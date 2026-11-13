/**
 * 第二关几何结构签名（最近 10 局双重去重的几何级依据）。
 *
 * 规格要求签名至少纳入：牌的位置及坐标、所属层级及区域、牌堆轮廓、
 * 遮挡关系、可操作区域、各层牌数及空间分布。
 * 本模块的三个输出全部只从**实际生成的牌面几何**计算，不读取 type / 牌面顺序 /
 * seed / templateId，因此「换花色、换洗牌、换 seed」都不会改变结构签名。
 *
 *  · structureSignature        : 完整几何结构哈希（含坐标、层级、区域、轮廓、
 *                                遮挡、可操作区、各层牌数与空间分布）
 *  · canonicalGeometrySignature: 平移 / 左右镜像归一化后的**纯形状**哈希，
 *                                专门用来识别「不同模板生成的等价结构」
 *                                （形状相同、只是整体挪了位置或左右翻面）
 *  · structureSimilarity(a,b)  : 结构级数值相似度 ∈ [0,1]，与既有
 *                                layoutSimilarity 一起做「高度相似」兜底
 */
import { sha256Hex } from './sha256.js';
import { TILE_W, TILE_H, OVERLAP_THRESHOLD, TILE_AREA } from './config.js';
import { overlapArea } from './layout.js';
import { layoutShape } from './layout_signature.js';

export const STRUCTURE_ALGORITHM = 'MAH-L2-STRUCT-v1/SHA-256';
export const CANONICAL_ALGORITHM = 'MAH-L2-CANON-v1/SHA-256';

var THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;

function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
function str(v) { return v === undefined || v === null ? '' : String(v); }
function cmpStr(a, b) { return a < b ? -1 : (a > b ? 1 : 0); }

/** 几何遮挡：只看 z 与相交面积，与牌型、洗牌、seed 完全无关 */
function geomBlocked(cards, i) {
  var a = cards[i];
  for (var j = 0; j < cards.length; j++) {
    if (j === i) continue;
    var b = cards[j];
    if (num(b.z) <= num(a.z)) continue;
    if (overlapArea(a, b) > THRESH_AREA) return true;
  }
  return false;
}

/** 卡片的稳定几何键（不含 type / state / 渲染字段） */
function geomKey(c) {
  return [num(c.x), num(c.y), num(c.layer), str(c.region), num(c.zoneLayer), num(c.z)].join(':');
}

/**
 * @param {object} data generateLevel() 的返回值，或 { cards: [...] }
 * @returns {object} 结构签名与统计（可直接 JSON 序列化进历史记录）
 */
export function calculateStructureSignature(data) {
  var cards = (data && data.cards) || [];
  var sorted = cards.slice().sort(function (a, b) {
    return num(a.layer) - num(b.layer) || num(a.y) - num(b.y) ||
      num(a.x) - num(b.x) || num(a.z) - num(b.z);
  });

  /* 1) 牌的位置及坐标 / 层级 / 区域 */
  var cardLines = [];
  for (var i = 0; i < sorted.length; i++) {
    var c = sorted[i];
    cardLines.push([num(c.x), num(c.y), num(c.layer), str(c.region),
                    num(c.zoneLayer), num(c.z), str(c.seg)].join(','));
  }

  /* 2) 各层牌数 / 包围盒 / 质心（空间分布）+ 层轮廓占位格 */
  var layerMap = {};
  var regionMap = {};
  var silhouette = {};
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (var k = 0; k < cards.length; k++) {
    var q = cards[k];
    var li = num(q.layer);
    if (!layerMap[li]) {
      layerMap[li] = { n: 0, sx: 0, sy: 0, minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, cells: {} };
    }
    var L = layerMap[li];
    L.n++;
    L.sx += num(q.x);
    L.sy += num(q.y);
    if (num(q.x) < L.minX) L.minX = num(q.x);
    if (num(q.y) < L.minY) L.minY = num(q.y);
    if (num(q.x) + TILE_W > L.maxX) L.maxX = num(q.x) + TILE_W;
    if (num(q.y) + TILE_H > L.maxY) L.maxY = num(q.y) + TILE_H;
    var ck = num(q.x) + ',' + num(q.y);
    L.cells[ck] = 1;
    silhouette[ck] = 1;
    regionMap[str(q.region)] = (regionMap[str(q.region)] || 0) + 1;
    if (num(q.x) < minX) minX = num(q.x);
    if (num(q.y) < minY) minY = num(q.y);
    if (num(q.x) + TILE_W > maxX) maxX = num(q.x) + TILE_W;
    if (num(q.y) + TILE_H > maxY) maxY = num(q.y) + TILE_H;
  }
  var layerKeys = [];
  for (var lk in layerMap) if (Object.prototype.hasOwnProperty.call(layerMap, lk)) layerKeys.push(lk);
  layerKeys.sort(function (a, b) { return Number(a) - Number(b); });
  var layerLines = [];
  var contourLines = [];
  for (var li2 = 0; li2 < layerKeys.length; li2++) {
    var M = layerMap[layerKeys[li2]];
    layerLines.push([layerKeys[li2], M.n,
                     Math.round(M.sx / M.n), Math.round(M.sy / M.n),
                     M.minX, M.minY, M.maxX, M.maxY].join(','));
    var cks = [];
    for (var cell in M.cells) if (Object.prototype.hasOwnProperty.call(M.cells, cell)) cks.push(cell);
    cks.sort(cmpStr);
    contourLines.push(layerKeys[li2] + '=' + cks.join('&'));
  }
  var silKeys = [];
  for (var sk in silhouette) if (Object.prototype.hasOwnProperty.call(silhouette, sk)) silKeys.push(sk);
  silKeys.sort(cmpStr);

  /* 3) 区域结构 */
  var regionKeys = [];
  for (var rk in regionMap) if (Object.prototype.hasOwnProperty.call(regionMap, rk)) regionKeys.push(rk);
  regionKeys.sort(cmpStr);
  var regionLines = [];
  for (var r = 0; r < regionKeys.length; r++) regionLines.push(regionKeys[r] + ':' + regionMap[regionKeys[r]]);

  /* 4) 遮挡关系 + 可操作区域 */
  var blockedKeys = [];
  var playableKeys = [];
  var edgeLines = [];
  for (var t = 0; t < cards.length; t++) {
    var cc = cards[t];
    var isBlk = geomBlocked(cards, t);
    if (isBlk) blockedKeys.push(geomKey(cc)); else playableKeys.push(geomKey(cc));
    var blockers = [];
    for (var u = 0; u < cards.length; u++) {
      if (u === t) continue;
      var other = cards[u];
      if (num(other.z) <= num(cc.z)) continue;
      if (overlapArea(cc, other) > THRESH_AREA) blockers.push(geomKey(other));
    }
    blockers.sort(cmpStr);
    edgeLines.push(geomKey(cc) + '>' + blockers.join('&'));
  }
  blockedKeys.sort(cmpStr);
  playableKeys.sort(cmpStr);
  edgeLines.sort(cmpStr);

  var structureSignature = sha256Hex([
    STRUCTURE_ALGORITHM,
    'n=' + cards.length,
    'box=' + [minX, minY, maxX, maxY].join(','),
    'cards=' + cardLines.join('|'),
    'layers=' + layerLines.join('|'),
    'contours=' + contourLines.join('|'),
    'silhouette=' + silKeys.join('|'),
    'regions=' + regionLines.join('|'),
    'edges=' + edgeLines.join('|'),
    'playable=' + playableKeys.join('|'),
    'blocked=' + blockedKeys.join('|'),
  ].join('\n'));

  return {
    algorithm: STRUCTURE_ALGORITHM,
    structureSignature: structureSignature,
    canonicalGeometrySignature: canonicalGeometrySignature(cards),
    tileCount: cards.length,
    layerCount: layerKeys.length,
    regionCount: regionKeys.length,
    playableCount: playableKeys.length,
    blockedCount: blockedKeys.length,
    box: { minX: minX, minY: minY, maxX: maxX, maxY: maxY, w: maxX - minX, h: maxY - minY },
    layerCounts: layerMap,
    regionCounts: regionMap,
    contourCellCount: silKeys.length,
  };
}

/**
 * 平移 / 镜像归一化的纯形状签名：
 *  · 把所有坐标平移到 minX/minY 为 0（消除整体位置差异）；
 *  · 再取「原形状」与「左右镜像形状」字典序较小的那个（消除左右翻面差异）；
 *  · 只纳入 (layer, 相对 x, 相对 y) 与每层占位格集合，不纳入 region / type / z。
 * 因此两个模板只要生成了「同形不同位」或「左右镜像」的等价结构，签名必然相同。
 */
export function canonicalGeometrySignature(cards) {
  var list = cards || [];
  if (!list.length) return sha256Hex(CANONICAL_ALGORITHM + '|empty');
  var minX = Infinity, minY = Infinity, maxX = -Infinity;
  for (var i = 0; i < list.length; i++) {
    var x = num(list[i].x), y = num(list[i].y);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + TILE_W > maxX) maxX = x + TILE_W;
  }
  var width = maxX - minX;
  function build(mirror) {
    var lines = [];
    for (var j = 0; j < list.length; j++) {
      var c = list[j];
      var rx = num(c.x) - minX;
      var ry = num(c.y) - minY;
      if (mirror) rx = width - TILE_W - rx;
      lines.push(num(c.layer) + ':' + rx + ':' + ry);
    }
    lines.sort(cmpStr);
    return lines.join('|');
  }
  var a = build(false);
  var b = build(true);
  var canon = a < b ? a : b;
  return sha256Hex(CANONICAL_ALGORITHM + '|w=' + width + '|' + canon);
}

/** 两个集合的 Jaccard */
function jaccard(a, b) {
  var inter = 0, uni = 0, k;
  for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) { uni++; if (b[k]) inter++; }
  for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) if (!a[k]) uni++;
  return uni ? inter / uni : 0;
}

/** 只取主堆牌：44 张盲盒队列是既有固定规则组件，模板并不改变它，
 *  因此比较「模板结构差异」时不应让固定队列抬高相似度。 */
export function mainStackCards(cards) {
  var out = [];
  for (var i = 0; i < (cards || []).length; i++) {
    if (cards[i].seg !== 'queue') out.push(cards[i]);
  }
  return out;
}

/**
 * 结构级相似度：层轮廓 Jaccard 均值 0.4 + 整体轮廓 Jaccard 0.3 +
 * 区域分布 Jaccard 0.2 + 可操作区 Jaccard 0.1（只比较主堆）。
 * 与 layoutSimilarity 互补：后者看含队列的整体占位格，这里还看区域与可操作区。
 */
export function structureSimilarity(dataA, dataB) {
  var a = mainStackCards(dataA && dataA.cards ? dataA.cards : dataA);
  var b = mainStackCards(dataB && dataB.cards ? dataB.cards : dataB);
  if (!a || !b) return 0;
  var A = layoutShape(a);
  var B = layoutShape(b);
  var n = Math.max(A.layers.length, B.layers.length);
  var sum = 0, used = 0;
  for (var i = 0; i < n; i++) {
    var la = A.layers[i] || {}, lb = B.layers[i] || {};
    var ea = false, eb = false, k;
    for (k in la) if (Object.prototype.hasOwnProperty.call(la, k)) { ea = true; break; }
    for (k in lb) if (Object.prototype.hasOwnProperty.call(lb, k)) { eb = true; break; }
    if (!ea && !eb) continue;
    sum += jaccard(la, lb);
    used++;
  }
  var layerSim = used ? sum / used : 0;
  var silSim = jaccard(A.silhouette, B.silhouette);
  function regionSet(cards) {
    var out = {};
    for (var q = 0; q < cards.length; q++) out[str(cards[q].region) + '@' + num(cards[q].layer)] = 1;
    return out;
  }
  var regSim = jaccard(regionSet(a), regionSet(b));
  function playableSet(cards) {
    var out = {};
    // generateLevel 的牌面已带真实 blocked 标记，直接复用 O(n)；
    // 只有裸坐标数组（无该字段）才回退到几何计算
    var hasFlag = cards.length > 0 && typeof cards[0].blocked === 'boolean';
    for (var q = 0; q < cards.length; q++) {
      var free = hasFlag ? !cards[q].blocked : !geomBlocked(cards, q);
      if (free) out[num(cards[q].x) + ',' + num(cards[q].y)] = 1;
    }
    return out;
  }
  var playSim = jaccard(playableSet(a), playableSet(b));
  return 0.4 * layerSim + 0.3 * silSim + 0.2 * regSim + 0.1 * playSim;
}

/** 便捷：把结构签名写进历史记录时的字段组 */
export function structureFields(data) {
  var s = calculateStructureSignature(data);
  return {
    structureSignature: s.structureSignature,
    canonicalGeometrySignature: s.canonicalGeometrySignature,
  };
}
