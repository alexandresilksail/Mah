/**
 * 第二关 20 套模板的几何生成器（规格驱动 + 整层统一相位）。
 *
 * 【唯一几何标准 = l2_spec.js 的模板规格】
 * 每一层占哪些格，由 specPlan(spec, profile) 直接给出，**与本文件的随机无关**：
 *   · 档位只决定「多少层、每层几张」，不改变任何格的位置；
 *   · seed 只决定「每层的半格相位」这一纯遮挡细节。
 * 因此任何档位 / 任何 seed 生成的牌局，俯视轮廓、区域位置、比例、方向、间距、
 * 层级分布都和规格（= 缩略图）一致；seed 不会改变布局形状。
 *
 * 【相位为什么可以整层统一】
 * 本层所有牌共用同一个半格相位时，同层任意两张牌格位不同 ⇒ 水平间距恒为 TILE_W、
 * 垂直间距恒为 TILE_H ⇒ 相交面积恒为 0。「同层零重叠」这条硬规则因此是**构造性成立**
 * 的，不需要搜索、也不会退化成兜底。这与既有 buildMainStack 的视觉口径一致
 * （整层一个错位向量，而不是逐张抖动）。
 *
 * 【支撑与开局可点数怎么同时成立】
 *   · 铺设段：每层「少量新格 + 上一层尾部复用的格」。复用格与下层同格，
 *     无论相位如何都至少有 25% 面积重叠 ⇒ 必然被支撑；新格在多源 BFS 序里紧邻
 *     已用格 ⇒ 有下层邻居。相位在 4 种里逐层贪心挑「无支撑牌最少」的那个。
 *   · 尾段：在 A/B 两块间交替，两块都已铺设过 ⇒ 全部同格支撑（悬空必然为 0）；
 *     A/B 不相交 ⇒ 两块各自的牌互不遮挡，开局可点张数由两块的大小之和决定，
 *     再叠加与铺设段之间的遮挡细节即可落在 19–25。
 *
 * 【不变硬契约（与既有第二关一致）】
 *  · 半格晶格 x%LATTICE_X=0 / y%LATTICE_Y=0；同层零重叠；
 *  · 主堆落在 BOARD_BAND 内；z 全序 = layer 升序 → y 升序 → x 升序；
 *  · 总张数 = profile.mainCount + profile.queueCount，主堆层数 = profile.layers；
 *  · 队列 44 张直接复用 layout_profiles.buildQueue()，规则一字不改；
 *  · 开局可点 19–25 张（VISIBLE_MIN/MAX）。
 *
 * 【全局格网】x = GRID_X0 + c*TILE_W + px*LATTICE_X（c=0..8，px∈{0,1}）
 *             y = GRID_Y0 + r*TILE_H + py*LATTICE_Y（r=0..4，py∈{0,1}）
 *
 * 第一关永远不经过本文件；不带 templateId 的第二关调用会被 generator.js 直接拒绝。
 */
import {
  TILE_W, TILE_H, LATTICE_X, LATTICE_Y, BOARD_BAND,
} from './config.js';
import { makeRng } from './rng.js';
import { hasSupport } from './layout.js';
import {
  buildQueue, countVisible, VISIBLE_MIN, VISIBLE_MAX, QUEUE_SHAPE,
} from './layout_profiles.js';
import { templateById, MASK_COLS, MASK_ROWS } from './l2_templates.js';
import {
  GRID_X0, GRID_Y0, PHASES, specFor, specPlan, checkFidelity, planLayerKeys,
} from './l2_spec.js';

var X_MIN = GRID_X0;
var Y_MIN = GRID_Y0;
var GRID_COLS = MASK_COLS;
var GRID_ROWS = MASK_ROWS;

/** 队列固定贡献 4 张可点（四条链各一张队首） */
var QUEUE_VISIBLE = 4;

/* ==================== 层段划分（沿用既有 seg 字段口径） ==================== */

function segmentOf(li, n) {
  var n1 = Math.max(1, Math.round(n * 0.25));
  var n2 = Math.max(1, Math.round(n * 0.36));
  if (li < n1) return 'top';
  if (li < n1 + n2) return 'mid';
  return 'core';
}

/* ==================== 单层落牌 ==================== */

/** 一张牌在 (cell, phase) 下的左上角坐标 */
function posOf(cell, ph) {
  return {
    x: X_MIN + cell.c * TILE_W + ph[0] * LATTICE_X,
    y: Y_MIN + cell.r * TILE_H + ph[1] * LATTICE_Y,
  };
}

