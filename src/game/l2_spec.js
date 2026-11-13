/**
 * 第二关模板的**几何规格层**（唯一几何设计标准）。
 *
 * 【为什么需要这一层】
 * 前两版的实现在「轮廓掩膜」之外仍把「每层选哪些格」交给 seed + 形状分随机决定，
 * 结果同一套模板在 A 档位与 B 档位生成的牌位几乎无关（实测同模板跨档位结构相似度
 * 最低 0.107，比不同模板之间 0.414 还低）—— 缩略图好看，但实际牌局不是那个形状。
 *
 * 本文件把「每层占哪些格」提升为**与 seed 无关、只由档位决定层数的显式规格**：
 *
 *   规格 = 轮廓掩膜（哪些格可落牌）
 *        + 掩膜游走序 walk（多源 BFS，越靠前越靠近掩膜中心）
 *        + 尾段双块交错划分 blocks（walk 序奇偶对分）
 *
 * 规划（specPlan）= 把 walk 前段「铺开」到各层（每层只引入少量新格，其余复用上一层
 * 相邻格）→ 掩膜被完整覆盖后，余下所有层在两个互不相交的块之间交替。
 *
 * 【为什么必须这样铺】
 * 第二关档位是 22–28 层、主堆 217–277 张，而掩膜只有 27–40 格（每格平均 7 张）。
 *   · 若每层都尽量选「没用过的格」（上一版的做法），层间几乎不重叠，
 *     上层牌找不到任何下层牌支撑 → 大面积悬空；
 *   · 若每层都复用同一批格，掩膜永远铺不满 → 俯视轮廓被简化成缩略图的一部分。
 * 于是分两段：
 *   铺设段（l < fillLayers）每层「引入 q 个新格 + 复用上一层尾部 3 个格」，
 *     复用格与上层同格 → 必然被支撑；新格在多源 BFS 序里紧接已用格 → 有下层邻居；
 *   尾段（l ≥ fillLayers）在 A/B 两块间交替，两块都已铺设过 → 全部同格支撑，
 *     且 A/B 不相交 → 俯视遮挡关系可控（开局可点张数落在 19–25）。
 *
 * 【相位】本层所有牌共用同一个半格相位（与既有 buildMainStack 的视觉口径一致）。
 * 这带来一个可证明的性质：同层任意两张牌格位不同、相位相同 ⇒ 水平/垂直间距恰好
 * 是 TILE_W / TILE_H ⇒ 相交面积为 0。**同层零重叠因此不依赖搜索**。
 *
 * 第一关永远不经过本文件。
 */
import { sha256Hex } from './sha256.js';
import { TILE_W, TILE_H, LATTICE_X, LATTICE_Y, layerPlanFor } from './config.js';
import { templateById, MASK_COLS, MASK_ROWS } from './l2_templates.js';
import { hasSupport } from './layout.js';

export var SPEC_ALGORITHM = 'MAH-L2-SPEC-v2';

/** 全局 9×5 整格网原点（与 l2_geometry 共用同一组常量，避免两处漂移） */
export var GRID_X0 = 33;
export var GRID_Y0 = 220;

/** 单层最大张数（第二关各档位 layerPlanFor 实测 6–16，取 18 留余量） */
export var SPEC_FORM_SIZE = 18;
/** 铺设段每层至少复用的「上一层同格」数量：同格必被下层支撑 */
export var KEEP_REUSE = 3;
/** 尾段交错的默认块数（低层数档位用 2 块，见 tailBlocksFor） */
export var TAIL_BLOCKS = 2;
/**
 * 尾段块数：层数少的档位（≤16 层，例如 15 层的 lite 档）尾段层本来就少，
 * 块数再一多，每块只轮得到两三轮，平均压深立刻掉到档位门槛以下；
 * 层数多的档位块数太少又会压深过高（一副牌被两块窄塔占满）。
 * 按档位层数取 2 / 3，两侧才能同时满足「平均压深 ≥ 0.28·N」与「开局可点 19–25」。
 */
function tailBlocksFor(layerCount) {
  return layerCount <= 16 ? 2 : 3;
}
/** 铺设起点数量上限（全部落在最底层，因此不得超过首层张数 14） */
export var SPEC_SEED_MAX = 5;
/** 起点半径目标：只有当某格离所有起点都超过这个距离时才加一个起点。
 *  必须够大 —— 起点越多，底层一次铺掉的格越多，剩下能"垒高"的层就越少，
 *  平均压深会掉；只有单起点推不动的长走廊（如 L2-P13 蛇形，直径 28 步）
 *  才值得加起点。 */
export var SPEC_SEED_RADIUS = 10;

function cellKey(c, r) { return c + ',' + r; }

function cloneCell(c) { return { c: c.c, r: c.r, k: c.k, region: c.region }; }

/* ==================== 掩膜几何：邻接 / 连通分量 / 游走序 ==================== */

function buildAdjacency(cells) {
  var maskKeys = {};
  for (var i = 0; i < cells.length; i++) maskKeys[cells[i].k] = 1;
  var adj = {};
  for (var j = 0; j < cells.length; j++) {
    var c = cells[j].c;
    var r = cells[j].r;
    var list = [];
    var probe = [[c - 1, r], [c + 1, r], [c, r - 1], [c, r + 1]];
    for (var p = 0; p < probe.length; p++) {
      var k2 = cellKey(probe[p][0], probe[p][1]);
      if (maskKeys[k2]) list.push(k2);
    }
    adj[cells[j].k] = list;
  }
  return adj;
}

