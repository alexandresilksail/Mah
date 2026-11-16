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
 * 半格相位候选，绝不用于制造模板之间的差异。
 *
 * 【本轮重构：彻底取消固定四链队列】主体掩膜（9×5）之下，每套模板还自带一份
 * 显式、完整、只属于自己的「外廓牌位段」（9×2 掩膜 + 逐层张数 + 相位起点），
 * 承载原 44 张牌位：格位置、层级分布、遮挡关系、可点区域全部由模板自己定义，
 * 20 套互不相同，不再由任何共享 buildQueue()/QUEUE_SHAPE 追加。旧四链
 * （左竖 7 / 右竖 7 / 中横 15 / 底横 15）已从源码中彻底删除。
 *
 * 【冻结边界】本文件只被第二关路径引用；第一关不 import、不读取、不受影响。
 *
 * 【牌数配置】总张数 / 层数 / 牌种数 / 花色配额 / 三消规则全部沿用 config.js 的
 * 既有档位，一个都不改；原 44 张牌位一张不少地融入各套模板的完整布局。
 */
import { sha256Hex } from './sha256.js';

/* 9 列 × 5 行的全局格网（与 l2_geometry.js 的 X_MIN/Y_MIN/TILE_W/TILE_H 对应） */
export const MASK_COLS = 9;
export const MASK_ROWS = 5;

/* ==================== 完整布局：外廓牌位段 ==================== */
/**
 * 【本轮重构】第二关的 44 张牌不再来自共享的固定四链队列（QUEUE_SHAPE /
 * buildQueue 已彻底删除）。每套模板在原有 9×5 主体掩膜之外，另带一份**显式、
 * 完整、只属于自己**的外廓牌位定义：
 *   · mask   : 2 行 × 9 列，'#' 可落牌、'.' 禁止；对应整格行 r=4、r=5
 *              （y = 308+4*88=660 与 308+5*88=748，叠加半格相位后 y ≤ 792，
 *               792+88=880 ≤ BOARD_BAND.bottom=918；整体垂直居中于牌桌）。
 *              上沿与主体底行同高，因此外廓牌能真实压住主体底沿，
 *              完整保留原有的跨段遮挡与开局可点数设计；
 *   · layers : 外廓逐层张数（非递减，总和恒 44），层集合按「格池前缀」嵌套，
 *             因此低层每张牌必然被高层同格牌以 ≥50% 面积压住；
 *   · turn   : 该模板外廓层的相位轮转起点（0..3），逐层轮转形成遮挡链。
 *
 * 外廓格与主体格分属不同的整格行（r=5/6 vs r=0..4），格 key 不冲突；
 * 主体掩膜、walk、specPlan 铺设段/尾段一律不动，只是「完整布局」多了一段
 * 由模板自己定义、每套都不同的牌位结构。
 */
export const OUTER_COLS = 9;
export const OUTER_ROWS = 2;
export const OUTER_R0 = 4;
/** 第二关完整布局里外廓牌的段标记（旧 'queue' 四链段已彻底取消） */
export const OUTER_SEG = 'outer';
/** 外廓牌位总数：与旧队列配额 profile.queueCount 完全相同，牌数不减 */
export const OUTER_TILE_COUNT = 44;

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

/* ==================== 20 套完整布局的外廓牌位定义 ==================== */
/**
 * 每套模板的 44 张外廓牌位。mask 形状与主体轮廓呼应（金字塔 / 双核心 / 环形 /
 * 阶梯 / 迷宫 / 棋盘 / 月牙 / 波浪 / 四角 …），layers 层数与逐层张数、turn 相位
 * 起点三者也都按模板分别定义 —— 不是「主体 + 一份共享底板」，而是 20 份互不相同
 * 的完整三维牌位结构。所有 layers 数组：非递减、总和 = 44、最大值 ≤ 该模板格数。
 */
