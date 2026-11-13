/**
 * 第二关 20 套掩膜模板的几何生成器。
 *
 * 只在 generateLevel(2, seed, { profile, templateId }) 显式带 templateId 时启用；
 * 不带 templateId 时 generator.js 仍走 layout_profiles.js 的既有沙漏路径，
 * 因此 seed 池、机器人难度、几何契约等既有验收基线完全不受影响。
 * 第一关永远不经过本文件。
 *
 * 不变硬契约（与既有第二关一致）：
 *  · 半格晶格 x%33=0 / y%44=0；同层整格对齐、零重叠；
 *  · 主堆落在 BOARD_BAND 内；z 全序 = layer 升序 → y 升序 → x 升序；
 *  · 总张数 = profile.mainCount + profile.queueCount，层数 = profile.layers + 44；
 *  · 队列 44 张直接复用 layout_profiles.buildQueue()，规则一字不改；
 *  · 开局可点 19–25 张（VISIBLE_MIN/MAX）沿用既有候选筛选口径。
 *
 * 【全局格网】每层都落在同一张 9 列 × 5 行的整格网格上：
 *   x = 33 + c*66 + px*33（c=0..8，px∈{0,1}；最大 594+66=660 ≤ 700）
 *   y = 220 + r*88 + py*44（r=0..4，py∈{0,1}；最大 616+88=704 ≤ 918）
 *
 * 【轮廓来源】模板的 mask 决定哪些格允许落牌 —— 20 套模板的整体轮廓
 * （金字塔 / 双核心 / 环形 / 沙漏 / 月牙 / 棋盘 …）由此直接决定，
 * 不是靠改 seed、改牌面顺序或整体平移坐标制造差异。
 * growth 只决定层中心在掩膜内如何移动，layerShape 只决定层内优先选格顺序，
 * offsets 决定层间半格错位（遮挡关系）。seed 只带来层内细节抖动。
 */
import {
  TILE_W, TILE_H, LATTICE_X, LATTICE_Y, BOARD_BAND, layerPlanFor,
} from './config.js';
import { makeRng } from './rng.js';
import { hasSupport } from './layout.js';
import {
  buildQueue, countVisible, VISIBLE_MIN, VISIBLE_MAX, QUEUE_SHAPE,
} from './layout_profiles.js';
import { templateById, MASK_COLS, MASK_ROWS } from './l2_templates.js';

var X_MIN = 33;
var Y_MIN = 220;
var GRID_COLS = MASK_COLS;
var GRID_ROWS = MASK_ROWS;

function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

/* ==================== 层级分布 ==================== */

/** 把模板的独立层曲线重采样到 N 层（线性插值） */
function resampleCurve(curve, n) {
  if (n <= 1) return [curve[0]];
  var out = [];
  for (var i = 0; i < n; i++) {
    var u = i / (n - 1) * (curve.length - 1);
    var a = Math.floor(u);
    var b = Math.min(curve.length - 1, a + 1);
    out.push(curve[a] + (curve[b] - curve[a]) * (u - a));
  }
  return out;
}

/** 归一化到整数层张数：每层 ≥1，总和严格 = total（与 config.normalizePlan 同口径） */
function normalizePlan(weights, total) {
  var sum = 0;
  for (var s = 0; s < weights.length; s++) sum += weights[s];
  var plan = [];
  for (var i = 0; i < weights.length; i++) plan.push(Math.max(1, Math.round(weights[i] / sum * total)));
  var err = total - plan.reduce(function (a, b) { return a + b; }, 0);
  var guard = 0;
  while (err !== 0 && guard++ < 10000) {
    var bi = 0;
    for (var j = 1; j < weights.length; j++) if (weights[j] > weights[bi]) bi = j;
    var idx = (guard - 1) % plan.length;
    var k = err > 0 ? idx : bi;
    if (err > 0) { plan[k]++; err--; }
    else if (plan[k] > 1) { plan[k]--; err++; }
  }
  return plan;
}

