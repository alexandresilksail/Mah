/**
 * 第二关 20 套布局模板（唯一结构定义源）。
 *
 * 【参考口径】原版《羊了个羊》第二关的内部数据无法获取，本文件只以**可观察到的
 * 布局特征**为参考（多层叠牌、区域组合、轮廓收放、层间半格错位遮挡），
 * 不声称精确复刻原版算法，也不含任何从原版导出的坐标数据。
 *
 * 【模板 = 全局轮廓掩膜 + 成长参数，不是随机种子 / 牌面顺序 / 坐标微调】
 * 每套模板都用一张 9 列 × 5 行的**显式掩膜**描述它在牌桌上的整体轮廓：
 *   '#' 可落牌格、'@' 高密度格、'.' 禁止落牌格。
 * 掩膜的连通分量就是该模板的「区域结构」（region 字段），
 * 因此双核心 = 2 个分量、三岛屿 = 3 个、四角围合 = 4 个、环形 = 1 个连通环。
 *
 * 其余结构参数：
 *   · growth      : 层中心随高度变化的轨迹（决定层间空间分布，不改变掩膜轮廓）
 *   · layerShape  : 每层在掩膜内选格的形状偏好（blob / band / ring / cross …）
 *   · layerCurve  : 独立层级分布曲线（重采样到 N 层后归一化到 mainCount）
 *   · offsets     : 层间半格错位向量（决定遮挡关系）
 *   · density     : 继承上一层格位的比例基准（保证支撑、形成叠压）
 *   · phase       : 初始半格相位
 *
 * 20 套的 structureSignature 两两不同；seed 只在**同一套模板内部**决定
 * 层内抖动与队列偏移，绝不用于制造模板之间的差异。
 *
 * 【冻结边界】本文件只被第二关路径引用；第一关不 import、不读取、不受影响。
 *
 * 【牌数配置】模板只决定「每层在掩膜里的哪些格落牌」，总张数 / 层数 / 牌种数 /
 * 44 张盲盒队列 / 三消规则全部沿用 config.js 的既有档位，一个都不改。
 */
import { sha256Hex } from './sha256.js';

/* 9 列 × 5 行的全局格网（与 l2_geometry.js 的 X_MIN/Y_MIN/TILE_W/TILE_H 对应） */
export const MASK_COLS = 9;
export const MASK_ROWS = 5;

/* ==================== 形状族（仅用于报告分组） ==================== */

export const TEMPLATE_CATEGORIES = [
  { key: 'core', label: '核心聚拢型', feature: '主堆围绕一个或两个核心收拢叠压' },
  { key: 'island', label: '多岛分离型', feature: '多个互不相连的牌岛并立，中间留空' },
  { key: 'frame', label: '围合环抱型', feature: '外围环绕或双向收束，中心形成空心/窄腰' },
  { key: 'dir', label: '单向偏置型', feature: '整体偏向一侧或沿对角线逐级递进' },
  { key: 'grid', label: '格网迷宫型', feature: '交错小堆 / 曲折通道，遮挡链细碎' },
  { key: 'wave', label: '起伏异形型', feature: '轮廓高低起伏或弯月收束' },
  { key: 'irregular', label: '不规则大陆型', feature: '不对称、多凸起、多凹陷的整体轮廓' },
];

/* 层级分布曲线：重采样到 N 层后归一化，总和恒等于 profile.mainCount */
const CURVES = {
  flat: [1, 1, 1, 1, 1],
  rise: [1, 1.35, 1.7, 2.1, 2.5],
  fall: [2.5, 2.1, 1.7, 1.35, 1],
  arch: [1, 1.6, 2.2, 1.6, 1],
  valley: [2.2, 1.6, 1, 1.6, 2.2],
  dualpeak: [2, 1, 2, 1, 2],
  saw: [1, 2, 1, 2, 1],
  plateau: [1, 2, 2, 2, 1],
};