/** 连通分量（4 邻接）：返回每个分量里「最靠近掩膜中心」的格作为铺开起点 */
function componentSeeds(cells, adj, centroid) {
  var seen = {};
  var seeds = [];
  for (var i = 0; i < cells.length; i++) {
    var start = cells[i];
    if (seen[start.k]) continue;
    var comp = [];
    var queue = [start.k];
    seen[start.k] = 1;
    while (queue.length) {
      var k = queue.shift();
      comp.push(k);
      var nb = adj[k];
      for (var n = 0; n < nb.length; n++) {
        if (seen[nb[n]]) continue;
        seen[nb[n]] = 1;
        queue.push(nb[n]);
      }
    }
    var best = null;
    var bestD = Infinity;
    for (var c2 = 0; c2 < comp.length; c2++) {
      var pr = comp[c2].split(',');
      var cc = +pr[0];
      var rr = +pr[1];
      var d = (cc - centroid[0]) * (cc - centroid[0]) + (rr - centroid[1]) * (rr - centroid[1]);
      if (d < bestD - 1e-9 ||
          (Math.abs(d - bestD) < 1e-9 && best !== null && (rr < +best.split(',')[1] ||
            (rr === +best.split(',')[1] && cc < +best.split(',')[0])))) {
        bestD = d; best = comp[c2];
      }
    }
    seeds.push(best);
  }
  return seeds;
}

/**
 * 把每个连通分量的单一起点扩成「最远点采样」的多起点。
 *
 * 【为什么必须多起点】半格错位下，一格最多只能把生长推向左右中的**一侧**
 * （px=1 才撑得住右邻，px=0 才撑得住左邻，且同一格两种极性必须分处两层），
 * 所以单起点在一条长走廊上的推进速度约等于「1 层 = 1 步」。L2-P13 是 29 格
 * 单格宽蛇形，从中心到两端各 14 步，而最紧的档位只有 15 层 —— 一端必然在
 * 层数耗尽时还差 1 格。多起点能让走廊两端同时向内生长，把最长距离压到 6 步以内。
 *
 * 起点数上限取 min(SPEC_SEED_MAX, 首层张数)：起点全部落在最底层（底层不需要支撑），
 * 所以起点数不能超过首层张数，否则多出来的起点会被挤到第二层、变成悬空牌。
 */
function multiSeeds(cells, adj, centroid) {
  var seeds = componentSeeds(cells, adj, centroid);
  while (seeds.length < SPEC_SEED_MAX) {
    var dists = [];
    for (var s = 0; s < seeds.length; s++) dists.push(bfsDist(adj, seeds[s]));
    var bestKey = null;
    var bestD = -1;
    for (var i = 0; i < cells.length; i++) {
      var k = cells[i].k;
      var dmin = Infinity;
      for (var j = 0; j < dists.length; j++) {
        if (dists[j][k] < dmin) dmin = dists[j][k];
      }
      if (!(dmin < Infinity)) continue;
      /* 严格大于 → 平局时取 cells 序更靠前的格，保证确定性 */
      if (dmin > bestD) { bestD = dmin; bestKey = k; }
    }
    if (bestKey === null || bestD <= SPEC_SEED_RADIUS) break;
    seeds.push(bestKey);
  }
  return seeds;
}

/** 单源 BFS 距离表 */
function bfsDist(adj, from) {
  var dist = {};
  dist[from] = 0;
  var queue = [from];
  while (queue.length) {
    var k = queue.shift();
    var nb = adj[k];
    for (var i = 0; i < nb.length; i++) {
      if (dist[nb[i]] === undefined) {
        dist[nb[i]] = dist[k] + 1;
        queue.push(nb[i]);
      }
    }
  }
  return dist;
}

/**
 * 多源 BFS 游走序：所有连通分量的起点同时入队，逐圈向外扩散。
 *   · 同一分量内相邻格在序里相邻 → 后续格一定有「序更靠前」的邻居；
 *   · 各分量轮流推进 → walk 的任意前缀都同时覆盖所有区域，
 *     于是任何一层都落在缩略图的每个牌岛上，不会某层只出现在一个角。
 */
function walkOrder(cells, adj, seeds) {
  var byKey = {};
  for (var i = 0; i < cells.length; i++) byKey[cells[i].k] = cells[i];
  var seen = {};
  var order = [];
  var queue = [];
  for (var s = 0; s < seeds.length; s++) {
    if (seen[seeds[s]]) continue;
    seen[seeds[s]] = 1;
    queue.push(seeds[s]);
  }
  while (queue.length) {
    var k = queue.shift();
    order.push(byKey[k]);
    if (order.length > cells.length) throw new Error('规格缺陷：游走序长度溢出');
    var nb = adj[k];
    /* 邻居按「更靠近中心优先」排序会破坏 BFS 的圈层性，这里保持坐标序以保证确定性 */
    var sorted = nb.slice().sort(function (a, b) {
      var pa = a.split(','), pb = b.split(',');
      return (+pa[0] - +pb[0]) || (+pa[1] - +pb[1]);
    });
    for (var n = 0; n < sorted.length; n++) {
      if (seen[sorted[n]]) continue;
      seen[sorted[n]] = 1;
      queue.push(sorted[n]);
    }
  }
  if (order.length !== cells.length) {
    throw new Error('规格缺陷：游走序覆盖 ' + order.length + '/' + cells.length + ' 格');
  }
  return order;
}

/* ==================== 规格构建 ==================== */