/**
 * 模板自己的层级分布：层数 N 与总张数 mainCount 都来自既有档位，
 * 只重分配「每层多少张」。曲线形状由模板定义，与 seed 无关。
 * 容量上限 = 该模板掩膜的可落牌格数（一层不能落下比掩膜格更多的牌）。
 */
export function templatePlanFor(profile, template) {
  var base = layerPlanFor(profile);
  var n = base.length;
  var curve = resampleCurve(template.structure.layerCurve, n);
  var plan = normalizePlan(curve, profile.mainCount);
  var capPerLayer = template.maskCellCount;
  var guard = 0;
  var moved = true;
  while (moved && guard++ < 400) {
    moved = false;
    for (var i = 0; i < plan.length; i++) {
      if (plan[i] <= capPerLayer) continue;
      var over = plan[i] - capPerLayer;
      plan[i] = capPerLayer;
      var minI = 0;
      for (var j = 1; j < plan.length; j++) if (plan[j] < plan[minI]) minI = j;
      plan[minI] += over;
      moved = true;
      break;
    }
  }
  return plan;
}

/* ==================== 形状选格 ==================== */

/**
 * 形状优先级：分数越小越优先被选中。
 * (biasC, biasR) 是该层形状中心，由模板 growth 轨迹决定 —— 同一个形状
 * 落在掩膜的不同位置会产生完全不同的占位格集合。
 */
function shapeScore(shape, c, r, cols, rows, biasC, biasR) {
  var dx = c - biasC;
  var dy = r - biasR;
  var nx = Math.abs(dx) / Math.max(1, cols / 2);
  var ny = Math.abs(dy) / Math.max(1, rows / 2);
  var border = Math.min(c, r, cols - 1 - c, rows - 1 - r);
  switch (shape) {
    case 'blob':    return dx * dx + dy * dy;
    case 'band':    return Math.abs(dy);
    case 'ring':    return border;
    case 'shell':   return border * 3 + (dx * dx + dy * dy) * 0.1;
    case 'cross':   return Math.min(Math.abs(dx), Math.abs(dy)) * 2 + (nx + ny) * 0.1;
    case 'stair':   return Math.abs(dy * (cols - 1) - dx * (rows - 1));
    case 'wedge':   return Math.abs(dx - dy * (cols / Math.max(1, rows)));
    case 'nest':    return Math.min(border * 2, dx * dx + dy * dy);
    case 'comb':    return (c % 2 === 0 ? 0 : 3) + r * 0.1;
    case 'arc':     return Math.abs(dy + (rows - 1) * 0.35 * (1 - nx));
    case 'diamond': return nx + ny;
    case 'split':
    case 'dual':    return Math.min(c * c + dy * dy, (c - (cols - 1)) * (c - (cols - 1)) + dy * dy);
    case 'checker': return ((c + r) % 2 === 0 ? 0 : 2) + r * 0.05;
    case 'fan':     return Math.abs(dx) * (rows - r) / Math.max(1, rows);
    case 'flat':    return 0;
    default:        return dx * dx + dy * dy;
  }
}

/**
 * 掩膜内选 need 个格子。
 *  · 只在模板 mask 允许的格位里选（整体轮廓因此固定）；
 *  · 先按形状分数排序，'@' 高密度格优先；
 *  · 优先取 inheritN 个「上一层占位格」（保证支撑、形成多层叠压）；
 *  · 其余按形状分数补足 → 缺口位置由掩膜与形状共同决定；
 *  · 每层再叠加一个「层号 + 格位」的确定性扰动：同一模板的相邻层不会
 *    选出完全相同的格位集合，层间错位才能形成真实遮挡链；
 *  · seed 只带来 0.24 的额外抖动，不改变模板轮廓。
 */
