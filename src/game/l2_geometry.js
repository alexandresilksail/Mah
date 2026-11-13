/**
 * 第二关模板几何生成器（50 套模板的实际落牌实现）。
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
 * 模板的 env 决定该层实际可用的列数 / 行数，shapes 决定占位格，
 * zones + trajectory 决定形状中心偏置，offsets 决定层间半格错位。
 * 相邻层继承一部分占位格，保证非底层牌都有下层支撑、不存在悬空牌，
 * 同时形成原版多层叠牌的遮挡链。seed 只决定层内细节与候选顺序。
 */
import {
  TILE_W, TILE_H, LATTICE_X, LATTICE_Y, BOARD_BAND, layerPlanFor,
} from './config.js';
import { makeRng } from './rng.js';
import { hasSupport } from './layout.js';
import {
  buildQueue, countVisible, VISIBLE_MIN, VISIBLE_MAX, QUEUE_SHAPE,
} from './layout_profiles.js';
import { templateById, ZONE_ANCHORS } from './l2_templates.js';

var X_MIN = 33;
var Y_MIN = 220;
var GRID_COLS = 9;
var GRID_ROWS = 5;

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
 */
export function templatePlanFor(profile, template) {
  var base = layerPlanFor(profile);
  var n = base.length;
  var curve = resampleCurve(template.structure.layerCurve, n);
  var plan = normalizePlan(curve, profile.mainCount);
  // 每层必须能在全局格网里放下，溢出量挪到最轻的层，总和不变
  // （windowFor 会按 need 自动扩窗，所以容量上限就是整张格网）
  var capPerLayer = GRID_COLS * GRID_ROWS;
  var guard = 0;
  var moved = true;
  while (moved && guard++ < 200) {
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
 * (biasC, biasR) 是该层形状中心，由模板区域 / 轨迹决定 —— 同一个形状
 * 落在不同区域会产生完全不同的占位格集合。
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
    case 'pyramid': return r * 4 + Math.abs(dx) / (r + 1);
    case 'fan':     return Math.abs(dx) * (rows - r) / Math.max(1, rows);
    default:        return dx * dx + dy * dy;
  }
}

/**
 * 在可用格网里选 need 个格子。
 *  · 先按形状分数排序；
 *  · 优先取 inheritN 个「上一层占位格」（保证支撑、形成多层叠压）；
 *  · 其余按形状分数补足 → 缺口位置由形状决定，轮廓显著不同；
 *  · seed 只带来 0.18 的抖动，不改变形状特征。
 */