/* 半格错位向量集合（px, py 各按 2 取模） */
const OFFSETS = {
  diag: [[1, 1], [0, 1], [1, 0]],
  vert: [[0, 1], [0, 1], [1, 1]],
  horiz: [[1, 0], [1, 0], [0, 1]],
  alt: [[1, 1], [1, 1], [0, 0]],
  cross: [[1, 0], [0, 1], [1, 1], [0, 0]],
};

/* ==================== 20 套显式轮廓掩膜 ==================== */

/**
 * 20 套形状定义。
 *  mask      : 5 行 × 9 列字符串，'#' 可落牌，'@' 高密度，'.' 禁止
 *  growth    : 层中心轨迹
 *  layerShape: 层内选格形状
 *  curve     : 层级分布曲线
 *  offsets / density / phase : 遮挡与继承参数
 */
var DEFS = [
  /* 1. 中心金字塔：底宽顶窄、中央集中 */
  ['L2-P01', 'core', '中心金字塔', {
    mask: ['...###...', '..#####..', '.#######.', '#########', '#########'],
    growth: 'central', layerShape: 'pyramid', curve: 'rise', offsets: 'diag',
    density: 0.12, phase: [0, 0],
    feature: '底座铺满全宽、逐层向中央收拢，形成正金字塔',
  }],

  /* 2. 双核心：左右两个独立主牌堆，中间留空 */
  ['L2-P02', 'core', '双核心', {
    mask: ['####.####', '####.####', '####.####', '####.####', '####.####'],
    growth: 'dual', layerShape: 'split', curve: 'arch', offsets: 'vert',
    density: 0.12, phase: [1, 0],
    feature: '左右各一座 4×5 主牌堆，中间整列留空',
  }],

  /* 3. 三岛屿：左、中、右三个独立牌堆 */
  ['L2-P03', 'island', '三岛屿', {
    mask: ['##.##.##.', '##.##.##.', '##.##.##.', '##.##.##.', '##.##.##.'],
    growth: 'scatter', layerShape: 'split', curve: 'flat', offsets: 'diag',
    density: 0.13, phase: [0, 1],
    feature: '三座 2×5 牌岛并立，岛间整列断开',
  }],

  /* 4. 环形围绕：外围环绕，中间空心 */
  ['L2-P04', 'frame', '环形围绕', {
    mask: ['#########', '##.....##', '##.....##', '##.....##', '#########'],
    growth: 'ring', layerShape: 'ring', curve: 'flat', offsets: 'cross',
    density: 0.11, phase: [0, 0],
    feature: '外圈闭合成环，中心 5×3 完全空心',
  }],

  /* 5. 十字交叉：横向与纵向主体交叠 */
  ['L2-P05', 'frame', '十字交叉', {
    mask: ['...###...', '#########', '#########', '#########', '...###...'],
    growth: 'cross', layerShape: 'cross', curve: 'plateau', offsets: 'cross',
    density: 0.11, phase: [1, 1],
    feature: '中间三行全宽横臂 + 中列贯穿三行的竖臂',
  }],

  /* 6. 阶梯上升：左下 → 右上逐级递增 */
  ['L2-P06', 'dir', '阶梯上升', {
    mask: ['....####.', '..######.', '.########', '#####....', '####.....'],
    growth: 'stair', layerShape: 'stair', curve: 'rise', offsets: 'diag',
    density: 0.12, phase: [0, 0],
    feature: '斜向 3 格宽带自左下抬升到右上，台阶式轮廓',
  }],

  /* 7. 阶梯下降：左上 → 右下逐级递减 */
  ['L2-P07', 'dir', '阶梯下降', {
    mask: ['.####....', '.######..', '########.', '....#####', '.....####'],
    growth: 'stairDown', layerShape: 'stair', curve: 'fall', offsets: 'alt',
    density: 0.12, phase: [1, 0],
    feature: '斜向 3 格宽带自左上下降到右下，与上升阶梯镜像',
  }],

  /* 8. 左侧巨塔：左侧高密度，右侧分散 */
  ['L2-P08', 'dir', '左侧巨塔', {
    mask: ['####.....', '######...', '#######..', '#########', '######...'],
    growth: 'left', layerShape: 'blob', curve: 'rise', offsets: 'vert',
    density: 0.13, phase: [0, 1],
    feature: '左 4 列厚实，向右逐层收窄，右下刻意留空',
  }],

  /* 9. 右侧巨塔：右侧高密度，左侧分散 */
  ['L2-P09', 'dir', '右侧巨塔', {
    mask: ['.....####', '...######', '..#######', '#########', '...######'],
    growth: 'right', layerShape: 'blob', curve: 'fall', offsets: 'vert',
    density: 0.13, phase: [1, 1],
    feature: '右 4 列厚实，向左逐层收窄，左下刻意留空',
  }],

  /* 10. 上下双层岛：上方与下方两个主体区域 */
  ['L2-P10', 'island', '上下双层岛', {
    mask: ['#########', '#########', '.........', '#########', '#########'],
    growth: 'dualVertical', layerShape: 'band', curve: 'dualpeak', offsets: 'horiz',
    density: 0.13, phase: [0, 0],
    feature: '上下两条 9×2 横带，中间整行断开',
  }],

  /* 11. 蝴蝶形：左右对称双翼，中央连接 */
  ['L2-P11', 'frame', '蝴蝶形', {
    mask: ['##.....##', '###...###', '####.####', '###...###', '##.....##'],
    growth: 'butterfly', layerShape: 'split', curve: 'arch', offsets: 'diag',
    density: 0.12, phase: [1, 0],
    feature: '左右双翼外扩，中央仅一行相连形成蝶身',
  }],

  /* 12. 沙漏形：上下宽、中间窄 */
  ['L2-P12', 'frame', '沙漏形', {
    mask: ['#########', '#########', '...###...', '#########', '#########'],
    growth: 'hourglass', layerShape: 'band', curve: 'valley', offsets: 'cross',
    density: 0.12, phase: [0, 1],
    feature: '上下各 9×2 宽带，中间一行收束到 3 格窄腰',
  }],

  /* 13. 迷宫形：多区域连接，形成曲折通道 */
  ['L2-P13', 'grid', '迷宫形', {
    mask: ['#########', '........#', '#########', '#........', '#########'],
    growth: 'serpentine', layerShape: 'flat', curve: 'flat', offsets: 'alt',
    density: 0.11, phase: [1, 1],
    feature: '上下横墙与左右单格通道交替，形成 S 形走廊',
  }],

  /* 14. 棋盘形：多个分散小牌堆，交错排列 */
  ['L2-P14', 'grid', '棋盘形', {
    mask: ['###..###.', '###..###.', '###..###.', '.###..###', '.###..###'],
    growth: 'checker', layerShape: 'checker', curve: 'flat', offsets: 'horiz',
    density: 0.14, phase: [0, 0],
    feature: '3×3 小块上下错位排布，形成棋盘式交错小堆',
  }],

  /* 15. 弧形月牙：整体弯月，中心偏移 */
  ['L2-P15', 'wave', '弧形月牙', {
    mask: ['..#####..', '.#######.', '####..###', '###....##', '####..###'],
    growth: 'crescent', layerShape: 'ring', curve: 'arch', offsets: 'diag',
    density: 0.11, phase: [1, 0],
    feature: '左侧厚弧、右侧渐薄，凹口偏向右侧，整体呈弯月',
  }],

  /* 16. 波浪形：多个高低起伏的连续区域 */
  ['L2-P16', 'wave', '波浪形', {
    mask: ['#########', '###...###', '..#####..', '###...###', '#########'],
    growth: 'wave', layerShape: 'arc', curve: 'saw', offsets: 'cross',
    density: 0.12, phase: [0, 1],
    feature: '轮廓按行起伏：满 → 缺口 → 窄 → 缺口 → 满，形成波浪',
  }],

  /* 17. 对角双塔：左上与右下两个主牌堆 */
  ['L2-P17', 'island', '对角双塔', {
    mask: ['######...', '######...', '...###...', '...######', '...######'],
    growth: 'diag', layerShape: 'stair', curve: 'rise', offsets: 'alt',
    density: 0.13, phase: [1, 1],
    feature: '左上 6×2 与右下 6×2 两座塔，仅中央 3 格相连',
  }],

  /* 18. 四角围合：四角分布主体，中间留空 */
  ['L2-P18', 'island', '四角围合', {
    mask: ['####.####', '####.####', '.........', '####.####', '####.####'],
    growth: 'corners', layerShape: 'split', curve: 'dualpeak', offsets: 'vert',
    density: 0.13, phase: [0, 0],
    feature: '四个 4×2 角块分居四角，中行与中列十字留空',
  }],

  /* 19. 中心十字岛：中央主体向四个方向延伸 */
  ['L2-P19', 'frame', '中心十字岛', {
    mask: ['..#####..', '..#####..', '#########', '..#####..', '..#####..'],
    growth: 'crossCenter', layerShape: 'cross', curve: 'plateau', offsets: 'horiz',
    density: 0.12, phase: [1, 0],
    feature: '中央 3×5 主体 + 中部一行向左右各伸出 2 格',
  }],

  /* 20. 不规则大陆形：不对称、多凸起、多凹陷 */
  ['L2-P20', 'irregular', '不规则大陆形', {
    mask: ['.#######.', '####.####', '.########', '###..####', '.#######.'],
    growth: 'asym', layerShape: 'blob', curve: 'rise', offsets: 'cross',
    density: 0.15, phase: [0, 1],
    feature: '左右不对称、上下多凸起，内部两处缺格形成海湾状凹陷',
  }],
];