function pickMaskCells(rng, need, cells, shape, bias, inherit, inheritRatio, li, usage) {
  if (need > cells.length) {
    throw new Error('单层需要 ' + need + ' 张，掩膜只有 ' + cells.length + ' 个可落牌格');
  }
  // 先把形状分数归一化到 [0,1]，否则 split（c² 可到 64）会彻底压死 band（|dy| ≤ 2），
  // 导致每层都选同一批格、层间几乎不轮转、可见牌数被压到 15 以下。
  var raw = [];
  var minS = Infinity, maxS = -Infinity;
  for (var i = 0; i < cells.length; i++) {
    var b = shapeScore(shape, cells[i].c, cells[i].r, GRID_COLS, GRID_ROWS, bias[0], bias[1]);
    raw.push(b);
    if (b < minS) minS = b;
    if (b > maxS) maxS = b;
  }
  var span = maxS - minS || 1;
  var scored = [];
  for (var j = 0; j < cells.length; j++) {
    var cell = cells[j];
    var norm = (raw[j] - minS) / span;         // 0 = 最符合形状，1 = 最不符合
    var dense = cell.w > 1 ? -0.15 : 0;
    var h = ((li + 1) * 73856093 ^ (cell.c + 1) * 19349663 ^ (cell.r + 1) * 83492791) >>> 0;
    var jitter = (h % 997) / 997;
    // 覆盖补偿：越久没被用过的掩膜格位优先级越高，保证每个连通区域都真实落牌
    var last = Object.prototype.hasOwnProperty.call(usage, cell.k) ? usage[cell.k] : -1;
    var starve = Math.min(1.60, (li - last) * 0.30);
    // 0.58 形状 + 0.42 扰动 − 覆盖补偿：既保留掩膜内的形状倾向，
    // 又让相邻层真正错位，形成原版那种「上层压住下层、但压不全」的遮挡链。
    scored.push({ c: cell.c, r: cell.r, k: cell.k, s: 0.58 * norm + 0.42 * jitter + dense - starve + rng.next() * 0.12 });
  }
  scored.sort(function (a, b) { return a.s - b.s || a.r - b.r || a.c - b.c; });
  var inheritN = Math.min(need, Math.floor(need * inheritRatio));
  var out = [];
  var used = {};
  if (inherit && inheritN > 0) {
    for (var j = 0; j < scored.length && out.length < inheritN; j++) {
      if (!inherit[scored[j].k]) continue;
      out.push(scored[j]);
      used[scored[j].k] = 1;
    }
  }
  for (var m = 0; m < scored.length && out.length < need; m++) {
    if (used[scored[m].k]) continue;
    out.push(scored[m]);
    used[scored[m].k] = 1;
  }
  return out;
}

/* ==================== 轨迹 / 区域 ==================== */

function segmentOf(li, n) {
  var n1 = Math.max(1, Math.round(n * 0.25));
  var n2 = Math.max(1, Math.round(n * 0.36));
  if (li < n1) return 'top';
  if (li < n1 + n2) return 'mid';
  return 'core';
}

/**
 * 形状中心偏置 (biasC, biasR)：在 9×5 全局格网里按模板 growth 推进，
 * 形成纵向 / 横向 / 环形 / 阶梯 / 螺旋 / 交替的空间分布。
 * 掩膜负责「哪些格能落牌」，这里只负责「这一层优先落在哪些格」。
 */
