/**
 * 全局唯一常量源。
 *
 * ── 本轮重构的第一原则 ─────────────────────────────────────────────
 * 牌的尺寸只有一套：TILE_W × TILE_H = 54 × 72（严格 3:4）。
 * 主堆、侧堆、教学关、深渊关、槽位、临时区、命中判定、遮挡判定，
 * 全部读取这两个常量。**任何地方都不允许按 layer / 关卡 / 剩余张数去缩放牌面**。
 *
 * 遮挡只有一个定义：存在 z 更高的牌，矩形交集 / TILE_AREA > OVERLAP_THRESHOLD。
 * 与"层数比较"无关，与"覆盖率求和"无关。
 *
 * 舞台固定 720 × 1280（竖屏），所有坐标都是这个逻辑坐标系内的绝对左上角像素。
 */
export const W = 720;
export const H = 1280;

/* ==================== 第 1 步：统一常量 ==================== */

/** 牌面宽（所有层、所有关卡共用，禁止缩放） */
export const TILE_W = 54;
/** 牌面高（所有层、所有关卡共用，禁止缩放） */
export const TILE_H = 72;
/** 单张牌面积：遮挡判定的分母 */
export const TILE_AREA = TILE_W * TILE_H;
/** 槽位格数 */
export const SLOT_CAPACITY = 7;
/** 相交面积 / 牌面积 > 此值即视为被压住 */
export const OVERLAP_THRESHOLD = 0.10;

/* ---------- 旧接口别名（保持导出名不变，值全部指向上面的单一常量源） ---------- */
export const SLOT_SIZE = SLOT_CAPACITY;
export const INTERSECT_EPS = OVERLAP_THRESHOLD;
export const COVER_RATIO = OVERLAP_THRESHOLD;

/** 总关卡数：固定 2 关 */
export const LEVEL_COUNT = 2;

/* ==================== 牌桌分区 ==================== */

/** 画布安全区：所有牌矩形必须完整落在里面 */
export const BOARD_BAND = { top: 196, bottom: 918, left: 20, right: 700 };

/** 主堆可用区（左右各让出 116px 给侧堆） */
export const MAIN_ZONE = { left: 132, right: 588, top: 212, bottom: 902 };

/** 侧堆可用区：左 / 右各一块 */
export const SIDE_ZONES = [
  { left: 22, right: 132, top: 212, bottom: 902 },
  { left: 594, right: 698, top: 212, bottom: 902 },
];

/** 侧堆：每侧 6 个竖向队列 × 每队列 6 张 = 36 张；队列内沿 y 露边 13px */
export const SIDE_QUEUES = 6;
export const SIDE_QUEUE_LEN = 6;
export const SIDE_STEP_Y = 13;
export const SIDE_PITCH_X = 50;
export const SIDE_PITCH_Y = 206;

/* ==================== 关卡规格（第 3 步） ==================== */

export const LEVEL_SPEC = {
  1: {
    level: 1,
    cardCount: 18,
    layers: 2,
    types: 6,
    bottom: { c: 4, r: 3 }, // 底层 4 列 × 3 行 = 12
    top: { c: 2, r: 3 }, // 顶层 6 张，压在底层接缝上
    props: { shuffle: 3, undo: 3, remove: 3 },
    reviveMax: 1,
  },
  2: {
    level: 2,
    cardCount: 222, // 74 组三消
    groups: 74,
    layers: 7,
    types: 15,
    mainCount: 150, // (A) 主堆
    sideCount: 36, // (B) 每个侧堆
    props: { shuffle: 3, undo: 3, remove: 3 },
    reviveMax: 1,
  },
};

/**
 * 难度参数 —— 调优只需要动这三个：
 *   DECOY_GROUPS ：order 段 A 里「只用 3 种花色」的组数，越大前期越顺。
 *   TRAP_SPAN    ：段 B+C+D 的总张数（必须 3 的倍数）。越大 → 段 A 越短、
 *                  长期陷阱组的第一张越浅、与最深处第三张的跨度越大。
 *   LONG_TRAP    ：长期挂单张的陷阱组数，直接决定槽位被占用的格数
 *                  （必须 ≤ SLOT_BUDGET - 2，否则可解路径会被撑爆）。
 * 两个可选的进阶参数（不写进默认 DIFFICULTY，由生成器按组数动态推导，
 * 以保证「15 种花色的组数相差 ≤1」）：
 *   DECOY_SUITS  ：诱饵段花色池大小；TRAP_SUITS：陷阱段花色池大小。
 *   通过 generateLevel(2, seed, { difficulty: { DECOY_SUITS, TRAP_SUITS } }) 覆盖。
 * 其余是安全参数，不建议改：
 *   SLOT_BUDGET   ：反向生成时槽里同时挂着的半成品上限（≤ SLOT_CAPACITY-1）。
 *   MATCH_DELAY_MS：入槽到消除的延迟，期间禁止重复触发。
 * TRAP_GROUPS 由 TRAP_SPAN 推导，保留导出仅为兼容旧接口。
 */
export const DECOY_GROUPS = 15;
export const TRAP_SPAN = 57;
export const LONG_TRAP = 4;
export const TRAP_GROUPS = TRAP_SPAN / 3;
export const SLOT_BUDGET = SLOT_CAPACITY - 1;
export const MATCH_DELAY_MS = 200;