function buildSpec(tpl) {
  var cells = [];
  for (var i = 0; i < tpl.maskCells.length; i++) {
    var raw = tpl.maskCells[i];
    cells.push({
      c: raw.c, r: raw.r, k: raw.k,
      region: tpl.maskRegion[raw.k] || 'R1',
    });
  }
  if (!cells.length) throw new Error('规格缺陷：模板 ' + tpl.templateId + ' 掩膜为空');

  var sumC = 0, sumR = 0;
  for (var j = 0; j < cells.length; j++) { sumC += cells[j].c; sumR += cells[j].r; }
  var centroid = [sumC / cells.length, sumR / cells.length];

  var adj = buildAdjacency(cells);
  var seeds = multiSeeds(cells, adj, centroid);
  var walk = walkOrder(cells, adj, seeds);

  var walkIndex = {};
  for (var w = 0; w < walk.length; w++) walkIndex[walk[w].k] = w;

  /* 邻接表带方向：{ k, dc, dr }。铺设段选相位要靠方向判断
   * 「这张牌将来能不能撑住它还没铺的邻格」。 */
  var nbr = {};
  for (var nk in adj) {
    if (!Object.prototype.hasOwnProperty.call(adj, nk)) continue;
    var pr = nk.split(',');
    var nc = +pr[0];
    var nr = +pr[1];
    var list = [];
    for (var ni = 0; ni < adj[nk].length; ni++) {
      var pk = adj[nk][ni].split(',');
      list.push({ k: adj[nk][ni], dc: +pk[0] - nc, dr: +pk[1] - nr });
    }
    nbr[nk] = list;
  }

  var silhouette = walk.map(function (c) { return c.k; }).slice().sort();

  var signature = sha256Hex(SPEC_ALGORITHM + '|' + tpl.templateId + '|' + walk.map(function (c) {
    return c.k + '@' + c.region;
  }).join(';'));

  return {
    templateId: tpl.templateId,
    algorithm: SPEC_ALGORITHM,
    maskCells: cells,
    maskCellCount: cells.length,
    maskRegion: tpl.maskRegion,
    maskRegionCount: tpl.maskRegionCount,
    maskBox: tpl.maskBox,
    adj: adj,
    nbr: nbr,
    seeds: seeds,
    walk: walk,
    walkIndex: walkIndex,
    formSize: Math.min(SPEC_FORM_SIZE, cells.length),
    silhouette: silhouette,
    signature: signature,
  };
}

var SPEC_CACHE = {};

/** 取一套模板的规格（结果缓存） */
export function specFor(templateId) {
  var cached = SPEC_CACHE[templateId];
  if (cached) return cached;
  var tpl = templateById(templateId);
  if (!tpl) throw new Error('未知第二关模板: ' + templateId);
  var spec = buildSpec(tpl);
  SPEC_CACHE[templateId] = spec;
  return spec;
}

/* ==================== 规划：把规格展开成逐层格集合 ==================== */

/** 该相位提供的「支撑极性」位：bit0 px=0 / bit1 px=1 / bit2 py=0 / bit3 py=1 */
function phaseBits(ph) {
  return (ph[0] === 0 ? 1 : 2) | (ph[1] === 0 ? 4 : 8);
}

/**
 * 某格为了撑住它「还没铺过的邻格」，自己必须在下面具备哪几种极性。
 * 半格错位是有方向的：左子格要求父格 px=1，右子格要求 px=0，上 py=1、下 py=0。
 */
function needMask(spec, key, used) {
  var nb = spec.nbr[key];
  if (!nb) return 0;
  var m = 0;
  for (var i = 0; i < nb.length; i++) {
    if (used[nb[i].k]) continue;
    /* 子格在左 ⇒ 父格 px 必须为 0（上层 px 小于下层才压得上）；右 ⇒ 1；上 ⇒ py 0；下 ⇒ 1 */
    if (nb[i].dc === -1) m |= 1;
    else if (nb[i].dc === 1) m |= 2;
    else if (nb[i].dr === -1) m |= 4;
    else if (nb[i].dr === 1) m |= 8;
  }
  return m;
}

/** 该格是否还有「尚未铺过」的 4 邻接邻居（= 将来要靠它撑住的子格） */
function hasUnusedNeighbor(spec, key, used) {
  var nb = spec.adj[key] || [];
  for (var i = 0; i < nb.length; i++) if (!used[nb[i]]) return true;
  return false;
}

/** 该格在「已经被用过的格」里是否至少有一个 4 邻接邻居 */
function hasUsedNeighbor(spec, key, used) {
  var nb = spec.adj[key] || [];
  for (var i = 0; i < nb.length; i++) if (used[nb[i]]) return true;
  return false;
}

/**
 * 「这格赶紧补极性」的紧急度：它还没铺过的邻居里，有多少是叶子（只有它一个邻格）。
 *
 * 叶子格的落牌相位被唯一邻格的极性**唯一决定**，没有第二条路；二度格的自由度也很小；
 * 三度以上的格随便哪两块互补极性里剩一块都能凑合。所以紧急度按 叶子 ≫ 二度 > 多度
 * 排，再乘上方向缺口的个数。
 */
function polarityUrgency(spec, key, used, missing) {
  var nb = spec.nbr[key] || [];
  var s = 0;
  for (var i = 0; i < nb.length; i++) {
    var nbk = nb[i];
    if (used[nbk.k]) continue;
    var bit = nbk.dc === -1 ? 1 : (nbk.dc === 1 ? 2 : (nbk.dr === -1 ? 4 : 8));
    if (!(missing & bit)) continue;
    var deg = (spec.nbr[nbk.k] || []).length;
    s += deg <= 1 ? 100 : (deg === 2 ? 10 : 1);
  }
  return s;
}

/**
 * 从游走序里取最多 q 个「尚未使用、且在已用格里有 4 邻接邻居」的新格。
 *   · 第一层没有下层可撑（底层本来就不需要支撑）→ 直接按游走序铺；
 *   · 之后每一格都必须紧邻已用格，否则引入它就是引入一张注定悬空的牌 ——
 *     这种格一律留到下一层（届时它的邻居已被铺过），而不是硬塞进本层。
 * 返回值长度可能小于 q，调用方用「上一层复用格」把本层补满。
 */