/**
 * 把一层落成牌（不写入任何状态）。
 * 相位优先取「该格自己的相位」（铺设段逐格求解），没有则取整层相位（尾段）。
 * @returns {Array} 与 layer.cells 一一对应的牌对象
 */
function layerCards(layer, spec, profile, li, n) {
  var seg = segmentOf(li, n);
  var out = [];
  for (var k = 0; k < layer.cells.length; k++) {
    var c = layer.cells[k];
    var p = posOf(c, c.phase || layer.phase);
    out.push({
      x: p.x,
      y: p.y,
      layer: li,
      region: c.region,
      zoneLayer: li,
      seg: seg,
      gridW: spec.maskBox.cols,
      gridH: spec.maskBox.rows,
      gaps: 1 - spec.maskCellCount / (GRID_COLS * GRID_ROWS),
      pinned: '',
    });
  }
  return out;
}

/** 这一层里有几张牌拿不到下层支撑 */
function unsupportedCount(cards, lower) {
  if (!lower.length) return 0;
  var n = 0;
  for (var i = 0; i < cards.length; i++) if (!hasSupport(cards[i], lower)) n++;
  return n;
}

/* ==================== 主堆：按规格逐层落牌 ==================== */

/**
 * 按计划落整个主堆。**零随机**：每层占哪些格、用哪个相位都由 plan 给出。
 *
 * @param {object} profile 档位
 * @param {object} spec    模板规格
 * @param {object} plan    规格计划
 * @returns {Array} 主堆牌（不含队列）
 */
function buildMain(profile, spec, plan) {
  var n = plan.layerCount;
  var out = [];
  for (var li = 0; li < n; li++) {
    var layer = plan.layers[li];
    var cards = layerCards(layer, spec, profile, li, n);
    for (var k = 0; k < cards.length; k++) out.push(cards[k]);
  }
  return out;
}

/** 悬空统计：非底层牌必须有 >10% 面积的下层支撑（cumulative 下层） */
function countFloating(mainCards) {
  var byLayer = {};
  for (var i = 0; i < mainCards.length; i++) {
    var c = mainCards[i];
    if (!byLayer[c.layer]) byLayer[c.layer] = [];
    byLayer[c.layer].push(c);
  }
  var ids = Object.keys(byLayer).map(Number).sort(function (a, b) { return a - b; });
  var below = [];
  var floating = 0;
  for (var l = 0; l < ids.length; l++) {
    var same = byLayer[ids[l]];
    if (l > 0) {
      for (var s = 0; s < same.length; s++) if (!hasSupport(same[s], below)) floating++;
    }
    for (var b = 0; b < same.length; b++) below.push(same[b]);
  }
  return floating;
}

/* ==================== 对外入口 ==================== */

/**
 * 候选轮次：只用来在「尾段两块各自的相位」里挑开局可点落在 19–25 的那个。
 * 任何候选都不会改变模板的格集合 —— 规格已经固定了每一层占哪些格。
 */
export var TEMPLATE_CANDIDATE_ROUNDS = 16;

/**
 * 生成一套模板的真实牌位。
 *
 * 几何（每层格集合）由规格唯一确定；本函数只在相位与队列位置上取候选，
 * 使开局可点落在 19–25 且主堆零悬空。生成后立刻做一次规格保真校验，
 * 不过即抛错（带 violations 明细），绝不返回一个「形状不对但能玩」的布局。
 */
export function generateTemplateLayout(seed, profile, templateId) {
  var tpl = templateById(templateId);
  if (!tpl) throw new Error('未知第二关模板: ' + templateId);
  if (!profile || !profile.queueCount) throw new Error('模板只适用于第二关档位');

  var spec = specFor(templateId);
  var base = ((seed >>> 0) ^ 0x6c32f1a7) >>> 0;
  var rot = makeRng(base).int(0, 3);

  var best = null;
  var bestScore = Infinity;
  var bestVisible = 0;

  for (var r = 0; r < 2; r++) {
    if (best && bestScore === 0) break;
    var fillRot = (rot + r) % PHASES.length;
    for (var a = 0; a < PHASES.length; a++) {
      for (var b = 0; b < PHASES.length; b++) {
        var pa = PHASES[(rot + a) % PHASES.length];
        var pb = PHASES[(rot + b) % PHASES.length];
        var cand = buildCandidate(spec, profile, templateId, fillRot, pa, pb,
          base, (a * PHASES.length + b));
        if (cand.accept) return cand.cards;
        if (cand.score < bestScore) {
          bestScore = cand.score; best = cand.cards; bestVisible = cand.visible;
        }
      }
    }
  }

  if (!best) throw new Error('模板 ' + templateId + ' 没有任何可用候选（相位候选全部失败）');
  throw new Error('模板 ' + templateId + ' 生成失败：' +
    TEMPLATE_CANDIDATE_ROUNDS + ' 组遮挡候选都无法同时满足「保真 + 零悬空 + 开局可点 ' +
    VISIBLE_MIN + '–' + VISIBLE_MAX + '」（最好的一组：可点 ' + bestVisible +
    '、悬空 ' + best.floatingCount + '）');
}