export const DIFFICULTY = {
  DECOY_GROUPS,
  TRAP_SPAN,
  LONG_TRAP,
  TRAP_GROUPS,
  SLOT_BUDGET,
  MATCH_DELAY_MS,
};

/* ==================== 布局预设（保留旧字段名，供 DOM 降级视图 / 放置逻辑读取） ==================== */

const LAYOUT_EASY = {
  tileW: TILE_W,
  tileH: TILE_H,
  pitchX: TILE_W + 8, // 同层留 8px 缝：62
  pitchY: TILE_H + 8, // 80
  jitter: 0,
  // 顶层相对底层错开半格（第 3 步要求）
  staggerX: TILE_W / 2,
  staggerY: TILE_H / 2,
  plan: [{ c: 4, r: 3, n: 12 }, { c: 2, r: 3, n: 6 }],
};

const LAYOUT_HARD = {
  tileW: TILE_W,
  tileH: TILE_H,
  pitchX: TILE_W + 8,
  pitchY: TILE_H + 8,
  jitter: TILE_W / 4,
  // 7 层主堆的层计划（实际几何由 layout.js 的簇模板生成，这里只记录张数）
  plan: [
    { li: 0, n: 30 },
    { li: 1, n: 28 },
    { li: 2, n: 26 },
    { li: 3, n: 24 },
    { li: 4, n: 20 },
    { li: 5, n: 14 },
    { li: 6, n: 8 },
  ],
};

export const LAYOUTS = { 1: LAYOUT_EASY, 2: LAYOUT_HARD };

export function layoutFor(level) {
  return level <= 1 ? LAYOUT_EASY : LAYOUT_HARD;
}

/** 某一关的总牌数（层计划直接加总；深渊关另加两侧堆） */
export function planTotal(L) {
  const n = L.plan.reduce((s, seg) => s + seg.n, 0);
  return L === LAYOUT_HARD ? n + LEVEL_SPEC[2].sideCount * 2 : n;
}

/* ==================== 槽位 / 临时区（统一 54×72） ==================== */

export const SLOT_PANEL = { x: 26, y: 1028, w: 668, h: 126 };
export const SLOT_PITCH = 92; // 7 × 92 = 644 = 面板内宽
export const SLOT_CARD_W = TILE_W;
export const SLOT_CARD_H = TILE_H;
export const SLOT_X0 = SLOT_PANEL.x + 12;
export const SLOT_Y = SLOT_PANEL.y + Math.round((SLOT_PANEL.h - TILE_H) / 2);

/** 移出道具的临时区：不占槽位，点击可放回槽位 */
export const TEMP_ZONE = { x: 90, y: 1172, pitch: 60, max: 9 };

/* ==================== 顶部 / 道具栏 ==================== */

export const MENU_BTN = { x: 22, y: 30, w: 54, h: 54 };
export const SOUND_BTN = { x: 644, y: 30, w: 54, h: 54 };

export const TOOL_Y = 972;
export const TOOL_R = 42;
export const TOOL_XS = [152, 360, 568];

/* ==================== 配色：深色沉浸 ==================== */

export const C = {
  bgTop: '#1B1714',
  bgMid: '#131010',
  bgBot: '#080707',
  wood: 'rgba(126, 92, 58, 0.10)',

  panel: 'rgba(22, 19, 17, 0.94)',
  panelHi: 'rgba(48, 41, 35, 0.94)',
  panelLine: 'rgba(255, 226, 176, 0.16)',
  well: 'rgba(8, 7, 6, 0.86)',
  wellLine: 'rgba(255, 236, 200, 0.10)',

  gold: '#EBCB86',
  goldDeep: '#C79A4A',
  goldGhost: 'rgba(235, 203, 134, 0.30)',

  text: '#F0E5D2',
  textDim: 'rgba(228, 213, 190, 0.55)',
  textFaint: 'rgba(228, 213, 190, 0.30)',

  red: '#C8452F',
  redSoft: '#E0705C',
  green: '#4E9E6E',
  bad: '#E0705C',

  tileFace: '#FFFDF5',
  shadow: 'rgba(0,0,0,0.5)',
  dim: 'rgba(0, 0, 0, 0.35)',
};

/* ==================== 关卡参数 ==================== */

/**
 * 关卡参数。保留 (level, rand) 签名与全部旧字段。
 * @param {number} level 1 | 2
 * @param {() => number} rand 随机源（保留参数位）
 */
export function levelParams(level, rand = Math.random) {
  const spec = LEVEL_SPEC[level <= 1 ? 1 : 2];
  const layout = layoutFor(spec.level);
  return {
    level: spec.level,
    triples: spec.cardCount / 3,
    cardCount: spec.cardCount,
    layers: spec.layers,
    types: spec.types,
    props: { ...spec.props },
    reviveMax: spec.reviveMax,
    layout,
    mode: spec.level === 1 ? 'solvable' : 'reverse',
    phases: spec.level === 2 ? { decoy: DECOY_GROUPS * 3, trap: TRAP_GROUPS * 3 } : null,
    spec,
  };
}