function grabNew(spec, q, used) {
  var empty = true;
  for (var key in used) {
    if (Object.prototype.hasOwnProperty.call(used, key)) { empty = false; break; }
  }
  var out = [];
  var walk = spec.walk;
  for (var i = 0; i < walk.length && out.length < q; i++) {
    var c = walk[i];
    if (used[c.k]) continue;
    if (empty || hasUsedNeighbor(spec, c.k, used)) out.push(c);
  }
  return out;
}

/** 相位枚举：(0,0) 与 (1,1) 打头 —— 这两者互为「能互相支撑」的一对 */
export var PHASES = [[0, 0], [1, 1], [1, 0], [0, 1]];

/** 相位在 PHASES 里的下标（找不到时退回 0，保证纯函数、不抛错） */
function phaseIndex(ph) {
  for (var i = 0; i < PHASES.length; i++) {
    if (PHASES[i][0] === ph[0] && PHASES[i][1] === ph[1]) return i;
  }
  return 0;
}

/** 一张牌在 (cell, phase) 下的左上角坐标（与落牌口径完全一致） */
export function cellPos(cell, ph) {
  return {
    x: GRID_X0 + cell.c * TILE_W + ph[0] * LATTICE_X,
    y: GRID_Y0 + cell.r * TILE_H + ph[1] * LATTICE_Y,
  };
}

/** 两个左上角坐标的矩形是否相交（牌尺寸相同，同层必须恒为 false） */
function overlaps(posA, posB) {
  var ix = Math.min(posA.x + TILE_W, posB.x + TILE_W) - Math.max(posA.x, posB.x);
  var iy = Math.min(posA.y + TILE_H, posB.y + TILE_H) - Math.max(posA.y, posB.y);
  return ix > 0 && iy > 0;
}

/**
 * 规格 + 档位 → 逐层「格集合 + 半格相位」（纯函数、零随机）。
 *
 * 档位只决定「多少层、每层几张」，不改变任何格的位置；
 * 同一个 (spec, profile, fillRot) 永远得到同一份计划 ——
 * 这是「缩略图 = 唯一几何标准」的落点。
 *
 * 【为什么相位要在规划阶段定】
 * 半格支撑是有方向性的：上层牌要与下层邻格相交，必须 px_upper < px_lower
 * （或 py 同理）。也就是说「下层那格用的是哪种相位」决定了「上层邻格能不能被撑住」。
 * 所以不能先选格再挑相位，而要**先定相位、再从候选新格里只取能被撑住的那些**：
 * 撑不住的新格留到下一层（那时它的邻居已经被铺过），本层用上一层复用格补满。
 * 这样「主堆零悬空」是构造出来的，而不是靠事后统计碰运气。
 */