/**
 * 第二关「规格保真」复核（安装后 / 渲染前两道复用同一个实现）。
 *
 * 与生成时那一道的区别：这里**不复用生成时缓存的结果**，而是从 templateId + 档位
 * 重新取规格、重新展开计划，再拿**牌桌上真实的牌位**逐格比对。任何一层格集合、
 * 轮廓、区域覆盖、同层重叠、晶格、张数不符都会返回 ok=false 与 violations 明细。
 *
 * @param {Array} cards     牌桌真实牌位（含 44 张盲盒队列）
 * @param {string} templateId 本局应使用的模板
 * @param {object} profile  本局档位
 */
export function verifyTemplateFidelity(cards, templateId, profile, fillRot) {
  if (!templateId) {
    return { ok: false, templateId: '', violations: [{ code: 'NO_TEMPLATE', detail: '本局没有 templateId' }], checks: {} };
  }
  var spec;
  try {
    spec = specFor(templateId);
  } catch (e) {
    return { ok: false, templateId: templateId,
      violations: [{ code: 'BAD_TEMPLATE', detail: String(e && e.message) }], checks: {} };
  }
  if (!profile || !profile.mainCount) {
    return { ok: false, templateId: templateId,
      violations: [{ code: 'BAD_PROFILE', detail: '缺少档位信息' }], checks: {} };
  }
  var plan;
  try {
    plan = specPlan(spec, profile, { fillRot: fillRot === undefined ? 0 : (fillRot | 0) });
  } catch (e) {
    return { ok: false, templateId: templateId,
      violations: [{ code: 'PLAN_FAILED', detail: String(e && e.message) }], checks: {} };
  }
  return checkFidelity(cards, spec, plan, profile);
}

/** 单组候选：按 (fillRot, 尾段两块相位) 落牌并做全部硬校验 */
function buildCandidate(spec, profile, templateId, fillRot, pa, pb, base, salt) {
  var tailPhase = function (block) { return block === 0 ? pa : pb; };
  var plan = specPlan(spec, profile, { fillRot: fillRot, tailPhase: tailPhase });
  var main = buildMain(profile, spec, plan);

  var q = buildQueue(makeRng((base ^ Math.imul(salt + 1, 0x85ebca6b)) >>> 0), plan.layerCount,
    profile.queueCount / QUEUE_SHAPE.reduce(function (a, x) { return a + x.n; }, 0));
  if (q.total !== profile.queueCount) {
    throw new Error('模板队列张数 ' + q.total + ' ≠ 档位 ' + profile.queueCount);
  }

  var cards = main.concat(q.cards);
  cards.layerCount = plan.layerCount + q.layers;
  cards.floatingCount = countFloating(main);

  for (var ci = 0; ci < cards.length; ci++) {
    var c3 = cards[ci];
    if (c3.x % LATTICE_X !== 0 || c3.y % LATTICE_Y !== 0) {
      throw new Error('模板坐标 (' + c3.x + ',' + c3.y + ') 不在半格晶格上');
    }
    if (c3.x < BOARD_BAND.left || c3.y < BOARD_BAND.top ||
        c3.x + TILE_W > BOARD_BAND.right || c3.y + TILE_H > BOARD_BAND.bottom) {
      throw new Error('模板坐标 (' + c3.x + ',' + c3.y + ') 越出牌桌');
    }
  }
  var expect = profile.mainCount + profile.queueCount;
  if (cards.length !== expect) throw new Error('模板总张数 ' + cards.length + ' ≠ 档位 ' + expect);

  cards.sort(function (a, b) { return a.layer - b.layer || a.y - b.y || a.x - b.x; });
  for (var z = 0; z < cards.length; z++) { cards[z].id = z; cards[z].z = z; }

  var v = countVisible(cards);
  var vdev = v < VISIBLE_MIN ? VISIBLE_MIN - v : (v > VISIBLE_MAX ? v - VISIBLE_MAX : 0);
  var fidelity = null;
  var ok = false;

  /* 可点张数 / 悬空先过（便宜），再做保真校验（贵） —— 两者都过才接受 */
  if (vdev === 0 && cards.floatingCount === 0) {
    fidelity = checkFidelity(cards, spec, plan, profile);
    ok = fidelity.ok;
  }

  if (ok) {
    cards.templateId = templateId;
    cards.specSignature = spec.signature;
    /* 落牌用的 fillRot 必须跟着牌局走：计划是按 (spec, profile, fillRot) 展开的，
     * 复核时若拿默认 fillRot 重新展开，会得到「格集合同、但每层分到哪些格不同」的计划，
     * 于是 LAYER_FORM 会误判。 */
    cards.specFillRot = plan.fillRot;
    cards.fidelity = fidelity;
    cards.visible = v;
    return { accept: true, cards: cards, plan: plan, visible: v, score: 0 };
  }

  var score = cards.floatingCount * 1000 + vdev * 100 + Math.abs(v - 22) * 0.01;
  return { accept: false, cards: cards, plan: plan, visible: v, score: score };
}