var L11  = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
var L12a = [3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4];
var L12b = [2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
var L12c = [2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4];
var L12d = [1, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
var L13a = [2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4];
var L13b = [2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4];
var L13c = [2, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4];
var L14a = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4];
var L14b = [2, 2, 2, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4];
var L14c = [2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4];
var L15a = [2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4];
var L15b = [1, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4];
var L16a = [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
var L16c = [1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4];

var OUTER_DEFS = {
  'L2-P01': { mask: ['..#####..', '#########'], layers: L11,  turn: 0 },
  'L2-P02': { mask: ['####.####', '####.####'], layers: L12a, turn: 1 },
  'L2-P03': { mask: ['##.##.##.', '.##.##.##'], layers: L13a, turn: 2 },
  'L2-P04': { mask: ['##.....##', '#########'], layers: L14a, turn: 3 },
  'L2-P05': { mask: ['...###...', '#########'], layers: L15a, turn: 0 },
  'L2-P06': { mask: ['##.###.##', '.########'], layers: L16a, turn: 1 },
  'L2-P07': { mask: ['.########', '.....####'], layers: L12b, turn: 2 },
  'L2-P08': { mask: ['######...', '####.....'], layers: L12c, turn: 3 },
  'L2-P09': { mask: ['...######', '.....####'], layers: L13b, turn: 0 },
  'L2-P10': { mask: ['#########', '##.###.##'], layers: L14b, turn: 1 },
  'L2-P11': { mask: ['##.....##', '###...###'], layers: L15b, turn: 2 },
  'L2-P12': { mask: ['#########', '...###...'], layers: L16c, turn: 3 },
  'L2-P13': { mask: ['#########', '#.#.#.#.#'], layers: L12d, turn: 1 },
  'L2-P14': { mask: ['###..###.', '.###..###'], layers: L13c, turn: 2 },
  'L2-P15': { mask: ['.#######.', '####..###'], layers: L14c, turn: 3 },
  'L2-P16': { mask: ['###...###', '#########'], layers: L11,  turn: 0 },
  'L2-P17': { mask: ['######...', '...######'], layers: L12a, turn: 1 },
  'L2-P18': { mask: ['####.####', '##.###.##'], layers: L13a, turn: 2 },
  'L2-P19': { mask: ['..#####..', '.#######.'], layers: L14a, turn: 3 },
  'L2-P20': { mask: ['.#######.', '####.####'], layers: L15a, turn: 0 },
};

/**
 * 解析一套模板的外廓定义：可落牌格（中心优先排序 + 连通区域标签）、逐层张数、
 * 相位起点。这里是**纯数据展开**，不含任何随机；同一 templateId 永远同一份结果。
 */
function parseOuter(cfg, id) {
  if (!cfg || !cfg.mask || !cfg.layers) {
    throw new Error('模板 ' + id + ' 缺少完整外廓牌位定义');
  }
  if (cfg.mask.length !== OUTER_ROWS) {
    throw new Error('模板 ' + id + ' 外廓掩膜行数 ' + cfg.mask.length + ' ≠ ' + OUTER_ROWS);
  }
  var cells = [];
  for (var r = 0; r < OUTER_ROWS; r++) {
    var line = cfg.mask[r];
    if (typeof line !== 'string' || line.length !== OUTER_COLS) {
      throw new Error('模板 ' + id + ' 外廓第 ' + r + ' 行宽度 ' + (line ? line.length : 0) + ' ≠ ' + OUTER_COLS);
    }
    for (var c = 0; c < OUTER_COLS; c++) {
      if (line.charAt(c) === '.') continue;
      if (line.charAt(c) !== '#') {
        throw new Error('模板 ' + id + ' 外廓掩膜含非法字符 "' + line.charAt(c) + '"');
      }
      cells.push({ c: c, r: r + OUTER_R0, k: c + ',' + (r + OUTER_R0) });
    }
  }
  /* 确定性格池序（每层取前缀 ⇒ 层集合严格嵌套 ⇒ 低层必被高层压住）：
   *  1) r 小者优先 —— 外廓上沿 y=660 与主体底行 y=616 有 44px 重叠，
   *     于是外廓牌能真实压住主体底沿，维持原有遮挡与开局可点数设计；
   *  2) 同一行按「离中心越远越优先」横向铺开，任意前缀都覆盖整幅牌桌宽度，
   *     而不是把牌塔挤在中间一小块（那会让主体可点牌暴涨、越过 25 上限）。
   * 这是一份**结构**排序，完全由模板掩膜决定，与 seed / 随机偏移无关。 */
  var cc = (OUTER_COLS - 1) / 2;
  cells.sort(function (a, b) {
    if (a.r !== b.r) return a.r - b.r;
    var ea = -Math.abs(a.c - cc);
    var eb = -Math.abs(b.c - cc);
    return ea - eb || a.c - b.c;
  });
  /* 外廓连通区域（4 邻接），标签用 O1/O2…，与主体 R1/R2… 区分 */
  var reg = labelRegions(cells);
  for (var ci = 0; ci < cells.length; ci++) {
    cells[ci].region = (reg.labels[cells[ci].k] || 'R1').replace('R', 'O');
  }
  var layers = cfg.layers.slice();
  var total = 0;
  for (var li = 0; li < layers.length; li++) {
    if (!(layers[li] >= 1) || layers[li] > cells.length) {
      throw new Error('模板 ' + id + ' 外廓第 ' + li + ' 层张数 ' + layers[li] + ' 非法');
    }
    if (li && layers[li] < layers[li - 1]) {
      throw new Error('模板 ' + id + ' 外廓层张数不是非递减（层集合无法嵌套）');
    }
    total += layers[li];
  }
  if (total !== OUTER_TILE_COUNT) {
    throw new Error('模板 ' + id + ' 外廓总张数 ' + total + ' ≠ ' + OUTER_TILE_COUNT);
  }
  var turn = ((cfg.turn | 0) % 4 + 4) % 4;
  var raw = {
    mask: cfg.mask.slice(), layers: layers, turn: turn,
    cells: cells.map(function (x) { return x.k + '@' + x.region; }),
  };
  return {
    mask: cfg.mask.slice(),
    cells: cells,
    cellCount: cells.length,
    layers: layers,
    layerCount: layers.length,
    total: total,
    turn: turn,
    signature: sha256Hex('MAH-L2-OUTER-v1|' + id + '|' + JSON.stringify(raw)),
  };
}

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
  /* 每套模板自带一份完整外廓牌位定义（44 张），与主体共同构成本局完整布局 */
  var outer = parseOuter(OUTER_DEFS[templateId], templateId);
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
    /* v3：结构签名同时纳入主体参数与本套独有的完整外廓牌位定义 */
    structureSignature: sha256Hex('MAH-L2-TPL-v3|' + templateId + '|' + JSON.stringify(structure) +
      '|' + outer.signature),
    maskCells: cells,
    maskCellCount: cells.length,
    maskRegion: regionInfo.labels,
    maskRegionCount: regionInfo.count,
    maskBox: box,
    outer: outer,
    outerCellCount: outer.cellCount,
    outerLayerCount: outer.layerCount,
    outerTileCount: outer.total,
    outerSignature: outer.signature,
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
    /* 本套模板的完整外廓牌位定义摘要 */
    outerMask: t.outer.mask.slice(),
    outerCellCount: t.outer.cellCount,
    outerLayers: t.outer.layers.slice(),
    outerLayerCount: t.outer.layerCount,
    outerTileCount: t.outer.total,
    outerTurn: t.outer.turn,
    outerSignature: t.outer.signature,
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