function buildPlan(spec, profile, fillRot) {
  /* 每层张数直接取档位既有规划（沙漏曲线，6–15 张/层）——
   * 这是难度与视觉轮廓的一部分，不能在这里重新均分。 */
  var plan = layerPlanFor(profile);
  var L = plan.length;
  if (!L) throw new Error('档位缺少 layerPlanFor 规划');
  if (profile.layers && profile.layers !== L) {
    throw new Error('档位层数 ' + profile.layers + ' 与 layerPlanFor ' + L + ' 层不一致');
  }

  var n = spec.maskCellCount;
  var used = {};
  var lower = [];              // 已落牌的左上角坐标，用于支撑判定
  var remaining = n;
  var layers = [];
  var fillLayers = 0;
  var delayed = 0;             // 因「无可支撑邻居」被推迟到下一层的新格数
  /* 每格已有哪种「支撑极性」：bit0 = px=0，bit1 = px=1，bit2 = py=0，bit3 = py=1 */
  var supMask = {};

  /** 这个相位能撑住多少个「还没铺过的邻格」（1 步前瞻） */
  function enabledCount(cell, ph) {
    var nb = spec.nbr[cell.k] || [];
    var s = 0;
    for (var i = 0; i < nb.length; i++) {
      if (used[nb[i].k]) continue;
      if (nb[i].dc === -1) { if (ph[0] === 0) s++; }
      else if (nb[i].dc === 1) { if (ph[0] === 1) s++; }
      else if (nb[i].dr === -1) { if (ph[1] === 0) s++; }
      else if (nb[i].dr === 1) { if (ph[1] === 1) s++; }
    }
    return s;
  }

  for (var l = 0; l < L; l++) {
    var size = plan[l];
    if (size > spec.formSize) {
      throw new Error('模板 ' + spec.templateId + ' 第 ' + l + ' 层需要 ' + size +
        ' 格，超过单层上限 ' + spec.formSize);
    }
    var entries = [];              // { cell, phase, pos }
    var kind;
    var phase = PHASES[fillRot % PHASES.length];

    if (remaining > 0) {
      kind = 'fill';
      fillLayers = l + 1;
      /* 铺设段整层共用一个相位：同层格位互不相同 + 相位相同 ⇒ 相交面积恒为 0，
       * 「同层零重叠」不需要搜索也不会退化成兜底。 */
      /* 本层最多引入几张新格。
       * 常规为 size-2（留 2 张复用，保证层间叠压连续）；但当剩余未铺格已经能
       * 一层装下时不再设限 —— 否则游走序末端的格（单格宽走廊的尽头）会被这个
       * 上限一直挤到层数耗尽，出现「剩 1 格」的假失败。 */
      var cap = l === 0 ? size : Math.max(1, size - Math.min(KEEP_REUSE, 2));
      if (remaining <= size) cap = remaining;
      var cands = grabNew(spec, n, used);
      if (!cands.length) {
        throw new Error('模板 ' + spec.templateId + ' 铺设第 ' + l +
          ' 层找不到任何有下层邻居的新格（游走序或掩膜连通性有问题）');
      }

      /* 选层相位：数一数在每个相位下「能立刻引入几张新牌」，取最多的那个。
       * 相位决定这一层能往哪个方向长（上层牌要压住左侧邻格，下层同格必须 px=1），
       * 所以逐层换相位就是在轮流开辟四个生长方向。 */
      phase = PHASES[(fillRot + l) % PHASES.length];
      var tryOrder = [0, 1, 2, 3];
      var taken = {};
      var freshCount = 0;
      var placedPos = [];

      function conflicts(pos) {
        for (var q = 0; q < placedPos.length; q++) if (overlaps(pos, placedPos[q])) return true;
        return false;
      }

      function popcount(v) {
        var c2 = 0;
        while (v) { c2 += v & 1; v >>= 1; }
        return c2;
      }

      /* 补位格：相位要挑一个不与本层已放牌相交的（逐格相位下不能再用「整层相位」硬套） */
      function pushFiller(cellF) {
        for (var tf = 0; tf < tryOrder.length; tf++) {
          var phF = PHASES[(fillRot + l + tryOrder[tf]) % PHASES.length];
          var posF = cellPos(cellF, phF);
          if (conflicts(posF)) continue;
          entries.push({ cell: cellF, phase: phF, pos: posF });
          placedPos.push(posF);
          taken[cellF.k] = 1;
          return true;
        }
        return false;
      }

      /* 1) 新格：逐格挑相位。三条约束 —— 有下层支撑（硬）、与本层已放牌零相交（硬）、
       *    并尽量为自己「还没铺过的子格」留好极性。
       *    逐格而不是整层共用：单格宽走廊（蛇形 / 月牙掩膜）的两个末端往往要求相反
       *    的极性，整层一个相位只能推进一端，铺设会慢到把层数耗光。 */
      for (var ci = 0; ci < cands.length && entries.length < cap; ci++) {
        var cell = cands[ci];
        var myNeed = needMask(spec, cell.k, used);
        var best = null;
        var bestSc = -1;
        for (var t = 0; t < tryOrder.length; t++) {
          var ph = PHASES[(fillRot + l + tryOrder[t]) % PHASES.length];
          var pos = cellPos(cell, ph);
          if (lower.length && !hasSupport({ x: pos.x, y: pos.y }, lower)) continue;
          if (conflicts(pos)) continue;
          var sc = popcount(myNeed & phaseBits(ph)) * 4 + (tryOrder.length - t);
          if (sc > bestSc) { bestSc = sc; best = { cell: cell, phase: ph, pos: pos }; }
        }
        if (!best) { delayed++; continue; }
        entries.push(best);
        placedPos.push(best.pos);
        taken[cell.k] = 1;
        freshCount++;
      }

      /* 2) 补「支撑极性」：半格错位是有方向的 —— 某格要撑住左侧子格，自己下面必须
       *    压着一张 px=0 的同格牌；撑住右侧要 px=1；上下同理要 py=0 / py=1。
       *    一张牌只能取一种错位，所以每格需要在下面压着两种互补错位，
       *    四个方向的子格才都可铺。没有这一步，掩膜拐角与走廊尽头会永久卡死。
       *
       *    【为什么要按紧急度排序】走廊尽头（叶子格）只有唯一一个邻格，它的落牌
       *    相位被那一格的极性唯一决定；一旦那一格在别的方向上用掉了唯一的名额，
       *    尽头就永远补不上（L2-P13 的 0,0 就是这样卡住的）。所以「邻格是叶子」
       *    的极性需求必须最先满足，其次才是二度格、多度格。 */
      if (entries.length < size) {
        var polCands = [];
        for (var wi = 0; wi < spec.walk.length; wi++) {
          var wc2 = spec.walk[wi];
          if (!used[wc2.k] || taken[wc2.k]) continue;
          var needAll2 = needMask(spec, wc2.k, used);
          if (!needAll2) continue;
          var missing2 = needAll2 & ~(supMask[wc2.k] || 0);
          if (!missing2) continue;
          polCands.push({
            cell: wc2, missing: missing2,
            urgency: polarityUrgency(spec, wc2.k, used, missing2),
            order: wi,
          });
        }
        polCands.sort(function (a, b) {
          if (b.urgency !== a.urgency) return b.urgency - a.urgency;
          return a.order - b.order;
        });
        for (var pc = 0; pc < polCands.length && entries.length < size; pc++) {
          var cand2 = polCands[pc];
          if (taken[cand2.cell.k]) continue;
          for (var t2 = 0; t2 < tryOrder.length; t2++) {
            var ph2 = PHASES[(fillRot + l + tryOrder[t2]) % PHASES.length];
            if (!(phaseBits(ph2) & cand2.missing)) continue;
            var pos2 = cellPos(cand2.cell, ph2);
            if (conflicts(pos2)) continue;
            entries.push({ cell: cand2.cell, phase: ph2, pos: pos2 });
            placedPos.push(pos2);
            taken[cand2.cell.k] = 1;
            break;
          }
        }
      }

      /* 3) 不足 size 的部分从上一层复用（必然有同格下层牌） */
      if (entries.length < size && l > 0) {
        var prevL = layers[l - 1].cells;
        for (var pi = prevL.length - 1; pi >= 0 && entries.length < size; pi--) {
          if (taken[prevL[pi].k]) continue;
          if (!pushFiller(prevL[pi])) continue;
        }
      }

      /* 4) 仍不足：任取已用格补满（同格一定有下层牌撑着） */
      if (entries.length < size) {
        for (var fi = spec.walk.length - 1; fi >= 0 && entries.length < size; fi--) {
          var fc = spec.walk[fi];
          if (!used[fc.k] || taken[fc.k]) continue;
          pushFiller(fc);
        }
      }
      if (entries.length !== size) {
        throw new Error('模板 ' + spec.templateId + ' 铺设第 ' + l + ' 层格数 ' +
          entries.length + ' ≠ ' + size);
      }
      remaining -= freshCount;
    } else {
      /* 尾段：在游走序上取两块「步进窗口」交替摆放 ——
       *   · 两块互不重叠（或只重叠几张）⇒ 同一轮里上下两层不互相遮挡，
       *     开局可点张数因此稳定落在 19–25；
       *   · 窗口都在掩膜内，且全部格在铺设段都已经铺过 ⇒ 悬空必然为 0。
       *
       * 【相位必须逐轮轮转】如果同一块每次复用都用同一个相位，(x,y) 会完全重合，
       * 而相邻格在同一相位下又是「整格错开」（66px，零重叠）—— 结果是尾段每一层的
       * 牌只被**同格**的下几层挡住，平均压深只有 ~6，远低于档位要求的 0.28×层数，
       * 整副牌摸起来"一摸到底"。让相位随轮次在 4 种里轮转后，同格相邻两层变成
       * 半格相交（50%）、相邻格之间也出现半格相交，压深回到与既有第二关同档。 */
      kind = 'tail';
      var blocks = tailBlocksFor(L);
      var slot = (layers.length - fillLayers) % blocks;
      var cycle = Math.floor((layers.length - fillLayers) / blocks);
      /* 两块按**半个窗口**错开：既不像整窗错开那样让一半掩膜格完全没有尾段牌
       * （那些格只能靠铺设段，平均压深会掉到档位门槛以下，L2-P01/P08 尤其明显），
       * 也不像同窗重叠那样让开局可点张数暴涨。 */
      /* 各块按**小于一个窗口**的步长错开（两块 1/3、三块 1/2 窗口）：
       *   · 整窗错开 → 一半掩膜格完全没有尾段牌，那些格只能靠铺设段撑着，
       *     平均压深直接掉到档位门槛以下（L2-P01 / L2-P08 实测最明显）；
       *   · 窗口重叠过多 → 开局可点张数暴涨、越过 25 张上限，候选全被拒。 */
      var hop = blocks === 2 ? size / 4 : size / 2;
      var baseOff = Math.round(slot * hop);
      phase = PHASES[cycle % PHASES.length];
      for (var bi = 0; bi < size; bi++) {
        var wc = spec.walk[(((baseOff + bi) % n) + n) % n];
        entries.push({ cell: wc, phase: phase, pos: cellPos(wc, phase) });
      }
    }

    var out = [];
    for (var ej = 0; ej < entries.length; ej++) {
      var e = entries[ej];
      out.push({
        c: e.cell.c, r: e.cell.r, k: e.cell.k,
        region: e.cell.region, phase: e.phase.slice(),
      });
      used[e.cell.k] = 1;
      supMask[e.cell.k] = (supMask[e.cell.k] || 0) |
        (e.phase[0] === 0 ? 1 : 2) | (e.phase[1] === 0 ? 4 : 8);
      lower.push(e.pos);
    }
    layers.push({
      index: l, kind: kind,
      block: kind === 'tail' ? ((layers.length - fillLayers) % blocks) : -1,
      cycle: kind === 'tail' ? Math.floor((layers.length - fillLayers) / blocks) : -1,
      phase: phase.slice(), cells: out,
    });
  }

  if (remaining !== 0) {
    var left = [];
    for (var sk = 0; sk < spec.silhouette.length; sk++) {
      if (!used[spec.silhouette[sk]]) left.push(spec.silhouette[sk]);
    }
    throw new Error('模板 ' + spec.templateId + ' 在 ' + L + ' 层内没能铺满掩膜（剩 ' +
      remaining + ' 格：' + left.join(' ') + '），档位层数太小');
  }

  var total = 0;
  for (var t3 = 0; t3 < layers.length; t3++) total += layers[t3].cells.length;
  if (total !== profile.mainCount) {
    throw new Error('规格展开张数 ' + total + ' ≠ 档位主堆 ' + profile.mainCount);
  }

  /* 自检：全部层格集合并集必须等于掩膜全集（俯视轮廓 == 缩略图） */
  var covered = {};
  for (var cj = 0; cj < layers.length; cj++) {
    for (var ck = 0; ck < layers[cj].cells.length; ck++) covered[layers[cj].cells[ck].k] = 1;
  }
  var missing = 0;
  for (var si = 0; si < spec.silhouette.length; si++) if (!covered[spec.silhouette[si]]) missing++;
  if (missing) {
    throw new Error('规格缺陷：模板 ' + spec.templateId + ' 展开后仍有 ' + missing + ' 格未被覆盖');
  }

  return {
    templateId: spec.templateId,
    profileId: profile.id,
    layers: layers,
    layerCount: L,
    fillLayers: fillLayers,
    delayed: delayed,
    total: total,
    fillRot: fillRot,
    signature: spec.signature,
  };
}