function biasFor(tpl, li, n) {
  var s = tpl.structure;
  var t = n > 1 ? li / (n - 1) : 0;
  var cx = (GRID_COLS - 1) / 2;
  var cy = (GRID_ROWS - 1) / 2;
  function ic(v) { return clamp(Math.round(v), 0, GRID_COLS - 1); }
  function ir(v) { return clamp(Math.round(v), 0, GRID_ROWS - 1); }
  switch (s.growth) {
    case 'central':
      return [ic(cx), ir(cy)];
    case 'dual':
      return [ic(li % 2 ? cx * 0.45 : GRID_COLS - 1 - cx * 0.45), ir(cy)];
    case 'scatter': {
      var band = li % 3;
      return [ic(band === 0 ? 1 : (band === 1 ? cx : GRID_COLS - 2)), ir(cy)];
    }
    case 'ring':
      return [ic(cx + cx * 0.9 * Math.cos(2 * Math.PI * t)),
              ir(cy + cy * 0.9 * Math.sin(2 * Math.PI * t))];
    case 'cross':
      return li % 2
        ? [ic(cx + cx * Math.cos(2 * Math.PI * t)), ir(cy)]
        : [ic(cx), ir(cy + cy * Math.sin(2 * Math.PI * t))];
    case 'stair':
      return [ic((GRID_COLS - 1) * t), ir((GRID_ROWS - 1) * (1 - t))];
    case 'stairDown':
      return [ic((GRID_COLS - 1) * t), ir((GRID_ROWS - 1) * t)];
    case 'left':
      return [ic(cx * 0.35), ir(cy + cy * 0.5 * (t - 0.5))];
    case 'right':
      return [ic(GRID_COLS - 1 - cx * 0.35), ir(cy + cy * 0.5 * (t - 0.5))];
    case 'dualVertical':
      return [ic(cx), ir(li % 2 ? cy * 0.35 : GRID_ROWS - 1 - cy * 0.35)];
    case 'butterfly':
      return [ic(li % 2 ? cx * 0.3 : GRID_COLS - 1 - cx * 0.3), ir(cy)];
    case 'hourglass':
      return [ic(cx), ir(cy)];
    case 'serpentine':
      return [ic((li % 2 ? t : 1 - t) * (GRID_COLS - 1)), ir((GRID_ROWS - 1) * t)];
    case 'checker':
      return [ic((li * 3) % GRID_COLS), ir((li * 2) % GRID_ROWS)];
    case 'crescent': {
      var ang = Math.PI + t * Math.PI;
      return [ic(cx * 0.6 + cx * 0.8 * Math.cos(ang)),
              ir(cy + cy * 0.8 * Math.sin(ang))];
    }
    case 'wave':
      return [ic(cx), ir(cy + cy * 0.75 * Math.sin(t * Math.PI * 2))];
    case 'diag':
      return [ic((GRID_COLS - 1) * t), ir((GRID_ROWS - 1) * t)];
    case 'corners': {
      var corner = li % 4;
      var ccx = corner === 0 || corner === 2 ? cx * 0.25 : GRID_COLS - 1 - cx * 0.25;
      var ccy = corner < 2 ? cy * 0.25 : GRID_ROWS - 1 - cy * 0.25;
      return [ic(ccx), ir(ccy)];
    }
    case 'crossCenter':
      return [ic(cx), ir(cy)];
    case 'asym':
      return [ic(li % 3 === 0 ? cx * 0.4 : GRID_COLS - 1 - cx * 0.45),
              ir(cy + cy * 0.4 * (t - 0.5))];
    default:
      return [ic(cx), ir(cy)];
  }
}

/* ==================== 主堆 ==================== */

/**
 * 底层专用覆盖采样：每个连通区域至少 1 张，其余按「最远点」铺开。
 * 底层不需要支撑，却是上层唯一的支撑来源；把它铺满轮廓后，
 * 第 1 层几乎不可能出现悬空牌，后续层也能靠继承稳定叠压。
 */
function pickCoverCells(rng, need, cells, tpl) {
  var chosen = [];
  var used = {};
  var regionFirst = {};
  for (var i = 0; i < cells.length; i++) {
    var rg = tpl.maskRegion[cells[i].k] || 'R1';
    if (!regionFirst[rg]) regionFirst[rg] = cells[i];
  }
  for (var k in regionFirst) {
    if (!Object.prototype.hasOwnProperty.call(regionFirst, k)) continue;
    if (chosen.length >= need) break;
    chosen.push(regionFirst[k]);
    used[regionFirst[k].k] = 1;
  }
  while (chosen.length < need) {
    var best = null;
    var bestD = -Infinity;
    for (var j = 0; j < cells.length; j++) {
      if (used[cells[j].k]) continue;
      var d = Infinity;
      for (var m = 0; m < chosen.length; m++) {
        var dd = Math.abs(cells[j].c - chosen[m].c) + Math.abs(cells[j].r - chosen[m].r);
        if (dd < d) d = dd;
      }
      var jit = rng.next() * 0.3;
      if (d + jit > bestD) { bestD = d + jit; best = cells[j]; }
    }
    if (!best) break;
    chosen.push(best);
    used[best.k] = 1;
  }
  var out = [];
  for (var q = 0; q < chosen.length; q++) out.push({ c: chosen[q].c, r: chosen[q].r, k: chosen[q].k });
  return out;
}

