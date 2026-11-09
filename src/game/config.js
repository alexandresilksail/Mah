/**
 * 全局唯一常量源（玩法层重做版）。
 *
 * ── 单一尺寸 ──────────────────────────────────────────────────────
 * 全项目只有一对牌面尺寸：TILE_W × TILE_H = 66 × 88（严格 3:4）。
 * 所有层、所有关卡、主堆、槽位、临时区、命中判定、遮挡判定全部只读这两个常量。
 * 禁止出现按 layer / 关卡 / 剩余张数缩放牌面的代码。
 *
 * ── 一堆 ──────────────────────────────────────────────────────────
 * 两关都只有一个牌堆：没有侧堆、没有多簇、没有随机抖动。
 * 同层坐标 = 层原点 + (i·TILE_W, j·TILE_H)；层原点逐层累加半格错位向量，
 * 于是所有坐标都落在 (TILE_W/2, TILE_H/2) 的整数倍晶格上。
 *
 * 舞台固定 720 × 1280（竖屏），坐标均为绝对左上角像素。
 */
export const W = 720;
export const H = 1280;

/* ==================== 第 1 步：统一常量 ==================== */

/** 牌面宽（所有层、所有关卡共用，禁止缩放；允许 60~72，此处取 66） */
export const TILE_W = 66;
/** 牌面高（严格 3:4：66 × 4 / 3 = 88） */
export const TILE_H = 88;
/** 单张牌面积：遮挡判定的分母 */
export const TILE_AREA = TILE_W * TILE_H;
/** 半格晶格步长：所有牌的 x 必为 LATTICE_X 的整数倍，y 必为 LATTICE_Y 的整数倍 */
export const LATTICE_X = TILE_W / 2;
export const LATTICE_Y = TILE_H / 2;
/** 槽位格数 */
export const SLOT_CAPACITY = 7;
/** 相交面积 / 牌面积 > 此值即视为被压住 */
export const OVERLAP_THRESHOLD = 0.10;
/** 入槽到消除的延迟（毫秒），期间禁止重复触发 */
export const MATCH_DELAY_MS = 200;

/* ---------- 仍被引用的旧导出名（值全部指向单一常量源） ---------- */
export const SLOT_SIZE = SLOT_CAPACITY;

/** 总关卡数：固定 2 关 */
export const LEVEL_COUNT = 2;

/* ==================== 牌桌 ==================== */

/** 画布安全区：所有牌矩形必须完整落在里面，且牌堆整体居中于此 */
export const BOARD_BAND = { top: 196, bottom: 918, left: 20, right: 700 };
export const BOARD_CX = (BOARD_BAND.left + BOARD_BAND.right) / 2;
export const BOARD_CY = (BOARD_BAND.top + BOARD_BAND.bottom) / 2;
/** 断言单堆连通时，每张牌矩形各外扩的像素 */
export const CONNECT_PAD = 4;

/* ==================== 半格晶格与层间错位 ==================== */

/**
 * 层间错位向量，单位是 (LATTICE_X, LATTICE_Y)。
 * 规范给定的三个向量：{(W/2,H/2), (0,H/2), (W/2,0)}。
 * 逐层由 seed 随机选一个并用整数累加，因此坐标永远落在半格晶格上。
 */
export const LAYER_OFFSETS = [
  [1, 1],
  [0, 1],
  [1, 0],
];

/* ==================== 关卡规格 ==================== */

export const LEVEL_SPEC = {
  1: {
    level: 1,
    cardCount: 24, // 8 组三消
    groups: 8,
    layers: 3,
    types: 8, // 每种恰好 3 张
    plan: [12, 8, 4], // 底层 → 顶层，总和 24，上窄下宽
    props: { shuffle: 3, undo: 3, remove: 3 },
    reviveMax: 1,
  },
  2: {
    level: 2,
    cardCount: 222, // 74 组三消
    groups: 74,
    layers: 7,
    types: 15,
    plan: [56, 50, 42, 34, 20, 12, 8], // 总和 222，每层非空，上窄下宽
    props: { shuffle: 3, undo: 3, remove: 3 },
    reviveMax: 1,
  },
};

