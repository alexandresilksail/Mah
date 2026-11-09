/**
 * MahLeMah v2.0.0 —— 全局唯一常量源。
 *
 * ── v2.0.0 相对 v1 的变化 ────────────────────────────────────────────
 *  · 两关都使用完整的 16 种牌型（唯一注册表见 tile_types.js）；
 *  · 两关布局改为独立模板驱动（见 layout_templates.js），第 2 关是多区域牌堆；
 *  · 难度参数 / 机器人参数集中在 DIFFICULTY；
 *  · 配色改为暖白 / 奶油底 + 多色卡牌 + 橙珊瑚红蓝按钮，绿色只作辅助色；
 *  · C 里的旧深色字段保留同名，但值全部换成浅色系（render.js 只读这些字段）。
 *
 * ── 保持不变的硬契约（engine.js / render.js / ES5 降级视图依赖） ──────
 *  · TILE_W / TILE_H 全项目唯一一对牌面尺寸；
 *  · SLOT_CAPACITY = 7、OVERLAP_THRESHOLD = 0.10、MATCH_DELAY_MS = 200；
 *  · LAYOUTS[level].slot 的字段名与坐标结构；
 *  · levelParams() / layoutFor() / LAYOUTS / C / FUNNEL / LAYER_SHAPE 的导出名。
 */
export const VERSION = '2.0.0';

export const W = 720;
export const H = 1280;

/* ==================== 统一常量 ==================== */

export const TILE_W = 66;
export const TILE_H = 88;
export const TILE_AREA = TILE_W * TILE_H;
export const LATTICE_X = TILE_W / 2;
export const LATTICE_Y = TILE_H / 2;
export const SLOT_CAPACITY = 7;
export const OVERLAP_THRESHOLD = 0.10;
export const MATCH_DELAY_MS = 200;
export const SLOT_SIZE = SLOT_CAPACITY;
export const LEVEL_COUNT = 2;

/* ==================== 牌桌 ==================== */

export const BOARD_BAND = { top: 196, bottom: 918, left: 20, right: 700 };
export const BOARD_CX = (BOARD_BAND.left + BOARD_BAND.right) / 2;
export const BOARD_CY = (BOARD_BAND.top + BOARD_BAND.bottom) / 2;
export const CONNECT_PAD = 4;

export const LAYER_OFFSETS = [
  [1, 1],
  [0, 1],
  [1, 0],
];

/* ==================== 关卡规格 ==================== */

/**
 * 两关都完整使用 16 种牌型，每种张数都是 3 的倍数。
 * 第 1 关：16 种 × 3 张 = 48 张，3 层浅堆（教学但不无脑）。
 * 第 2 关：240 张 = 80 组三消，7 层「主堆 + 两侧盲盒 + 底部保留区」多区域。
 * plan 是层张数基准；真正坐标由 layout_templates.js 的模板数据生成。
 */
export const LEVEL_SPEC = {
  1: {
    level: 1,
    cardCount: 48,
    groups: 16,
    layers: 3,
    types: 16,
    plan: [21, 15, 12],
    props: { shuffle: 3, undo: 3, remove: 3 },
    reviveMax: 1,
    template: 'L1_TUTORIAL',
  },
  2: {
    level: 2,
    cardCount: 240,
    groups: 80,
    layers: 15, // 15 个互不重复的全局堆叠层：主堆 7 + 左右各 3 + 保留区 2
    types: 16,
    plan: [45, 39, 33, 27, 21, 9, 6],
    props: { shuffle: 3, undo: 3, remove: 3 },
    reviveMax: 1,
    template: 'L2_MULTI_ZONE',
  },
};

/** 两关专属牌型分布（单位：三消组数，不是张数） */
export const LEVEL_MIX = {
  1: {
    // 16 种各 1 组；开局 4 组只用「易识别」的 4 种，后期逐步放开
    groups: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    openingSuits: 4,
    openingGroups: 4,
    span: 2,
    easyFirst: ['sparrow', 'red-centre', 'coin-1', 'blue-frame'],
  },
  2: {
    // 不均匀：常见牌型多、稀有牌型少，且与布局区域联动
    groups: [7, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4],
    openingSuits: 10,
    openingGroups: 6,
    span: 3,
    regionBias: {
      core: [0, 1, 2, 3, 6, 7, 8, 11, 12],
      side: [4, 5, 9, 10, 13],
      reserve: [2, 3, 14, 15, 8],
    },
  },
};

/* ==================== 布局外形参数（阶段 4 的模板系统读取） ==================== */

