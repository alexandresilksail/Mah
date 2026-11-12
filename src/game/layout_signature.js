/**
 * 布局签名（第四阶段）——从**实际生成的牌局数据**计算，绝不从 seed 推导。
 *
 * 三个签名各自独立、可复算：
 *  · geometrySignature  : 坐标 / 层级 / 区域 / z 全序 / 遮挡关系 / 可操作区，
 *                          与洗牌完全无关。同一档位换 seed → 该签名必须相同。
 *  · distributionSignature : 与布局相关的牌型分布（每种牌型张数 + 沿 z 全序的
 *                          牌型序列）。只换花色排列会改它，不改几何。
 *  · layoutSignature    : SHA-256(geometrySignature + distributionSignature)，
 *                          即需求 §5 要求的「至少纳入布局相关牌型分布信息」的主签名。
 *
 * 差异化判定同时检查 layoutSignature 与 geometrySignature：
 * 这样即使牌型排列变了（layoutSignature 变化），只要位置/层级/遮挡结构没变，
 * 仍会被 geometrySignature 判为「同一布局」而拒绝（需求 4.3 的显式禁止项）。
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