/* ==================== 掩膜解析：格位 / 密度 / 连通区域 ==================== */

/** 解析一张掩膜：返回可落牌格列表（含密度权重） */
function parseMask(rows, id) {
  if (!rows || rows.length !== MASK_ROWS) {
    throw new Error('模板 ' + id + ' 掩膜行数 ' + (rows ? rows.length : 0) + ' ≠ ' + MASK_ROWS);
  }
  var cells = [];
  for (var r = 0; r < MASK_ROWS; r++) {
    var line = rows[r];
    if (typeof line !== 'string' || line.length !== MASK_COLS) {
      throw new Error('模板 ' + id + ' 第 ' + r + ' 行宽度 ' + (line ? line.length : 0) + ' ≠ ' + MASK_COLS);
    }
    for (var c = 0; c < MASK_COLS; c++) {
      var ch = line.charAt(c);
      if (ch === '.') continue;
      if (ch !== '#' && ch !== '@') {
        throw new Error('模板 ' + id + ' 掩膜含非法字符 "' + ch + '"（只允许 # @ .）');
      }
      cells.push({ c: c, r: r, k: c + ',' + r, w: ch === '@' ? 1.7 : 1 });
    }
  }
  return cells;
}

/** 4 邻域连通分量：每个格位 → 区域标签（R1 / R2 …） */
function labelRegions(cells) {
  var byKey = {};
  for (var i = 0; i < cells.length; i++) byKey[cells[i].k] = cells[i];
  var seen = {};
  var labels = {};
  var region = 0;
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (var j = 0; j < cells.length; j++) {
    var start = cells[j];
    if (seen[start.k]) continue;
    region++;
    var label = 'R' + region;
    var queue = [start];
    seen[start.k] = 1;
    labels[start.k] = label;
    while (queue.length) {
      var cur = queue.pop();
      for (var d = 0; d < dirs.length; d++) {
        var nk = (cur.c + dirs[d][0]) + ',' + (cur.r + dirs[d][1]);
        if (!byKey[nk] || seen[nk]) continue;
        seen[nk] = 1;
        labels[nk] = label;
        queue.push(byKey[nk]);
      }
    }
  }
  return { labels: labels, count: region };
}

