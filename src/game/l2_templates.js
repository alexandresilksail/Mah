/**
 * 第二关 50 套布局模板（唯一结构定义源）。
 *
 * 【参考口径】原版《羊了个羊》第二关的内部数据无法获取，这里只以**可观察到的
 * 布局特征**为参考：多层叠牌、上下/左右区域组合、层间半格错位形成的遮挡链、
 * 中央密堆 + 两侧盲盒、轮廓收放与空间分布。本文件不声称精确复刻原版算法，
 * 也不含任何从原版导出的坐标数据。
 *
 * 【模板 ≠ 随机种子 / 牌面顺序 / 坐标微调】每个模板是一组**结构参数**：
 *   · zones       : 该模板允许出现的区域集合（决定区域结构与 region 字段）
 *   · shapes      : 该模板逐层使用的牌堆形状序列（决定轮廓）
 *   · trajectory  : 层中心的空间轨迹（决定空间分布）
 *   · layerCurve  : 独立层级分布曲线（重采样到 N 层后归一化到 mainCount）
 *   · env         : 每层网格的列数 / 行数包络
 *   · offsets     : 层间半格错位向量集合（决定遮挡关系）
 *   · pin/align/spread/density/phase : 边界钉层、对齐步长、轨迹幅度、
 *                                     缺口比例、初始半格相位
 * 50 套定义的 `structureSignature` 两两不同；seed 只在**同一套模板内部**
 * 决定团块生长细节、层中心抖动与队列偏移，绝不用于制造模板之间的差异。
 *
 * 【冻结边界】本文件只被第二关路径引用；第一关不 import、不读取、不受影响。
 *
 * 【牌数配置】模板只重分配「每层多少张」，总张数 / 层数 / 牌种数 / 44 张盲盒
 * 队列 / 三消规则全部沿用 config.js 的既有档位，一个都不改。
 */
import { sha256Hex } from './sha256.js';

/* ==================== 10 类原著风格结构 ==================== */

export const TEMPLATE_CATEGORIES = [
  { key: 'central', label: '中央集中型', feature: '主堆收在牌桌中央，层层向核心收拢叠压' },
  { key: 'scatter', label: '多区域分散型', feature: '层分散到多个互不相连的区域，形成多堆并立' },
  { key: 'dual', label: '双核心叠层型', feature: '左右/上下两个独立核心各自叠层' },
  { key: 'extent', label: '横向及纵向延展型', feature: '沿水平或竖直方向拉长，形成长条延展牌堆' },
  { key: 'ring', label: '环形包围型', feature: '层沿椭圆环绕，中心留空形成包围结构' },
  { key: 'cross', label: '十字交错型', feature: '横臂与竖臂交错叠压' },
  { key: 'stair', label: '阶梯递进型', feature: '层中心沿对角线逐级递降/递升' },
  { key: 'nest', label: '多层嵌套型', feature: '外框包内层，层层向内嵌套' },
  { key: 'asym', label: '非对称复杂叠层型', feature: '左右不对称、单边厚重与偏置缺口' },
  { key: 'combo', label: '组合异形型', feature: '梳齿 / 弧带 / 菱形 / 螺旋 / 沙漏等组合轮廓' },
];

/* 区域锚点：牌左上角坐标可达范围内的逻辑中心（半格晶格会再吸附） */
const ZONE_ANCHORS = {
  center: [330, 396],
  north: [330, 264],
  south: [330, 506],
  west: [165, 396],
  east: [495, 396],
  nw: [165, 264],
  ne: [495, 264],
  sw: [165, 484],
  se: [495, 484],
  coreA: [264, 396],
  coreB: [396, 396],
  midTop: [330, 308],
  midBottom: [330, 462],
  farWest: [99, 396],
  farEast: [561, 396],
};