/* ==================== 漏斗难度参数 ==================== */

/**
 * 难度调优只需要动这三个（全部在 config.js 的 FUNNEL 对象里）：
 *   TOP_SUITS     ：上带（order 前约 30%）允许的花色种类数。越少开局越顺。
 *                   第 2 关取 3~4，第 1 关固定 3。
 *   MID_SPAN      ：中带每个批次同时推进的组数，也就是「同花色三张在 order 里的间距」。
 *                   越大 → 槽位越常停在 5~6 格（上限受 7 格槽位约束）。
 *   CROSS_GROUPS  ：底带「跨带陷阱组」数量：第一张放在中带尾部，
 *                   第二、三张埋在 order 最深处。越大越容易让槽位被半成品塞满。
 *
 * 其余为结构参数，调难度不必改：
 *   TOP_RATIO / MID_RATIO：三带在 order 上的占比（自动对齐到 3 的倍数）。
 *   HILL_STEPS / HILL_PROBES：生成期爬山（方案 a）的迭代次数与每步贪心探局数；
 *                   置 0 即关闭爬山，只用确定性漏斗构造。
 */
export const FUNNEL = {
  TOP_SUITS: 3,
  MID_SPAN: 3,
  CROSS_GROUPS: 3,
  TOP_RATIO: 0.30,
  MID_RATIO: 0.40,
  HILL_STEPS: 0,
  HILL_PROBES: 3,
};

/* ==================== 槽位 / 临时区 ==================== */

/**
 * 删掉侧堆后重新排布：7 格紧贴、面板居中，不再为左右侧堆留空洞。
 * 7 × SLOT_PITCH = 546 = 面板内宽；槽位牌与牌堆牌同为 TILE_W × TILE_H。
 */
export const SLOT_PITCH = 78;
export const SLOT_PANEL = { x: 73, y: 1024, w: 574, h: 124, x0Pad: 14, y0Pad: 18 };
export const SLOT_CARD_W = TILE_W;
export const SLOT_CARD_H = TILE_H;
export const SLOT_X0 = SLOT_PANEL.x + SLOT_PANEL.x0Pad;
export const SLOT_Y = SLOT_PANEL.y + SLOT_PANEL.y0Pad;

/** 移出道具的临时区：不占槽位，点击可放回槽位 */
export const TEMP_ZONE = { x: 36, y: 1172, pitch: 72, max: 9 };

/* ==================== 顶部 / 道具栏 ==================== */

export const MENU_BTN = { x: 22, y: 30, w: 54, h: 54 };
export const SOUND_BTN = { x: 644, y: 30, w: 54, h: 54 };

/** 道具栏居中三等分，紧贴牌桌下沿、槽位面板上沿 */
export const TOOL_Y = 968;
export const TOOL_R = 42;
export const TOOL_XS = [150, 360, 570];

/* ==================== 布局预设 ==================== */

/**
 * 保留旧字段名供 DOM 降级视图 / 放置逻辑读取。
 * tileW / tileH 只从常量取；pitchX / pitchY 等于牌面尺寸（同层零重叠）；
 * jitter 恒为 0（禁止随机抖动）。
 */
function makeLayout(level) {
  const spec = LEVEL_SPEC[level];
  return {
    tileW: TILE_W,
    tileH: TILE_H,
    pitchX: TILE_W,
    pitchY: TILE_H,
    jitter: 0,
    plan: spec.plan.map((n, li) => ({ li, n })),
    // ES5 降级视图画槽位面板时用的绝对坐标（不能 import，只能从 game.layout 读）
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
    mode: spec.level === 1 ? 'funnel' : 'funnel-hill',
    plan: spec.plan.slice(),
    funnel: { ...FUNNEL },
    spec,
  };
}