/**
 * 候选统计（测试 / 诊断用）：同一 (seed, 档位, 模板) 下每个候选的
 * 开局可点数、主堆悬空数与规格保真结果。不修改任何游戏状态。
 */
export function templateCandidateStats(seed, profile, templateId) {
  var tpl = templateById(templateId);
  if (!tpl) throw new Error('未知第二关模板: ' + templateId);
  var spec = specFor(templateId);
  var base = ((seed >>> 0) ^ 0x6c32f1a7) >>> 0;
  var out = [];
  for (var r = 0; r < 2; r++) {
    for (var a = 0; a < PHASES.length; a++) {
      for (var b = 0; b < PHASES.length; b++) {
        var cand = buildCandidate(spec, profile, templateId, r, PHASES[a], PHASES[b],
          base, (a * PHASES.length + b));
        out.push({
          fillRot: r,
          visible: cand.visible,
          floating: cand.cards.floatingCount,
          fidelity: cand.accept || (cand.cards.fidelity && cand.cards.fidelity.ok) || false,
          accept: cand.accept,
          tailPhases: [PHASES[a].slice(), PHASES[b].slice()],
        });
      }
    }
  }
  return out;
}

/** 模板布局的自检摘要（测试 / 报告用） */
export function describeTemplateLayout(cards, tpl, visible) {
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  /* 主堆单独算一份包围盒：盲盒队列固定铺在下方，混在一起会把 20 套形状差异抹平 */
  var mMinX = Infinity, mMaxX = -Infinity, mMinY = Infinity, mMaxY = -Infinity;
  var layers = {};
  var regions = {};
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    if (c.x < minX) minX = c.x;
    if (c.x + TILE_W > maxX) maxX = c.x + TILE_W;
    if (c.y < minY) minY = c.y;
    if (c.y + TILE_H > maxY) maxY = c.y + TILE_H;
    if (c.seg !== 'queue') {
      if (c.x < mMinX) mMinX = c.x;
      if (c.x + TILE_W > mMaxX) mMaxX = c.x + TILE_W;
      if (c.y < mMinY) mMinY = c.y;
      if (c.y + TILE_H > mMaxY) mMaxY = c.y + TILE_H;
    }
    layers[c.layer] = (layers[c.layer] || 0) + 1;
    if (c.seg !== 'queue') regions[c.region] = (regions[c.region] || 0) + 1;
  }
  return {
    templateId: tpl.templateId,
    cards: cards.length,
    layers: Object.keys(layers).length,
    regions: Object.keys(regions).length,
    box: { w: maxX - minX, h: maxY - minY, minX: minX, minY: minY },
    mainBox: { w: mMaxX - mMinX, h: mMaxY - mMinY, minX: mMinX, minY: mMinY },
    /* 开局可点张数：优先用调用方传入的实测值，其次取生成时挂在 cards.visible 上的数 */
    visible: typeof visible === 'number' ? visible
      : (typeof cards.visible === 'number' ? cards.visible : null),
    layerSizes: layers,
    regionSizes: regions,
  };
}

export { planLayerKeys };