/* 独立层级分布曲线：重采样到 N 层后归一化，总和恒等于 profile.mainCount */
const CURVES = {
  flat: [1, 1, 1, 1, 1],
  rise: [1, 1.35, 1.7, 2.1, 2.5],
  fall: [2.5, 2.1, 1.7, 1.35, 1],
  arch: [1, 1.6, 2.2, 1.6, 1],
  valley: [2.2, 1.6, 1, 1.6, 2.2],
  dualpeak: [2, 1, 2, 1, 2],
  saw: [1, 2, 1, 2, 1],
  step: [1, 1, 2, 2, 3, 3],
  plateau: [1, 2, 2, 2, 1],
  spike: [1, 1, 3, 1, 1],
  crown: [1, 1.25, 1.5, 2, 3],
};

/* 形状序列：逐层循环取用，决定每层团块轮廓 */
const SHAPE_SETS = {
  core: ['blob', 'pyramid', 'diamond', 'blob', 'nest'],
  band: ['band', 'arc', 'band', 'comb', 'band'],
  ring: ['ring', 'shell', 'ring', 'arc', 'ring'],
  cross: ['cross', 'blob', 'cross', 'wedge', 'cross'],
  stair: ['stair', 'wedge', 'stair', 'fan', 'stair'],
  nest: ['nest', 'shell', 'nest', 'ring', 'nest'],
  split: ['split', 'dual', 'split', 'checker', 'split'],
  mixed: ['blob', 'band', 'ring', 'cross', 'stair', 'diamond'],
  comb: ['comb', 'fan', 'comb', 'wedge', 'comb'],
  arc: ['arc', 'shell', 'arc', 'diamond', 'arc'],
  shell: ['shell', 'nest', 'ring', 'shell', 'nest'],
  wedge: ['wedge', 'stair', 'fan', 'wedge', 'comb'],
  fan: ['fan', 'arc', 'fan', 'wedge', 'fan'],
  checker: ['checker', 'split', 'checker', 'comb', 'checker'],
};

/* 半格错位向量集合（px, py 各按 2 取模） */
const OFFSETS = {
  diag: [[1, 1], [0, 1], [1, 0]],
  vert: [[0, 1], [0, 1], [1, 1]],
  horiz: [[1, 0], [1, 0], [0, 1]],
  alt: [[1, 1], [1, 1], [0, 0]],
  cross: [[1, 0], [0, 1], [1, 1], [0, 0]],
};

/* 网格包络 */
const ENVS = {
  wide: { colsLo: 7, colsHi: 10, rowsMax: 3 },
  mid: { colsLo: 5, colsHi: 8, rowsMax: 4 },
  narrow: { colsLo: 3, colsHi: 6, rowsMax: 5 },
  tall: { colsLo: 3, colsHi: 5, rowsMax: 7 },
  square: { colsLo: 4, colsHi: 6, rowsMax: 5 },
  full: { colsLo: 8, colsHi: 10, rowsMax: 4 },
};

/* ==================== 50 套模板的显式定义 ==================== */

/**
 * 用一个基配置 + 显式变体参数造出模板对象。
 * 变体之间必须有**结构参数差异**（区域集合 / 形状 / 轨迹 / 层级曲线 /
 * 网格包络 / 遮挡相位），不是只改一个数字。
 */
function tpl(templateId, category, name, cfg) {
  var cat = null;
  for (var i = 0; i < TEMPLATE_CATEGORIES.length; i++) {
    if (TEMPLATE_CATEGORIES[i].key === category) cat = TEMPLATE_CATEGORIES[i];
  }
  var structure = {
    zones: cfg.zones.slice(),
    shapes: SHAPE_SETS[cfg.shapes].slice(),
    trajectory: cfg.trajectory,
    layerCurve: CURVES[cfg.curve].slice(),
    env: { colsLo: ENVS[cfg.env].colsLo, colsHi: ENVS[cfg.env].colsHi, rowsMax: ENVS[cfg.env].rowsMax },
    offsets: OFFSETS[cfg.offsets].map(function (p) { return [p[0], p[1]]; }),
    align: cfg.align,
    pin: cfg.pin,
    spreadX: cfg.spreadX,
    spreadY: cfg.spreadY,
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
    structureSignature: sha256Hex('MAH-L2-TPL-v1|' + templateId + '|' + JSON.stringify(structure)),
  };
}