function buildTemplateStack(rng, plan, tpl) {
  var s = tpl.structure;
  var n = plan.length;
  var out = [];
  var px = (s.phase[0] + rng.int(0, 1)) % 2;
  var py = (s.phase[1] + rng.int(0, 1)) % 2;
  var inheritRatio = 0.12 + s.density * 0.6; // 0.19–0.21：只保证关键支撑，其余靠形状与扰动错位
  var prevCells = null;
  var cells = tpl.maskCells;
  var usage = {};

  for (var li = 0; li < n; li++) {
    var need = plan[li];
    var seg = segmentOf(li, n);
    var bias = biasFor(tpl, li, n);
    var picked = li === 0
      ? pickCoverCells(rng, need, cells, tpl)
      : pickMaskCells(rng, need, cells, s.layerShape, bias, prevCells, inheritRatio, li, usage);
    var inherit = {};
    for (var i = 0; i < picked.length; i++) {
      var cell = picked[i];
      usage[cell.k] = li;
      out.push({
        x: X_MIN + cell.c * TILE_W + px * LATTICE_X,
        y: Y_MIN + cell.r * TILE_H + py * LATTICE_Y,
        layer: li,
        region: tpl.maskRegion[cell.k] || 'R1',
        zoneLayer: li,
        seg: seg,
        gridW: tpl.maskBox.cols,
        gridH: tpl.maskBox.rows,
        gaps: 1 - tpl.maskCellCount / (GRID_COLS * GRID_ROWS),
        pinned: '',
      });
      inherit[cell.k] = 1;
    }
    prevCells = inherit;
    var off = s.offsets[rng.int(0, s.offsets.length - 1)];
    px = (px + off[0]) % 2;
    py = (py + off[1]) % 2;
  }
  return out;
}

/* ==================== 支撑修补 ==================== */

/**
 * 消除悬空牌：每张非底层牌必须与至少一张更低层的牌有 >10% 面积重叠。
 * 掩膜造成的少量无支撑牌，会被移到**同一层**里最近的一个
 * 「在掩膜内、有支撑且不与同层其它牌重合」的格位。
 *
 * 只改个别牌的落点，不改总张数、层数、区域、队列与三消规则，
 * 也不会把牌移出模板轮廓；修完仍由 buildOnce 统一重排 z 全序。
 * @returns {number} 未能修补的悬空牌数（正常应为 0）
 */