var PLAN_CACHE = {};

/**
 * 取一份计划。
 * @param {object} spec    specFor(templateId)
 * @param {object} profile 档位
 * @param {object} [opt]   { fillRot: 0..3, tailPhase: function(block) -> [px,py] }
 *
 * 格集合与铺设段相位只由 (spec, profile, fillRot) 决定并被缓存；
 * 尾段相位是纯遮挡细节（A/B 两块各自的半格错位），可以按候选临时替换，
 * 不会改动任何一层占哪些格。
 */
export function specPlan(spec, profile, opt) {
  var o = opt || {};
  var rot = ((o.fillRot | 0) % PHASES.length + PHASES.length) % PHASES.length;
  var ck = spec.templateId + '|' + profile.id + '|' + rot;
  var cached = PLAN_CACHE[ck];
  if (!cached) {
    cached = buildPlan(spec, profile, rot);
    PLAN_CACHE[ck] = cached;
  }
  if (!o.tailPhase) return cached;

  var layers = [];
  for (var i = 0; i < cached.layers.length; i++) {
    var L0 = cached.layers[i];
    if (L0.kind !== 'tail') { layers.push(L0); continue; }
    /* 候选只给「这一块的基准相位」，实际相位再按轮次轮转 —— 与 buildPlan 的
     * 默认口径（PHASES[cycle % 4]）完全一致，因此 base=[0,0] 就是默认布局。 */
    var base = o.tailPhase(L0.block);
    var tp = PHASES[(phaseIndex(base) + (L0.cycle || 0)) % PHASES.length];
    var cells2 = [];
    for (var j = 0; j < L0.cells.length; j++) {
      var c0 = L0.cells[j];
      cells2.push({ c: c0.c, r: c0.r, k: c0.k, region: c0.region, phase: tp.slice() });
    }
    layers.push({ index: L0.index, kind: 'tail', block: L0.block, cycle: L0.cycle,
      phase: tp.slice(), cells: cells2 });
  }
  return {
    templateId: cached.templateId,
    profileId: cached.profileId,
    layers: layers,
    layerCount: cached.layerCount,
    fillLayers: cached.fillLayers,
    delayed: cached.delayed,
    total: cached.total,
    fillRot: cached.fillRot,
    signature: cached.signature,
  };
}