var DEFS = [
  /* ---- 1 中央集中型 × 5 ---- */
  ['L2-C01', 'central', '中央密核塔', { zones: ['center'], shapes: 'core', trajectory: 'central', curve: 'arch', env: 'mid', offsets: 'diag', align: 66, pin: 'none', spreadX: 18, spreadY: 150, density: 0.11, phase: [0, 0], feature: '全部层堆叠在中央，轮廓自下而上收拢' }],
  ['L2-C02', 'central', '中央沙漏', { zones: ['center', 'midTop', 'midBottom'], shapes: 'mixed', trajectory: 'central', curve: 'valley', env: 'wide', offsets: 'cross', align: 33, pin: 'edges', spreadX: 42, spreadY: 160, density: 0.12, phase: [1, 0], feature: '中段收腰、上下两端外扩的沙漏轮廓' }],
  ['L2-C03', 'central', '中央菱形核', { zones: ['center'], shapes: 'arc', trajectory: 'nest', curve: 'spike', env: 'square', offsets: 'vert', align: 66, pin: 'none', spreadX: 12, spreadY: 130, density: 0.09, phase: [0, 1], feature: '菱形外框逐层向内嵌，中心单层最厚' }],
  ['L2-C04', 'central', '中央竖塔', { zones: ['center', 'north', 'south'], shapes: 'stair', trajectory: 'vertical', curve: 'rise', env: 'tall', offsets: 'vert', align: 33, pin: 'none', spreadX: 24, spreadY: 180, density: 0.13, phase: [1, 1], feature: '窄列高层塔，层张数自上而下递增' }],
  ['L2-C05', 'central', '中央宽基座', { zones: ['center', 'midBottom'], shapes: 'band', trajectory: 'central', curve: 'plateau', env: 'full', offsets: 'horiz', align: 66, pin: 'edges', spreadX: 30, spreadY: 120, density: 0.10, phase: [0, 0], feature: '宽带状层做基座，上部窄层叠压' }],

  /* ---- 2 多区域分散型 × 5 ---- */
  ['L2-S01', 'scatter', '四象限分散', { zones: ['nw', 'ne', 'sw', 'se'], shapes: 'split', trajectory: 'scatter', curve: 'fall', env: 'narrow', offsets: 'alt', align: 66, pin: 'corners', spreadX: 0, spreadY: 0, density: 0.14, phase: [0, 0], feature: '四个互不相连的象限各自成堆' }],
  ['L2-S02', 'scatter', '六区并立', { zones: ['nw', 'north', 'ne', 'sw', 'south', 'se'], shapes: 'mixed', trajectory: 'scatter', curve: 'fall', env: 'square', offsets: 'cross', align: 33, pin: 'none', spreadX: 0, spreadY: 0, density: 0.12, phase: [1, 0], feature: '六个区域并立，层张数锯齿交替' }],
  ['L2-S03', 'scatter', '三岛链', { zones: ['west', 'center', 'east'], shapes: 'comb', trajectory: 'scatter', curve: 'dualpeak', env: 'mid', offsets: 'diag', align: 66, pin: 'edges', spreadX: 0, spreadY: 0, density: 0.11, phase: [0, 1], feature: '左中右三座牌岛，梳齿状边缘' }],
  ['L2-S04', 'scatter', '上下双带', { zones: ['north', 'south', 'center'], shapes: 'band', trajectory: 'scatter', curve: 'fall', env: 'wide', offsets: 'horiz', align: 33, pin: 'none', spreadX: 0, spreadY: 0, density: 0.10, phase: [1, 1], feature: '上下两条横向带 + 中央连接层' }],
  ['L2-S05', 'scatter', '边缘散点', { zones: ['farWest', 'farEast', 'nw', 'se'], shapes: 'split', trajectory: 'scatter', curve: 'spike', env: 'narrow', offsets: 'alt', align: 66, pin: 'corners', spreadX: 0, spreadY: 0, density: 0.16, phase: [0, 0], feature: '贴边散点堆，中央刻意留空' }],

  /* ---- 3 双核心叠层型 × 5 ---- */
  ['L2-D01', 'dual', '左右双核', { zones: ['coreA', 'coreB'], shapes: 'core', trajectory: 'dual', curve: 'arch', env: 'mid', offsets: 'diag', align: 66, pin: 'edges', spreadX: 0, spreadY: 120, density: 0.11, phase: [0, 0], feature: '左右两个核心交替叠层' }],
  ['L2-D02', 'dual', '上下双核', { zones: ['north', 'south'], shapes: 'mixed', trajectory: 'dual', curve: 'valley', env: 'wide', offsets: 'vert', align: 33, pin: 'none', spreadX: 0, spreadY: 0, density: 0.12, phase: [1, 0], feature: '上下两个核心，中间腰部收窄' }],
  ['L2-D03', 'dual', '对角双核', { zones: ['nw', 'se'], shapes: 'arc', trajectory: 'dual', curve: 'dualpeak', env: 'square', offsets: 'cross', align: 66, pin: 'corners', spreadX: 0, spreadY: 0, density: 0.10, phase: [0, 1], feature: '西北 / 东南对角两核，弧形轮廓' }],
  ['L2-D04', 'dual', '双核夹桥', { zones: ['coreA', 'center', 'coreB'], shapes: 'cross', trajectory: 'dual', curve: 'step', env: 'mid', offsets: 'horiz', align: 33, pin: 'edges', spreadX: 0, spreadY: 90, density: 0.11, phase: [1, 1], feature: '双核之间有十字连接层' }],
  ['L2-D05', 'dual', '不等双核', { zones: ['west', 'coreB'], shapes: 'stair', trajectory: 'dual', curve: 'rise', env: 'narrow', offsets: 'alt', align: 66, pin: 'none', spreadX: 0, spreadY: 140, density: 0.13, phase: [0, 0], feature: '左侧厚重、右侧轻薄的不等双核' }],

  /* ---- 4 横向及纵向延展型 × 5 ---- */
  ['L2-E01', 'extent', '横向长卷', { zones: ['farWest', 'west', 'center', 'east', 'farEast'], shapes: 'band', trajectory: 'horizontal', curve: 'rise', env: 'wide', offsets: 'horiz', align: 33, pin: 'edges', spreadX: 220, spreadY: 40, density: 0.10, phase: [0, 0], feature: '沿水平方向铺满全宽的长卷' }],
  ['L2-E02', 'extent', '纵向长柱', { zones: ['north', 'center', 'south'], shapes: 'comb', trajectory: 'vertical', curve: 'rise', env: 'tall', offsets: 'vert', align: 66, pin: 'none', spreadX: 40, spreadY: 180, density: 0.12, phase: [1, 0], feature: '纵向拉长的窄柱与梳齿边缘' }],
  ['L2-E03', 'extent', '横向双带', { zones: ['north', 'south'], shapes: 'band', trajectory: 'horizontal', curve: 'saw', env: 'full', offsets: 'cross', align: 33, pin: 'edges', spreadX: 190, spreadY: 0, density: 0.11, phase: [0, 1], feature: '上下两条横向带交替叠压' }],
  ['L2-E04', 'extent', '纵向阶梯柱', { zones: ['west', 'center', 'east'], shapes: 'stair', trajectory: 'vertical', curve: 'step', env: 'square', offsets: 'diag', align: 66, pin: 'none', spreadX: 60, spreadY: 170, density: 0.13, phase: [1, 1], feature: '纵向延展同时横向阶梯错位' }],
  ['L2-E05', 'extent', '斜向长带', { zones: ['nw', 'center', 'se'], shapes: 'arc', trajectory: 'stair', curve: 'rise', env: 'wide', offsets: 'alt', align: 33, pin: 'corners', spreadX: 170, spreadY: 160, density: 0.12, phase: [0, 0], feature: '沿对角线延展的弧带' }],

  /* ---- 5 环形包围型 × 5 ---- */
  ['L2-R01', 'ring', '标准环墙', { zones: ['nw', 'north', 'ne', 'east', 'se', 'south', 'sw', 'west'], shapes: 'ring', trajectory: 'ring', curve: 'flat', env: 'wide', offsets: 'cross', align: 33, pin: 'corners', spreadX: 180, spreadY: 150, density: 0.12, phase: [0, 0], feature: '层沿椭圆环绕，中心留空' }],
  ['L2-R02', 'ring', '双层套环', { zones: ['nw', 'ne', 'sw', 'se', 'center'], shapes: 'nest', trajectory: 'ring', curve: 'valley', env: 'mid', offsets: 'diag', align: 66, pin: 'none', spreadX: 160, spreadY: 140, density: 0.11, phase: [1, 0], feature: '外环 + 内环两层嵌套' }],
  ['L2-R03', 'ring', '半环抱月', { zones: ['west', 'nw', 'north', 'ne', 'east'], shapes: 'arc', trajectory: 'ring', curve: 'arch', env: 'wide', offsets: 'horiz', align: 33, pin: 'edges', spreadX: 190, spreadY: 130, density: 0.13, phase: [0, 1], feature: '上半环包围，下方开口' }],
  ['L2-R04', 'ring', '螺旋收环', { zones: ['nw', 'ne', 'se', 'sw', 'center'], shapes: 'shell', trajectory: 'spiral', curve: 'spike', env: 'square', offsets: 'alt', align: 66, pin: 'corners', spreadX: 170, spreadY: 140, density: 0.10, phase: [1, 1], feature: '环半径逐层收缩的螺旋包围' }],
  ['L2-R05', 'ring', '环中带核', { zones: ['north', 'east', 'south', 'west', 'center'], shapes: 'ring', trajectory: 'ring', curve: 'dualpeak', env: 'full', offsets: 'vert', align: 33, pin: 'none', spreadX: 180, spreadY: 150, density: 0.11, phase: [0, 0], feature: '环墙 + 中央独立核心' }],

  /* ---- 6 十字交错型 × 5 ---- */
  ['L2-X01', 'cross', '正十字', { zones: ['north', 'south', 'west', 'east', 'center'], shapes: 'cross', trajectory: 'cross', curve: 'flat', env: 'mid', offsets: 'cross', align: 33, pin: 'none', spreadX: 150, spreadY: 150, density: 0.11, phase: [0, 0], feature: '横臂与竖臂交替叠压' }],
  ['L2-X02', 'cross', '斜十字', { zones: ['nw', 'ne', 'sw', 'se', 'center'], shapes: 'cross', trajectory: 'cross', curve: 'valley', env: 'square', offsets: 'diag', align: 66, pin: 'corners', spreadX: 160, spreadY: 140, density: 0.12, phase: [1, 0], feature: '沿对角线展开的十字' }],
  ['L2-X03', 'cross', '双横一竖', { zones: ['north', 'south', 'center'], shapes: 'band', trajectory: 'cross', curve: 'saw', env: 'wide', offsets: 'horiz', align: 33, pin: 'edges', spreadX: 190, spreadY: 120, density: 0.10, phase: [0, 1], feature: '两条横带被一条竖带贯穿' }],
  ['L2-X04', 'cross', '楔形交错', { zones: ['west', 'center', 'east'], shapes: 'mixed', trajectory: 'cross', curve: 'step', env: 'mid', offsets: 'alt', align: 66, pin: 'none', spreadX: 140, spreadY: 140, density: 0.13, phase: [1, 1], feature: '楔形与十字形状交错' }],
  ['L2-X05', 'cross', '十字嵌套', { zones: ['center', 'north', 'east', 'south', 'west'], shapes: 'nest', trajectory: 'cross', curve: 'arch', env: 'square', offsets: 'vert', align: 33, pin: 'none', spreadX: 150, spreadY: 150, density: 0.11, phase: [0, 0], feature: '外层十字框嵌套内层十字' }],

  /* ---- 7 阶梯递进型 × 5 ---- */
  ['L2-T01', 'stair', '右降阶梯', { zones: ['nw', 'center', 'se'], shapes: 'stair', trajectory: 'stair', curve: 'rise', env: 'mid', offsets: 'diag', align: 66, pin: 'corners', spreadX: 170, spreadY: 170, density: 0.11, phase: [0, 0], feature: '层中心自左上向右下逐级递降' }],
  ['L2-T02', 'stair', '左升阶梯', { zones: ['ne', 'center', 'sw'], shapes: 'stair', trajectory: 'stair', curve: 'fall', env: 'mid', offsets: 'alt', align: 33, pin: 'corners', spreadX: 170, spreadY: 170, density: 0.12, phase: [1, 0], feature: '层中心自右上向左下递降' }],
  ['L2-T03', 'stair', '折线阶梯', { zones: ['west', 'north', 'east', 'south'], shapes: 'comb', trajectory: 'stair', curve: 'saw', env: 'wide', offsets: 'cross', align: 66, pin: 'none', spreadX: 180, spreadY: 150, density: 0.10, phase: [0, 1], feature: '阶梯方向逐段折返' }],
  ['L2-T04', 'stair', '宽台阶梯', { zones: ['center', 'midBottom'], shapes: 'band', trajectory: 'stair', curve: 'plateau', env: 'full', offsets: 'horiz', align: 33, pin: 'edges', spreadX: 160, spreadY: 140, density: 0.11, phase: [1, 1], feature: '每级阶梯都是宽平台' }],
  ['L2-T05', 'stair', '嵌套阶梯', { zones: ['nw', 'ne', 'sw', 'se'], shapes: 'mixed', trajectory: 'stair', curve: 'dualpeak', env: 'square', offsets: 'vert', align: 66, pin: 'corners', spreadX: 160, spreadY: 160, density: 0.13, phase: [0, 0], feature: '阶梯与嵌套框交替' }],

  /* ---- 8 多层嵌套型 × 5 ---- */
  ['L2-N01', 'nest', '方框套核', { zones: ['center'], shapes: 'nest', trajectory: 'nest', curve: 'crown', env: 'square', offsets: 'vert', align: 66, pin: 'none', spreadX: 20, spreadY: 100, density: 0.11, phase: [0, 0], feature: '外框逐层向内收缩、顶层加冠形成宽口' }],
  ['L2-N02', 'nest', '壳层包裹', { zones: ['center', 'midTop', 'midBottom'], shapes: 'shell', trajectory: 'nest', curve: 'valley', env: 'mid', offsets: 'diag', align: 33, pin: 'edges', spreadX: 40, spreadY: 130, density: 0.12, phase: [1, 0], feature: '壳层 + 内核交替' }],
  ['L2-N03', 'nest', '同心菱', { zones: ['center'], shapes: 'arc', trajectory: 'nest', curve: 'rise', env: 'wide', offsets: 'cross', align: 66, pin: 'none', spreadX: 30, spreadY: 120, density: 0.10, phase: [0, 1], feature: '同心菱形轮廓逐层缩放' }],
  ['L2-N04', 'nest', '双层套嵌', { zones: ['coreA', 'coreB'], shapes: 'ring', trajectory: 'nest', curve: 'dualpeak', env: 'square', offsets: 'alt', align: 33, pin: 'none', spreadX: 50, spreadY: 110, density: 0.11, phase: [1, 1], feature: '两个套嵌中心各自成环' }],
  ['L2-N05', 'nest', '阶梯套嵌', { zones: ['center', 'north', 'south'], shapes: 'mixed', trajectory: 'nest', curve: 'step', env: 'mid', offsets: 'horiz', align: 66, pin: 'edges', spreadX: 45, spreadY: 140, density: 0.13, phase: [0, 0], feature: '嵌套深度按层阶梯递进' }],

  /* ---- 9 非对称复杂叠层型 × 5 ---- */
  ['L2-A01', 'asym', '左重右轻', { zones: ['west', 'center', 'east'], shapes: 'split', trajectory: 'asym', curve: 'rise', env: 'wide', offsets: 'diag', align: 33, pin: 'left', spreadX: 150, spreadY: 150, density: 0.12, phase: [0, 0], feature: '左侧厚堆，右侧稀疏' }],
  ['L2-A02', 'asym', '右重左轻', { zones: ['east', 'center', 'west'], shapes: 'comb', trajectory: 'asym', curve: 'rise', env: 'wide', offsets: 'alt', align: 66, pin: 'right', spreadX: 150, spreadY: 150, density: 0.12, phase: [1, 0], feature: '右侧厚堆，左侧稀疏' }],
  ['L2-A03', 'asym', '偏置缺口', { zones: ['nw', 'center', 'se'], shapes: 'wedge', trajectory: 'asym', curve: 'saw', env: 'mid', offsets: 'cross', align: 33, pin: 'corners', spreadX: 160, spreadY: 160, density: 0.15, phase: [0, 1], feature: '楔形缺口偏置到一侧' }],
  ['L2-A04', 'asym', '不规则扇面', { zones: ['sw', 'south', 'se', 'center'], shapes: 'fan', trajectory: 'asym', curve: 'spike', env: 'square', offsets: 'vert', align: 66, pin: 'none', spreadX: 140, spreadY: 150, density: 0.13, phase: [1, 1], feature: '扇形展开，厚薄不均' }],
  ['L2-A05', 'asym', '断桥叠层', { zones: ['west', 'east', 'center'], shapes: 'checker', trajectory: 'asym', curve: 'dualpeak', env: 'narrow', offsets: 'horiz', align: 33, pin: 'edges', spreadX: 170, spreadY: 140, density: 0.16, phase: [0, 0], feature: '棋盘式断点造成不规则遮挡链' }],

  /* ---- 10 组合异形型 × 5 ---- */
  ['L2-M01', 'combo', '梳齿长墙', { zones: ['west', 'center', 'east'], shapes: 'comb', trajectory: 'horizontal', curve: 'rise', env: 'full', offsets: 'horiz', align: 33, pin: 'edges', spreadX: 200, spreadY: 60, density: 0.11, phase: [0, 0], feature: '水平长墙 + 梳齿缺口' }],
  ['L2-M02', 'combo', '弧带环绕', { zones: ['nw', 'north', 'ne', 'center'], shapes: 'arc', trajectory: 'ring', curve: 'arch', env: 'wide', offsets: 'cross', align: 66, pin: 'corners', spreadX: 180, spreadY: 130, density: 0.12, phase: [1, 0], feature: '弧带沿上缘环绕' }],
  ['L2-M03', 'combo', '菱形叠压', { zones: ['center', 'north', 'south'], shapes: 'arc', trajectory: 'vertical', curve: 'valley', env: 'square', offsets: 'vert', align: 33, pin: 'none', spreadX: 60, spreadY: 170, density: 0.10, phase: [0, 1], feature: '菱形轮廓沿纵向叠压' }],
  ['L2-M04', 'combo', '螺旋外扩', { zones: ['center', 'nw', 'ne', 'se', 'sw'], shapes: 'mixed', trajectory: 'spiral', curve: 'step', env: 'mid', offsets: 'diag', align: 66, pin: 'corners', spreadX: 170, spreadY: 150, density: 0.13, phase: [1, 1], feature: '层中心沿螺旋向外扩张' }],
  ['L2-M05', 'combo', '沙漏交错', { zones: ['midTop', 'center', 'midBottom'], shapes: 'mixed', trajectory: 'cross', curve: 'saw', env: 'full', offsets: 'alt', align: 33, pin: 'edges', spreadX: 150, spreadY: 150, density: 0.11, phase: [0, 0], feature: '宽窄层交错 + 十字错位' }],
];

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
    zones: t.structure.zones.slice(),
    shapes: t.structure.shapes.slice(),
    trajectory: t.structure.trajectory,
    layerCurve: t.structure.layerCurve.slice(),
    env: t.structure.env,
    offsets: t.structure.offsets,
    pin: t.structure.pin,
  };
}

/** 按类别统计（10 类 × 5 套） */
export function templateCategoryStats() {
  var out = {};
  for (var i = 0; i < L2_TEMPLATES.length; i++) {
    var k = L2_TEMPLATES[i].category;
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

export { ZONE_ANCHORS };