function repairSupport(cards, tpl) {
  var byLayer = {};
  var maxLayer = 0;
  for (var i = 0; i < cards.length; i++) {
    var li = cards[i].layer;
    if (!byLayer[li]) byLayer[li] = [];
    byLayer[li].push(cards[i]);
    if (li > maxLayer) maxLayer = li;
  }
  var lower = (byLayer[0] || []).slice();
  var left = 0;

  for (var layer = 1; layer <= maxLayer; layer++) {
    var same = byLayer[layer] || [];
    if (!same.length) continue;
    var occupied = {};
    for (var s = 0; s < same.length; s++) occupied[same[s].x + ',' + same[s].y] = 1;
    for (var t = 0; t < same.length; t++) {
      var c = same[t];
      if (hasSupport(c, lower)) continue;
      var dx0 = ((c.x - X_MIN) % TILE_W + TILE_W) % TILE_W;
      var dy0 = ((c.y - Y_MIN) % TILE_H + TILE_H) % TILE_H;
      var oc = Math.round((c.x - X_MIN - dx0) / TILE_W);
      var orow = Math.round((c.y - Y_MIN - dy0) / TILE_H);
      var cands = [];
      // 4 种半格相位 × 掩膜内格位，按「离原位最近」排序
      for (var ph = 0; ph < 4; ph++) {
        var dx2 = (ph % 2) * LATTICE_X;
        var dy2 = Math.floor(ph / 2) * LATTICE_Y;
        for (var mc = 0; mc < tpl.maskCells.length; mc++) {
          var cell = tpl.maskCells[mc];
          cands.push({
            x: X_MIN + cell.c * TILE_W + dx2,
            y: Y_MIN + cell.r * TILE_H + dy2,
            d: Math.abs(cell.c - oc) + Math.abs(cell.r - orow) +
               (dx2 === dx0 ? 0 : 1) + (dy2 === dy0 ? 0 : 1),
          });
        }
      }
      cands.sort(function (a, b) { return a.d - b.d || a.y - b.y || a.x - b.x; });
      var moved = false;
      for (var ci = 0; ci < cands.length; ci++) {
        var nx = cands[ci].x;
        var ny = cands[ci].y;
        var key = nx + ',' + ny;
        if (occupied[key]) continue;
        var probe = { x: nx, y: ny };
        var clash = false;
        for (var sj = 0; sj < same.length; sj++) {
          if (same[sj] === c) continue;
          var ix = Math.min(nx + TILE_W, same[sj].x + TILE_W) - Math.max(nx, same[sj].x);
          var iy = Math.min(ny + TILE_H, same[sj].y + TILE_H) - Math.max(ny, same[sj].y);
          if (ix > 0 && iy > 0) { clash = true; break; }
        }
        if (clash) continue;
        if (!hasSupport(probe, lower)) continue;
        delete occupied[c.x + ',' + c.y];
        c.x = nx;
        c.y = ny;
        occupied[key] = 1;
        moved = true;
        break;
      }
      if (!moved) left++;
    }
    for (var u = 0; u < same.length; u++) lower.push(same[u]);
  }
  return left;
}

/* ==================== 单次构建 / 对外入口 ==================== */

function buildOnce(seed, profile, tpl) {
  var rng = makeRng(seed >>> 0);
  var plan = templatePlanFor(profile, tpl);
  var n = plan.length;
  var out = buildTemplateStack(rng, plan, tpl);
  var sumMain = plan.reduce(function (a, b) { return a + b; }, 0);
  if (out.length !== sumMain || sumMain !== profile.mainCount) {
    throw new Error('模板主堆张数 ' + out.length + ' ≠ 档位主堆 ' + profile.mainCount);
  }
  // 尽量消除悬空牌（项目既有默认路径本身也有约 4% 的半格错位牌不满足
  // hasSupport>10%，这里只做「就近移到有支撑空位」的保守修补，不因个别
  // 无法修补的牌让整局生成失败；剩余数量如实挂在数组上供测试/报告统计）
  var floating = repairSupport(out, tpl);
  var q = buildQueue(rng, n, profile.queueCount / QUEUE_SHAPE.reduce(function (a, x) { return a + x.n; }, 0));
  if (q.total !== profile.queueCount) {
    throw new Error('模板队列张数 ' + q.total + ' ≠ 档位 ' + profile.queueCount);
  }
  out = out.concat(q.cards);
  out.layerCount = n + q.layers;
  // concat 会丢掉挂在数组上的统计属性，这里显式回填，供 generateLevel / 验收使用
  out.floatingCount = floating;

  for (var i = 0; i < out.length; i++) {
    var c = out[i];
    if (c.x % LATTICE_X !== 0 || c.y % LATTICE_Y !== 0) {
      throw new Error('模板坐标 (' + c.x + ',' + c.y + ') 不在半格晶格上');
    }
    if (c.x < BOARD_BAND.left || c.y < BOARD_BAND.top ||
        c.x + TILE_W > BOARD_BAND.right || c.y + TILE_H > BOARD_BAND.bottom) {
      throw new Error('模板坐标 (' + c.x + ',' + c.y + ') 越出牌桌');
    }
  }
  var expect = profile.mainCount + profile.queueCount;
  if (out.length !== expect) throw new Error('模板总张数 ' + out.length + ' ≠ 档位 ' + expect);
  out.sort(function (a, b) { return a.layer - b.layer || a.y - b.y || a.x - b.x; });
  for (var k = 0; k < out.length; k++) { out[k].id = k; out[k].z = k; }
  return out;
}