/** 掩膜的包围盒（列/行跨度为 0 时按 1 处理） */
function maskBox(cells) {
  var c0 = MASK_COLS, c1 = -1, r0 = MASK_ROWS, r1 = -1;
  for (var i = 0; i < cells.length; i++) {
    if (cells[i].c < c0) c0 = cells[i].c;
    if (cells[i].c > c1) c1 = cells[i].c;
    if (cells[i].r < r0) r0 = cells[i].r;
    if (cells[i].r > r1) r1 = cells[i].r;
  }
  return { c0: c0, c1: c1, r0: r0, r1: r1, cols: c1 - c0 + 1, rows: r1 - r0 + 1 };
}

/* ==================== 模板对象构造 ==================== */

function tpl(templateId, category, name, cfg) {
  var cat = null;
  for (var i = 0; i < TEMPLATE_CATEGORIES.length; i++) {
    if (TEMPLATE_CATEGORIES[i].key === category) cat = TEMPLATE_CATEGORIES[i];
  }
  var cells = parseMask(cfg.mask, templateId);
  if (cells.length < 20) {
    throw new Error('模板 ' + templateId + ' 可落牌格只有 ' + cells.length + ' 个（< 20，无法承载高层牌数）');
  }
  var regionInfo = labelRegions(cells);
  var box = maskBox(cells);
  var structure = {
    mask: cfg.mask.slice(),
    growth: cfg.growth,
    layerShape: cfg.layerShape,
    layerCurve: CURVES[cfg.curve].slice(),
    offsets: OFFSETS[cfg.offsets].map(function (p) { return [p[0], p[1]]; }),
    density: cfg.density,
    phase: [cfg.phase[0], cfg.phase[1]],
  };
  return {
    templateId: templateId,
    category: category,
    categoryLabel: cat ? cat.label : category,
    name: name,
    feature: cfg.feature,
    structure: structure,
    structureSignature: sha256Hex('MAH-L2-TPL-v2|' + templateId + '|' + JSON.stringify(structure)),
    maskCells: cells,
    maskCellCount: cells.length,
    maskRegion: regionInfo.labels,
    maskRegionCount: regionInfo.count,
    maskBox: box,
  };
}