/** 计划里每层期望的格 key 集合（供保真校验逐个比对） */
export function planLayerKeys(plan) {
  var out = [];
  for (var l = 0; l < plan.layers.length; l++) {
    var keys = [];
    for (var i = 0; i < plan.layers[l].cells.length; i++) keys.push(plan.layers[l].cells[i].k);
    keys.sort();
    out.push(keys);
  }
  return out;
}

/* ==================== 保真校验 ==================== */

/**
 * 保真校验：把**实际牌局**与规格逐项比对。
 * 这是「缩略图 ↔ 实际布局」一一对应的硬判据，不是相似度阈值。
 *
 * 检查项（任一不过即 ok=false）：
 *   COUNT        总张数 == 档位 mainCount + queueCount
 *   CELL_OUT     主堆每张牌的格位都在掩膜内
 *   LATTICE      半格晶格
 *   LAYER_COUNT  层数与档位规格一致
 *   LAYER_FORM   每一层的格集合与规格计划逐格相同（顺序无关）
 *   PHASE        每一张牌的半格相位（px/py）与计划逐张相同（翻转后仍在同一格 /
 *               同一晶格，CELL_OUT/LATTICE/LAYER_FORM 抓不到，必须显式比对）
 *   SILHOUETTE   全部层格集合并集 == 掩膜全集（俯视轮廓不被简化 / 变形）
 *   REGION_COVER 每个连通区域都有牌
 *   SAME_LAYER   同层零重叠
 *
 * @param {Array} cards 实际牌位（含 queue 段）
 * @param {object} spec specFor(templateId)
 * @param {object} plan specPlan(spec, profile)
 * @param {object} profile 档位
 */