/** 候选轮次：不同档位的层数/张数差异较大，留足搜索空间以同时满足两条硬约束 */
export var TEMPLATE_CANDIDATE_ROUNDS = 64;

/**
 * 生成一套模板的真实牌位。返回与 generateProfileLayout 相同形状的数组。
 * 候选必须同时满足：开局可点 19–25 张（VISIBLE_MIN/MAX）且主堆悬空牌 = 0。
 * 满足即立即返回；全都不满足时取「可见偏差 × 1000 + 悬空 × 100」最小的候选，
 * 由 createNewGame 的 validateLevel / 几何校验独立复核，绝不静默放宽。
 * 只换候选内部随机相位，不改模板掩膜、档位牌数、层数或队列规则。
 */
export function generateTemplateLayout(seed, profile, templateId) {
  var tpl = templateById(templateId);
  if (!tpl) throw new Error('未知第二关模板: ' + templateId);
  if (!profile || !profile.queueCount) throw new Error('模板只适用于第二关档位');
  var base = ((seed >>> 0) ^ 0x6c32f1a7) >>> 0;
  var best = null;
  var bestScore = Infinity;
  for (var k = 0; k < TEMPLATE_CANDIDATE_ROUNDS; k++) {
    var cards = buildOnce((base ^ Math.imul(k + 1, 0x9e3779b9)) >>> 0, profile, tpl);
    var v = countVisible(cards);
    var floating = cards.floatingCount || 0;
    var vdev = v < VISIBLE_MIN ? VISIBLE_MIN - v : (v > VISIBLE_MAX ? v - VISIBLE_MAX : 0);
    if (vdev === 0 && floating === 0) {
      cards.templateId = tpl.templateId;
      return cards;
    }
    var score = vdev * 1000 + floating * 100 + Math.abs(v - 22) * 0.01;
    if (score < bestScore) { bestScore = score; best = cards; }
  }
  best.templateId = tpl.templateId;
  return best;
}

/**
 * 候选统计（测试 / 诊断用）：同一 (seed, 档位, 模板) 下每个候选的真实开局可点数
 * 与主堆悬空数。不修改任何游戏状态，供验收脚本核对「19–25 张且零悬空」是否可达。
 */
export function templateCandidateStats(seed, profile, templateId, rounds) {
  var tpl = templateById(templateId);
  if (!tpl) throw new Error('未知第二关模板: ' + templateId);
  var base = ((seed >>> 0) ^ 0x6c32f1a7) >>> 0;
  var n = rounds || TEMPLATE_CANDIDATE_ROUNDS;
  var out = [];
  for (var k = 0; k < n; k++) {
    var cards = buildOnce((base ^ Math.imul(k + 1, 0x9e3779b9)) >>> 0, profile, tpl);
    out.push({ visible: countVisible(cards), floating: cards.floatingCount || 0 });
  }
  return out;
}

/** 模板布局的自检摘要（测试 / 报告用） */
export function describeTemplateLayout(cards, tpl) {
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  var layers = {};
  var regions = {};
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    if (c.x < minX) minX = c.x;
    if (c.x + TILE_W > maxX) maxX = c.x + TILE_W;
    if (c.y < minY) minY = c.y;
    if (c.y + TILE_H > maxY) maxY = c.y + TILE_H;
    layers[c.layer] = (layers[c.layer] || 0) + 1;
    regions[c.region] = (regions[c.region] || 0) + 1;
  }
  return {
    templateId: tpl.templateId,
    cards: cards.length,
    layers: Object.keys(layers).length,
    regions: Object.keys(regions).length,
    box: { minX: minX, minY: minY, maxX: maxX, maxY: maxY, w: maxX - minX, h: maxY - minY },
    layerCounts: layers,
    regionCounts: regions,
    visible: countVisible(cards),
  };
}