export const LAYOUT_SHAPE = {
  /** 主堆每层张数基准，总和 = 主堆张数 */
  corePlanBase: [45, 39, 33, 27, 21, 9, 6],
  /** 每层相对基准的浮动上限（按 seed 变化，总和归一化回主堆张数） */
  planJitter: 2,
  /** 两侧盲盒长条：每侧张数（3 层 × 4 张） */
  sideCount: 12,
  /** 底部保留区：张数（2 层 × 18 张） */
  reserveCount: 36,
  /** 主堆第 2、3 层包围盒宽度至少比第 0 层宽出的像素（「中间厚」） */
  bellyExtraPx: TILE_W / 2,
  /** 主堆底层 / 中层填充率区间 */
  fillMin: 0.80,
  fillMax: 0.92,
  /** 主堆第 4 层最低填充率 */
  topFillMin: 0.85,
  /** 第 0–3 层每层至少留几处边缘缺口 */
  minEdgeGaps: 2,
};

/** 旧导出名保留：第三轮工具 / 文档里出现过，值指向同一份新配置 */
export const LAYER_SHAPE = {
  planBase: LAYOUT_SHAPE.corePlanBase,
  colsBase: [9, 9, 10, 10, 7, 5, 3],
  bellyExtraPx: LAYOUT_SHAPE.bellyExtraPx,
  planJitter: LAYOUT_SHAPE.planJitter,
  fillMin: LAYOUT_SHAPE.fillMin,
  fillMax: LAYOUT_SHAPE.fillMax,
  topFillMin: LAYOUT_SHAPE.topFillMin,
  minEdgeGaps: LAYOUT_SHAPE.minEdgeGaps,
};

/* ==================== 发牌 / 难度参数 ==================== */

/** 三带：上 25% / 中 30% / 下 45%（按 order 位置，段长对齐 3 的倍数） */
export const BAND_RATIOS = [0.25, 0.30, 0.45];

export const FUNNEL = {
  TOP_SUIT_MIN: 12,
  MID_SPAN: 3,
  LONG_TAIL_GROUPS: 3,
  HILL_STEPS: 0,
  HILL_PROBES: 3,
};

/**
 * 难度模型参数（阶段 5）。所有数值有默认值，运行时由 clampDifficulty() 做边界检查。
 * seedPool 仍走「离线筛选 + 运行时查表」机制，不在生成期做爬山。
 */
export const DIFFICULTY = {
  /** 第 2 关机器人验收：每种策略的样本量 */
  sampleSeeds: 1000,
  /** 蒙特卡洛每次决策的随机走法数 */
  mcPlayouts: 3,
  /** 有限深度搜索的最大展开深度（步） */
  searchDepth: 6,
  /** 多步前瞻的展开宽度 */
  lookaheadWidth: 6,
  /** 带错误惩罚贪心的失误率 */
  noise: 0.10,
  /**
   * seed 池筛选条件（tools/tune_pool.mjs）。
   *
   * v2 不再用「贪心机器人通关率 ≤20%」当硬门槛 —— 需求 5.1 明确指出
   * 单一机器人通关率不能代表真实玩家难度。数学上：SLOT_CAPACITY=7，
   * 波次剥离顺序的前 ~23 张就是开局可点牌，证书要求这 23 张里槽位 ≤6，
   * 因此必然有约 6 组三张同花色的牌同时可点；拥有完整信息的贪心机器人
   * 必然高通关率，这只能证明「关卡可解」，不能证明「关卡简单」。
   *
   * 改为：硬门槛只验「结构合法 + 随机必败 + 强策略可解」，
   * 其余用复合难度指数排序，取最难且仍可解的一批 seed。
   */
  pool: {
    minFreeRatio: 0.10,
    maxFreeRatio: 0.30,
    minAvgPressDepth: 3.0,
    minBottomCovered: 0.85,
    minFreeKinds: 8,
    targetPool: 120,
    /** 硬门槛：随机机器人 0 通关；至少一条强策略能通关（不是死局） */
    requireRandomZero: true,
    requireStrongSolver: true,
    /** 复合难度指数权重（和 = 1）：优先「死局后置」，不奖励开局秒杀 */
    weights: {
      naiveFailure: 0.20,   // 带失误玩家（noisy）失败率越高越难
      mistakeGap: 0.15,    // greedy 与 noisy 的通关率差（失误惩罚）
      lateDeath: 0.35,     // 失败进度越靠后越公平（权重最高）
      pressure: 0.15,      // 平均压深 / 底层被压率
      diversity: 0.15,     // 开局可点牌型数
    },
  },
};

/* ==================== 槽位 / 临时区 ==================== */