export function checkFidelity(cards, spec, plan, profile) {
  var violations = [];
  var checks = {};

  function bad(code, detail) {
    violations.push({ code: code, detail: detail });
  }

  var main = [];
  for (var i = 0; i < (cards || []).length; i++) {
    if (cards[i].seg !== 'queue') main.push(cards[i]);
  }

  checks.count = (cards || []).length === profile.mainCount + profile.queueCount &&
    main.length === profile.mainCount;
  if (!checks.count) {
    bad('COUNT', '总张数 ' + (cards || []).length + '/' +
      (profile.mainCount + profile.queueCount) + '，主堆 ' + main.length + '/' + profile.mainCount);
  }

  var maskKeys = {};
  for (var m = 0; m < spec.maskCells.length; m++) maskKeys[spec.maskCells[m].k] = 1;

  var byLayer = {};
  var outCount = 0;
  var badLattice = 0;
  for (var q = 0; q < main.length; q++) {
    var c = main[q];
    if (c.x % LATTICE_X !== 0 || c.y % LATTICE_Y !== 0) badLattice++;
    var col = Math.floor(((c.x - GRID_X0) / LATTICE_X) / 2);
    var row = Math.floor(((c.y - GRID_Y0) / LATTICE_Y) / 2);
    var key = cellKey(col, row);
    if (!maskKeys[key]) outCount++;
    if (!byLayer[c.layer]) byLayer[c.layer] = [];
    byLayer[c.layer].push({ key: key, card: c });
  }
  checks.cellOut = outCount === 0;
  if (!checks.cellOut) bad('CELL_OUT', outCount + ' 张牌落到了掩膜之外');

  checks.lattice = badLattice === 0;
  if (!checks.lattice) bad('LATTICE', badLattice + ' 张牌不在半格晶格上');

  var layerIds = Object.keys(byLayer).map(Number).sort(function (a, b) { return a - b; });
  checks.layerCount = layerIds.length === plan.layerCount;
  if (!checks.layerCount) {
    bad('LAYER_COUNT', '实际 ' + layerIds.length + ' 层，规格 ' + plan.layerCount + ' 层');
  }

  var formMismatch = 0;
  var formDetail = null;
  for (var l = 0; l < plan.layerCount; l++) {
    var got = (byLayer[l] || []).map(function (o) { return o.key; }).sort();
    var want = plan.layers[l].cells.map(function (c2) { return c2.k; }).sort();
    if (got.length !== want.length) {
      formMismatch++;
      if (!formDetail) formDetail = '第 ' + l + ' 层 ' + got.length + ' 格 ≠ 规格 ' + want.length + ' 格';
      continue;
    }
    for (var z = 0; z < want.length; z++) {
      if (got[z] !== want[z]) {
        formMismatch++;
        if (!formDetail) {
          formDetail = '第 ' + l + ' 层格集合与规格不同（' + got[z] + ' vs ' + want[z] + '）';
        }
        break;
      }
    }
  }
  checks.layerForm = formMismatch === 0;
  if (!checks.layerForm) bad('LAYER_FORM', formMismatch + ' 层与规格不一致：' + formDetail);

  /* 相位（半格错位）检查：缩略图按真实 (x,y) 绘制，相位不同则牌在牌桌上的
   * 实际像素位置不同 —— 与缩略图不再一一对应。相位只取 0/1（px/py），翻转后
   * 仍在半格晶格内、同一个格 key，因此「CELL_OUT / LATTICE / LAYER_FORM」都
   * 抓不到它，必须显式逐张比对。计划里每层每格都带期望相位，直接逐项对照。
   *
   * 只校验「铺设段（kind==='fill'）」的相位：铺设段相位是规格求解出来的（保证
   * 支撑），与 templateId + 档位 + fillRot 一一对应，是模板身份的一部分；尾段
   * （kind==='tail'）相位是生成时按「开局可点 19–25」挑的自由旋转（4 选 1），
   * 不是模板身份，verifyTemplateFidelity 用默认相位重展开会与之不同，故不校验。 */
  var expectPhase = {};
  for (var lp = 0; lp < plan.layerCount; lp++) {
    if (plan.layers[lp].kind !== 'fill') continue;
    var lc = plan.layers[lp].cells;
    for (var ci = 0; ci < lc.length; ci++) {
      expectPhase[lp + '|' + lc[ci].k] = lc[ci].phase;
    }
  }
  var badPhase = 0;
  for (var qp = 0; qp < main.length; qp++) {
    var cp = main[qp];
    var planLayer = plan.layers[cp.layer];
    if (!planLayer || planLayer.kind !== 'fill') continue;
    var ccol = Math.floor(((cp.x - GRID_X0) / LATTICE_X) / 2);
    var crow = Math.floor(((cp.y - GRID_Y0) / LATTICE_Y) / 2);
    var ckey = cellKey(ccol, crow);
    var cpx = (((Math.round((cp.x - GRID_X0) / LATTICE_X)) % 2) + 2) % 2;
    var cpy = (((Math.round((cp.y - GRID_Y0) / LATTICE_Y)) % 2) + 2) % 2;
    var exp = expectPhase[cp.layer + '|' + ckey];
    if (!exp || exp[0] !== cpx || exp[1] !== cpy) badPhase++;
  }
  checks.phase = badPhase === 0;
  if (!checks.phase) bad('PHASE', badPhase + ' 张牌的铺设段相位与规格不符');

  var used = {};
  for (var li = 0; li < layerIds.length; li++) {
    var arr = byLayer[layerIds[li]];
    for (var ai = 0; ai < arr.length; ai++) used[arr[ai].key] = 1;
  }
  var missingCells = 0;
  for (var si = 0; si < spec.silhouette.length; si++) {
    if (!used[spec.silhouette[si]]) missingCells++;
  }
  checks.silhouette = missingCells === 0 && outCount === 0;
  if (!checks.silhouette) {
    bad('SILHOUETTE', missingCells + ' 个掩膜格没被任何层使用（轮廓被简化）');
  }

  var regions = {};
  for (var ui in used) {
    if (!Object.prototype.hasOwnProperty.call(used, ui)) continue;
    regions[spec.maskRegion[ui] || 'R1'] = 1;
  }
  var regionCount = Object.keys(regions).length;
  checks.regionCover = regionCount === spec.maskRegionCount;
  if (!checks.regionCover) {
    bad('REGION_COVER', '只覆盖 ' + regionCount + '/' + spec.maskRegionCount + ' 个连通区域');
  }

  var overlap = 0;
  for (var lj = 0; lj < layerIds.length; lj++) {
    var list = byLayer[layerIds[lj]];
    for (var a1 = 0; a1 < list.length; a1++) {
      for (var b1 = a1 + 1; b1 < list.length; b1++) {
        var A = list[a1].card, B = list[b1].card;
        var ix = Math.min(A.x + TILE_W, B.x + TILE_W) - Math.max(A.x, B.x);
        var iy = Math.min(A.y + TILE_H, B.y + TILE_H) - Math.max(A.y, B.y);
        if (ix > 0 && iy > 0) overlap++;
      }
    }
  }
  checks.sameLayer = overlap === 0;
  if (!checks.sameLayer) bad('SAME_LAYER', overlap + ' 对同层牌重叠');

  return {
    ok: violations.length === 0,
    templateId: spec.templateId,
    profileId: profile.id,
    checks: checks,
    violations: violations,
    algorithm: SPEC_ALGORITHM,
  };
}

/** 规格摘要（报告 / 调试面板用） */
export function specSummary(spec) {
  return {
    templateId: spec.templateId,
    algorithm: spec.algorithm,
    maskCellCount: spec.maskCellCount,
    maskRegionCount: spec.maskRegionCount,
    formSize: spec.formSize,
    seeds: spec.seeds.length,
    walk: spec.walk.map(function (c) { return c.k; }),
    walkLength: spec.walk.length,
    silhouetteCovered: spec.silhouette.length,
    signature: spec.signature,
  };
}