export var L2_TEMPLATES = [];
for (var di = 0; di < DEFS.length; di++) {
  var d = DEFS[di];
  L2_TEMPLATES.push(tpl(d[0], d[1], d[2], d[3]));
}

export var L2_TEMPLATE_IDS = L2_TEMPLATES.map(function (t) { return t.templateId; });

var BY_ID = {};
for (var bi = 0; bi < L2_TEMPLATES.length; bi++) BY_ID[L2_TEMPLATES[bi].templateId] = L2_TEMPLATES[bi];

export function templateById(id) {
  return BY_ID[id] || null;
}

/** 模板的结构摘要（报告 / 调试面板 / 构建一致性检查用） */
export function templateSummary(t) {
  return {
    templateId: t.templateId,
    category: t.category,
    categoryLabel: t.categoryLabel,
    name: t.name,
    feature: t.feature,
    structureSignature: t.structureSignature,
    mask: t.structure.mask.slice(),
    maskCellCount: t.maskCellCount,
    maskRegionCount: t.maskRegionCount,
    maskBox: t.maskBox,
    growth: t.structure.growth,
    layerShape: t.structure.layerShape,
    layerCurve: t.structure.layerCurve.slice(),
    offsets: t.structure.offsets,
    density: t.structure.density,
    phase: t.structure.phase,
  };
}

/** 按形状族统计 */
export function templateCategoryStats() {
  var out = {};
  for (var i = 0; i < L2_TEMPLATES.length; i++) {
    var k = L2_TEMPLATES[i].category;
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