export const SLOT_PITCH = 78;
export const SLOT_PANEL = { x: 73, y: 1024, w: 574, h: 124, x0Pad: 14, y0Pad: 18 };
export const SLOT_CARD_W = TILE_W;
export const SLOT_CARD_H = TILE_H;
export const SLOT_X0 = SLOT_PANEL.x + SLOT_PANEL.x0Pad;
export const SLOT_Y = SLOT_PANEL.y + SLOT_PANEL.y0Pad;

export const TEMP_ZONE = { x: 36, y: 1172, pitch: 72, max: 9 };

/* ==================== 顶部 / 道具栏 ==================== */

export const MENU_BTN = { x: 22, y: 30, w: 54, h: 54 };
export const SOUND_BTN = { x: 644, y: 30, w: 54, h: 54 };
export const TOOL_Y = 968;
export const TOOL_R = 42;
export const TOOL_XS = [150, 360, 570];

/* ==================== 布局预设 ==================== */

function makeLayout(level) {
  const spec = LEVEL_SPEC[level];
  return {
    tileW: TILE_W,
    tileH: TILE_H,
    pitchX: TILE_W,
    pitchY: TILE_H,
    jitter: 0,
    plan: spec.plan.map((n, li) => ({ li, n })),
    slot: {
      x: SLOT_PANEL.x,
      y: SLOT_PANEL.y,
      w: SLOT_PANEL.w,
      h: SLOT_PANEL.h,
      x0: SLOT_X0,
      y0: SLOT_Y,
      pitch: SLOT_PITCH,
      padX: SLOT_PANEL.x0Pad,
      padY: SLOT_PANEL.y0Pad,
      cardW: SLOT_CARD_W,
      cardH: SLOT_CARD_H,
      capacity: SLOT_CAPACITY,
    },
  };
}

export const LAYOUTS = { 1: makeLayout(1), 2: makeLayout(2) };

export function layoutFor(level) {
  return level <= 1 ? LAYOUTS[1] : LAYOUTS[2];
}

/* ==================== 配色：暖白 / 奶油底 + 多色卡牌 ==================== */

/**
 * v2.0.0 视觉体系：浅米白 / 暖白 / 淡奶油为主背景，
 * 橙 / 珊瑚红 / 蓝为关键按钮，紫 / 金黄为特殊道具，绿色只作品牌辅助色。
 * 字段名沿用 v1（render.js 不改结构），值全部换成浅色系，文字为深棕。
 */
export const C = {
  bgTop: '#FFF9EC',
  bgMid: '#F7EEDC',
  bgBot: '#EFDFC2',
  wood: 'rgba(196, 158, 108, 0.10)',

  panel: '#FFFFFF',
  panelHi: '#FFF5E2',
  panelLine: 'rgba(150, 112, 70, 0.26)',
  well: '#F2E6CE',
  wellLine: 'rgba(150, 112, 70, 0.20)',

  gold: '#D79B33',
  goldDeep: '#A97520',
  goldGhost: 'rgba(215, 155, 51, 0.30)',

  text: '#4A3524',
  textDim: '#8B7154',
  textFaint: 'rgba(90, 68, 44, 0.36)',

  red: '#DD5B3E',
  redSoft: '#EE8A68',
  green: '#58A473',
  bad: '#D9533B',

  blue: '#3E7FC1',
  orange: '#F08A3C',
  coral: '#E4634A',
  purple: '#8C63C8',
  yellow: '#E9B93C',

  tileFace: '#FFFDF6',
  shadow: 'rgba(96, 66, 38, 0.30)',
  dim: 'rgba(28, 22, 16, 0.45)',
};

/* ==================== 关卡参数 ==================== */

export function levelParams(level, rand = Math.random) {
  void rand;
  const spec = LEVEL_SPEC[level <= 1 ? 1 : 2];
  return {
    level: spec.level,
    triples: spec.cardCount / 3,
    cardCount: spec.cardCount,
    layers: spec.layers,
    types: spec.types,
    props: { ...spec.props },
    reviveMax: spec.reviveMax,
    layout: layoutFor(spec.level),
    mode: spec.level === 1 ? 'tutorial' : 'multi-zone',
    plan: spec.plan.slice(),
    funnel: { ...FUNNEL },
    spec,
  };
}

/** 难度配置边界检查：任何新增配置都要有默认值和边界 */
export function clampDifficulty(raw) {
  const d = { ...DIFFICULTY, ...(raw || {}) };
  d.sampleSeeds = Math.max(1, Math.min(100000, d.sampleSeeds | 0));
  d.mcPlayouts = Math.max(1, Math.min(32, d.mcPlayouts | 0));
  d.searchDepth = Math.max(1, Math.min(64, d.searchDepth | 0));
  d.lookaheadWidth = Math.max(1, Math.min(32, d.lookaheadWidth | 0));
  d.noise = Math.max(0, Math.min(1, d.noise));
  return d;
}