function shapeCells(rng, need, cols, rows, shape, biasC, biasR, inherit, inheritRatio) {
  var scored = [];
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      scored.push({ c: c, r: r, k: c + ',' + r,
                    s: shapeScore(shape, c, r, cols, rows, biasC, biasR) + rng.next() * 0.18 });
    }
  }
  scored.sort(function (a, b) { return a.s - b.s || a.r - b.r || a.c - b.c; });
  var inheritN = Math.min(need, Math.floor(need * inheritRatio));
  var out = [];
  var used = {};
  if (inherit && inheritN > 0) {
    for (var i = 0; i < scored.length && out.length < inheritN; i++) {
      if (!inherit[scored[i].k]) continue;
      out.push(scored[i]);
      used[scored[i].k] = 1;
    }
  }
  for (var j = 0; j < scored.length && out.length < need; j++) {
    if (used[scored[j].k]) continue;
    out.push(scored[j]);
    used[scored[j].k] = 1;
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

/** 该层所属区域：模板 zones 池 + 轨迹共同决定 */
function zoneFor(tpl, li, n) {
  var zones = tpl.structure.zones;
  var traj = tpl.structure.trajectory;
  if (traj === 'scatter' || traj === 'dual') {
    return zones[(li + Math.floor(li / zones.length)) % zones.length];
  }
  if (traj === 'ring' || traj === 'spiral') {
    var q = Math.floor((li % n) / Math.max(1, n / 4)) % 4;
    var quad = ['nw', 'ne', 'se', 'sw'][q];
    for (var i = 0; i < zones.length; i++) if (zones[i] === quad) return quad;
    return zones[li % zones.length];
  }
  return zones[li % zones.length];
}

/**
 * 区域窗口：把 zone 锚点映射成全局 9×5 格网里的一个子矩形。
 * 不同区域（中央 / 四角 / 上下 / 左右）因此真正落在**不同坐标区间**，
 * 而不是只改一个中心参数 —— 这是 50 套模板轮廓差异的主要来源。
 * 窗口尺寸由模板 env 决定，并保证 w*h ≥ need 且不越出格网。
 */
function windowFor(zone, envCols, envRows, need) {
  var anchor = ZONE_ANCHORS[zone] || ZONE_ANCHORS.center;
  var ac = clamp(Math.round((anchor[0] - X_MIN) / TILE_W), 0, GRID_COLS - 1);
  var ar = clamp(Math.round((anchor[1] - Y_MIN) / TILE_H), 0, GRID_ROWS - 1);
  var w = clamp(envCols, 3, GRID_COLS);
  var h = clamp(envRows, 2, GRID_ROWS);
  // 至少留 2 个空格给支撑修补（修补只移动个别牌，不改张数）
  var spare = need + 2;
  if (w * h < spare) {
    h = Math.min(GRID_ROWS, Math.max(h, Math.ceil(spare / GRID_COLS)));
    w = Math.min(GRID_COLS, Math.max(w, Math.ceil(spare / h)));
  }
  var c0 = clamp(Math.round(ac - (w - 1) / 2), 0, GRID_COLS - w);
  var r0 = clamp(Math.round(ar - (h - 1) / 2), 0, GRID_ROWS - h);
  return { c0: c0, r0: r0, w: w, h: h };
}

/**
 * 形状中心偏置 (biasC, biasR)：在区域窗口内按轨迹推进，
 * 形成纵向 / 横向 / 环形 / 阶梯 / 螺旋 / 嵌套的空间分布。
 */
function biasFor(tpl, li, n, cols, rows) {
  var s = tpl.structure;
  var t = n > 1 ? li / (n - 1) : 0;
  switch (s.trajectory) {
    case 'central':
      return [clamp(Math.round(cols / 2), 0, cols - 1), clamp(Math.round(rows * t * 0.8), 0, rows - 1)];
    case 'vertical':
      return [clamp(Math.round(cols / 2 + (s.spreadX / 300) * (t - 0.5)), 0, cols - 1),
              clamp(Math.round((rows - 1) * t), 0, rows - 1)];
    case 'horizontal':
      return [clamp(Math.round((cols - 1) * t), 0, cols - 1),
              clamp(Math.round(rows / 2), 0, rows - 1)];
    case 'stair':
      return [clamp(Math.round((cols - 1) * t), 0, cols - 1),
              clamp(Math.round((rows - 1) * t), 0, rows - 1)];
    case 'ring':
      return [clamp(Math.round(cols / 2 + (cols / 2 - 1) * Math.cos(2 * Math.PI * t)), 0, cols - 1),
              clamp(Math.round(rows / 2 + (rows / 2 - 1) * Math.sin(2 * Math.PI * t)), 0, rows - 1)];
    case 'spiral':
      return [clamp(Math.round(cols / 2 + (cols / 2 - 1) * (0.3 + 0.7 * t) * Math.cos(2 * Math.PI * t * 1.6)), 0, cols - 1),
              clamp(Math.round(rows / 2 + (rows / 2 - 1) * (0.3 + 0.7 * t) * Math.sin(2 * Math.PI * t * 1.6)), 0, rows - 1)];
    case 'cross':
      return li % 2 === 0
        ? [clamp(Math.round((cols - 1) * t), 0, cols - 1), clamp(Math.round(rows / 2), 0, rows - 1)]
        : [clamp(Math.round(cols / 2), 0, cols - 1), clamp(Math.round((rows - 1) * t), 0, rows - 1)];
    case 'nest':
      return [clamp(Math.round(cols / 2 + (cols / 3) * (1 - t) * Math.cos(2 * Math.PI * t * 0.7)), 0, cols - 1),
              clamp(Math.round(rows / 2 + (rows / 3) * (1 - t) * Math.sin(2 * Math.PI * t * 0.7)), 0, rows - 1)];
    case 'asym':
      return [clamp(Math.round(cols / 2 + (li % 3 === 0 ? -1 : 1) * cols / 3), 0, cols - 1),
              clamp(Math.round((rows - 1) * t * 0.7), 0, rows - 1)];
    case 'scatter':
    case 'dual':
    default:
      return [clamp(Math.round(cols / 2), 0, cols - 1),
              clamp(Math.round(rows / 2), 0, rows - 1)];
  }
}

/* ==================== 主堆 ==================== */

function buildTemplateStack(rng, plan, tpl) {
  var s = tpl.structure;
  var n = plan.length;
  var out = [];
  var px = (s.phase[0] + rng.int(0, 1)) % 2;
  var py = (s.phase[1] + rng.int(0, 1)) % 2;
  var inheritRatio = 0.30 + s.density; // 0.40–0.46：保证支撑又不淹没形状
  var prevCells = null;

  for (var li = 0; li < n; li++) {
    var need = plan[li];
    var zone = zoneFor(tpl, li, n);
    var seg = segmentOf(li, n);
    var shape = s.shapes[li % s.shapes.length];
    var win = windowFor(zone, s.env.colsHi, s.env.rowsMax, need);
    var bias = biasFor(tpl, li, n, win.w, win.h);
    // 上一层的绝对格坐标映射到当前窗口的局部坐标，用于继承支撑格
    var localInherit = {};
    if (prevCells) {
      for (var pk in prevCells) {
        if (!Object.prototype.hasOwnProperty.call(prevCells, pk)) continue;
        var parts = pk.split(',');
        var lc = Number(parts[0]) - win.c0;
        var lr = Number(parts[1]) - win.r0;
        if (lc >= 0 && lc < win.w && lr >= 0 && lr < win.h) localInherit[lc + ',' + lr] = 1;
      }
    }
    var cells = shapeCells(rng, need, win.w, win.h, shape, bias[0], bias[1], localInherit, inheritRatio);
    if (cells.length !== need) {
      throw new Error('模板 ' + tpl.templateId + ' 第 ' + li + ' 层形状生成张数不符: ' + need);
    }
    var inherit = {};
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var absC = win.c0 + cell.c;
      var absR = win.r0 + cell.r;
      out.push({
        x: X_MIN + absC * TILE_W + px * LATTICE_X,
        y: Y_MIN + absR * TILE_H + py * LATTICE_Y,
        layer: li,
        region: zone,
        zoneLayer: li,
        seg: seg,
        gridW: win.w,
        gridH: win.h,
        gaps: (win.w * win.h - need) / (win.w * win.h),
        pinned: '',
      });
      inherit[absC + ',' + absR] = 1;
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
 * 形状 / 区域窗口造成的少量无支撑牌，会被移到**同一层**里最近的一个
 * 「有支撑且不与同层其它牌重合」的格位。
 *
 * 只改个别牌的落点，不改总张数、层数、区域、队列与三消规则，
 * 也不是给整堆加固定偏移；修完仍由 buildOnce 统一重排 z 全序。
 * @returns {number} 未能修补的悬空牌数（正常应为 0）
 */
function repairSupport(cards) {
  var byLayer = {};
  var maxLayer = 0;
  for (var i = 0; i < cards.length; i++) {
    var li = cards[i].layer;
    if (!byLayer[li]) byLayer[li] = [];
    byLayer[li].push(cards[i]);
    if (li > maxLayer) maxLayer = li;
  }
  var lower = (byLayer[0] || []).slice(); // 底层牌不需要支撑，但它们是上层的支撑来源
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
      // 4 种半格相位 × 9×5 格网，按「离原位最近」排序
      for (var ph = 0; ph < 4; ph++) {
        var dx2 = (ph % 2) * LATTICE_X;
        var dy2 = Math.floor(ph / 2) * LATTICE_Y;
        for (var gc = 0; gc < GRID_COLS; gc++) {
          for (var gr = 0; gr < GRID_ROWS; gr++) {
            cands.push({
              x: X_MIN + gc * TILE_W + dx2,
              y: Y_MIN + gr * TILE_H + dy2,
              d: Math.abs(gc - oc) + Math.abs(gr - orow) +
                 (dx2 === dx0 ? 0 : 1) + (dy2 === dy0 ? 0 : 1),
            });
          }
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
        // 同层严格零重叠（不只是 <10%）
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
  var floating = repairSupport(out);
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
 * 只换候选内部随机相位，不改模板结构、档位牌数、层数或队列规则。
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
