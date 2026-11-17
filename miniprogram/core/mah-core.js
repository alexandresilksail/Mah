var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// core/index.js
var index_exports = {};
__export(index_exports, {
  BOARD_BAND: () => BOARD_BAND,
  C: () => C,
  GENERATION_REASONS: () => GENERATION_REASONS,
  Game: () => Game,
  GenerationFailureError: () => GenerationFailureError,
  H: () => H,
  HISTORY_LIMIT: () => HISTORY_LIMIT,
  L2_DEDUP_ALGORITHM: () => L2_DEDUP_ALGORITHM,
  L2_HISTORY_LIMIT: () => L2_HISTORY_LIMIT,
  L2_TEMPLATES: () => L2_TEMPLATES,
  L2_TEMPLATE_IDS: () => L2_TEMPLATE_IDS,
  LAYER_OFFSETS: () => LAYER_OFFSETS,
  LAYOUTS: () => LAYOUTS,
  LEVEL1_PROFILES: () => LEVEL1_PROFILES,
  LEVEL2_PROFILES: () => LEVEL2_PROFILES,
  LEVEL_MIX: () => LEVEL_MIX,
  LEVEL_SPEC: () => LEVEL_SPEC,
  MASK_COLS: () => MASK_COLS,
  MASK_ROWS: () => MASK_ROWS,
  MATCH_DELAY_MS: () => MATCH_DELAY_MS,
  OUTER_TILE_COUNT: () => OUTER_TILE_COUNT,
  OVERLAP_THRESHOLD: () => OVERLAP_THRESHOLD,
  RESHUFFLE_MAX: () => RESHUFFLE_MAX,
  SIMILARITY_THRESHOLD: () => SIMILARITY_THRESHOLD,
  SLOT_CAPACITY: () => SLOT_CAPACITY,
  SLOT_CARD_H: () => SLOT_CARD_H,
  SLOT_CARD_W: () => SLOT_CARD_W,
  SLOT_PANEL: () => SLOT_PANEL,
  SLOT_PITCH: () => SLOT_PITCH,
  SLOT_X0: () => SLOT_X0,
  SLOT_Y: () => SLOT_Y,
  SOLVE_BUDGET: () => SOLVE_BUDGET,
  SPEC_ALGORITHM: () => SPEC_ALGORITHM,
  SUITS_L1: () => SUITS_L1,
  SUITS_L2: () => SUITS_L2,
  TEMP_ZONE: () => TEMP_ZONE,
  TILE_H: () => TILE_H,
  TILE_TYPES: () => TILE_TYPES,
  TILE_W: () => TILE_W,
  TYPE_BY_ID: () => TYPE_BY_ID,
  TYPE_COUNT: () => TYPE_COUNT,
  TYPE_IDS: () => TYPE_IDS,
  TYPE_LIST: () => TYPE_LIST,
  VERSION: () => VERSION,
  W: () => W,
  appendHistory: () => appendHistory,
  availableTemplateIds: () => availableTemplateIds,
  buildBlockerGraph: () => buildBlockerGraph,
  calculateLayoutSignature: () => calculateLayoutSignature,
  calculateStructureSignature: () => calculateStructureSignature,
  canonicalGeometrySignature: () => canonicalGeometrySignature,
  cardAt: () => cardAt,
  checkAgainstRecent: () => checkAgainstRecent,
  checkL2DualDedup: () => checkL2DualDedup,
  circle: () => circle,
  clamp: () => clamp,
  clampDifficulty: () => clampDifficulty,
  clearTileCache: () => clearTileCache,
  createNewGame: () => createNewGame,
  describeTemplateLayout: () => describeTemplateLayout,
  drawBackground: () => drawBackground,
  drawBoard: () => drawBoard,
  drawFx: () => drawFx,
  drawMascot: () => drawMascot,
  drawSlot: () => drawSlot,
  drawTile: () => drawTile,
  drawTileShadow: () => drawTileShadow,
  drawTitle: () => drawTitle,
  drawTitleScreen: () => drawTitleScreen,
  easeOutCubic: () => easeOutCubic,
  generateLevel: () => generateLevel,
  generateProfileLayout: () => generateProfileLayout,
  generateTemplateLayout: () => generateTemplateLayout,
  generatorIsCovered: () => isCovered,
  getType: () => getType,
  getUI: () => getUI,
  hasSupport: () => hasSupport,
  historyFor: () => historyFor,
  historyLimitFor: () => historyLimitFor,
  hitButton: () => hitButton,
  isCovered: () => isCovered,
  layoutFor: () => layoutFor,
  layoutShape: () => layoutShape,
  layoutSimilarity: () => layoutSimilarity,
  lerp: () => lerp,
  levelParams: () => levelParams,
  makeGameId: () => makeGameId,
  makeRng: () => makeRng,
  mixFor: () => mixFor,
  overlapArea: () => overlapArea,
  overlapRatio: () => overlapRatio,
  peelOrder: () => peelOrder,
  pickPoolSeed: () => pickPoolSeed,
  previousFrom: () => previousFrom,
  profileFor: () => profileFor,
  profilesFor: () => profilesFor,
  randomSeed: () => randomSeed,
  refreshBlocked: () => refreshBlocked,
  resolveSlot: () => resolveSlot,
  rollProfile: () => rollProfile,
  rr: () => rr,
  sanitizeHistory: () => sanitizeHistory,
  sanitizeRecord: () => sanitizeRecord,
  sha256Hex: () => sha256Hex,
  slotInsert: () => slotInsert,
  slotMatchTypes: () => slotMatchTypes,
  slotTargetX: () => slotTargetX,
  specFor: () => specFor,
  specSummary: () => specSummary,
  structureSimilarity: () => structureSimilarity,
  templateById: () => templateById,
  templateCandidateStats: () => templateCandidateStats,
  templateCategoryStats: () => templateCategoryStats,
  templateSummary: () => templateSummary,
  text: () => text,
  tileType: () => tileType,
  usedTemplateIds: () => usedTemplateIds,
  validateLevel: () => validateLevel,
  validateRegistry: () => validateRegistry,
  verify: () => verify,
  verifyTemplateFidelity: () => verifyTemplateFidelity
});
module.exports = __toCommonJS(index_exports);

// core/shared/config.js
var VERSION = "2.0.0";
var W = 720;
var H = 1280;
var TILE_W = 66;
var TILE_H = 88;
var TILE_AREA = TILE_W * TILE_H;
var LATTICE_X = TILE_W / 2;
var LATTICE_Y = TILE_H / 2;
var SLOT_CAPACITY = 7;
var OVERLAP_THRESHOLD = 0.1;
var MATCH_DELAY_MS = 200;
var SLOT_SIZE = SLOT_CAPACITY;
var LEVEL_COUNT = 2;
var BOARD_BAND = { top: 196, bottom: 918, left: 20, right: 700 };
var BOARD_CX = (BOARD_BAND.left + BOARD_BAND.right) / 2;
var BOARD_CY = (BOARD_BAND.top + BOARD_BAND.bottom) / 2;
var CONNECT_PAD = 4;
var LAYER_OFFSETS = [
  [1, 1],
  [0, 1],
  [1, 0]
];
var LEVEL_SPEC = {
  1: {
    level: 1,
    cardCount: 48,
    groups: 16,
    layers: 3,
    types: 16,
    plan: [21, 15, 12],
    props: { shuffle: 3, undo: 3, remove: 3 },
    reviveMax: 1,
    template: "L1_TUTORIAL"
  },
  2: {
    level: 2,
    cardCount: 240,
    groups: 80,
    layers: 15,
    // 15 个互不重复的全局堆叠层：主堆 7 + 左右各 3 + 保留区 2
    types: 16,
    plan: [45, 39, 33, 27, 21, 9, 6],
    props: { shuffle: 3, undo: 3, remove: 3 },
    reviveMax: 1,
    template: "L2_MULTI_ZONE"
  }
};
var LEVEL_MIX = {
  1: {
    // 16 种各 1 组；开局 4 组只用「易识别」的 4 种，后期逐步放开
    groups: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    openingSuits: 4,
    openingGroups: 4,
    span: 2,
    easyFirst: ["sparrow", "red-centre", "coin-1", "blue-frame"]
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
      reserve: [2, 3, 14, 15, 8]
    }
  }
};
var LEVEL2_PROFILES = [
  { id: 0, layers: 28, types: 15, mainCount: 277, queueCount: 44, groups: 107, groupsPerType: [8, 8, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7], weight: 0.0875, kind: "large" },
  { id: 1, layers: 24, types: 13, mainCount: 238, queueCount: 44, groups: 94, groupsPerType: [8, 8, 8, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7], weight: 0.0875, kind: "large" },
  { id: 2, layers: 26, types: 14, mainCount: 256, queueCount: 44, groups: 100, groupsPerType: [8, 8, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7], weight: 0.0875, kind: "large" },
  { id: 3, layers: 27, types: 16, mainCount: 268, queueCount: 44, groups: 104, groupsPerType: [7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6], weight: 0.0875, kind: "large" },
  { id: 4, layers: 23, types: 13, mainCount: 229, queueCount: 44, groups: 91, groupsPerType: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7], weight: 0.0875, kind: "large" },
  { id: 5, layers: 25, types: 13, mainCount: 247, queueCount: 44, groups: 97, groupsPerType: [8, 8, 8, 8, 8, 8, 7, 7, 7, 7, 7, 7, 7], weight: 0.0875, kind: "large" },
  { id: 6, layers: 22, types: 13, mainCount: 217, queueCount: 44, groups: 87, groupsPerType: [7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6], weight: 0.0875, kind: "large" },
  { id: 7, layers: 27, types: 14, mainCount: 268, queueCount: 44, groups: 104, groupsPerType: [8, 8, 8, 8, 8, 8, 7, 7, 7, 7, 7, 7, 7, 7], weight: 0.0875, kind: "large" },
  { id: 8, layers: 15, types: 15, mainCount: 148, queueCount: 44, groups: 64, groupsPerType: [5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], weight: 0.15, kind: "lite" },
  { id: 9, layers: 20, types: 15, mainCount: 211, queueCount: 44, groups: 85, groupsPerType: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5], weight: 0.15, kind: "lite" }
];
var LEVEL1_PROFILES = [
  { id: 0, layers: 2, types: 8, mainCount: 24, queueCount: 0, groups: 8, groupsPerType: [1, 1, 1, 1, 1, 1, 1, 1], weight: 0.25, kind: "l1" },
  { id: 1, layers: 3, types: 10, mainCount: 30, queueCount: 0, groups: 10, groupsPerType: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], weight: 0.25, kind: "l1" },
  { id: 2, layers: 3, types: 12, mainCount: 36, queueCount: 0, groups: 12, groupsPerType: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], weight: 0.25, kind: "l1" },
  { id: 3, layers: 3, types: 16, mainCount: 48, queueCount: 0, groups: 16, groupsPerType: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], weight: 0.25, kind: "l1" }
];
var RETRY_KEEPS_PROFILE = false;
function profilesFor(level) {
  return level <= 1 ? LEVEL1_PROFILES : LEVEL2_PROFILES;
}
function profileFor(level, id) {
  const list = profilesFor(level);
  if (Number.isInteger(id) && id >= 0 && id < list.length) return list[id];
  return list[0];
}
function rollProfile(level, rand = Math.random, current) {
  const list = profilesFor(level);
  const pool = list.filter((p) => p.id !== current);
  let total = 0;
  for (const p of pool) total += p.weight;
  let r = rand();
  if (!(r >= 0) || r >= 1) r = 0;
  let acc = 0;
  for (const p of pool) {
    acc += p.weight / total;
    if (r < acc) return p.id;
  }
  return pool[pool.length - 1].id;
}
var BASE28_SEGMENTS = [
  { ratio: 0.25, n: 7, from: 1.3, to: 0.82 },
  // 顶部 25%
  { ratio: 0.36, n: 10, from: 0.78, to: 0.6 },
  // 中段 36%（腰部最细）
  { ratio: 0.39, n: 11, from: 0.72, to: 1.45 }
  // 底部核心 39%（最厚）
];
function resample(seg, m) {
  const out = [];
  if (m <= 1) return [seg.from];
  for (let i = 0; i < m; i++) {
    const u = i / (m - 1);
    out.push(seg.from + (seg.to - seg.from) * u);
  }
  return out;
}
function normalizePlan(weights, total) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const plan = weights.map((w) => Math.max(1, Math.round(w / sum * total)));
  let err = total - plan.reduce((a, b) => a + b, 0);
  let guard = 0;
  while (err !== 0 && guard++ < 1e4) {
    let bi2 = 0;
    for (let i2 = 1; i2 < weights.length; i2++) if (weights[i2] > weights[bi2]) bi2 = i2;
    const idx2 = (guard - 1) % plan.length;
    const i = err > 0 ? idx2 : bi2;
    if (err > 0) {
      plan[i]++;
      err--;
    } else if (plan[i] > 1) {
      plan[i]--;
      err++;
    }
  }
  return plan;
}
function layerPlanFor(profile) {
  if (!profile) return [];
  if (profile.level === 1 || profile.kind === "l1") {
    const w = profile.layers === 2 ? [0.6, 0.4] : [0.5, 0.33, 0.17];
    return normalizePlan(w, profile.mainCount);
  }
  const N = profile.layers;
  const n1 = Math.max(1, Math.round(N * BASE28_SEGMENTS[0].ratio));
  const n2 = Math.max(1, Math.round(N * BASE28_SEGMENTS[1].ratio));
  const n3 = Math.max(1, N - n1 - n2);
  const counts = [n1, n2, N - n1 - n2 >= 1 ? N - n1 - n2 : n3];
  const weights = [];
  for (let s = 0; s < 3; s++) {
    const part = resample(BASE28_SEGMENTS[s], counts[s]);
    for (const w of part) weights.push(w);
  }
  while (weights.length < N) weights.push(BASE28_SEGMENTS[2].to);
  weights.length = N;
  return normalizePlan(weights, profile.mainCount);
}
var LAYOUT_SHAPE = {
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
  fillMin: 0.8,
  fillMax: 0.92,
  /** 主堆第 4 层最低填充率 */
  topFillMin: 0.85,
  /** 第 0–3 层每层至少留几处边缘缺口 */
  minEdgeGaps: 2
};
var LAYER_SHAPE = {
  planBase: LAYOUT_SHAPE.corePlanBase,
  colsBase: [9, 9, 10, 10, 7, 5, 3],
  bellyExtraPx: LAYOUT_SHAPE.bellyExtraPx,
  planJitter: LAYOUT_SHAPE.planJitter,
  fillMin: LAYOUT_SHAPE.fillMin,
  fillMax: LAYOUT_SHAPE.fillMax,
  topFillMin: LAYOUT_SHAPE.topFillMin,
  minEdgeGaps: LAYOUT_SHAPE.minEdgeGaps
};
var FUNNEL = {
  TOP_SUIT_MIN: 12,
  MID_SPAN: 3,
  LONG_TAIL_GROUPS: 3,
  HILL_STEPS: 0,
  HILL_PROBES: 3
};
var DIFFICULTY = {
  /** 第 2 关机器人验收：每种策略的样本量 */
  sampleSeeds: 1e3,
  /** 蒙特卡洛每次决策的随机走法数 */
  mcPlayouts: 3,
  /** 有限深度搜索的最大展开深度（步） */
  searchDepth: 6,
  /** 多步前瞻的展开宽度 */
  lookaheadWidth: 6,
  /** 带错误惩罚贪心的失误率 */
  noise: 0.1,
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
    minFreeRatio: 0.1,
    maxFreeRatio: 0.3,
    minAvgPressDepth: 3,
    minBottomCovered: 0.85,
    minFreeKinds: 8,
    targetPool: 120,
    /** 硬门槛：随机机器人 0 通关；至少一条强策略能通关（不是死局） */
    requireRandomZero: true,
    requireStrongSolver: true,
    /** 复合难度指数权重（和 = 1）：优先「死局后置」，不奖励开局秒杀 */
    weights: {
      naiveFailure: 0.2,
      // 带失误玩家（noisy）失败率越高越难
      mistakeGap: 0.15,
      // greedy 与 noisy 的通关率差（失误惩罚）
      lateDeath: 0.35,
      // 失败进度越靠后越公平（权重最高）
      pressure: 0.15,
      // 平均压深 / 底层被压率
      diversity: 0.15
      // 开局可点牌型数
    }
  }
};
var SLOT_PITCH = 78;
var SLOT_PANEL = { x: 73, y: 1024, w: 574, h: 124, x0Pad: 14, y0Pad: 18 };
var SLOT_CARD_W = TILE_W;
var SLOT_CARD_H = TILE_H;
var SLOT_X0 = SLOT_PANEL.x + SLOT_PANEL.x0Pad;
var SLOT_Y = SLOT_PANEL.y + SLOT_PANEL.y0Pad;
var TEMP_ZONE = { x: 36, y: 1172, pitch: 72, max: 9 };
var MENU_BTN = { x: 22, y: 30, w: 54, h: 54 };
var SETTINGS_BTN = { x: 516, y: 30, w: 54, h: 54 };
var SOUND_BTN = { x: 580, y: 30, w: 54, h: 54 };
var TOOL_Y = 968;
var TOOL_R = 42;
var TOOL_XS = [150, 360, 570];
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
      capacity: SLOT_CAPACITY
    }
  };
}
var LAYOUTS = { 1: makeLayout(1), 2: makeLayout(2) };
function layoutFor(level) {
  return level <= 1 ? LAYOUTS[1] : LAYOUTS[2];
}
var C = {
  bgTop: "#FFF9EC",
  bgMid: "#F7EEDC",
  bgBot: "#EFDFC2",
  wood: "rgba(196, 158, 108, 0.10)",
  panel: "#FFFFFF",
  panelHi: "#FFF5E2",
  panelLine: "rgba(150, 112, 70, 0.26)",
  well: "#F2E6CE",
  wellLine: "rgba(150, 112, 70, 0.20)",
  gold: "#D79B33",
  goldDeep: "#A97520",
  goldGhost: "rgba(215, 155, 51, 0.30)",
  text: "#4A3524",
  textDim: "#8B7154",
  textFaint: "rgba(90, 68, 44, 0.36)",
  red: "#DD5B3E",
  redSoft: "#EE8A68",
  green: "#58A473",
  bad: "#D9533B",
  blue: "#3E7FC1",
  orange: "#F08A3C",
  coral: "#E4634A",
  purple: "#8C63C8",
  yellow: "#E9B93C",
  tileFace: "#FFFDF6",
  shadow: "rgba(96, 66, 38, 0.30)",
  dim: "rgba(28, 22, 16, 0.45)"
};
function levelParams(level, rand = Math.random, profileId) {
  void rand;
  const lv = level <= 1 ? 1 : 2;
  const spec = LEVEL_SPEC[lv];
  const profile = Number.isInteger(profileId) ? profileFor(lv, profileId) : null;
  if (!profile) {
    return {
      level: spec.level,
      triples: spec.cardCount / 3,
      cardCount: spec.cardCount,
      layers: spec.layers,
      types: spec.types,
      props: __spreadValues({}, spec.props),
      reviveMax: spec.reviveMax,
      layout: layoutFor(spec.level),
      mode: spec.level === 1 ? "tutorial" : "multi-zone",
      plan: spec.plan.slice(),
      funnel: __spreadValues({}, FUNNEL),
      spec,
      profileId: null,
      profile: null,
      queueCount: 0,
      groups: spec.groups
    };
  }
  const cardCount = profile.mainCount + profile.queueCount;
  return {
    level: lv,
    triples: cardCount / 3,
    cardCount,
    layers: profile.layers,
    types: profile.types,
    props: __spreadValues({}, spec.props),
    reviveMax: spec.reviveMax,
    layout: layoutFor(lv),
    mode: lv === 1 ? "tutorial" : "multi-zone",
    plan: layerPlanFor(profile),
    funnel: __spreadValues({}, FUNNEL),
    spec: {
      level: lv,
      cardCount,
      groups: profile.groups,
      layers: profile.layers,
      types: profile.types,
      plan: layerPlanFor(profile),
      props: __spreadValues({}, spec.props),
      reviveMax: spec.reviveMax,
      template: spec.template
    },
    profileId: profile.id,
    profile,
    queueCount: profile.queueCount,
    groups: profile.groups
  };
}
function clampDifficulty(raw) {
  const d2 = __spreadValues(__spreadValues({}, DIFFICULTY), raw || {});
  d2.sampleSeeds = Math.max(1, Math.min(1e5, d2.sampleSeeds | 0));
  d2.mcPlayouts = Math.max(1, Math.min(32, d2.mcPlayouts | 0));
  d2.searchDepth = Math.max(1, Math.min(64, d2.searchDepth | 0));
  d2.lookaheadWidth = Math.max(1, Math.min(32, d2.lookaheadWidth | 0));
  d2.noise = Math.max(0, Math.min(1, d2.noise));
  return d2;
}

// core/shared/draw.js
function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.arcTo(x + w, y, x + w, y + rad, rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
  ctx.lineTo(x + rad, y + h);
  ctx.arcTo(x, y + h, x, y + h - rad, rad);
  ctx.lineTo(x, y + rad);
  ctx.arcTo(x, y, x + rad, y, rad);
  ctx.closePath();
}
function circle(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}
function text(ctx, str3, x, y, o = {}) {
  const {
    size = 24,
    weight = "400",
    family = '"Segoe UI", "Microsoft YaHei", system-ui, sans-serif',
    fill = "#fff",
    align = "center",
    baseline = "middle",
    alpha = 1,
    stroke = null,
    strokeWidth = 0,
    lineJoin = "round"
  } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.lineJoin = lineJoin;
  ctx.miterLimit = 2;
  if (stroke && strokeWidth > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(str3, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(str3, x, y);
  ctx.restore();
}
function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function overlapRatio(a, b) {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  if (x2 <= x || y2 <= y) return 0;
  return (x2 - x) * (y2 - y) / (a.w * a.h);
}

// core/shared/tile_types.js
var TILE_TYPES = [
  { id: "sparrow", name: "\u5E7A\u9E21", short: "\u96C0", family: "bird", icon: "bird", face: "#E6F6EC", rim: "#2E8B62", ink: "#176B4A", accent: "#F2A03D" },
  { id: "red-centre", name: "\u7EA2\u4E2D", short: "\u4E2D", family: "honor", icon: "diamond", face: "#FDE9E4", rim: "#D64B36", ink: "#A82C1C", accent: "#FFCE5C" },
  { id: "green-fa", name: "\u9752\u767C", short: "\u767C", family: "honor", icon: "leaf", face: "#E8F4D9", rim: "#4F9A3C", ink: "#27621F", accent: "#F0C64C" },
  { id: "blue-frame", name: "\u84DD\u6846", short: "\u6846", family: "honor", icon: "frame", face: "#E4F0FD", rim: "#3B7BC8", ink: "#1E4E8C", accent: "#FF9E5E" },
  { id: "coin-1", name: "\u91D1\u7B52", short: "\u91D1", family: "coin", icon: "coin1", face: "#FFF3D6", rim: "#D9A227", ink: "#8A5E12", accent: "#D9533B" },
  { id: "coin-3", name: "\u4E09\u7B52", short: "\u4E09", family: "coin", icon: "coin3", face: "#F1E8FB", rim: "#8A5FC0", ink: "#593389", accent: "#4FC0A8" },
  { id: "bamboo-2", name: "\u53CC\u7AF9", short: "\u7AF9", family: "bamboo", icon: "bamboo2", face: "#E9F6E2", rim: "#62A83F", ink: "#2F6B21", accent: "#E4573D" },
  { id: "bamboo-5", name: "\u4E94\u7AF9", short: "\u4E94", family: "bamboo", icon: "bamboo5", face: "#DEF2EE", rim: "#2E9C8C", ink: "#12645A", accent: "#F4B63C" },
  { id: "flower-plum", name: "\u6885\u82B1", short: "\u6885", family: "flower", icon: "blossom", face: "#FDE8F0", rim: "#D65A8C", ink: "#9B2F5C", accent: "#FFD25E" },
  { id: "flower-orchid", name: "\u5170\u82B1", short: "\u5170", family: "flower", icon: "orchid", face: "#F0E9FC", rim: "#7A5FC8", ink: "#49308A", accent: "#5FC0A8" },
  { id: "flower-chrys", name: "\u91D1\u83CA", short: "\u83CA", family: "flower", icon: "chrys", face: "#FFF0DA", rim: "#E08A2C", ink: "#945413", accent: "#D9533B" },
  { id: "fish", name: "\u9526\u9CA4", short: "\u9CA4", family: "animal", icon: "fish", face: "#FFE9DF", rim: "#E4634A", ink: "#A83A24", accent: "#4E9ED6" },
  { id: "moon", name: "\u5F2F\u6708", short: "\u6708", family: "sky", icon: "moon", face: "#E7EAFB", rim: "#4A5BAE", ink: "#2A357A", accent: "#F2C14E" },
  { id: "sun", name: "\u671D\u9633", short: "\u65E5", family: "sky", icon: "sun", face: "#FFF4CF", rim: "#E6B12F", ink: "#9A6B12", accent: "#E4573D" },
  { id: "cloud", name: "\u7965\u4E91", short: "\u4E91", family: "sky", icon: "cloud", face: "#E3F4FB", rim: "#3E97C1", ink: "#1D6389", accent: "#F0A04B" },
  { id: "star", name: "\u661F\u8292", short: "\u661F", family: "sky", icon: "star", face: "#F6EBFF", rim: "#9B5BC4", ink: "#5F3086", accent: "#F5C33B" }
];
var TYPE_IDS = [];
var TYPE_BY_ID = {};
for (let i = 0; i < TILE_TYPES.length; i++) {
  const t = TILE_TYPES[i];
  t.index = i;
  TYPE_IDS.push(t.id);
  TYPE_BY_ID[t.id] = t;
}
var TYPE_COUNT = TILE_TYPES.length;
function tileType(id) {
  return TYPE_BY_ID[id] || null;
}
function validateRegistry() {
  const ids = {};
  const names = {};
  const colors = {};
  const issues = [];
  for (let i = 0; i < TILE_TYPES.length; i++) {
    const t = TILE_TYPES[i];
    if (!t.id || !t.name || !t.icon || !t.face || !t.rim || !t.ink || !t.accent) {
      issues.push(`\u7B2C ${i} \u9879\u5B57\u6BB5\u7F3A\u5931`);
    }
    if (ids[t.id]) issues.push(`ID \u91CD\u590D\uFF1A${t.id}`);
    if (names[t.name]) issues.push(`\u540D\u79F0\u91CD\u590D\uFF1A${t.name}`);
    const key = t.face + "|" + t.rim + "|" + t.ink;
    if (colors[key]) issues.push(`\u914D\u8272\u91CD\u590D\uFF1A${t.id} / ${colors[key]}`);
    ids[t.id] = 1;
    names[t.name] = 1;
    colors[key] = t.id;
  }
  if (TILE_TYPES.length !== 16) issues.push(`\u724C\u578B\u6570\u91CF\u5E94\u4E3A 16\uFF0C\u5B9E\u6D4B ${TILE_TYPES.length}`);
  return { ok: issues.length === 0, issues, count: TILE_TYPES.length };
}
function mixFor(level, profile) {
  if (profile && Array.isArray(profile.groupsPerType)) {
    const out = new Array(16).fill(0);
    const gpt = profile.groupsPerType;
    for (let i = 0; i < gpt.length && i < 16; i++) out[i] = gpt[i];
    return out;
  }
  const raw = level <= 1 ? [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] : [7, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4];
  return raw.slice();
}
var ES5_LABELS = {};
for (let i = 0; i < TILE_TYPES.length; i++) {
  ES5_LABELS[TILE_TYPES[i].id] = { text: TILE_TYPES[i].short, color: TILE_TYPES[i].rim, face: TILE_TYPES[i].face };
}

// core/shared/tiles.js
var TYPE_LIST = [];
for (let i = 0; i < TILE_TYPES.length; i++) {
  const t = TILE_TYPES[i];
  TYPE_LIST.push({ id: t.id, kind: t.icon, label: t.name, index: i });
}
var TYPE_MAP = {};
for (let i = 0; i < TYPE_LIST.length; i++) TYPE_MAP[TYPE_LIST[i].id] = TYPE_LIST[i];
function getType(id) {
  return TYPE_MAP[id] || null;
}
var SUITS_L2 = TYPE_IDS.slice();
var SUITS_L1 = TYPE_IDS.slice();
var SHADOW_BLUR = 8;
var SHADOW_DX = 0;
var SHADOW_DY = 5;
var SPRITE_DPR = 2;
var spriteCache = {};
var shadowCache = {};
var spriteCount = 0;
var shadowCount = 0;
var spriteDisabled = false;
function dimAlphaOf(dimLevel) {
  return dimLevel > 0 ? Math.min(0.62, 0.45 + 0.05 * (dimLevel - 1)) : 0;
}
function offscreen(ctx, w, h) {
  const doc = ctx.canvas && ctx.canvas.ownerDocument;
  if (!doc || typeof doc.createElement !== "function") {
    spriteDisabled = true;
    return null;
  }
  const cv = doc.createElement("canvas");
  cv.width = Math.max(1, Math.round(w * SPRITE_DPR));
  cv.height = Math.max(1, Math.round(h * SPRITE_DPR));
  const c2 = cv.getContext("2d");
  if (!c2) {
    spriteDisabled = true;
    return null;
  }
  c2.scale(SPRITE_DPR, SPRITE_DPR);
  return c2;
}
function spriteFor(ctx, typeId, w, h, dimLevel, playable, selected) {
  if (spriteDisabled) return null;
  const dimAlpha = dimAlphaOf(dimLevel);
  const key = typeId + "|" + w.toFixed(1) + "|" + h.toFixed(1) + "|d" + dimAlpha.toFixed(2) + "|p" + (playable ? 1 : 0) + "|s" + (selected ? 1 : 0);
  if (spriteCache[key]) return spriteCache[key];
  const c2 = offscreen(ctx, w, h);
  if (!c2) return null;
  paintTile(c2, 0, 0, w, h, TYPE_BY_ID[typeId] || TILE_TYPES[0], dimAlpha, playable, selected);
  if (spriteCount > 400) {
    for (const k in spriteCache) if (Object.prototype.hasOwnProperty.call(spriteCache, k)) delete spriteCache[k];
    spriteCount = 0;
  }
  spriteCache[key] = c2.canvas;
  spriteCount++;
  return c2.canvas;
}
function shadowPad(w) {
  return Math.max(20, Math.round(w * 0.3));
}
function shadowSprite(ctx, w, h) {
  if (spriteDisabled) return null;
  const key = w.toFixed(1) + "|" + h.toFixed(1);
  if (shadowCache[key]) return shadowCache[key];
  const pad = shadowPad(w);
  const c2 = offscreen(ctx, w + pad * 2, h + pad * 2);
  if (!c2) return null;
  const rad = w * 0.14;
  const hasFilter = typeof c2.filter === "string";
  c2.save();
  if (hasFilter) c2.filter = "blur(1.8px)";
  c2.globalAlpha = 0.5;
  c2.fillStyle = "#5A3A22";
  rr(c2, pad + SHADOW_DX - 2, pad + SHADOW_DY - 2, w, h, rad);
  c2.fill();
  c2.restore();
  c2.save();
  if (hasFilter) c2.filter = "blur(" + SHADOW_BLUR + "px)";
  c2.globalAlpha = 0.45;
  c2.fillStyle = "#5A3A22";
  rr(c2, pad + SHADOW_DX, pad + SHADOW_DY, w, h, rad);
  c2.fill();
  c2.restore();
  if (shadowCount > 16) {
    for (const k in shadowCache) if (Object.prototype.hasOwnProperty.call(shadowCache, k)) delete shadowCache[k];
    shadowCount = 0;
  }
  shadowCache[key] = c2.canvas;
  shadowCount++;
  return c2.canvas;
}
function clearTileCache() {
  for (const k in spriteCache) if (Object.prototype.hasOwnProperty.call(spriteCache, k)) delete spriteCache[k];
  for (const k in shadowCache) if (Object.prototype.hasOwnProperty.call(shadowCache, k)) delete shadowCache[k];
  spriteCount = 0;
  shadowCount = 0;
}
function drawTile(ctx, x, y, w, h, typeId, opt = {}) {
  const alpha = opt.alpha === void 0 ? 1 : opt.alpha;
  const scale = opt.scale === void 0 ? 1 : opt.scale;
  const lift = opt.lift === void 0 ? 0 : opt.lift;
  const glow = opt.glow === void 0 ? 0 : opt.glow;
  const type = TYPE_BY_ID[typeId];
  if (!type) return;
  const dimLevel = opt.dimLevel === void 0 ? opt.covered ? 1 : 0 : opt.dimLevel;
  const playable = !!opt.playable && dimLevel === 0;
  const selected = !!opt.selected;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (scale !== 1 || lift !== 0) {
    const mx = x + w / 2;
    const my = y + h / 2;
    ctx.translate(mx, my - lift);
    ctx.scale(scale, scale);
    ctx.translate(-mx, -my);
  }
  ctx.save();
  ctx.shadowColor = "rgba(96, 66, 38, 0.42)";
  ctx.shadowBlur = SHADOW_BLUR;
  ctx.shadowOffsetX = SHADOW_DX;
  ctx.shadowOffsetY = SHADOW_DY;
  if (opt.back) {
    paintBack(ctx, x, y, w, h, dimLevel, playable);
  } else {
    const sprite = spriteFor(ctx, typeId, w, h, dimLevel, playable, selected);
    if (sprite) ctx.drawImage(sprite, x, y, w, h);
    else paintTile(ctx, x, y, w, h, type, dimAlphaOf(dimLevel), playable, selected);
  }
  ctx.restore();
  if (glow > 0) {
    ctx.save();
    ctx.globalAlpha *= Math.min(1, glow + 0.2);
    ctx.strokeStyle = "rgba(255, 236, 178, 0.95)";
    ctx.lineWidth = 2.5;
    rr(ctx, x - 2, y - 2, w + 4, h + 2, w * 0.14 + 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
function drawTileShadow(ctx, x, y, w, h, alpha = 0.55, depth = 0) {
  if (alpha <= 0.01) return;
  const spr = shadowSprite(ctx, w, h);
  const pad = shadowPad(w);
  if (spr) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha * (1.1 + depth * 0.25));
    ctx.drawImage(spr, x - pad + SHADOW_DX, y - pad + SHADOW_DY, w + pad * 2, h + pad * 2);
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = "rgba(96, 66, 38, 0.6)";
    rr(ctx, x + SHADOW_DX, y + SHADOW_DY, w, h, w * 0.14);
    ctx.fill();
    ctx.restore();
  }
}
function paintBack(ctx, x, y, w, h, dimLevel, playable) {
  const rad = w * 0.14;
  const thick = Math.max(4, Math.round(h * 0.06));
  const fh = h - thick;
  const rim = "#3E6E6A";
  const face = "#E8F1EC";
  const inset = Math.max(3.4, w * 0.07);
  ctx.save();
  ctx.fillStyle = rim;
  rr(ctx, x, y + thick, w, fh, rad);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  rr(ctx, x + 2, y + thick - 1, w - 4, 3, 2);
  ctx.fill();
  const g = ctx.createLinearGradient(x, y, x + w, y + fh);
  g.addColorStop(0, "#F4FAF6");
  g.addColorStop(1, face);
  ctx.fillStyle = g;
  rr(ctx, x, y, w, fh, rad);
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(2, w * 0.032);
  rr(ctx, x + inset, y + inset, w - inset * 2, fh - inset * 2, Math.max(2, rad - inset * 0.5));
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  rr(ctx, x + inset * 1.9, y + inset * 1.9, w - inset * 3.8, fh - inset * 3.8, Math.max(2, rad * 0.6));
  ctx.stroke();
  ctx.globalAlpha = 1;
  const cx = x + w / 2;
  const cy = y + fh / 2;
  const r = Math.min(w, fh) * 0.13;
  ctx.fillStyle = rim;
  ctx.globalAlpha = 0.85;
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 2 * k + Math.PI / 4;
    circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.52);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  circle(ctx, cx, cy, r * 0.42);
  ctx.fill();
  const dimAlpha = dimLevel > 0 ? Math.min(0.62, 0.45 + 0.05 * (dimLevel - 1)) : 0;
  if (dimAlpha > 0) {
    ctx.fillStyle = "rgba(28, 22, 16, " + dimAlpha.toFixed(2) + ")";
    rr(ctx, x, y + thick, w, fh, rad);
    ctx.fill();
  }
  if (playable) {
    ctx.strokeStyle = "rgba(255, 248, 220, 0.95)";
    ctx.lineWidth = 2.4;
    rr(ctx, x + 1, y + 1, w - 2, fh + thick - 2, rad);
    ctx.stroke();
  }
  ctx.restore();
}
function paintTile(ctx, x, y, w, h, type, dimAlpha, playable, selected) {
  const rad = w * 0.14;
  const thick = Math.max(4, Math.round(h * 0.06));
  const fh = h - thick;
  ctx.save();
  ctx.fillStyle = type.rim;
  rr(ctx, x, y + thick, w, fh, rad);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  rr(ctx, x + 2, y + thick - 1, w - 4, 3, 2);
  ctx.fill();
  const g = ctx.createLinearGradient(x, y, x, y + fh);
  g.addColorStop(0, "#FFFFFF");
  g.addColorStop(0.4, type.face);
  g.addColorStop(1, type.face);
  ctx.fillStyle = g;
  rr(ctx, x, y, w, fh, rad);
  ctx.fill();
  const bw = Math.max(2.4, w * 0.035);
  const inset = bw / 2 + 1.2;
  ctx.strokeStyle = type.rim;
  ctx.lineWidth = bw;
  rr(ctx, x + inset, y + inset, w - inset * 2, fh - inset * 2, Math.max(2, rad - inset * 0.6));
  ctx.stroke();
  ctx.save();
  rr(ctx, x + inset, y + inset, w - inset * 2, fh - inset * 2, Math.max(2, rad - inset * 0.6));
  ctx.clip();
  ctx.fillStyle = type.accent;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(x + inset, y + inset, w - inset * 2, Math.max(5, h * 0.075));
  ctx.globalAlpha = 0.3;
  ctx.fillRect(x + inset, y + fh - inset - Math.max(4, h * 0.05), w - inset * 2, Math.max(4, h * 0.05));
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.1;
  rr(ctx, x + inset + bw, y + inset + bw, w - (inset + bw) * 2, fh - (inset + bw) * 2, rad * 0.6);
  ctx.stroke();
  const boxW = w * 0.62;
  const boxH = fh * 0.66;
  drawIcon(ctx, type, x + w / 2, y + fh / 2 + h * 0.02, boxW, boxH);
  ctx.fillStyle = type.ink;
  circle(ctx, x + w - inset - 7, y + fh - inset - 7, 2.6);
  ctx.fill();
  if (dimAlpha > 0) {
    ctx.fillStyle = "rgba(28, 22, 16, " + dimAlpha.toFixed(2) + ")";
    rr(ctx, x, y + thick, w, fh, rad);
    ctx.fill();
  }
  if (playable) {
    ctx.strokeStyle = "rgba(255, 248, 220, 0.95)";
    ctx.lineWidth = 2.4;
    rr(ctx, x + 1, y + 1, w - 2, fh + thick - 2, rad);
    ctx.stroke();
  }
  if (selected) {
    ctx.strokeStyle = "#FFD35C";
    ctx.lineWidth = 3;
    rr(ctx, x - 1, y - 1, w + 2, fh + thick + 2, rad + 2);
    ctx.stroke();
  }
  ctx.restore();
}
function withBox(ctx, t, cx, cy, boxW, boxH, fn) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(boxW / 2, boxH / 2);
  ctx.lineWidth = 0.1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  fn(ctx, t);
  ctx.restore();
}
function filledCircle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function strokedCircle(ctx, x, y, r, color, lw) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw || 0.09;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}
function petal(ctx, x, y, r, color) {
  filledCircle(ctx, x, y, r, color);
}
function starPath(ctx, cx, cy, rOuter, rInner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / points;
    const r = i % 2 === 0 ? rOuter : rInner;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
function bambooStick(ctx, x, y, h, t) {
  ctx.fillStyle = t.ink;
  ctx.beginPath();
  ctx.moveTo(x - 0.1, y - h / 2);
  ctx.lineTo(x + 0.1, y - h / 2);
  ctx.lineTo(x + 0.1, y + h / 2);
  ctx.lineTo(x - 0.1, y + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 0.055;
  ctx.beginPath();
  ctx.moveTo(x - 0.13, y);
  ctx.lineTo(x + 0.13, y);
  ctx.stroke();
  filledCircle(ctx, x, y - h / 2, 0.075, t.accent);
  filledCircle(ctx, x, y + h / 2, 0.075, t.accent);
}
var ICONS = {
  bird(ctx, t) {
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 0.13;
    ctx.beginPath();
    ctx.moveTo(-0.85, 0.68);
    ctx.lineTo(0.85, 0.68);
    ctx.stroke();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 0.07;
    ctx.beginPath();
    ctx.moveTo(-0.45, 0.62);
    ctx.lineTo(-0.45, 0.74);
    ctx.moveTo(0.35, 0.62);
    ctx.lineTo(0.35, 0.74);
    ctx.stroke();
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.ellipse(0.15, 0.02, 0.52, 0.4, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.ellipse(0.28, 0.02, 0.32, 0.2, -0.35, 0, Math.PI * 2);
    ctx.fill();
    filledCircle(ctx, -0.38, -0.32, 0.26, t.ink);
    ctx.fillStyle = "#F6C33C";
    ctx.beginPath();
    ctx.moveTo(-0.6, -0.28);
    ctx.lineTo(-0.92, -0.18);
    ctx.lineTo(-0.58, -0.12);
    ctx.closePath();
    ctx.fill();
    filledCircle(ctx, -0.34, -0.58, 0.1, "#DD4A3A");
    filledCircle(ctx, -0.42, -0.36, 0.085, "#FFFFFF");
    filledCircle(ctx, -0.44, -0.36, 0.045, "#20261F");
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 0.085;
    ctx.beginPath();
    ctx.moveTo(0.55, 0.12);
    ctx.quadraticCurveTo(0.95, -0.15, 0.82, -0.62);
    ctx.moveTo(0.58, 0.18);
    ctx.quadraticCurveTo(1.02, 0, 0.98, -0.4);
    ctx.stroke();
    ctx.strokeStyle = "#D84536";
    ctx.lineWidth = 0.075;
    ctx.beginPath();
    ctx.moveTo(0.02, 0.38);
    ctx.lineTo(-0.02, 0.68);
    ctx.moveTo(0.28, 0.38);
    ctx.lineTo(0.32, 0.68);
    ctx.stroke();
  },
  diamond(ctx, t) {
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(0, -0.82);
    ctx.lineTo(0.66, 0);
    ctx.lineTo(0, 0.82);
    ctx.lineTo(-0.66, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 0.1;
    ctx.beginPath();
    ctx.moveTo(0, -0.48);
    ctx.lineTo(0.38, 0);
    ctx.lineTo(0, 0.48);
    ctx.lineTo(-0.38, 0);
    ctx.closePath();
    ctx.stroke();
    filledCircle(ctx, 0, 0, 0.12, t.accent);
  },
  leaf(ctx, t) {
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(-0.72, 0.62);
    ctx.quadraticCurveTo(-0.55, -0.72, 0.72, -0.62);
    ctx.quadraticCurveTo(0.62, 0.62, -0.72, 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 0.08;
    ctx.beginPath();
    ctx.moveTo(-0.62, 0.56);
    ctx.lineTo(0.6, -0.52);
    ctx.stroke();
    ctx.lineWidth = 0.05;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-0.25 + i * 0.2, 0.2 + i * 0.12);
      ctx.lineTo(0.05 + i * 0.18, -0.05 + i * 0.12);
      ctx.stroke();
    }
  },
  frame(ctx, t) {
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 0.16;
    ctx.beginPath();
    ctx.moveTo(-0.72, -0.72);
    ctx.lineTo(0.72, -0.72);
    ctx.lineTo(0.72, 0.72);
    ctx.lineTo(-0.72, 0.72);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 0.09;
    ctx.beginPath();
    ctx.moveTo(-0.44, -0.44);
    ctx.lineTo(0.44, -0.44);
    ctx.lineTo(0.44, 0.44);
    ctx.lineTo(-0.44, 0.44);
    ctx.closePath();
    ctx.stroke();
    filledCircle(ctx, -0.72, -0.72, 0.12, t.accent);
    filledCircle(ctx, 0.72, 0.72, 0.12, t.accent);
  },
  coin1(ctx, t) {
    strokedCircle(ctx, 0, 0, 0.74, t.ink, 0.16);
    strokedCircle(ctx, 0, 0, 0.48, t.accent, 0.13);
    filledCircle(ctx, 0, 0, 0.22, t.ink);
    filledCircle(ctx, 0, 0, 0.1, t.accent);
  },
  coin3(ctx, t) {
    const pts = [[0, -0.52], [-0.52, 0.42], [0.52, 0.42]];
    for (let i = 0; i < pts.length; i++) {
      strokedCircle(ctx, pts[i][0], pts[i][1], 0.34, t.ink, 0.11);
      strokedCircle(ctx, pts[i][0], pts[i][1], 0.19, t.accent, 0.08);
      filledCircle(ctx, pts[i][0], pts[i][1], 0.07, t.ink);
    }
  },
  bamboo2(ctx, t) {
    bambooStick(ctx, -0.35, 0, 1.3, t);
    bambooStick(ctx, 0.35, 0, 1.3, t);
  },
  bamboo5(ctx, t) {
    bambooStick(ctx, 0, -0.42, 0.72, t);
    bambooStick(ctx, -0.48, 0.32, 0.72, t);
    bambooStick(ctx, 0.48, 0.32, 0.72, t);
    bambooStick(ctx, -0.26, -0.05, 0.6, t);
    bambooStick(ctx, 0.26, -0.05, 0.6, t);
    filledCircle(ctx, 0, 0.1, 0.13, t.accent);
  },
  blossom(ctx, t) {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      petal(ctx, Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0.32, t.ink);
    }
    filledCircle(ctx, 0, 0, 0.26, t.accent);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      filledCircle(ctx, Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0.045, t.ink);
    }
  },
  orchid(ctx, t) {
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(0, 0.62);
    ctx.quadraticCurveTo(-0.92, 0.1, -0.55, -0.68);
    ctx.quadraticCurveTo(-0.1, -0.35, 0, 0.62);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0.62);
    ctx.quadraticCurveTo(0.92, 0.1, 0.55, -0.68);
    ctx.quadraticCurveTo(0.1, -0.35, 0, 0.62);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0.55);
    ctx.quadraticCurveTo(-0.3, -0.35, 0, -0.86);
    ctx.quadraticCurveTo(0.3, -0.35, 0, 0.55);
    ctx.fill();
    filledCircle(ctx, 0, 0.2, 0.17, t.accent);
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 0.07;
    ctx.beginPath();
    ctx.moveTo(0, 0.6);
    ctx.lineTo(0, 0.88);
    ctx.stroke();
  },
  chrys(ctx, t) {
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI * 2 / 12;
      const x = Math.cos(a), y = Math.sin(a);
      ctx.strokeStyle = i % 2 ? t.accent : t.ink;
      ctx.lineWidth = 0.11;
      ctx.beginPath();
      ctx.moveTo(x * 0.22, y * 0.22);
      ctx.lineTo(x * 0.84, y * 0.84);
      ctx.stroke();
      filledCircle(ctx, x * 0.86, y * 0.86, 0.07, t.ink);
    }
    filledCircle(ctx, 0, 0, 0.24, t.accent);
  },
  fish(ctx, t) {
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.ellipse(0.05, 0, 0.58, 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.52, 0);
    ctx.lineTo(0.94, -0.46);
    ctx.lineTo(0.94, 0.46);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.moveTo(-0.12, -0.3);
    ctx.lineTo(0.2, -0.62);
    ctx.lineTo(0.32, -0.28);
    ctx.closePath();
    ctx.fill();
    filledCircle(ctx, -0.38, -0.1, 0.09, "#FFFFFF");
    filledCircle(ctx, -0.4, -0.1, 0.045, "#20261F");
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 0.07;
    ctx.beginPath();
    ctx.moveTo(-0.1, 0.18);
    ctx.lineTo(0.38, 0.18);
    ctx.stroke();
  },
  moon(ctx, t) {
    filledCircle(ctx, 0.05, 0, 0.76, t.ink);
    filledCircle(ctx, 0.42, -0.16, 0.64, t.face);
    filledCircle(ctx, -0.48, -0.52, 0.1, t.accent);
    filledCircle(ctx, -0.22, 0.56, 0.07, t.accent);
  },
  sun(ctx, t) {
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI * 2 / 8;
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 0.12;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 0.52, Math.sin(a) * 0.52);
      ctx.lineTo(Math.cos(a) * 0.9, Math.sin(a) * 0.9);
      ctx.stroke();
    }
    filledCircle(ctx, 0, 0, 0.48, t.ink);
    filledCircle(ctx, 0, 0, 0.3, t.accent);
  },
  cloud(ctx, t) {
    filledCircle(ctx, -0.45, 0.1, 0.36, t.ink);
    filledCircle(ctx, 0, -0.2, 0.48, t.ink);
    filledCircle(ctx, 0.48, 0.1, 0.34, t.ink);
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(-0.78, 0.14);
    ctx.lineTo(0.78, 0.14);
    ctx.lineTo(0.78, 0.5);
    ctx.lineTo(-0.78, 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 0.09;
    ctx.beginPath();
    ctx.moveTo(-0.58, 0.34);
    ctx.lineTo(0.58, 0.34);
    ctx.stroke();
  },
  star(ctx, t) {
    ctx.fillStyle = t.ink;
    starPath(ctx, 0, 0, 0.88, 0.38, 5);
    ctx.fill();
    ctx.fillStyle = t.accent;
    starPath(ctx, 0, 0, 0.52, 0.22, 5);
    ctx.fill();
    filledCircle(ctx, 0, 0, 0.13, t.ink);
  }
};
function drawIcon(ctx, type, cx, cy, boxW, boxH) {
  const fn = ICONS[type.icon];
  if (!fn) return;
  withBox(ctx, type, cx, cy, boxW, boxH, (c, t) => {
    c.fillStyle = "rgba(255,255,255,0.72)";
    c.beginPath();
    c.ellipse(0, 0, 0.98, 0.98, 0, 0, Math.PI * 2);
    c.fill();
    fn(c, t);
  });
}

// core/shared/rng.js
function makeRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle(arr) {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    }
  };
}
function randomSeed() {
  return (Date.now() ^ Math.random() * 4294967295) >>> 0;
}

// core/shared/seed_pool.js
var SEED_POOL = {
  "L2-0": [7e3, 2654442761, 1013911226, 3668346987, 2027815452, 387283917, 3041719678, 1401188143, 4055623904, 774560834, 3428996595, 1788465060, 147933525, 2802369286, 2175741977, 535210442, 3189646203, 1549114668, 4203550429, 2563018894, 922487359, 3576923120, 1936391585, 295860050, 2950295811, 1309764276, 3964200037, 2323668502, 683136967, 3337572728, 1697041193, 56509658, 2710945419, 1070413884, 3724849645, 2084318110, 443786575, 3098222336, 1457690801, 4112126562],
  "L2-1": [2655442764, 1014911229, 3669346990, 2028815455, 388283920, 1402188146, 4056623907, 775560837, 3429996598, 1789465063, 148933528, 2803369289, 3817273515, 2176741980, 536210445, 3190646206, 1550114671, 4204550432, 2564018897, 923487362, 3577923123, 1937391588, 296860053, 2951295814, 1310764279, 3965200040, 2324668505, 684136970, 3338572731, 1698041196, 57509661, 2711945422, 1071413887, 3725849648, 2085318113, 444786578, 4113126565, 2472595030, 3486499256, 1845967721],
  "L2-2": [2007006, 2656442767, 3670346993, 2029815458, 3043719684, 1403188149, 4057623910, 2417092375, 776560840, 3430996601, 1790465066, 149933531, 2804369292, 1163837757, 3818273518, 2177741983, 537210448, 3191646209, 1551114674, 4205550435, 2565018900, 924487365, 3578923126, 1938391591, 297860056, 2952295817, 1311764282, 3966200043, 2325668508, 685136973, 3339572734, 2712945425, 1072413890, 3726849651, 2086318116, 445786581, 1459690807, 4114126568, 833063498, 3487499259],
  "L2-3": [3007009, 2657442770, 3671346996, 2030815461, 390283926, 3044719687, 1404188152, 4058623913, 2418092378, 777560843, 3431996604, 150933534, 2805369295, 1164837760, 3819273521, 2178741986, 3192646212, 4206550438, 2566018903, 3579923129, 1939391594, 298860059, 2953295820, 1312764285, 3967200046, 2326668511, 686136976, 3340572737, 1700041202, 59509667, 2713945428, 1073413893, 3727849654, 2087318119, 446786584, 3101222345, 1460690810, 2474595036, 834063501, 1847967727],
  "L2-4": [4007012, 2658442773, 1017911238, 3672346999, 2031815464, 391283929, 3045719690, 1405188155, 4059623916, 2419092381, 778560846, 3432996607, 1792465072, 151933537, 1165837763, 3820273524, 2179741989, 539210454, 3193646215, 1553114680, 4207550441, 2567018906, 926487371, 3580923132, 1940391597, 2954295823, 1313764288, 3968200049, 2327668514, 687136979, 3341572740, 1701041205, 60509670, 2714945431, 1074413896, 3728849657, 447786587, 1461690813, 4116126574, 2475595039],
  "L2-5": [5007015, 2659442776, 3673347002, 2032815467, 392283932, 3046719693, 1406188158, 4060623919, 2420092384, 779560849, 3433996610, 1793465075, 152933540, 2807369301, 1166837766, 3821273527, 2180741992, 540210457, 1554114683, 4208550444, 2568018909, 1941391600, 300860065, 2955295826, 1314764291, 3969200052, 688136982, 3342572743, 1702041208, 2715945434, 1075413899, 3729849660, 2089318125, 448786590, 3103222351, 1462690816, 4117126577, 2476595042, 836063507, 1849967733],
  "L2-6": [2660442779, 1019911244, 3674347005, 2033815470, 393283935, 3047719696, 2421092387, 780560852, 153933543, 1167837769, 3822273530, 2181741995, 3195646221, 1555114686, 4209550447, 2569018912, 928487377, 3582923138, 1942391603, 301860068, 2956295829, 1315764294, 3970200055, 2329668520, 689136985, 3343572746, 62509676, 3730849663, 2090318128, 449786593, 4118126580, 837063510, 210436201, 2864871962, 1224340427, 3878776188, 2238244653, 1611617344, 4266053105, 2625521570],
  "L2-7": [7007021, 1020911247, 3675347008, 2034815473, 394283938, 3048719699, 1408188164, 4062623925, 2422092390, 781560855, 3435996616, 1795465081, 154933546, 2809369307, 3823273533, 2182741998, 542210463, 3196646224, 1556114689, 4210550450, 2570018915, 929487380, 3583923141, 1943391606, 302860071, 2957295832, 1316764297, 3971200058, 2330668523, 3344572749, 63509679, 2717945440, 3731849666, 2091318131, 450786596, 3105222357, 1464690822, 4119126583, 2478595048, 838063513],
  "L2-8": [8007024, 3049719702, 155933549, 543210466, 1557114692, 4211550453, 2958295835, 1317764300, 3345572752, 1705041217, 1078413908, 2092318134, 3106222360, 4120126586, 1226340433, 2240244659, 3254148885, 1761543875, 1134916566, 3789352327, 3162725018, 1522193483, 3550001935, 2923374626, 2296747317, 656215782, 29588473, 1043492699, 2444673842, 2592600367, 3993781510, 3367154201, 2740526892, 1099995357, 3127803809, 4141708035, 1874549191, 621294573, 3275730334, 1008571490],
  "L2-9": [9007027, 2663442788, 1022911253, 3677347014, 2036815479, 396283944, 3050719705, 1410188170, 4064623931, 2424092396, 783560861, 3437996622, 156933552, 2811369313, 1170837778, 2184742004, 544210469, 3198646230, 1558114695, 4212550456, 2572018921, 3585923147, 1945391612, 304860077, 2959295838, 1318764303, 3973200064, 2332668529, 692136994, 3346572755, 1706041220, 65509685, 2719945446, 3733849672, 2093318137, 452786602, 3107222363, 1466690828, 4121126589, 2480595054]
};
function pickPoolSeed(level, profileId, rand = Math.random) {
  const key = "L2-" + profileId;
  let list = SEED_POOL[key];
  if (!list || !list.length) {
    list = [];
    for (const k in SEED_POOL) if (Object.prototype.hasOwnProperty.call(SEED_POOL, k)) list = list.concat(SEED_POOL[k]);
  }
  if (!list.length) return 0;
  const i = Math.min(list.length - 1, Math.max(0, Math.floor(rand() * list.length)));
  return list[i];
}

// core/shared/layout.js
var THRESH_AREA = OVERLAP_THRESHOLD * TILE_AREA;
function overlapArea(a, b) {
  const ix = Math.min(a.x + TILE_W, b.x + TILE_W) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + TILE_H, b.y + TILE_H) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}
function isBlocked(card, alive) {
  for (let i = 0; i < alive.length; i++) {
    const o = alive[i];
    if (o === card || o.z <= card.z) continue;
    if (overlapArea(card, o) > THRESH_AREA) return true;
  }
  return false;
}
function hasSupport(card, lower) {
  for (let i = 0; i < lower.length; i++) {
    if (overlapArea(card, lower[i]) > THRESH_AREA) return true;
  }
  return false;
}
function isHalfLattice(cards) {
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (Math.abs(c.x / LATTICE_X - Math.round(c.x / LATTICE_X)) > 1e-9) return false;
    if (Math.abs(c.y / LATTICE_Y - Math.round(c.y / LATTICE_Y)) > 1e-9) return false;
  }
  return true;
}
function buildBlockerGraph(cards) {
  const blockers = {};
  const dependents = {};
  for (let i = 0; i < cards.length; i++) {
    blockers[cards[i].id] = [];
    dependents[cards[i].id] = [];
  }
  for (let i = 0; i < cards.length; i++) {
    const a = cards[i];
    for (let j = i + 1; j < cards.length; j++) {
      const b = cards[j];
      if (overlapArea(a, b) <= THRESH_AREA) continue;
      const lo = a.z < b.z ? a : b;
      const hi = a.z < b.z ? b : a;
      blockers[lo.id].push(hi.id);
      dependents[hi.id].push(lo.id);
    }
  }
  return { blockers, dependents };
}
function countComponents(cards, pad = CONNECT_PAD) {
  const n = cards.length;
  if (n === 0) return 0;
  const parent = new Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a, b) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };
  const W2 = TILE_W + pad * 2;
  const H2 = TILE_H + pad * 2;
  for (let i = 0; i < n; i++) {
    const a = cards[i];
    for (let j = i + 1; j < n; j++) {
      const b = cards[j];
      if (Math.abs(a.x - b.x) < W2 && Math.abs(a.y - b.y) < H2) union(i, j);
    }
  }
  let roots = 0;
  for (let i = 0; i < n; i++) if (find(i) === i) roots++;
  return roots;
}
function sameLayerOverlapCount(cards) {
  let n = 0;
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].layer !== cards[j].layer) continue;
      if (overlapArea(cards[i], cards[j]) > 0) n++;
    }
  }
  return n;
}
function crossOcclusionStats(cards) {
  const byId = {};
  for (let i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  const g = buildBlockerGraph(cards);
  let pairs = 0;
  const regions = {};
  for (const id in g.blockers) {
    if (!Object.prototype.hasOwnProperty.call(g.blockers, id)) continue;
    const lo = byId[id];
    for (let k = 0; k < g.blockers[id].length; k++) {
      const hi = byId[g.blockers[id][k]];
      if (lo && hi && lo.region !== hi.region) {
        pairs++;
        const key = lo.region + "<" + hi.region;
        regions[key] = (regions[key] || 0) + 1;
      }
    }
  }
  return { pairs, regions };
}
function regionStats(cards) {
  const g = buildBlockerGraph(cards);
  const out = {};
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (!out[c.region]) out[c.region] = { cards: 0, free: 0, layers: {}, minLayer: 99, maxLayer: -1 };
    const r = out[c.region];
    r.cards++;
    if (g.blockers[c.id].length === 0) r.free++;
    r.layers[c.layer] = (r.layers[c.layer] || 0) + 1;
    if (c.layer < r.minLayer) r.minLayer = c.layer;
    if (c.layer > r.maxLayer) r.maxLayer = c.layer;
  }
  return out;
}
function peelOrder(cards, rand) {
  const g = buildBlockerGraph(cards);
  const indeg = {};
  const byId = {};
  let free = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    byId[c.id] = c;
    indeg[c.id] = g.blockers[c.id].length;
    if (indeg[c.id] === 0) free.push(c);
  }
  const order = [];
  const waves = [];
  const r = rand || Math.random;
  while (free.length) {
    const batch = free.slice();
    free = [];
    const key = {};
    for (let i = 0; i < batch.length; i++) key[batch[i].id] = r();
    batch.sort((a, b) => key[a.id] - key[b.id]);
    waves.push([order.length, order.length + batch.length]);
    for (let i = 0; i < batch.length; i++) order.push(batch[i].id);
    for (let i = 0; i < batch.length; i++) {
      const dep = g.dependents[batch[i].id];
      for (let k = 0; k < dep.length; k++) {
        const d2 = dep[k];
        indeg[d2] -= 1;
        if (indeg[d2] === 0) free.push(byId[d2]);
      }
    }
  }
  if (order.length < cards.length) {
    const seen = {};
    for (let i = 0; i < order.length; i++) seen[order[i]] = 1;
    const rest = cards.filter((c) => !seen[c.id]).sort((a, b) => b.z - a.z);
    if (rest.length) waves.push([order.length, order.length + rest.length]);
    for (let i = 0; i < rest.length; i++) order.push(rest[i].id);
  }
  order.waves = waves;
  return order;
}

// core/shared/layout_profiles.js
var VISIBLE_MIN = 19;
var VISIBLE_MAX = 25;
var X_MIN = 33;
var X_MAX = 627;
var Y_MIN = 220;
var Y_MAX = 792;
var QUEUE_COL_GUARD_Y = 528;
var MARGIN_COLS = [33, 627];
var clamp2 = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
function pickGrid(rng, need, colsLo, colsHi, rowsMax) {
  const cands = [];
  for (let cols = colsLo; cols <= colsHi; cols++) {
    for (let rows = 1; rows <= rowsMax; rows++) {
      const cap = cols * rows;
      if (cap < need) continue;
      const gaps = (cap - need) / cap;
      cands.push({ cols, rows, gaps, score: Math.abs(gaps - 0.11) });
    }
  }
  if (!cands.length) {
    const cols = colsLo;
    return { cols, rows: Math.ceil(need / cols), gaps: 0, score: 9 };
  }
  let best = cands[0];
  for (let i = 1; i < cands.length; i++) if (cands[i].score < best.score) best = cands[i];
  const ties = cands.filter((c) => Math.abs(c.score - best.score) < 1e-6);
  return ties[rng.int(0, ties.length - 1)];
}
function growBlob(rng, need, cols, rows) {
  const cap = cols * rows;
  if (need > cap) return null;
  const picked = new Array(cap).fill(false);
  const cells = [];
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const startC = clamp2(Math.round(cx + (rng.next() - 0.5) * 1.2), 0, cols - 1);
  const startR = clamp2(Math.round(cy + (rng.next() - 0.5) * 1.2), 0, rows - 1);
  const key = (c, r) => r * cols + c;
  const inFrontier = {};
  let frontier = [];
  const pushN = (c, r) => {
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    if (picked[key(c, r)]) return;
    const k = key(c, r);
    if (inFrontier[k]) return;
    inFrontier[k] = true;
    frontier.push([c, r]);
  };
  picked[key(startC, startR)] = true;
  cells.push([startC, startR]);
  pushN(startC - 1, startR);
  pushN(startC + 1, startR);
  pushN(startC, startR - 1);
  pushN(startC, startR + 1);
  while (cells.length < need && frontier.length) {
    let totalW = 0;
    const w = new Array(frontier.length);
    for (let i = 0; i < frontier.length; i++) {
      const dx = frontier[i][0] - cx;
      const dy = frontier[i][1] - cy;
      w[i] = 1 / (1 + dx * dx + dy * dy);
      totalW += w[i];
    }
    let r = rng.next() * totalW;
    let pickI = frontier.length - 1;
    for (let i = 0; i < frontier.length; i++) {
      r -= w[i];
      if (r <= 0) {
        pickI = i;
        break;
      }
    }
    const cell = frontier[pickI];
    frontier = frontier.slice(0, pickI).concat(frontier.slice(pickI + 1));
    delete inFrontier[key(cell[0], cell[1])];
    picked[key(cell[0], cell[1])] = true;
    cells.push(cell);
    pushN(cell[0] - 1, cell[1]);
    pushN(cell[0] + 1, cell[1]);
    pushN(cell[0], cell[1] - 1);
    pushN(cell[0], cell[1] + 1);
  }
  return cells.length === need ? cells : null;
}
function buildBand(rng, need, cols, rows) {
  const cap = cols * rows;
  if (need > cap) return null;
  const r0 = rng.int(0, rows - 1);
  const cells = [];
  for (let c = 0; c < cols && cells.length < need; c++) cells.push([c, r0]);
  if (cells.length === need) return cells;
  if (rows <= 1) return null;
  const other = 1 - r0;
  const mid = (cols - 1) / 2;
  const order = [];
  for (let c = 0; c < cols; c++) order.push(c);
  order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  let oi = 0;
  while (cells.length < need) {
    cells.push([order[oi % cols], other]);
    oi++;
    if (oi > cap) return null;
  }
  return cells;
}
function buildMainStack(rng, plan, opts) {
  const N = plan.length;
  const out = [];
  let px = rng.int(0, 1);
  let py = rng.int(0, 1);
  let cxs = 330;
  for (let li = 0; li < N; li++) {
    const need = plan[li];
    const seg = opts.segment(li, N);
    const env = opts.envelope[seg];
    const grid = pickGrid(rng, need, env.colsLo, env.colsHi, env.rowsMax);
    const cols = grid.cols;
    const rows = grid.rows;
    let blob = seg === "mid" ? buildBand(rng, need, cols, rows) : growBlob(rng, need, cols, rows);
    if (!blob) throw new Error("\u56E2\u5757\u751F\u957F\u5931\u8D25\uFF1A" + need + "/" + cols + "x" + rows);
    const t = N > 1 ? li / (N - 1) : 0;
    const baseCy = opts.topCy + (opts.botCy - opts.topCy) * t;
    const jitterY = (rng.next() - 0.5) * opts.walkY;
    const blockH = (rows - 1) * TILE_H;
    let oy = Math.round((baseCy + jitterY - blockH / 2) / LATTICE_Y) * LATTICE_Y + py * LATTICE_Y;
    oy = clamp2(oy, opts.yMin, opts.yMax - blockH);
    cxs += (rng.next() - 0.5) * opts.walkX;
    cxs = clamp2(cxs, opts.cxMin, opts.cxMax);
    const blockW = (cols - 1) * TILE_W;
    let loX = opts.xMin;
    let hiX = opts.xMax - blockW;
    if (oy + blockH >= QUEUE_COL_GUARD_Y && opts.guardMargins) {
      loX = Math.max(loX, MARGIN_COLS[0] + TILE_W);
      hiX = Math.min(hiX, MARGIN_COLS[1] - TILE_W);
    }
    if (hiX < loX) {
      loX = opts.xMin;
      hiX = opts.xMax - blockW;
    }
    let ox;
    const pin = li === opts.pinLeft ? "left" : li === opts.pinRight ? "right" : "";
    if (pin) {
      let minC = cols;
      let maxC = -1;
      for (let i = 0; i < blob.length; i++) {
        if (blob[i][0] < minC) minC = blob[i][0];
        if (blob[i][0] > maxC) maxC = blob[i][0];
      }
      const shift = pin === "left" ? -minC : cols - 1 - maxC;
      if (shift) blob = blob.map((p) => [p[0] + shift, p[1]]);
      ox = pin === "left" ? opts.xMin : opts.xMax - blockW;
    } else {
      ox = Math.round((cxs - blockW / 2) / LATTICE_X) * LATTICE_X + px * LATTICE_X;
      ox = Math.round((ox - loX) / opts.xAlign) * opts.xAlign + loX;
      ox = clamp2(ox, loX, hiX);
    }
    ox = clamp2(ox, opts.xMin, opts.xMax - blockW);
    ox = Math.round(ox / LATTICE_X) * LATTICE_X;
    for (let i = 0; i < blob.length; i++) {
      out.push({
        x: ox + blob[i][0] * TILE_W,
        y: oy + blob[i][1] * TILE_H,
        layer: li,
        region: opts.region,
        zoneLayer: li,
        seg,
        gridW: cols,
        gridH: rows,
        gaps: grid.gaps,
        pinned: pin || ""
      });
    }
    const off = opts.offsets[rng.int(0, opts.offsets.length - 1)];
    px = (px + off[0]) % 2;
    py = (py + off[1]) % 2;
  }
  return out;
}
var THRESH_AREA2 = OVERLAP_THRESHOLD * TILE_AREA;
function overlapArea2(a, b) {
  const ix = Math.min(a.x + TILE_W, b.x + TILE_W) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + TILE_H, b.y + TILE_H) - Math.max(a.y, b.y);
  return ix > 0 && iy > 0 ? ix * iy : 0;
}
function countVisible(cards) {
  let n = 0;
  for (let i = 0; i < cards.length; i++) {
    const a = cards[i];
    let blocked = false;
    for (let j = 0; j < cards.length; j++) {
      if (i === j) continue;
      const b = cards[j];
      if (b.z <= a.z) continue;
      if (overlapArea2(a, b) > THRESH_AREA2) {
        blocked = true;
        break;
      }
    }
    if (!blocked) n++;
  }
  return n;
}
function centerStackVertically(cards) {
  if (!cards || !cards.length) return 0;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].y < minY) minY = cards[i].y;
    if (cards[i].y + TILE_H > maxY) maxY = cards[i].y + TILE_H;
  }
  const stackH = maxY - minY;
  const bandH = BOARD_BAND.bottom - BOARD_BAND.top;
  const targetTop = BOARD_BAND.top + (bandH - stackH) / 2;
  let shift = Math.round((targetTop - minY) / LATTICE_Y) * LATTICE_Y;
  const lo = Math.ceil((BOARD_BAND.top - minY) / LATTICE_Y) * LATTICE_Y;
  const hi = Math.floor((BOARD_BAND.bottom - maxY) / LATTICE_Y) * LATTICE_Y;
  if (lo <= hi) shift = clamp2(shift, lo, hi);
  else shift = Math.round((lo + hi) / 2 / LATTICE_Y) * LATTICE_Y;
  if (shift) for (let i = 0; i < cards.length; i++) cards[i].y += shift;
  return shift;
}
function buildOnce(rngSeed, profile) {
  const rng = makeRng(rngSeed >>> 0);
  const plan = layerPlanFor(profile);
  const N = plan.length;
  const isL1 = profile.queueCount === 0;
  if (!isL1) {
    throw new Error("\u7B2C\u4E8C\u5173\u56FA\u5B9A\u56DB\u94FE\u961F\u5217\u5DF2\u53D6\u6D88\uFF1A\u8BF7\u4F7F\u7528 l2_geometry.generateTemplateLayout \u7684\u5B8C\u6574\u6A21\u677F\u5E03\u5C40");
  }
  let out;
  {
    out = buildMainStack(rng, plan, {
      region: "core",
      segment: () => "l1",
      envelope: { l1: { colsLo: 5, colsHi: 7, rowsMax: 4 } },
      // 层中心围绕牌桌可视区中心 BOARD_CY 展开：跨度仍是 150px/层（保住
      // 遮挡规则与开局可点张数），但整体不再钉在屏幕上方。
      topCy: BOARD_CY - 150 * (N - 1) / 2,
      botCy: BOARD_CY + 150 * (N - 1) / 2,
      yMin: Y_MIN,
      yMax: Y_MAX,
      // 第 2 节「五局内布局不能相同」：第一关牌少，若把横向中心钉在 280–380，
      // 不同 seed 会生成几乎重合的团块（实测同档位相似度均值 0.646、最大 1.000），
      // 五局窗口内根本凑不出足够不同的布局。因此横向中心放开到整幅牌桌，
      // 随机游走步长也放大到 1.6 格。
      xMin: X_MIN,
      xMax: X_MAX,
      cxMin: X_MIN + 132,
      cxMax: X_MAX - 132,
      walkX: 1.6 * LATTICE_X,
      walkY: 1 * LATTICE_Y,
      xAlign: TILE_W,
      guardMargins: false,
      pinLeft: -1,
      pinRight: -1,
      offsets: [[0, 1], [1, 0], [1, 1]]
    });
    centerStackVertically(out);
  }
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (c.x % LATTICE_X !== 0 || c.y % LATTICE_Y !== 0) {
      throw new Error("\u5750\u6807 (" + c.x + "," + c.y + ") \u4E0D\u5728\u534A\u683C\u6676\u683C\u4E0A");
    }
    if (c.x < BOARD_BAND.left || c.y < BOARD_BAND.top || c.x + TILE_W > BOARD_BAND.right || c.y + TILE_H > BOARD_BAND.bottom) {
      throw new Error("\u5750\u6807 (" + c.x + "," + c.y + ") \u8D8A\u51FA\u724C\u684C");
    }
  }
  const expect = profile.mainCount + profile.queueCount;
  if (out.length !== expect) {
    throw new Error("\u5E03\u5C40\u5F20\u6570 " + out.length + " \u2260 \u6863\u4F4D " + expect);
  }
  out.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < out.length; i++) {
    out[i].id = i;
    out[i].z = i;
  }
  if (!out.layerCount) {
    let maxLayer = 0;
    for (let i = 0; i < out.length; i++) if (out[i].layer > maxLayer) maxLayer = out[i].layer;
    out.layerCount = maxLayer + 1;
  }
  return out;
}
function generateProfileLayout(seed, profile) {
  if (!profile) throw new Error("generateProfileLayout \u9700\u8981 profile");
  if (profile.queueCount !== 0) {
    throw new Error("\u7B2C\u4E8C\u5173\u56FA\u5B9A\u56DB\u94FE\u961F\u5217\u5DF2\u53D6\u6D88\uFF1AgenerateProfileLayout \u53EA\u670D\u52A1\u7B2C\u4E00\u5173\uFF0C\u7B2C\u4E8C\u5173\u8BF7\u8D70 l2_geometry.generateTemplateLayout \u7684 20 \u5957\u5B8C\u6574\u6A21\u677F\u5E03\u5C40");
  }
  const base = (seed >>> 0 ^ 1356788174) >>> 0;
  if (profile.queueCount === 0) {
    const first = buildOnce(base, profile);
    if (countComponents(first) <= 1) return first;
    let best = first;
    let bestComp = countComponents(first);
    for (let k = 0; k < 15 && bestComp > 1; k++) {
      const cards = buildOnce((base ^ Math.imul(k + 1, 2654435769)) >>> 0, profile);
      const comp = countComponents(cards);
      if (comp < bestComp) {
        bestComp = comp;
        best = cards;
      }
    }
    return best;
  }
  throw new Error("generateProfileLayout \u53EA\u670D\u52A1\u7B2C\u4E00\u5173");
}

// core/shared/sha256.js
var K = [
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
];
function rotr(x, n) {
  return x >>> n | x << 32 - n;
}
function hex8(n) {
  var s = "";
  var tab = "0123456789abcdef";
  for (var i = 7; i >= 0; i--) s += tab.charAt(n >>> i * 4 & 15);
  return s;
}
function utf8Bytes(str3) {
  var out = [];
  for (var i = 0; i < str3.length; i++) {
    var c = str3.charCodeAt(i);
    if (c < 128) {
      out.push(c);
    } else if (c < 2048) {
      out.push(192 | c >> 6, 128 | c & 63);
    } else if (c >= 55296 && c <= 56319 && i + 1 < str3.length) {
      var c2 = str3.charCodeAt(i + 1);
      var cp = 65536 + (c - 55296 << 10) + (c2 - 56320);
      out.push(240 | cp >> 18, 128 | cp >> 12 & 63, 128 | cp >> 6 & 63, 128 | cp & 63);
      i++;
    } else {
      out.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
    }
  }
  return out;
}
function sha256Hex(str3) {
  var bytes = utf8Bytes(String(str3));
  var len = bytes.length;
  var padded = len + 1;
  while (padded % 64 !== 56) padded++;
  var total = padded + 8;
  var msg = new Array(total);
  var i;
  for (i = 0; i < total; i++) msg[i] = 0;
  for (i = 0; i < len; i++) msg[i] = bytes[i];
  msg[len] = 128;
  var bits = len * 8;
  var hi = Math.floor(bits / 4294967296);
  var lo = bits % 4294967296;
  msg[total - 8] = hi >>> 24 & 255;
  msg[total - 7] = hi >>> 16 & 255;
  msg[total - 6] = hi >>> 8 & 255;
  msg[total - 5] = hi & 255;
  msg[total - 4] = lo >>> 24 & 255;
  msg[total - 3] = lo >>> 16 & 255;
  msg[total - 2] = lo >>> 8 & 255;
  msg[total - 1] = lo & 255;
  var H2 = [
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ];
  var w = new Array(64);
  for (var off = 0; off < total; off += 64) {
    for (i = 0; i < 16; i++) {
      var j = off + i * 4;
      w[i] = msg[j] << 24 | msg[j + 1] << 16 | msg[j + 2] << 8 | msg[j + 3] | 0;
    }
    for (i = 16; i < 64; i++) {
      var x = w[i - 15];
      var y = w[i - 2];
      var s0 = rotr(x, 7) ^ rotr(x, 18) ^ x >>> 3;
      var s1 = rotr(y, 17) ^ rotr(y, 19) ^ y >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
    }
    var a = H2[0], b = H2[1], c = H2[2], d2 = H2[3];
    var e = H2[4], f = H2[5], g = H2[6], h = H2[7];
    for (i = 0; i < 64; i++) {
      var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      var ch = e & f ^ ~e & g;
      var t1 = h + S1 + ch + K[i] + w[i] | 0;
      var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      var maj = a & b ^ a & c ^ b & c;
      var t2 = S0 + maj | 0;
      h = g;
      g = f;
      f = e;
      e = d2 + t1 | 0;
      d2 = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H2[0] = H2[0] + a | 0;
    H2[1] = H2[1] + b | 0;
    H2[2] = H2[2] + c | 0;
    H2[3] = H2[3] + d2 | 0;
    H2[4] = H2[4] + e | 0;
    H2[5] = H2[5] + f | 0;
    H2[6] = H2[6] + g | 0;
    H2[7] = H2[7] + h | 0;
  }
  var out = "";
  for (i = 0; i < 8; i++) out += hex8(H2[i]);
  return out;
}

// core/shared/l2_templates.js
var MASK_COLS = 9;
var MASK_ROWS = 5;
var OUTER_COLS = 9;
var OUTER_ROWS = 2;
var OUTER_R0 = 4;
var OUTER_SEG = "outer";
var OUTER_TILE_COUNT = 44;
var TEMPLATE_CATEGORIES = [
  { key: "core", label: "\u6838\u5FC3\u805A\u62E2\u578B", feature: "\u4E3B\u5806\u56F4\u7ED5\u4E00\u4E2A\u6216\u4E24\u4E2A\u6838\u5FC3\u6536\u62E2\u53E0\u538B" },
  { key: "island", label: "\u591A\u5C9B\u5206\u79BB\u578B", feature: "\u591A\u4E2A\u4E92\u4E0D\u76F8\u8FDE\u7684\u724C\u5C9B\u5E76\u7ACB\uFF0C\u4E2D\u95F4\u7559\u7A7A" },
  { key: "frame", label: "\u56F4\u5408\u73AF\u62B1\u578B", feature: "\u5916\u56F4\u73AF\u7ED5\u6216\u53CC\u5411\u6536\u675F\uFF0C\u4E2D\u5FC3\u5F62\u6210\u7A7A\u5FC3/\u7A84\u8170" },
  { key: "dir", label: "\u5355\u5411\u504F\u7F6E\u578B", feature: "\u6574\u4F53\u504F\u5411\u4E00\u4FA7\u6216\u6CBF\u5BF9\u89D2\u7EBF\u9010\u7EA7\u9012\u8FDB" },
  { key: "grid", label: "\u683C\u7F51\u8FF7\u5BAB\u578B", feature: "\u4EA4\u9519\u5C0F\u5806 / \u66F2\u6298\u901A\u9053\uFF0C\u906E\u6321\u94FE\u7EC6\u788E" },
  { key: "wave", label: "\u8D77\u4F0F\u5F02\u5F62\u578B", feature: "\u8F6E\u5ED3\u9AD8\u4F4E\u8D77\u4F0F\u6216\u5F2F\u6708\u6536\u675F" },
  { key: "irregular", label: "\u4E0D\u89C4\u5219\u5927\u9646\u578B", feature: "\u4E0D\u5BF9\u79F0\u3001\u591A\u51F8\u8D77\u3001\u591A\u51F9\u9677\u7684\u6574\u4F53\u8F6E\u5ED3" }
];
var CURVES = {
  flat: [1, 1, 1, 1, 1],
  rise: [1, 1.35, 1.7, 2.1, 2.5],
  fall: [2.5, 2.1, 1.7, 1.35, 1],
  arch: [1, 1.6, 2.2, 1.6, 1],
  valley: [2.2, 1.6, 1, 1.6, 2.2],
  dualpeak: [2, 1, 2, 1, 2],
  saw: [1, 2, 1, 2, 1],
  plateau: [1, 2, 2, 2, 1]
};
var OFFSETS = {
  diag: [[1, 1], [0, 1], [1, 0]],
  vert: [[0, 1], [0, 1], [1, 1]],
  horiz: [[1, 0], [1, 0], [0, 1]],
  alt: [[1, 1], [1, 1], [0, 0]],
  cross: [[1, 0], [0, 1], [1, 1], [0, 0]]
};
var DEFS = [
  /* 1. 中心金字塔：底宽顶窄、中央集中 */
  ["L2-P01", "core", "\u4E2D\u5FC3\u91D1\u5B57\u5854", {
    mask: ["...###...", "..#####..", ".#######.", "#########", "#########"],
    growth: "central",
    layerShape: "pyramid",
    curve: "rise",
    offsets: "diag",
    density: 0.12,
    phase: [0, 0],
    feature: "\u5E95\u5EA7\u94FA\u6EE1\u5168\u5BBD\u3001\u9010\u5C42\u5411\u4E2D\u592E\u6536\u62E2\uFF0C\u5F62\u6210\u6B63\u91D1\u5B57\u5854"
  }],
  /* 2. 双核心：左右两个独立主牌堆，中间留空 */
  ["L2-P02", "core", "\u53CC\u6838\u5FC3", {
    mask: ["####.####", "####.####", "####.####", "####.####", "####.####"],
    growth: "dual",
    layerShape: "split",
    curve: "arch",
    offsets: "vert",
    density: 0.12,
    phase: [1, 0],
    feature: "\u5DE6\u53F3\u5404\u4E00\u5EA7 4\xD75 \u4E3B\u724C\u5806\uFF0C\u4E2D\u95F4\u6574\u5217\u7559\u7A7A"
  }],
  /* 3. 三岛屿：左、中、右三个独立牌堆 */
  ["L2-P03", "island", "\u4E09\u5C9B\u5C7F", {
    mask: ["##.##.##.", "##.##.##.", "##.##.##.", "##.##.##.", "##.##.##."],
    growth: "scatter",
    layerShape: "split",
    curve: "flat",
    offsets: "diag",
    density: 0.13,
    phase: [0, 1],
    feature: "\u4E09\u5EA7 2\xD75 \u724C\u5C9B\u5E76\u7ACB\uFF0C\u5C9B\u95F4\u6574\u5217\u65AD\u5F00"
  }],
  /* 4. 环形围绕：外围环绕，中间空心 */
  ["L2-P04", "frame", "\u73AF\u5F62\u56F4\u7ED5", {
    mask: ["#########", "##.....##", "##.....##", "##.....##", "#########"],
    growth: "ring",
    layerShape: "ring",
    curve: "flat",
    offsets: "cross",
    density: 0.11,
    phase: [0, 0],
    feature: "\u5916\u5708\u95ED\u5408\u6210\u73AF\uFF0C\u4E2D\u5FC3 5\xD73 \u5B8C\u5168\u7A7A\u5FC3"
  }],
  /* 5. 十字交叉：横向与纵向主体交叠 */
  ["L2-P05", "frame", "\u5341\u5B57\u4EA4\u53C9", {
    mask: ["...###...", "#########", "#########", "#########", "...###..."],
    growth: "cross",
    layerShape: "cross",
    curve: "plateau",
    offsets: "cross",
    density: 0.11,
    phase: [1, 1],
    feature: "\u4E2D\u95F4\u4E09\u884C\u5168\u5BBD\u6A2A\u81C2 + \u4E2D\u5217\u8D2F\u7A7F\u4E09\u884C\u7684\u7AD6\u81C2"
  }],
  /* 6. 阶梯上升：左下 → 右上逐级递增 */
  ["L2-P06", "dir", "\u9636\u68AF\u4E0A\u5347", {
    mask: ["....####.", "..######.", ".########", "#####....", "####....."],
    growth: "stair",
    layerShape: "stair",
    curve: "rise",
    offsets: "diag",
    density: 0.12,
    phase: [0, 0],
    feature: "\u659C\u5411 3 \u683C\u5BBD\u5E26\u81EA\u5DE6\u4E0B\u62AC\u5347\u5230\u53F3\u4E0A\uFF0C\u53F0\u9636\u5F0F\u8F6E\u5ED3"
  }],
  /* 7. 阶梯下降：左上 → 右下逐级递减 */
  ["L2-P07", "dir", "\u9636\u68AF\u4E0B\u964D", {
    mask: [".####....", ".######..", "########.", "....#####", ".....####"],
    growth: "stairDown",
    layerShape: "stair",
    curve: "fall",
    offsets: "alt",
    density: 0.12,
    phase: [1, 0],
    feature: "\u659C\u5411 3 \u683C\u5BBD\u5E26\u81EA\u5DE6\u4E0A\u4E0B\u964D\u5230\u53F3\u4E0B\uFF0C\u4E0E\u4E0A\u5347\u9636\u68AF\u955C\u50CF"
  }],
  /* 8. 左侧巨塔：左侧高密度，右侧分散 */
  ["L2-P08", "dir", "\u5DE6\u4FA7\u5DE8\u5854", {
    mask: ["####.....", "######...", "#######..", "#########", "######..."],
    growth: "left",
    layerShape: "blob",
    curve: "rise",
    offsets: "vert",
    density: 0.13,
    phase: [0, 1],
    feature: "\u5DE6 4 \u5217\u539A\u5B9E\uFF0C\u5411\u53F3\u9010\u5C42\u6536\u7A84\uFF0C\u53F3\u4E0B\u523B\u610F\u7559\u7A7A"
  }],
  /* 9. 右侧巨塔：右侧高密度，左侧分散 */
  ["L2-P09", "dir", "\u53F3\u4FA7\u5DE8\u5854", {
    mask: [".....####", "...######", "..#######", "#########", "...######"],
    growth: "right",
    layerShape: "blob",
    curve: "fall",
    offsets: "vert",
    density: 0.13,
    phase: [1, 1],
    feature: "\u53F3 4 \u5217\u539A\u5B9E\uFF0C\u5411\u5DE6\u9010\u5C42\u6536\u7A84\uFF0C\u5DE6\u4E0B\u523B\u610F\u7559\u7A7A"
  }],
  /* 10. 上下双层岛：上方与下方两个主体区域 */
  ["L2-P10", "island", "\u4E0A\u4E0B\u53CC\u5C42\u5C9B", {
    mask: ["#########", "#########", ".........", "#########", "#########"],
    growth: "dualVertical",
    layerShape: "band",
    curve: "dualpeak",
    offsets: "horiz",
    density: 0.13,
    phase: [0, 0],
    feature: "\u4E0A\u4E0B\u4E24\u6761 9\xD72 \u6A2A\u5E26\uFF0C\u4E2D\u95F4\u6574\u884C\u65AD\u5F00"
  }],
  /* 11. 蝴蝶形：左右对称双翼，中央连接 */
  ["L2-P11", "frame", "\u8774\u8776\u5F62", {
    mask: ["##.....##", "###...###", "####.####", "###...###", "##.....##"],
    growth: "butterfly",
    layerShape: "split",
    curve: "arch",
    offsets: "diag",
    density: 0.12,
    phase: [1, 0],
    feature: "\u5DE6\u53F3\u53CC\u7FFC\u5916\u6269\uFF0C\u4E2D\u592E\u4EC5\u4E00\u884C\u76F8\u8FDE\u5F62\u6210\u8776\u8EAB"
  }],
  /* 12. 沙漏形：上下宽、中间窄 */
  ["L2-P12", "frame", "\u6C99\u6F0F\u5F62", {
    mask: ["#########", "#########", "...###...", "#########", "#########"],
    growth: "hourglass",
    layerShape: "band",
    curve: "valley",
    offsets: "cross",
    density: 0.12,
    phase: [0, 1],
    feature: "\u4E0A\u4E0B\u5404 9\xD72 \u5BBD\u5E26\uFF0C\u4E2D\u95F4\u4E00\u884C\u6536\u675F\u5230 3 \u683C\u7A84\u8170"
  }],
  /* 13. 迷宫形：多区域连接，形成曲折通道 */
  ["L2-P13", "grid", "\u8FF7\u5BAB\u5F62", {
    mask: ["#########", "........#", "#########", "#........", "#########"],
    growth: "serpentine",
    layerShape: "flat",
    curve: "flat",
    offsets: "alt",
    density: 0.11,
    phase: [1, 1],
    feature: "\u4E0A\u4E0B\u6A2A\u5899\u4E0E\u5DE6\u53F3\u5355\u683C\u901A\u9053\u4EA4\u66FF\uFF0C\u5F62\u6210 S \u5F62\u8D70\u5ECA"
  }],
  /* 14. 棋盘形：多个分散小牌堆，交错排列 */
  ["L2-P14", "grid", "\u68CB\u76D8\u5F62", {
    mask: ["###..###.", "###..###.", "###..###.", ".###..###", ".###..###"],
    growth: "checker",
    layerShape: "checker",
    curve: "flat",
    offsets: "horiz",
    density: 0.14,
    phase: [0, 0],
    feature: "3\xD73 \u5C0F\u5757\u4E0A\u4E0B\u9519\u4F4D\u6392\u5E03\uFF0C\u5F62\u6210\u68CB\u76D8\u5F0F\u4EA4\u9519\u5C0F\u5806"
  }],
  /* 15. 弧形月牙：整体弯月，中心偏移 */
  ["L2-P15", "wave", "\u5F27\u5F62\u6708\u7259", {
    mask: ["..#####..", ".#######.", "####..###", "###....##", "####..###"],
    growth: "crescent",
    layerShape: "ring",
    curve: "arch",
    offsets: "diag",
    density: 0.11,
    phase: [1, 0],
    feature: "\u5DE6\u4FA7\u539A\u5F27\u3001\u53F3\u4FA7\u6E10\u8584\uFF0C\u51F9\u53E3\u504F\u5411\u53F3\u4FA7\uFF0C\u6574\u4F53\u5448\u5F2F\u6708"
  }],
  /* 16. 波浪形：多个高低起伏的连续区域 */
  ["L2-P16", "wave", "\u6CE2\u6D6A\u5F62", {
    mask: ["#########", "###...###", "..#####..", "###...###", "#########"],
    growth: "wave",
    layerShape: "arc",
    curve: "saw",
    offsets: "cross",
    density: 0.12,
    phase: [0, 1],
    feature: "\u8F6E\u5ED3\u6309\u884C\u8D77\u4F0F\uFF1A\u6EE1 \u2192 \u7F3A\u53E3 \u2192 \u7A84 \u2192 \u7F3A\u53E3 \u2192 \u6EE1\uFF0C\u5F62\u6210\u6CE2\u6D6A"
  }],
  /* 17. 对角双塔：左上与右下两个主牌堆 */
  ["L2-P17", "island", "\u5BF9\u89D2\u53CC\u5854", {
    mask: ["######...", "######...", "...###...", "...######", "...######"],
    growth: "diag",
    layerShape: "stair",
    curve: "rise",
    offsets: "alt",
    density: 0.13,
    phase: [1, 1],
    feature: "\u5DE6\u4E0A 6\xD72 \u4E0E\u53F3\u4E0B 6\xD72 \u4E24\u5EA7\u5854\uFF0C\u4EC5\u4E2D\u592E 3 \u683C\u76F8\u8FDE"
  }],
  /* 18. 四角围合：四角分布主体，中间留空 */
  ["L2-P18", "island", "\u56DB\u89D2\u56F4\u5408", {
    mask: ["####.####", "####.####", ".........", "####.####", "####.####"],
    growth: "corners",
    layerShape: "split",
    curve: "dualpeak",
    offsets: "vert",
    density: 0.13,
    phase: [0, 0],
    feature: "\u56DB\u4E2A 4\xD72 \u89D2\u5757\u5206\u5C45\u56DB\u89D2\uFF0C\u4E2D\u884C\u4E0E\u4E2D\u5217\u5341\u5B57\u7559\u7A7A"
  }],
  /* 19. 中心十字岛：中央主体向四个方向延伸 */
  ["L2-P19", "frame", "\u4E2D\u5FC3\u5341\u5B57\u5C9B", {
    mask: ["..#####..", "..#####..", "#########", "..#####..", "..#####.."],
    growth: "crossCenter",
    layerShape: "cross",
    curve: "plateau",
    offsets: "horiz",
    density: 0.12,
    phase: [1, 0],
    feature: "\u4E2D\u592E 3\xD75 \u4E3B\u4F53 + \u4E2D\u90E8\u4E00\u884C\u5411\u5DE6\u53F3\u5404\u4F38\u51FA 2 \u683C"
  }],
  /* 20. 不规则大陆形：不对称、多凸起、多凹陷 */
  ["L2-P20", "irregular", "\u4E0D\u89C4\u5219\u5927\u9646\u5F62", {
    mask: [".#######.", "####.####", ".########", "###..####", ".#######."],
    growth: "asym",
    layerShape: "blob",
    curve: "rise",
    offsets: "cross",
    density: 0.15,
    phase: [0, 1],
    feature: "\u5DE6\u53F3\u4E0D\u5BF9\u79F0\u3001\u4E0A\u4E0B\u591A\u51F8\u8D77\uFF0C\u5185\u90E8\u4E24\u5904\u7F3A\u683C\u5F62\u6210\u6D77\u6E7E\u72B6\u51F9\u9677"
  }]
];
var L11 = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
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
  "L2-P01": { mask: ["..#####..", "#########"], layers: L11, turn: 0 },
  "L2-P02": { mask: ["####.####", "####.####"], layers: L12a, turn: 1 },
  "L2-P03": { mask: ["##.##.##.", ".##.##.##"], layers: L13a, turn: 2 },
  "L2-P04": { mask: ["##.....##", "#########"], layers: L14a, turn: 3 },
  "L2-P05": { mask: ["...###...", "#########"], layers: L15a, turn: 0 },
  "L2-P06": { mask: ["##.###.##", ".########"], layers: L16a, turn: 1 },
  "L2-P07": { mask: [".########", ".....####"], layers: L12b, turn: 2 },
  "L2-P08": { mask: ["######...", "####....."], layers: L12c, turn: 3 },
  "L2-P09": { mask: ["...######", ".....####"], layers: L13b, turn: 0 },
  "L2-P10": { mask: ["#########", "##.###.##"], layers: L14b, turn: 1 },
  "L2-P11": { mask: ["##.....##", "###...###"], layers: L15b, turn: 2 },
  "L2-P12": { mask: ["#########", "...###..."], layers: L16c, turn: 3 },
  "L2-P13": { mask: ["#########", "#.#.#.#.#"], layers: L12d, turn: 1 },
  "L2-P14": { mask: ["###..###.", ".###..###"], layers: L13c, turn: 2 },
  "L2-P15": { mask: [".#######.", "####..###"], layers: L14c, turn: 3 },
  "L2-P16": { mask: ["###...###", "#########"], layers: L11, turn: 0 },
  "L2-P17": { mask: ["######...", "...######"], layers: L12a, turn: 1 },
  "L2-P18": { mask: ["####.####", "##.###.##"], layers: L13a, turn: 2 },
  "L2-P19": { mask: ["..#####..", ".#######."], layers: L14a, turn: 3 },
  "L2-P20": { mask: [".#######.", "####.####"], layers: L15a, turn: 0 }
};
function parseOuter(cfg, id) {
  if (!cfg || !cfg.mask || !cfg.layers) {
    throw new Error("\u6A21\u677F " + id + " \u7F3A\u5C11\u5B8C\u6574\u5916\u5ED3\u724C\u4F4D\u5B9A\u4E49");
  }
  if (cfg.mask.length !== OUTER_ROWS) {
    throw new Error("\u6A21\u677F " + id + " \u5916\u5ED3\u63A9\u819C\u884C\u6570 " + cfg.mask.length + " \u2260 " + OUTER_ROWS);
  }
  var cells = [];
  for (var r = 0; r < OUTER_ROWS; r++) {
    var line = cfg.mask[r];
    if (typeof line !== "string" || line.length !== OUTER_COLS) {
      throw new Error("\u6A21\u677F " + id + " \u5916\u5ED3\u7B2C " + r + " \u884C\u5BBD\u5EA6 " + (line ? line.length : 0) + " \u2260 " + OUTER_COLS);
    }
    for (var c = 0; c < OUTER_COLS; c++) {
      if (line.charAt(c) === ".") continue;
      if (line.charAt(c) !== "#") {
        throw new Error("\u6A21\u677F " + id + ' \u5916\u5ED3\u63A9\u819C\u542B\u975E\u6CD5\u5B57\u7B26 "' + line.charAt(c) + '"');
      }
      cells.push({ c, r: r + OUTER_R0, k: c + "," + (r + OUTER_R0) });
    }
  }
  var cc = (OUTER_COLS - 1) / 2;
  cells.sort(function(a, b) {
    if (a.r !== b.r) return a.r - b.r;
    var ea = -Math.abs(a.c - cc);
    var eb = -Math.abs(b.c - cc);
    return ea - eb || a.c - b.c;
  });
  var reg = labelRegions(cells);
  for (var ci = 0; ci < cells.length; ci++) {
    cells[ci].region = (reg.labels[cells[ci].k] || "R1").replace("R", "O");
  }
  var layers = cfg.layers.slice();
  var total = 0;
  for (var li = 0; li < layers.length; li++) {
    if (!(layers[li] >= 1) || layers[li] > cells.length) {
      throw new Error("\u6A21\u677F " + id + " \u5916\u5ED3\u7B2C " + li + " \u5C42\u5F20\u6570 " + layers[li] + " \u975E\u6CD5");
    }
    if (li && layers[li] < layers[li - 1]) {
      throw new Error("\u6A21\u677F " + id + " \u5916\u5ED3\u5C42\u5F20\u6570\u4E0D\u662F\u975E\u9012\u51CF\uFF08\u5C42\u96C6\u5408\u65E0\u6CD5\u5D4C\u5957\uFF09");
    }
    total += layers[li];
  }
  if (total !== OUTER_TILE_COUNT) {
    throw new Error("\u6A21\u677F " + id + " \u5916\u5ED3\u603B\u5F20\u6570 " + total + " \u2260 " + OUTER_TILE_COUNT);
  }
  var turn = ((cfg.turn | 0) % 4 + 4) % 4;
  var raw = {
    mask: cfg.mask.slice(),
    layers,
    turn,
    cells: cells.map(function(x) {
      return x.k + "@" + x.region;
    })
  };
  return {
    mask: cfg.mask.slice(),
    cells,
    cellCount: cells.length,
    layers,
    layerCount: layers.length,
    total,
    turn,
    signature: sha256Hex("MAH-L2-OUTER-v1|" + id + "|" + JSON.stringify(raw))
  };
}
function parseMask(rows, id) {
  if (!rows || rows.length !== MASK_ROWS) {
    throw new Error("\u6A21\u677F " + id + " \u63A9\u819C\u884C\u6570 " + (rows ? rows.length : 0) + " \u2260 " + MASK_ROWS);
  }
  var cells = [];
  for (var r = 0; r < MASK_ROWS; r++) {
    var line = rows[r];
    if (typeof line !== "string" || line.length !== MASK_COLS) {
      throw new Error("\u6A21\u677F " + id + " \u7B2C " + r + " \u884C\u5BBD\u5EA6 " + (line ? line.length : 0) + " \u2260 " + MASK_COLS);
    }
    for (var c = 0; c < MASK_COLS; c++) {
      var ch = line.charAt(c);
      if (ch === ".") continue;
      if (ch !== "#" && ch !== "@") {
        throw new Error("\u6A21\u677F " + id + ' \u63A9\u819C\u542B\u975E\u6CD5\u5B57\u7B26 "' + ch + '"\uFF08\u53EA\u5141\u8BB8 # @ .\uFF09');
      }
      cells.push({ c, r, k: c + "," + r, w: ch === "@" ? 1.7 : 1 });
    }
  }
  return cells;
}
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
    var label = "R" + region;
    var queue = [start];
    seen[start.k] = 1;
    labels[start.k] = label;
    while (queue.length) {
      var cur = queue.pop();
      for (var d2 = 0; d2 < dirs.length; d2++) {
        var nk = cur.c + dirs[d2][0] + "," + (cur.r + dirs[d2][1]);
        if (!byKey[nk] || seen[nk]) continue;
        seen[nk] = 1;
        labels[nk] = label;
        queue.push(byKey[nk]);
      }
    }
  }
  return { labels, count: region };
}
function maskBox(cells) {
  var c0 = MASK_COLS, c1 = -1, r0 = MASK_ROWS, r1 = -1;
  for (var i = 0; i < cells.length; i++) {
    if (cells[i].c < c0) c0 = cells[i].c;
    if (cells[i].c > c1) c1 = cells[i].c;
    if (cells[i].r < r0) r0 = cells[i].r;
    if (cells[i].r > r1) r1 = cells[i].r;
  }
  return { c0, c1, r0, r1, cols: c1 - c0 + 1, rows: r1 - r0 + 1 };
}
function tpl(templateId, category, name, cfg) {
  var cat = null;
  for (var i = 0; i < TEMPLATE_CATEGORIES.length; i++) {
    if (TEMPLATE_CATEGORIES[i].key === category) cat = TEMPLATE_CATEGORIES[i];
  }
  var cells = parseMask(cfg.mask, templateId);
  if (cells.length < 20) {
    throw new Error("\u6A21\u677F " + templateId + " \u53EF\u843D\u724C\u683C\u53EA\u6709 " + cells.length + " \u4E2A\uFF08< 20\uFF0C\u65E0\u6CD5\u627F\u8F7D\u9AD8\u5C42\u724C\u6570\uFF09");
  }
  var regionInfo = labelRegions(cells);
  var box = maskBox(cells);
  var outer = parseOuter(OUTER_DEFS[templateId], templateId);
  var structure = {
    mask: cfg.mask.slice(),
    growth: cfg.growth,
    layerShape: cfg.layerShape,
    layerCurve: CURVES[cfg.curve].slice(),
    offsets: OFFSETS[cfg.offsets].map(function(p) {
      return [p[0], p[1]];
    }),
    density: cfg.density,
    phase: [cfg.phase[0], cfg.phase[1]]
  };
  return {
    templateId,
    category,
    categoryLabel: cat ? cat.label : category,
    name,
    feature: cfg.feature,
    structure,
    /* v3：结构签名同时纳入主体参数与本套独有的完整外廓牌位定义 */
    structureSignature: sha256Hex("MAH-L2-TPL-v3|" + templateId + "|" + JSON.stringify(structure) + "|" + outer.signature),
    maskCells: cells,
    maskCellCount: cells.length,
    maskRegion: regionInfo.labels,
    maskRegionCount: regionInfo.count,
    maskBox: box,
    outer,
    outerCellCount: outer.cellCount,
    outerLayerCount: outer.layerCount,
    outerTileCount: outer.total,
    outerSignature: outer.signature
  };
}
var L2_TEMPLATES = [];
for (di = 0; di < DEFS.length; di++) {
  d = DEFS[di];
  L2_TEMPLATES.push(tpl(d[0], d[1], d[2], d[3]));
}
var d;
var di;
var L2_TEMPLATE_IDS = L2_TEMPLATES.map(function(t) {
  return t.templateId;
});
var BY_ID = {};
for (bi = 0; bi < L2_TEMPLATES.length; bi++) BY_ID[L2_TEMPLATES[bi].templateId] = L2_TEMPLATES[bi];
var bi;
function templateById(id) {
  return BY_ID[id] || null;
}
function templateSummary(t) {
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
    outerSignature: t.outer.signature
  };
}
function templateCategoryStats() {
  var out = {};
  for (var i = 0; i < L2_TEMPLATES.length; i++) {
    var k = L2_TEMPLATES[i].category;
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

// core/shared/l2_spec.js
var SPEC_ALGORITHM = "MAH-L2-SPEC-v3";
var GRID_X0 = 33;
var GRID_Y0 = 308;
var SPEC_FORM_SIZE = 18;
var KEEP_REUSE = 3;
function tailBlocksFor(layerCount) {
  return layerCount <= 16 ? 2 : 3;
}
var SPEC_SEED_MAX = 5;
var SPEC_SEED_RADIUS = 10;
function cellKey(c, r) {
  return c + "," + r;
}
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
      var pr = comp[c2].split(",");
      var cc = +pr[0];
      var rr2 = +pr[1];
      var d2 = (cc - centroid[0]) * (cc - centroid[0]) + (rr2 - centroid[1]) * (rr2 - centroid[1]);
      if (d2 < bestD - 1e-9 || Math.abs(d2 - bestD) < 1e-9 && best !== null && (rr2 < +best.split(",")[1] || rr2 === +best.split(",")[1] && cc < +best.split(",")[0])) {
        bestD = d2;
        best = comp[c2];
      }
    }
    seeds.push(best);
  }
  return seeds;
}
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
      if (dmin > bestD) {
        bestD = dmin;
        bestKey = k;
      }
    }
    if (bestKey === null || bestD <= SPEC_SEED_RADIUS) break;
    seeds.push(bestKey);
  }
  return seeds;
}
function bfsDist(adj, from) {
  var dist = {};
  dist[from] = 0;
  var queue = [from];
  while (queue.length) {
    var k = queue.shift();
    var nb = adj[k];
    for (var i = 0; i < nb.length; i++) {
      if (dist[nb[i]] === void 0) {
        dist[nb[i]] = dist[k] + 1;
        queue.push(nb[i]);
      }
    }
  }
  return dist;
}
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
    if (order.length > cells.length) throw new Error("\u89C4\u683C\u7F3A\u9677\uFF1A\u6E38\u8D70\u5E8F\u957F\u5EA6\u6EA2\u51FA");
    var nb = adj[k];
    var sorted = nb.slice().sort(function(a, b) {
      var pa = a.split(","), pb = b.split(",");
      return +pa[0] - +pb[0] || +pa[1] - +pb[1];
    });
    for (var n = 0; n < sorted.length; n++) {
      if (seen[sorted[n]]) continue;
      seen[sorted[n]] = 1;
      queue.push(sorted[n]);
    }
  }
  if (order.length !== cells.length) {
    throw new Error("\u89C4\u683C\u7F3A\u9677\uFF1A\u6E38\u8D70\u5E8F\u8986\u76D6 " + order.length + "/" + cells.length + " \u683C");
  }
  return order;
}
function buildSpec(tpl2) {
  var cells = [];
  for (var i = 0; i < tpl2.maskCells.length; i++) {
    var raw = tpl2.maskCells[i];
    cells.push({
      c: raw.c,
      r: raw.r,
      k: raw.k,
      region: tpl2.maskRegion[raw.k] || "R1"
    });
  }
  if (!cells.length) throw new Error("\u89C4\u683C\u7F3A\u9677\uFF1A\u6A21\u677F " + tpl2.templateId + " \u63A9\u819C\u4E3A\u7A7A");
  var sumC = 0, sumR = 0;
  for (var j = 0; j < cells.length; j++) {
    sumC += cells[j].c;
    sumR += cells[j].r;
  }
  var centroid = [sumC / cells.length, sumR / cells.length];
  var adj = buildAdjacency(cells);
  var seeds = multiSeeds(cells, adj, centroid);
  var walk = walkOrder(cells, adj, seeds);
  var walkIndex = {};
  for (var w = 0; w < walk.length; w++) walkIndex[walk[w].k] = w;
  var nbr = {};
  for (var nk in adj) {
    if (!Object.prototype.hasOwnProperty.call(adj, nk)) continue;
    var pr = nk.split(",");
    var nc = +pr[0];
    var nr = +pr[1];
    var list = [];
    for (var ni = 0; ni < adj[nk].length; ni++) {
      var pk = adj[nk][ni].split(",");
      list.push({ k: adj[nk][ni], dc: +pk[0] - nc, dr: +pk[1] - nr });
    }
    nbr[nk] = list;
  }
  var silhouette = walk.map(function(c) {
    return c.k;
  }).slice().sort();
  var outer = tpl2.outer;
  var outerCells = outer.cells.map(function(c) {
    return { c: c.c, r: c.r, k: c.k, region: c.region };
  });
  var outerRegion = {};
  var seenOuterReg = {};
  var outerRegionCount = 0;
  for (var oi = 0; oi < outerCells.length; oi++) {
    var ok = outerCells[oi].k;
    var org = outerCells[oi].region;
    outerRegion[ok] = org;
    if (!seenOuterReg[org]) {
      seenOuterReg[org] = 1;
      outerRegionCount++;
    }
  }
  var outerSilhouette = outerCells.map(function(c) {
    return c.k;
  }).sort();
  var signature = sha256Hex(SPEC_ALGORITHM + "|" + tpl2.templateId + "|" + walk.map(function(c) {
    return c.k + "@" + c.region;
  }).join(";") + "|OUTER|" + outer.signature);
  return {
    templateId: tpl2.templateId,
    algorithm: SPEC_ALGORITHM,
    maskCells: cells,
    maskCellCount: cells.length,
    maskRegion: tpl2.maskRegion,
    maskRegionCount: tpl2.maskRegionCount,
    maskBox: tpl2.maskBox,
    adj,
    nbr,
    seeds,
    walk,
    walkIndex,
    formSize: Math.min(SPEC_FORM_SIZE, cells.length),
    silhouette,
    outer,
    outerCells,
    outerCellCount: outerCells.length,
    outerRegion,
    outerRegionCount,
    outerSilhouette,
    signature
  };
}
var SPEC_CACHE = {};
function specFor(templateId) {
  var cached = SPEC_CACHE[templateId];
  if (cached) return cached;
  var tpl2 = templateById(templateId);
  if (!tpl2) throw new Error("\u672A\u77E5\u7B2C\u4E8C\u5173\u6A21\u677F: " + templateId);
  var spec = buildSpec(tpl2);
  SPEC_CACHE[templateId] = spec;
  return spec;
}
function phaseBits(ph) {
  return (ph[0] === 0 ? 1 : 2) | (ph[1] === 0 ? 4 : 8);
}
function needMask(spec, key, used) {
  var nb = spec.nbr[key];
  if (!nb) return 0;
  var m = 0;
  for (var i = 0; i < nb.length; i++) {
    if (used[nb[i].k]) continue;
    if (nb[i].dc === -1) m |= 1;
    else if (nb[i].dc === 1) m |= 2;
    else if (nb[i].dr === -1) m |= 4;
    else if (nb[i].dr === 1) m |= 8;
  }
  return m;
}
function hasUsedNeighbor(spec, key, used) {
  var nb = spec.adj[key] || [];
  for (var i = 0; i < nb.length; i++) if (used[nb[i]]) return true;
  return false;
}
function polarityUrgency(spec, key, used, missing) {
  var nb = spec.nbr[key] || [];
  var s = 0;
  for (var i = 0; i < nb.length; i++) {
    var nbk = nb[i];
    if (used[nbk.k]) continue;
    var bit = nbk.dc === -1 ? 1 : nbk.dc === 1 ? 2 : nbk.dr === -1 ? 4 : 8;
    if (!(missing & bit)) continue;
    var deg = (spec.nbr[nbk.k] || []).length;
    s += deg <= 1 ? 100 : deg === 2 ? 10 : 1;
  }
  return s;
}
function grabNew(spec, q, used) {
  var empty = true;
  for (var key in used) {
    if (Object.prototype.hasOwnProperty.call(used, key)) {
      empty = false;
      break;
    }
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
var PHASES = [[0, 0], [1, 1], [1, 0], [0, 1]];
function phaseIndex(ph) {
  for (var i = 0; i < PHASES.length; i++) {
    if (PHASES[i][0] === ph[0] && PHASES[i][1] === ph[1]) return i;
  }
  return 0;
}
function cellPos(cell, ph) {
  return {
    x: GRID_X0 + cell.c * TILE_W + ph[0] * LATTICE_X,
    y: GRID_Y0 + cell.r * TILE_H + ph[1] * LATTICE_Y
  };
}
function overlaps(posA, posB) {
  var ix = Math.min(posA.x + TILE_W, posB.x + TILE_W) - Math.max(posA.x, posB.x);
  var iy = Math.min(posA.y + TILE_H, posB.y + TILE_H) - Math.max(posA.y, posB.y);
  return ix > 0 && iy > 0;
}
function buildPlan(spec, profile, fillRot) {
  var plan = layerPlanFor(profile);
  var L = plan.length;
  if (!L) throw new Error("\u6863\u4F4D\u7F3A\u5C11 layerPlanFor \u89C4\u5212");
  if (profile.layers && profile.layers !== L) {
    throw new Error("\u6863\u4F4D\u5C42\u6570 " + profile.layers + " \u4E0E layerPlanFor " + L + " \u5C42\u4E0D\u4E00\u81F4");
  }
  var n = spec.maskCellCount;
  var used = {};
  var lower = [];
  var remaining = n;
  var layers = [];
  var fillLayers = 0;
  var delayed = 0;
  var supMask = {};
  function enabledCount(cell2, ph3) {
    var nb = spec.nbr[cell2.k] || [];
    var s = 0;
    for (var i = 0; i < nb.length; i++) {
      if (used[nb[i].k]) continue;
      if (nb[i].dc === -1) {
        if (ph3[0] === 0) s++;
      } else if (nb[i].dc === 1) {
        if (ph3[0] === 1) s++;
      } else if (nb[i].dr === -1) {
        if (ph3[1] === 0) s++;
      } else if (nb[i].dr === 1) {
        if (ph3[1] === 1) s++;
      }
    }
    return s;
  }
  for (var l = 0; l < L; l++) {
    var size = plan[l];
    if (size > spec.formSize) {
      throw new Error("\u6A21\u677F " + spec.templateId + " \u7B2C " + l + " \u5C42\u9700\u8981 " + size + " \u683C\uFF0C\u8D85\u8FC7\u5355\u5C42\u4E0A\u9650 " + spec.formSize);
    }
    var entries = [];
    var kind;
    var phase = PHASES[fillRot % PHASES.length];
    if (remaining > 0) {
      let conflicts = function(pos3) {
        for (var q = 0; q < placedPos.length; q++) if (overlaps(pos3, placedPos[q])) return true;
        return false;
      }, popcount = function(v) {
        var c2 = 0;
        while (v) {
          c2 += v & 1;
          v >>= 1;
        }
        return c2;
      }, pushFiller = function(cellF) {
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
      };
      kind = "fill";
      fillLayers = l + 1;
      var cap = l === 0 ? size : Math.max(1, size - Math.min(KEEP_REUSE, 2));
      if (remaining <= size) cap = remaining;
      var cands = grabNew(spec, n, used);
      if (!cands.length) {
        throw new Error("\u6A21\u677F " + spec.templateId + " \u94FA\u8BBE\u7B2C " + l + " \u5C42\u627E\u4E0D\u5230\u4EFB\u4F55\u6709\u4E0B\u5C42\u90BB\u5C45\u7684\u65B0\u683C\uFF08\u6E38\u8D70\u5E8F\u6216\u63A9\u819C\u8FDE\u901A\u6027\u6709\u95EE\u9898\uFF09");
      }
      phase = PHASES[(fillRot + l) % PHASES.length];
      var tryOrder = [0, 1, 2, 3];
      var taken = {};
      var freshCount = 0;
      var placedPos = [];
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
          if (sc > bestSc) {
            bestSc = sc;
            best = { cell, phase: ph, pos };
          }
        }
        if (!best) {
          delayed++;
          continue;
        }
        entries.push(best);
        placedPos.push(best.pos);
        taken[cell.k] = 1;
        freshCount++;
      }
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
            cell: wc2,
            missing: missing2,
            urgency: polarityUrgency(spec, wc2.k, used, missing2),
            order: wi
          });
        }
        polCands.sort(function(a, b) {
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
      if (entries.length < size && l > 0) {
        var prevL = layers[l - 1].cells;
        for (var pi = prevL.length - 1; pi >= 0 && entries.length < size; pi--) {
          if (taken[prevL[pi].k]) continue;
          if (!pushFiller(prevL[pi])) continue;
        }
      }
      if (entries.length < size) {
        for (var fi = spec.walk.length - 1; fi >= 0 && entries.length < size; fi--) {
          var fc = spec.walk[fi];
          if (!used[fc.k] || taken[fc.k]) continue;
          pushFiller(fc);
        }
      }
      if (entries.length !== size) {
        throw new Error("\u6A21\u677F " + spec.templateId + " \u94FA\u8BBE\u7B2C " + l + " \u5C42\u683C\u6570 " + entries.length + " \u2260 " + size);
      }
      remaining -= freshCount;
    } else {
      kind = "tail";
      var blocks = tailBlocksFor(L);
      var slot = (layers.length - fillLayers) % blocks;
      var cycle = Math.floor((layers.length - fillLayers) / blocks);
      var hop = blocks === 2 ? size / 4 : size / 2;
      var baseOff = Math.round(slot * hop);
      phase = PHASES[cycle % PHASES.length];
      for (var bi2 = 0; bi2 < size; bi2++) {
        var wc = spec.walk[((baseOff + bi2) % n + n) % n];
        entries.push({ cell: wc, phase, pos: cellPos(wc, phase) });
      }
    }
    var out = [];
    for (var ej = 0; ej < entries.length; ej++) {
      var e = entries[ej];
      out.push({
        c: e.cell.c,
        r: e.cell.r,
        k: e.cell.k,
        region: e.cell.region,
        phase: e.phase.slice()
      });
      used[e.cell.k] = 1;
      supMask[e.cell.k] = (supMask[e.cell.k] || 0) | (e.phase[0] === 0 ? 1 : 2) | (e.phase[1] === 0 ? 4 : 8);
      lower.push(e.pos);
    }
    layers.push({
      index: l,
      kind,
      block: kind === "tail" ? (layers.length - fillLayers) % blocks : -1,
      cycle: kind === "tail" ? Math.floor((layers.length - fillLayers) / blocks) : -1,
      phase: phase.slice(),
      cells: out
    });
  }
  if (remaining !== 0) {
    var left = [];
    for (var sk = 0; sk < spec.silhouette.length; sk++) {
      if (!used[spec.silhouette[sk]]) left.push(spec.silhouette[sk]);
    }
    throw new Error("\u6A21\u677F " + spec.templateId + " \u5728 " + L + " \u5C42\u5185\u6CA1\u80FD\u94FA\u6EE1\u63A9\u819C\uFF08\u5269 " + remaining + " \u683C\uFF1A" + left.join(" ") + "\uFF09\uFF0C\u6863\u4F4D\u5C42\u6570\u592A\u5C0F");
  }
  var total = 0;
  for (var t3 = 0; t3 < layers.length; t3++) total += layers[t3].cells.length;
  if (total !== profile.mainCount) {
    throw new Error("\u89C4\u683C\u5C55\u5F00\u5F20\u6570 " + total + " \u2260 \u6863\u4F4D\u4E3B\u5806 " + profile.mainCount);
  }
  var covered = {};
  for (var cj = 0; cj < layers.length; cj++) {
    for (var ck = 0; ck < layers[cj].cells.length; ck++) covered[layers[cj].cells[ck].k] = 1;
  }
  var missing = 0;
  for (var si = 0; si < spec.silhouette.length; si++) if (!covered[spec.silhouette[si]]) missing++;
  if (missing) {
    throw new Error("\u89C4\u683C\u7F3A\u9677\uFF1A\u6A21\u677F " + spec.templateId + " \u5C55\u5F00\u540E\u4ECD\u6709 " + missing + " \u683C\u672A\u88AB\u8986\u76D6");
  }
  return {
    templateId: spec.templateId,
    profileId: profile.id,
    layers,
    layerCount: L,
    fillLayers,
    delayed,
    total,
    fillRot,
    signature: spec.signature
  };
}
var PLAN_CACHE = {};
function specPlan(spec, profile, opt) {
  var o = opt || {};
  var rot = ((o.fillRot | 0) % PHASES.length + PHASES.length) % PHASES.length;
  var ck = spec.templateId + "|" + profile.id + "|" + rot;
  var cached = PLAN_CACHE[ck];
  if (!cached) {
    cached = buildPlan(spec, profile, rot);
    PLAN_CACHE[ck] = cached;
  }
  if (!o.tailPhase) return cached;
  var layers = [];
  for (var i = 0; i < cached.layers.length; i++) {
    var L0 = cached.layers[i];
    if (L0.kind !== "tail") {
      layers.push(L0);
      continue;
    }
    var base = o.tailPhase(L0.block);
    var tp = PHASES[(phaseIndex(base) + (L0.cycle || 0)) % PHASES.length];
    var cells2 = [];
    for (var j = 0; j < L0.cells.length; j++) {
      var c0 = L0.cells[j];
      cells2.push({ c: c0.c, r: c0.r, k: c0.k, region: c0.region, phase: tp.slice() });
    }
    layers.push({
      index: L0.index,
      kind: "tail",
      block: L0.block,
      cycle: L0.cycle,
      phase: tp.slice(),
      cells: cells2
    });
  }
  return {
    templateId: cached.templateId,
    profileId: cached.profileId,
    layers,
    layerCount: cached.layerCount,
    fillLayers: cached.fillLayers,
    delayed: cached.delayed,
    total: cached.total,
    fillRot: cached.fillRot,
    signature: cached.signature
  };
}
var OUTER_PLAN_CACHE = {};
function outerPlanFor(spec, profile) {
  var ck = spec.templateId + "|" + profile.id;
  var cached = OUTER_PLAN_CACHE[ck];
  if (cached) return cached;
  var outer = spec.outer;
  var L = layerPlanFor(profile).length;
  var layers = [];
  var total = 0;
  for (var k = 0; k < outer.layerCount; k++) {
    var cnt = outer.layers[k];
    if (cnt > spec.outerCellCount) {
      throw new Error("\u6A21\u677F " + spec.templateId + " \u5916\u5ED3\u7B2C " + k + " \u5C42 " + cnt + " \u5F20 > \u53EF\u843D\u724C\u683C " + spec.outerCellCount);
    }
    var ph = PHASES[(outer.turn + k) % PHASES.length];
    var cells = [];
    for (var i = 0; i < cnt; i++) {
      var c = spec.outerCells[i];
      cells.push({ c: c.c, r: c.r, k: c.k, region: c.region, phase: ph.slice() });
    }
    layers.push({ index: k, layer: L + k, kind: "outer", phase: ph.slice(), cells });
    total += cnt;
  }
  if (total !== OUTER_TILE_COUNT || total !== profile.queueCount) {
    throw new Error("\u6A21\u677F " + spec.templateId + " \u5916\u5ED3\u5F20\u6570 " + total + " \u2260 \u6863\u4F4D\u914D\u989D " + profile.queueCount);
  }
  var maxCnt = outer.layers[outer.layerCount - 1];
  var usedReg = {};
  for (var ur = 0; ur < maxCnt; ur++) {
    usedReg[spec.outerRegion[spec.outerCells[ur].k] || "O1"] = 1;
  }
  var plan = {
    templateId: spec.templateId,
    profileId: profile.id,
    baseLayer: L,
    layerCount: outer.layerCount,
    totalLayerCount: L + outer.layerCount,
    total,
    turn: outer.turn,
    layers,
    silhouette: spec.outerCells.slice(0, maxCnt).map(function(c2) {
      return c2.k;
    }).sort(),
    regionCount: Object.keys(usedReg).length,
    signature: outer.signature
  };
  OUTER_PLAN_CACHE[ck] = plan;
  return plan;
}
function checkFidelity(cards, spec, plan, profile) {
  var violations = [];
  var checks = {};
  function bad(code, detail) {
    violations.push({ code, detail });
  }
  var main = [];
  var outerCards = [];
  for (var i = 0; i < (cards || []).length; i++) {
    if (cards[i].seg === OUTER_SEG) outerCards.push(cards[i]);
    else main.push(cards[i]);
  }
  checks.count = (cards || []).length === profile.mainCount + profile.queueCount && main.length === profile.mainCount && outerCards.length === profile.queueCount;
  if (!checks.count) {
    bad("COUNT", "\u603B\u5F20\u6570 " + (cards || []).length + "/" + (profile.mainCount + profile.queueCount) + "\uFF0C\u4E3B\u5806 " + main.length + "/" + profile.mainCount + "\uFF0C\u6A21\u677F\u5916\u5ED3 " + outerCards.length + "/" + profile.queueCount);
  }
  var maskKeys = {};
  for (var m = 0; m < spec.maskCells.length; m++) maskKeys[spec.maskCells[m].k] = 1;
  var byLayer = {};
  var outCount = 0;
  var badLattice = 0;
  for (var q = 0; q < main.length; q++) {
    var c = main[q];
    if (c.x % LATTICE_X !== 0 || c.y % LATTICE_Y !== 0) badLattice++;
    var col = Math.floor((c.x - GRID_X0) / LATTICE_X / 2);
    var row = Math.floor((c.y - GRID_Y0) / LATTICE_Y / 2);
    var key = cellKey(col, row);
    if (!maskKeys[key]) outCount++;
    if (!byLayer[c.layer]) byLayer[c.layer] = [];
    byLayer[c.layer].push({ key, card: c });
  }
  checks.cellOut = outCount === 0;
  if (!checks.cellOut) bad("CELL_OUT", outCount + " \u5F20\u724C\u843D\u5230\u4E86\u63A9\u819C\u4E4B\u5916");
  checks.lattice = badLattice === 0;
  if (!checks.lattice) bad("LATTICE", badLattice + " \u5F20\u724C\u4E0D\u5728\u534A\u683C\u6676\u683C\u4E0A");
  var layerIds = Object.keys(byLayer).map(Number).sort(function(a, b) {
    return a - b;
  });
  checks.layerCount = layerIds.length === plan.layerCount;
  if (!checks.layerCount) {
    bad("LAYER_COUNT", "\u5B9E\u9645 " + layerIds.length + " \u5C42\uFF0C\u89C4\u683C " + plan.layerCount + " \u5C42");
  }
  var formMismatch = 0;
  var formDetail = null;
  for (var l = 0; l < plan.layerCount; l++) {
    var got = (byLayer[l] || []).map(function(o) {
      return o.key;
    }).sort();
    var want = plan.layers[l].cells.map(function(c2) {
      return c2.k;
    }).sort();
    if (got.length !== want.length) {
      formMismatch++;
      if (!formDetail) formDetail = "\u7B2C " + l + " \u5C42 " + got.length + " \u683C \u2260 \u89C4\u683C " + want.length + " \u683C";
      continue;
    }
    for (var z = 0; z < want.length; z++) {
      if (got[z] !== want[z]) {
        formMismatch++;
        if (!formDetail) {
          formDetail = "\u7B2C " + l + " \u5C42\u683C\u96C6\u5408\u4E0E\u89C4\u683C\u4E0D\u540C\uFF08" + got[z] + " vs " + want[z] + "\uFF09";
        }
        break;
      }
    }
  }
  checks.layerForm = formMismatch === 0;
  if (!checks.layerForm) bad("LAYER_FORM", formMismatch + " \u5C42\u4E0E\u89C4\u683C\u4E0D\u4E00\u81F4\uFF1A" + formDetail);
  var expectPhase = {};
  for (var lp = 0; lp < plan.layerCount; lp++) {
    if (plan.layers[lp].kind !== "fill") continue;
    var lc = plan.layers[lp].cells;
    for (var ci = 0; ci < lc.length; ci++) {
      expectPhase[lp + "|" + lc[ci].k] = lc[ci].phase;
    }
  }
  var badPhase = 0;
  for (var qp = 0; qp < main.length; qp++) {
    var cp = main[qp];
    var planLayer = plan.layers[cp.layer];
    if (!planLayer || planLayer.kind !== "fill") continue;
    var ccol = Math.floor((cp.x - GRID_X0) / LATTICE_X / 2);
    var crow = Math.floor((cp.y - GRID_Y0) / LATTICE_Y / 2);
    var ckey = cellKey(ccol, crow);
    var cpx = (Math.round((cp.x - GRID_X0) / LATTICE_X) % 2 + 2) % 2;
    var cpy = (Math.round((cp.y - GRID_Y0) / LATTICE_Y) % 2 + 2) % 2;
    var exp = expectPhase[cp.layer + "|" + ckey];
    if (!exp || exp[0] !== cpx || exp[1] !== cpy) badPhase++;
  }
  checks.phase = badPhase === 0;
  if (!checks.phase) bad("PHASE", badPhase + " \u5F20\u724C\u7684\u94FA\u8BBE\u6BB5\u76F8\u4F4D\u4E0E\u89C4\u683C\u4E0D\u7B26");
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
    bad("SILHOUETTE", missingCells + " \u4E2A\u63A9\u819C\u683C\u6CA1\u88AB\u4EFB\u4F55\u5C42\u4F7F\u7528\uFF08\u8F6E\u5ED3\u88AB\u7B80\u5316\uFF09");
  }
  var regions = {};
  for (var ui in used) {
    if (!Object.prototype.hasOwnProperty.call(used, ui)) continue;
    regions[spec.maskRegion[ui] || "R1"] = 1;
  }
  var regionCount = Object.keys(regions).length;
  checks.regionCover = regionCount === spec.maskRegionCount;
  if (!checks.regionCover) {
    bad("REGION_COVER", "\u53EA\u8986\u76D6 " + regionCount + "/" + spec.maskRegionCount + " \u4E2A\u8FDE\u901A\u533A\u57DF");
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
  if (!checks.sameLayer) bad("SAME_LAYER", overlap + " \u5BF9\u540C\u5C42\u724C\u91CD\u53E0");
  var op = null;
  try {
    op = outerPlanFor(spec, profile);
  } catch (eOuter) {
    bad("OUTER_PLAN", String(eOuter && eOuter.message));
  }
  if (op) {
    checks.outerCount = outerCards.length === op.total;
    if (!checks.outerCount) bad("OUTER_COUNT", "\u5916\u5ED3\u724C " + outerCards.length + " \u2260 \u6A21\u677F\u89C4\u683C " + op.total);
    var oThresh = OVERLAP_THRESHOLD * TILE_AREA;
    var oByLayer = {};
    var oUsed = {};
    var oRegions = {};
    var oLatticeBad = 0, oBandBad = 0, oCellBad = 0, oPhaseBad = 0;
    for (var oi2 = 0; oi2 < outerCards.length; oi2++) {
      var oc = outerCards[oi2];
      if (oc.x % LATTICE_X !== 0 || oc.y % LATTICE_Y !== 0) oLatticeBad++;
      if (oc.x < BOARD_BAND.left || oc.y < BOARD_BAND.top || oc.x + TILE_W > BOARD_BAND.right || oc.y + TILE_H > BOARD_BAND.bottom) oBandBad++;
      var occ = Math.floor((oc.x - GRID_X0) / LATTICE_X / 2);
      var ocr = Math.floor((oc.y - GRID_Y0) / LATTICE_Y / 2);
      var ock = cellKey(occ, ocr);
      oUsed[ock] = 1;
      oRegions[spec.outerRegion[ock] || "O1"] = 1;
      if (!oByLayer[oc.layer]) oByLayer[oc.layer] = [];
      oByLayer[oc.layer].push({ key: ock, card: oc });
      var opl = op.layers[oc.layer - op.baseLayer];
      if (!opl) {
        oCellBad++;
        continue;
      }
      var owant = null;
      for (var ow = 0; ow < opl.cells.length; ow++) {
        if (opl.cells[ow].k === ock) {
          owant = opl.cells[ow];
          break;
        }
      }
      if (!owant) {
        oCellBad++;
        continue;
      }
      var opx = (Math.round((oc.x - GRID_X0) / LATTICE_X) % 2 + 2) % 2;
      var opy = (Math.round((oc.y - GRID_Y0) / LATTICE_Y) % 2 + 2) % 2;
      if (owant.phase[0] !== opx || owant.phase[1] !== opy) oPhaseBad++;
    }
    checks.outerLattice = oLatticeBad === 0;
    if (!checks.outerLattice) bad("OUTER_LATTICE", oLatticeBad + " \u5F20\u5916\u5ED3\u724C\u4E0D\u5728\u534A\u683C\u6676\u683C\u4E0A");
    checks.outerBand = oBandBad === 0;
    if (!checks.outerBand) bad("OUTER_BAND", oBandBad + " \u5F20\u5916\u5ED3\u724C\u8D8A\u51FA\u724C\u684C");
    var oLayerIds = Object.keys(oByLayer).map(Number).sort(function(a, b) {
      return a - b;
    });
    checks.outerLayerCount = oLayerIds.length === op.layerCount && oLayerIds[0] === op.baseLayer && oLayerIds[oLayerIds.length - 1] === op.totalLayerCount - 1;
    if (!checks.outerLayerCount) {
      bad("OUTER_LAYER_COUNT", "\u5916\u5ED3\u5B9E\u9645 " + oLayerIds.length + " \u5C42\uFF0C\u89C4\u683C " + op.layerCount + " \u5C42");
    }
    var oFormBad = 0, oFormDetail = "\u65E0";
    for (var ol = 0; ol < op.layerCount; ol++) {
      var ogot = (oByLayer[op.layers[ol].layer] || []).map(function(o) {
        return o.key;
      }).sort();
      var owantKeys = op.layers[ol].cells.map(function(c2) {
        return c2.k;
      }).sort();
      if (ogot.length !== owantKeys.length) {
        oFormBad++;
        if (oFormDetail === "\u65E0") oFormDetail = "\u5916\u5ED3\u7B2C " + ol + " \u5C42 " + ogot.length + " \u683C \u2260 \u89C4\u683C " + owantKeys.length + " \u683C";
        continue;
      }
      for (var oz = 0; oz < owantKeys.length; oz++) {
        if (ogot[oz] !== owantKeys[oz]) {
          oFormBad++;
          if (oFormDetail === "\u65E0") oFormDetail = "\u5916\u5ED3\u7B2C " + ol + " \u5C42\u683C\u96C6\u5408\u4E0E\u89C4\u683C\u4E0D\u540C";
          break;
        }
      }
    }
    checks.outerForm = oFormBad === 0 && oCellBad === 0;
    if (!checks.outerForm) bad("OUTER_FORM", oFormBad + oCellBad + " \u9879\u5916\u5ED3\u683C\u4F4D\u4E0E\u89C4\u683C\u4E0D\u7B26\uFF1A" + oFormDetail);
    checks.outerPhase = oPhaseBad === 0;
    if (!checks.outerPhase) bad("OUTER_PHASE", oPhaseBad + " \u5F20\u5916\u5ED3\u724C\u534A\u683C\u76F8\u4F4D\u4E0E\u89C4\u683C\u4E0D\u7B26");
    var oUsedKeys = Object.keys(oUsed).sort();
    var oSilOK = oUsedKeys.length === op.silhouette.length;
    for (var os = 0; oSilOK && os < op.silhouette.length; os++) {
      if (oUsedKeys[os] !== op.silhouette[os]) oSilOK = false;
    }
    checks.outerSilhouette = oSilOK;
    if (!checks.outerSilhouette) {
      bad("OUTER_SILHOUETTE", "\u5916\u5ED3\u5360\u4F4D\u683C " + oUsedKeys.length + " \u4E2A \u2260 \u89C4\u683C " + op.silhouette.length + " \u4E2A");
    }
    var oRegCount = Object.keys(oRegions).length;
    checks.outerRegionCover = oRegCount === op.regionCount;
    if (!checks.outerRegionCover) {
      bad("OUTER_REGION_COVER", "\u5916\u5ED3\u8986\u76D6 " + oRegCount + "/" + op.regionCount + " \u4E2A\u8FDE\u901A\u533A\u57DF");
    }
    var oOverlap = 0;
    for (var olj = 0; olj < oLayerIds.length; olj++) {
      var olist = oByLayer[oLayerIds[olj]];
      for (var oa = 0; oa < olist.length; oa++) {
        for (var ob = oa + 1; ob < olist.length; ob++) {
          var oA = olist[oa].card, oB = olist[ob].card;
          var oix = Math.min(oA.x + TILE_W, oB.x + TILE_W) - Math.max(oA.x, oB.x);
          var oiy = Math.min(oA.y + TILE_H, oB.y + TILE_H) - Math.max(oA.y, oB.y);
          if (oix > 0 && oiy > 0) oOverlap++;
        }
      }
    }
    checks.outerSameLayer = oOverlap === 0;
    if (!checks.outerSameLayer) bad("OUTER_SAME_LAYER", oOverlap + " \u5BF9\u5916\u5ED3\u540C\u5C42\u724C\u91CD\u53E0");
    var oTopLayer = op.layers[op.layerCount - 1].layer;
    var oPlayable = 0, oNonTopPlayable = 0;
    for (var opa = 0; opa < outerCards.length; opa++) {
      var ocard = outerCards[opa];
      var oblk = false;
      for (var opb = 0; opb < (cards || []).length; opb++) {
        var oother = cards[opb];
        if (oother === ocard || oother.z <= ocard.z) continue;
        var oix2 = Math.min(ocard.x + TILE_W, oother.x + TILE_W) - Math.max(ocard.x, oother.x);
        var oiy2 = Math.min(ocard.y + TILE_H, oother.y + TILE_H) - Math.max(ocard.y, oother.y);
        if (oix2 > 0 && oiy2 > 0 && oix2 * oiy2 > oThresh) {
          oblk = true;
          break;
        }
      }
      if (!oblk) {
        oPlayable++;
        if (ocard.layer !== oTopLayer) oNonTopPlayable++;
      }
    }
    checks.outerPlayable = oPlayable === op.layers[op.layerCount - 1].cells.length && oNonTopPlayable === 0;
    if (!checks.outerPlayable) {
      bad("OUTER_PLAYABLE", "\u5916\u5ED3\u53EF\u70B9 " + oPlayable + " \u5F20\uFF08\u89C4\u683C\u9876\u5C42 " + op.layers[op.layerCount - 1].cells.length + " \u5F20\uFF09\uFF0C\u975E\u9876\u5C42\u53EF\u70B9 " + oNonTopPlayable + " \u5F20");
    }
  }
  return {
    ok: violations.length === 0,
    templateId: spec.templateId,
    profileId: profile.id,
    checks,
    violations,
    algorithm: SPEC_ALGORITHM,
    outerTiles: outerCards.length,
    outerLayerCount: op ? op.layerCount : 0,
    outerSignature: op ? op.signature : ""
  };
}
function specSummary(spec) {
  return {
    templateId: spec.templateId,
    algorithm: spec.algorithm,
    maskCellCount: spec.maskCellCount,
    maskRegionCount: spec.maskRegionCount,
    formSize: spec.formSize,
    seeds: spec.seeds.length,
    walk: spec.walk.map(function(c) {
      return c.k;
    }),
    walkLength: spec.walk.length,
    silhouetteCovered: spec.silhouette.length,
    outerCellCount: spec.outerCellCount,
    outerLayerCount: spec.outer.layerCount,
    outerTileCount: spec.outer.total,
    outerSilhouetteCovered: spec.outerSilhouette.length,
    outerSignature: spec.outer.signature,
    signature: spec.signature
  };
}

// core/shared/l2_geometry.js
var X_MIN2 = GRID_X0;
var Y_MIN2 = GRID_Y0;
var GRID_COLS = MASK_COLS;
var GRID_ROWS = MASK_ROWS;
function segmentOf(li, n) {
  var n1 = Math.max(1, Math.round(n * 0.25));
  var n2 = Math.max(1, Math.round(n * 0.36));
  if (li < n1) return "top";
  if (li < n1 + n2) return "mid";
  return "core";
}
function posOf(cell, ph) {
  return {
    x: X_MIN2 + cell.c * TILE_W + ph[0] * LATTICE_X,
    y: Y_MIN2 + cell.r * TILE_H + ph[1] * LATTICE_Y
  };
}
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
      seg,
      gridW: spec.maskBox.cols,
      gridH: spec.maskBox.rows,
      gaps: 1 - spec.maskCellCount / (GRID_COLS * GRID_ROWS),
      pinned: ""
    });
  }
  return out;
}
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
function buildOuter(spec, profile) {
  var op = outerPlanFor(spec, profile);
  var out = [];
  for (var k = 0; k < op.layers.length; k++) {
    var L = op.layers[k];
    for (var i = 0; i < L.cells.length; i++) {
      var c = L.cells[i];
      var p = posOf(c, c.phase);
      out.push({
        x: p.x,
        y: p.y,
        layer: L.layer,
        region: c.region,
        zoneLayer: k,
        seg: OUTER_SEG,
        outerLayer: k,
        outerIndex: i,
        gridW: spec.maskBox.cols,
        gridH: spec.maskBox.rows,
        gaps: 0,
        pinned: ""
      });
    }
  }
  if (out.length !== op.total) {
    throw new Error("\u6A21\u677F " + spec.templateId + " \u5916\u5ED3\u843D\u724C " + out.length + " \u2260 " + op.total);
  }
  return { cards: out, plan: op };
}
function countFloating(mainCards) {
  var byLayer = {};
  for (var i = 0; i < mainCards.length; i++) {
    var c = mainCards[i];
    if (!byLayer[c.layer]) byLayer[c.layer] = [];
    byLayer[c.layer].push(c);
  }
  var ids = Object.keys(byLayer).map(Number).sort(function(a, b2) {
    return a - b2;
  });
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
var TEMPLATE_CANDIDATE_ROUNDS = 64;
function generateTemplateLayout(seed, profile, templateId) {
  var tpl2 = templateById(templateId);
  if (!tpl2) throw new Error("\u672A\u77E5\u7B2C\u4E8C\u5173\u6A21\u677F: " + templateId);
  if (!profile || !profile.queueCount) throw new Error("\u6A21\u677F\u53EA\u9002\u7528\u4E8E\u7B2C\u4E8C\u5173\u6863\u4F4D");
  var spec = specFor(templateId);
  var base = (seed >>> 0 ^ 1815277991) >>> 0;
  var rot = makeRng(base).int(0, 3);
  var best = null;
  var bestScore = Infinity;
  var bestVisible = 0;
  for (var r = 0; r < PHASES.length; r++) {
    if (best && bestScore === 0) break;
    var fillRot = (rot + r) % PHASES.length;
    for (var a = 0; a < PHASES.length; a++) {
      for (var b = 0; b < PHASES.length; b++) {
        var pa = PHASES[(rot + a) % PHASES.length];
        var pb = PHASES[(rot + b) % PHASES.length];
        var cand = buildCandidate(
          spec,
          profile,
          templateId,
          fillRot,
          pa,
          pb,
          base,
          a * PHASES.length + b
        );
        if (cand.accept) return cand.cards;
        if (cand.score < bestScore) {
          bestScore = cand.score;
          best = cand.cards;
          bestVisible = cand.visible;
        }
      }
    }
  }
  if (!best) throw new Error("\u6A21\u677F " + templateId + " \u6CA1\u6709\u4EFB\u4F55\u53EF\u7528\u5019\u9009\uFF08\u76F8\u4F4D\u5019\u9009\u5168\u90E8\u5931\u8D25\uFF09");
  var err = new Error("\u6A21\u677F " + templateId + " \u751F\u6210\u5931\u8D25\uFF1A" + TEMPLATE_CANDIDATE_ROUNDS + " \u7EC4\u906E\u6321\u5019\u9009\u90FD\u65E0\u6CD5\u540C\u65F6\u6EE1\u8DB3\u300C\u4FDD\u771F + \u96F6\u60AC\u7A7A + \u5F00\u5C40\u53EF\u70B9 " + VISIBLE_MIN + "\u2013" + VISIBLE_MAX + "\u300D\uFF08\u6700\u597D\u7684\u4E00\u7EC4\uFF1A\u53EF\u70B9 " + bestVisible + "\u3001\u60AC\u7A7A " + best.floatingCount + "\uFF09");
  err.cards = best;
  err.visible = bestVisible;
  err.floating = best.floatingCount;
  err.templateId = templateId;
  err.profileId = profile.id;
  throw err;
}
function verifyTemplateFidelity(cards, templateId, profile, fillRot) {
  if (!templateId) {
    return { ok: false, templateId: "", violations: [{ code: "NO_TEMPLATE", detail: "\u672C\u5C40\u6CA1\u6709 templateId" }], checks: {} };
  }
  var spec;
  try {
    spec = specFor(templateId);
  } catch (e) {
    return {
      ok: false,
      templateId,
      violations: [{ code: "BAD_TEMPLATE", detail: String(e && e.message) }],
      checks: {}
    };
  }
  if (!profile || !profile.mainCount) {
    return {
      ok: false,
      templateId,
      violations: [{ code: "BAD_PROFILE", detail: "\u7F3A\u5C11\u6863\u4F4D\u4FE1\u606F" }],
      checks: {}
    };
  }
  var plan;
  try {
    plan = specPlan(spec, profile, { fillRot: fillRot === void 0 ? 0 : fillRot | 0 });
  } catch (e) {
    return {
      ok: false,
      templateId,
      violations: [{ code: "PLAN_FAILED", detail: String(e && e.message) }],
      checks: {}
    };
  }
  return checkFidelity(cards, spec, plan, profile);
}
function buildCandidate(spec, profile, templateId, fillRot, pa, pb, base, salt) {
  void base;
  void salt;
  var tailPhase = function(block) {
    return block === 0 ? pa : pb;
  };
  var plan = specPlan(spec, profile, { fillRot, tailPhase });
  var main = buildMain(profile, spec, plan);
  var built = buildOuter(spec, profile);
  var op = built.plan;
  var cards = main.concat(built.cards);
  cards.layerCount = plan.layerCount + op.layerCount;
  cards.floatingCount = countFloating(main);
  for (var ci = 0; ci < cards.length; ci++) {
    var c3 = cards[ci];
    if (c3.x % LATTICE_X !== 0 || c3.y % LATTICE_Y !== 0) {
      throw new Error("\u6A21\u677F\u5750\u6807 (" + c3.x + "," + c3.y + ") \u4E0D\u5728\u534A\u683C\u6676\u683C\u4E0A");
    }
    if (c3.x < BOARD_BAND.left || c3.y < BOARD_BAND.top || c3.x + TILE_W > BOARD_BAND.right || c3.y + TILE_H > BOARD_BAND.bottom) {
      throw new Error("\u6A21\u677F\u5750\u6807 (" + c3.x + "," + c3.y + ") \u8D8A\u51FA\u724C\u684C");
    }
  }
  var expect = profile.mainCount + profile.queueCount;
  if (cards.length !== expect) throw new Error("\u6A21\u677F\u603B\u5F20\u6570 " + cards.length + " \u2260 \u6863\u4F4D " + expect);
  cards.sort(function(a, b) {
    return a.layer - b.layer || a.y - b.y || a.x - b.x;
  });
  for (var z = 0; z < cards.length; z++) {
    cards[z].id = z;
    cards[z].z = z;
  }
  var v = countVisible(cards);
  var vdev = v < VISIBLE_MIN ? VISIBLE_MIN - v : v > VISIBLE_MAX ? v - VISIBLE_MAX : 0;
  var fidelity = null;
  var ok = false;
  if (vdev === 0 && cards.floatingCount === 0) {
    fidelity = checkFidelity(cards, spec, plan, profile);
    ok = fidelity.ok;
  }
  if (ok) {
    cards.templateId = templateId;
    cards.specSignature = spec.signature;
    cards.specFillRot = plan.fillRot;
    cards.fidelity = fidelity;
    cards.visible = v;
    cards.outerSignature = op.signature;
    cards.outerLayerCount = op.layerCount;
    return { accept: true, cards, plan, visible: v, score: 0 };
  }
  var score = cards.floatingCount * 1e3 + vdev * 100 + Math.abs(v - 22) * 0.01;
  return { accept: false, cards, plan, visible: v, score };
}
function templateCandidateStats(seed, profile, templateId) {
  var tpl2 = templateById(templateId);
  if (!tpl2) throw new Error("\u672A\u77E5\u7B2C\u4E8C\u5173\u6A21\u677F: " + templateId);
  var spec = specFor(templateId);
  var base = (seed >>> 0 ^ 1815277991) >>> 0;
  var out = [];
  for (var r = 0; r < 2; r++) {
    for (var a = 0; a < PHASES.length; a++) {
      for (var b = 0; b < PHASES.length; b++) {
        var cand = buildCandidate(
          spec,
          profile,
          templateId,
          r,
          PHASES[a],
          PHASES[b],
          base,
          a * PHASES.length + b
        );
        out.push({
          fillRot: r,
          visible: cand.visible,
          floating: cand.cards.floatingCount,
          fidelity: cand.accept || cand.cards.fidelity && cand.cards.fidelity.ok || false,
          accept: cand.accept,
          tailPhases: [PHASES[a].slice(), PHASES[b].slice()]
        });
      }
    }
  }
  return out;
}
function describeTemplateLayout(cards, tpl2, visible) {
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  var mMinX = Infinity, mMaxX = -Infinity, mMinY = Infinity, mMaxY = -Infinity;
  var oMinX = Infinity, oMaxX = -Infinity, oMinY = Infinity, oMaxY = -Infinity;
  var layers = {};
  var regions = {};
  var outerTiles = 0;
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    if (c.x < minX) minX = c.x;
    if (c.x + TILE_W > maxX) maxX = c.x + TILE_W;
    if (c.y < minY) minY = c.y;
    if (c.y + TILE_H > maxY) maxY = c.y + TILE_H;
    if (c.seg !== OUTER_SEG) {
      if (c.x < mMinX) mMinX = c.x;
      if (c.x + TILE_W > mMaxX) mMaxX = c.x + TILE_W;
      if (c.y < mMinY) mMinY = c.y;
      if (c.y + TILE_H > mMaxY) mMaxY = c.y + TILE_H;
      regions[c.region] = (regions[c.region] || 0) + 1;
    } else {
      outerTiles++;
      if (c.x < oMinX) oMinX = c.x;
      if (c.x + TILE_W > oMaxX) oMaxX = c.x + TILE_W;
      if (c.y < oMinY) oMinY = c.y;
      if (c.y + TILE_H > oMaxY) oMaxY = c.y + TILE_H;
    }
    layers[c.layer] = (layers[c.layer] || 0) + 1;
  }
  return {
    templateId: tpl2.templateId,
    cards: cards.length,
    layers: Object.keys(layers).length,
    regions: Object.keys(regions).length,
    box: { w: maxX - minX, h: maxY - minY, minX, minY },
    mainBox: { w: mMaxX - mMinX, h: mMaxY - mMinY, minX: mMinX, minY: mMinY },
    outerBox: { w: oMaxX - oMinX, h: oMaxY - oMinY, minX: oMinX, minY: oMinY },
    outerTiles,
    /* 开局可点张数：优先用调用方传入的实测值，其次取生成时挂在 cards.visible 上的数 */
    visible: typeof visible === "number" ? visible : typeof cards.visible === "number" ? cards.visible : null,
    layerSizes: layers,
    regionSizes: regions
  };
}

// core/shared/robots.js
var now = () => typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
function replayTypes(types) {
  const count = {};
  let slot = 0;
  let peak = 0;
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    const n = (count[t] || 0) + 1;
    slot += 1;
    if (n >= 3) {
      count[t] = n - 3;
      slot -= 3;
    } else count[t] = n;
    if (slot >= SLOT_CAPACITY) return { ok: false, peak };
    if (slot > peak) peak = slot;
  }
  for (const k in count) {
    if (Object.prototype.hasOwnProperty.call(count, k) && count[k] !== 0) return { ok: false, peak };
  }
  return { ok: slot === 0, peak };
}
function makeState(levelData) {
  const cards = levelData.cards.map((c) => __spreadProps(__spreadValues({}, c), { state: "board" }));
  const graph = levelData._graph || buildBlockerGraph(cards);
  const byId = {};
  const indeg = {};
  const free = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    byId[c.id] = c;
    indeg[c.id] = graph.blockers[c.id].length;
    if (indeg[c.id] === 0) free.push(c);
  }
  return { cards, graph, byId, indeg, free, slot: [], alive: cards.length, steps: 0 };
}
function slotCounts(slot) {
  const cnt = {};
  for (let i = 0; i < slot.length; i++) cnt[slot[i].type] = (cnt[slot[i].type] || 0) + 1;
  return cnt;
}
function greedyScore(c, slot, graph, indeg, rng) {
  const cnt = slotCounts(slot);
  const n = cnt[c.type] || 0;
  let unlock = 0;
  const dep = graph.dependents[c.id];
  for (let k = 0; k < dep.length; k++) if (indeg[dep[k]] === 1) unlock++;
  let score;
  if (n === 2) score = 1e3 + unlock * 8;
  else if (n === 1) score = 300 + unlock * 6;
  else score = unlock * 12;
  return score + rng.next() * 4;
}
function bestGreedy(state, pool, rng) {
  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < pool.length; i++) {
    const s = greedyScore(pool[i], state.slot, state.graph, state.indeg, rng);
    if (s > bestScore) {
      bestScore = s;
      best = pool[i];
    }
  }
  return best || pool[0];
}
function snapshot(state) {
  const indeg = {};
  for (const k in state.indeg) if (Object.prototype.hasOwnProperty.call(state.indeg, k)) indeg[k] = state.indeg[k];
  const free = state.free.slice();
  const slot = state.slot.slice();
  return { indeg, free, slot, alive: state.alive, graph: state.graph, byId: state.byId };
}
function stepSnapshot(s, card) {
  const fi = s.free.indexOf(card);
  if (fi >= 0) s.free.splice(fi, 1);
  const dep = s.graph.dependents[card.id];
  for (let k = 0; k < dep.length; k++) {
    s.indeg[dep[k]] -= 1;
    if (s.indeg[dep[k]] === 0) s.free.push(s.byId[dep[k]]);
  }
  s.alive -= 1;
  s.slot.push(card);
  const cnt = slotCounts(s.slot);
  let hit = null;
  for (const t in cnt) {
    if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) {
      hit = t;
      break;
    }
  }
  if (hit !== null) {
    let need = 3;
    for (let i = 0; i < s.slot.length && need > 0; i++) {
      if (s.slot[i].type === hit) {
        s.slot.splice(i, 1);
        i--;
        need--;
      }
    }
  }
  return s.slot.length < SLOT_CAPACITY && (s.alive > 0 || s.slot.length === 0);
}
function rankedPool(state, rng, width) {
  const scored = state.free.map((c) => ({ c, s: greedyScore(c, state.slot, state.graph, state.indeg, rng) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, Math.min(width, scored.length)).map((x) => x.c);
}
function lookaheadPick(state, rng, width) {
  const pool = rankedPool(state, rng, width);
  let best = pool[0];
  let bestVal = -Infinity;
  for (let i = 0; i < pool.length; i++) {
    const s = snapshot(state);
    stepSnapshot(s, pool[i]);
    const cnt = slotCounts(s.slot);
    let potential = 0;
    for (let k = 0; k < s.free.length; k++) {
      const n = cnt[s.free[k].type] || 0;
      if (n === 2) potential += 6;
      else if (n === 1) potential += 2;
    }
    const immediate = greedyScore(pool[i], state.slot, state.graph, state.indeg, rng);
    const score = immediate + potential * 2 - s.slot.length * 2 + rng.next() * 2;
    if (score > bestVal) {
      bestVal = score;
      best = pool[i];
    }
  }
  return best;
}
function montecarloPick(state, rng, cfg) {
  const pool = rankedPool(state, rng, 3);
  let best = pool[0];
  let bestVal = -Infinity;
  for (let i = 0; i < pool.length; i++) {
    const s = snapshot(state);
    stepSnapshot(s, pool[i]);
    let sum = 0;
    for (let k = 0; k < cfg.mcPlayouts; k++) {
      const s2 = __spreadProps(__spreadValues({}, s), { indeg: {}, free: s.free.slice(), slot: s.slot.slice() });
      for (const key in s.indeg) if (Object.prototype.hasOwnProperty.call(s.indeg, key)) s2.indeg[key] = s.indeg[key];
      s2.cards = state.cards;
      s2.graph = state.graph;
      s2.byId = state.byId;
      sum += randomPlayoutFrom(s2, rng, 40);
    }
    const val = sum / cfg.mcPlayouts;
    if (val > bestVal) {
      bestVal = val;
      best = pool[i];
    }
  }
  return best;
}
function randomPlayoutFrom(s, rng, maxSteps) {
  let steps = 0;
  while (s.free.length && s.slot.length < SLOT_CAPACITY && steps < maxSteps) {
    const c = s.free[rng.int(0, s.free.length - 1)];
    if (!stepSnapshot(s, c)) break;
    steps++;
  }
  const total = s.cards ? s.cards.length : 1;
  return 1 - (s.alive + s.slot.length) / total;
}
function searchPick(state, rng, cfg) {
  const pool = rankedPool(state, rng, 4);
  let best = pool[0];
  let bestVal = -Infinity;
  let budget = 220;
  for (let i = 0; i < pool.length; i++) {
    const s = snapshot(state);
    s.cards = state.cards;
    s.graph = state.graph;
    s.byId = state.byId;
    if (!stepSnapshot(s, pool[i])) continue;
    const val = dfsValue(s, Math.max(1, cfg.searchDepth - 1), rng, budget);
    budget = val.budget;
    if (val.score > bestVal) {
      bestVal = val.score;
      best = pool[i];
    }
    if (budget <= 0) break;
  }
  return best;
}
function dfsValue(s, depth, rng, budget) {
  if (budget <= 0) return { score: 1 - (s.alive + s.slot.length) / (s.cards ? s.cards.length : 1), budget: 0 };
  if (depth <= 0 || !s.free.length || s.slot.length >= SLOT_CAPACITY) {
    return { score: 1 - (s.alive + s.slot.length) / (s.cards ? s.cards.length : 1), budget };
  }
  budget--;
  const width = Math.min(2, s.free.length);
  let best = -Infinity;
  for (let i = 0; i < width; i++) {
    const c = s.free[i];
    const s2 = __spreadProps(__spreadValues({}, s), { indeg: {}, free: s.free.slice(), slot: s.slot.slice() });
    for (const key in s.indeg) if (Object.prototype.hasOwnProperty.call(s.indeg, key)) s2.indeg[key] = s.indeg[key];
    s2.cards = s.cards;
    s2.graph = s.graph;
    s2.byId = s.byId;
    if (!stepSnapshot(s2, c)) continue;
    const r = dfsValue(s2, depth - 1, rng, budget);
    budget = r.budget;
    if (r.score > best) best = r.score;
    if (budget <= 0) break;
  }
  if (best === -Infinity) best = 1 - (s.alive + s.slot.length) / (s.cards ? s.cards.length : 1);
  return { score: best, budget };
}
function simulateRobot(levelData, rng, opt = {}) {
  const o = opt || {};
  const cfg = clampDifficulty(o.difficulty);
  const mode = o.mode || "greedy";
  const noise = o.noise === void 0 ? cfg.noise : o.noise;
  const state = makeState(levelData);
  const total = state.cards.length;
  const maxSteps = o.maxSteps || 2e4;
  const track = !!o.track;
  const wantPath = !!o.path;
  const path = [];
  const slotHist = [0, 0, 0, 0, 0, 0, 0, 0];
  let hangPeak = 0;
  let slotSum = 0;
  let decisionTotal = 0;
  let decisionCount = 0;
  const everyMC = 12;
  const everySearch = 10;
  while (state.steps < maxSteps) {
    if (state.alive === 0 && state.slot.length === 0) {
      return finish(true, false);
    }
    if (state.slot.length >= SLOT_CAPACITY) return finish(false, true);
    if (!state.free.length) return finish(false, true);
    const t0 = now();
    let pick;
    if (mode === "random" || mode === "noisy" && rng.next() < noise) {
      pick = state.free[rng.int(0, state.free.length - 1)];
    } else if (mode === "montecarlo" && state.steps % everyMC === 0) {
      pick = montecarloPick(state, rng, cfg);
    } else if (mode === "search" && state.steps % everySearch === 0) {
      pick = searchPick(state, rng, cfg);
    } else if (mode === "lookahead") {
      pick = lookaheadPick(state, rng, cfg.lookaheadWidth);
    } else {
      pick = bestGreedy(state, state.free, rng);
    }
    decisionTotal += now() - t0;
    decisionCount++;
    const fi = state.free.indexOf(pick);
    if (fi >= 0) state.free.splice(fi, 1);
    const dep = state.graph.dependents[pick.id];
    for (let k = 0; k < dep.length; k++) {
      state.indeg[dep[k]] -= 1;
      if (state.indeg[dep[k]] === 0) state.free.push(state.byId[dep[k]]);
    }
    state.alive -= 1;
    state.slot.push(pick);
    state.steps++;
    if (wantPath) path.push(pick.id);
    slotSum += state.slot.length;
    if (track) {
      slotHist[Math.min(7, state.slot.length)]++;
      const kinds = {};
      for (let i = 0; i < state.slot.length; i++) kinds[state.slot[i].type] = 1;
      let hang = 0;
      for (const k in kinds) if (Object.prototype.hasOwnProperty.call(kinds, k)) hang++;
      if (hang > hangPeak) hangPeak = hang;
    }
    const cnt = slotCounts(state.slot);
    let hit = null;
    for (const t in cnt) {
      if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) {
        hit = t;
        break;
      }
    }
    if (hit !== null) {
      let need = 3;
      for (let i = 0; i < state.slot.length && need > 0; i++) {
        if (state.slot[i].type === hit) {
          state.slot.splice(i, 1);
          i--;
          need--;
        }
      }
    }
  }
  return finish(false, false);
  function finish(win, deadlock) {
    const pct = 1 - (state.alive + state.slot.length) / total;
    const res = {
      win,
      deadlock,
      steps: state.steps,
      cleared: total - state.alive - state.slot.length,
      total,
      pct,
      slotAvg: state.steps ? slotSum / state.steps : 0,
      slotLeft: state.slot.length,
      decisionMs: decisionCount ? decisionTotal / decisionCount : 0,
      propsUsed: 0
    };
    if (track) {
      res.slotHist = slotHist;
      res.hangPeak = hangPeak;
    }
    if (wantPath) {
      res.path = win ? path.slice() : null;
    }
    return res;
  }
}

// core/shared/generator.js
var THRESH_AREA3 = OVERLAP_THRESHOLD * TILE_AREA;
var SOLVE_BUDGET = 3e4;
var RESHUFFLE_MAX = 6;
var L1_GATE = 32;
function typePool(level, profile) {
  const mix = mixFor(level, profile);
  const out = [];
  for (let i = 0; i < mix.length; i++) {
    for (let k = 0; k < mix[i] * 3; k++) out.push(TYPE_IDS[i]);
  }
  return out;
}
function fisherYates(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}
function buildTypeSequence(n, order, rng, ctx) {
  const level = ctx.level;
  const pool = typePool(level, ctx.profile);
  if (pool.length !== n) {
    throw new Error("\u82B1\u8272\u6C60 " + pool.length + " \u5F20 \u2260 \u724C\u6570 " + n + " \u5F20");
  }
  const needKinds = level <= 1 ? 4 : 10;
  let best = null;
  let bestKinds = -1;
  for (let attempt = 0; attempt < 8; attempt++) {
    const seq = fisherYates(pool.slice(), rng);
    for (let i = 0; i < n; i++) ctx.byId[order[i]].type = seq[i];
    const seen = {};
    let kinds = 0;
    for (let i = 0; i < n; i++) {
      const c = ctx.cards[i];
      if (c.blocked) continue;
      if (!seen[c.type]) {
        seen[c.type] = 1;
        kinds++;
      }
    }
    if (kinds > bestKinds) {
      bestKinds = kinds;
      best = seq;
    }
    if (kinds >= needKinds) {
      return { seq, openingKinds: kinds, attempts: attempt + 1 };
    }
  }
  return { seq: best, openingKinds: bestKinds, attempts: 8 };
}
function baseCard(src) {
  return {
    id: src.id,
    x: src.x,
    y: src.y,
    w: TILE_W,
    h: TILE_H,
    layer: src.layer,
    region: src.region,
    zoneLayer: src.zoneLayer,
    /* 完整布局段标记：主体层（top/mid/core）或模板独有的外廓段（outer）。
     * 旧的「盲盒队列 chain/chainIndex/chainLen」四链字段已随固定队列一并删除。
     * 渲染层靠 seg/blocked 决定显示牌背还是牌面。 */
    seg: src.seg,
    outerLayer: src.outerLayer,
    outerIndex: src.outerIndex,
    z: src.z,
    type: TYPE_IDS[0],
    state: "board",
    blocked: false,
    vx: null,
    vy: null,
    vScale: 1,
    appearAt: 0
  };
}
function assignZ(cards) {
  const sorted = cards.slice().sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  for (let i = 0; i < sorted.length; i++) sorted[i].z = i;
}
function layerMeta(cards, layers) {
  const out = [];
  for (let li = 0; li < layers; li++) {
    const list = cards.filter((c) => c.layer === li);
    let ox = 360;
    let oy = 500;
    if (list.length) {
      ox = list[0].x;
      oy = list[0].y;
      for (let i = 1; i < list.length; i++) {
        if (list[i].x < ox) ox = list[i].x;
        if (list[i].y < oy) oy = list[i].y;
      }
    }
    out.push({ li, ox, oy, n: list.length });
  }
  return out;
}
function generateLevel(level, seed, opt = {}) {
  const lv = level <= 1 ? 1 : 2;
  let profile = null;
  const rawProfile = opt.profile !== void 0 ? opt.profile : opt.profileId;
  if (rawProfile !== void 0 && rawProfile !== null) {
    profile = typeof rawProfile === "number" ? profileFor(lv, rawProfile) : rawProfile;
  }
  if (!profile) profile = profileFor(lv, profilesFor(lv)[0].id);
  const s = (seed === void 0 ? lv === 1 ? randomSeed() : pickPoolSeed(lv, profile.id) : seed) >>> 0;
  const rng = makeRng(s);
  const p = levelParams(lv, () => rng.next(), profile.id);
  const needSolvable = lv <= 1;
  const LAYOUT_ROUNDS = needSolvable ? 24 : 1;
  const DEAL_TRIES = needSolvable ? 40 : 1;
  let built = null;
  let funnel = null;
  let solution = null;
  let roundsUsed = 0;
  let dealTries = 0;
  for (let round = 0; round < LAYOUT_ROUNDS && !built; round++) {
    roundsUsed = round + 1;
    const layoutSeed = round === 0 ? s : (s ^ Math.imul(round, 2654435769)) >>> 0;
    if (lv === 2 && !opt.templateId) {
      throw new Error("\u7B2C\u4E8C\u5173\u751F\u6210\u5931\u8D25\uFF1A\u5FC5\u987B\u663E\u5F0F\u6307\u5B9A 20 \u5957\u6A21\u677F\u4E4B\u4E00\uFF08templateId\uFF09\uFF0C\u65E7\u5E03\u5C40\u751F\u6210\u8DEF\u5F84\u5DF2\u5E9F\u5F03");
    }
    const src2 = lv === 2 ? generateTemplateLayout(layoutSeed, profile, opt.templateId) : generateProfileLayout(layoutSeed, profile);
    const cards2 = src2.map(baseCard);
    assignZ(cards2);
    const byId2 = {};
    for (let i = 0; i < cards2.length; i++) byId2[cards2[i].id] = cards2[i];
    const graph2 = buildBlockerGraph(cards2);
    for (let i = 0; i < cards2.length; i++) {
      cards2[i].blocked = graph2.blockers[cards2[i].id].length > 0;
    }
    const order2 = peelOrder(cards2, () => rng.next());
    for (let attempt = 0; attempt < DEAL_TRIES && !built; attempt++) {
      dealTries++;
      funnel = buildTypeSequence(cards2.length, order2, rng, {
        level: lv,
        profile,
        byId: byId2,
        cards: cards2
      });
      if (!needSolvable) {
        built = { src: src2, cards: cards2, byId: byId2, graph: graph2, order: order2 };
        break;
      }
      let path = null;
      let all = true;
      for (let k = 0; k < L1_GATE; k++) {
        const probe = simulateRobot(
          { cards: cards2, _graph: graph2 },
          makeRng((s ^ Math.imul(attempt + 1, 2246822507) ^ Math.imul(round + 1, 668265263) ^ Math.imul(k + 1, 2654435769)) >>> 0),
          { mode: "greedy", path: true }
        );
        if (!probe.win) {
          all = false;
          break;
        }
        if (k === 0) path = probe.path;
      }
      if (!all || !path) continue;
      solution = path;
      built = { src: src2, cards: cards2, byId: byId2, graph: graph2, order: order2 };
    }
  }
  if (!built) {
    const err = new Error("UNSOLVABLE: seed " + s + " \u8FDE\u7EED " + LAYOUT_ROUNDS + " \u79CD\u51E0\u4F55 \xD7 " + DEAL_TRIES + " \u6B21\u6D17\u724C\u90FD\u641C\u4E0D\u5230 greedy \u901A\u5173\u7684\u724C\u5C40");
    err.code = "UNSOLVABLE";
    err.seed = s;
    throw err;
  }
  const src = built.src;
  const cards = built.cards;
  const byId = built.byId;
  const graph = built.graph;
  const order = built.order;
  const typeSeq = funnel.seq;
  const solTypes = solution ? new Array(solution.length) : [];
  if (solution) {
    for (let i = 0; i < solution.length; i++) solTypes[i] = byId[solution[i]].type;
  }
  refreshBlocked(cards);
  const visible = cards.reduce((n2, c) => n2 + (c.state === "board" && !c.blocked ? 1 : 0), 0);
  const typeCounts = {};
  for (let i = 0; i < cards.length; i++) {
    typeCounts[cards[i].type] = (typeCounts[cards[i].type] || 0) + 1;
  }
  const layerCount = src.layerCount || p.layers;
  return {
    cards,
    layers: layerMeta(cards, layerCount),
    layerCount,
    profile,
    profileId: profile.id,
    // 第二关模板 ID（旧路径已删除，第二关必为 20 套之一；第一关恒为 null）
    templateId: lv === 2 ? opt.templateId : null,
    // 模板路径的悬空牌修补统计（0 = 主堆全部有支撑；默认路径恒为 0）
    floatingCount: src.floatingCount || 0,
    // 模板规格保真校验结果（生成后这一道；安装后 / 渲染前另有两道）
    fidelity: src.fidelity || null,
    specSignature: src.specSignature || "",
    specFillRot: src.specFillRot === void 0 ? 0 : src.specFillRot,
    solution: solution ? solution.slice() : null,
    requireSolution: needSolvable,
    solvable: !!solution,
    order,
    waves: order.waves,
    bands: null,
    funnelParams: {
      openingKinds: funnel.openingKinds,
      shuffleAttempts: funnel.attempts,
      layoutRounds: roundsUsed,
      dealTries
    },
    typeSeq: typeSeq.slice(),
    typeCounts,
    certificate: solution ? replayTypes(solTypes) : { ok: false, peak: 0 },
    degraded: false,
    topKinds: funnel.openingKinds,
    params: p,
    seed: s,
    mode: p.mode,
    visible,
    scramble: null,
    _graph: graph,
    regions: regionStats(cards),
    crossOcclusion: crossOcclusionStats(cards)
  };
}
function validateLevel(data) {
  const issues = [];
  const cards = data.cards;
  const reg = validateRegistry();
  if (!reg.ok) issues.push("\u724C\u578B\u6CE8\u518C\u8868\u975E\u6CD5\uFF1A" + reg.issues.join("\uFF1B"));
  const seen = {};
  for (let i = 0; i < cards.length; i++) seen[cards[i].type] = 1;
  const kinds = [];
  for (const k in seen) if (Object.prototype.hasOwnProperty.call(seen, k)) kinds.push(k);
  const expectKinds = data.params && data.params.types ? data.params.types : TYPE_COUNT;
  if (kinds.length !== expectKinds) issues.push(`\u724C\u578B\u6570 ${kinds.length} \u2260 \u6863\u4F4D ${expectKinds}`);
  const mix = data.profile ? mixFor(data.params.level, data.profile) : null;
  for (let i = 0; i < TYPE_IDS.length; i++) {
    const n = cards.reduce((a, c) => a + (c.type === TYPE_IDS[i] ? 1 : 0), 0);
    const want = mix ? mix[i] * 3 : null;
    if (n % 3 !== 0) issues.push(`${TYPE_IDS[i]} \u5F20\u6570 ${n} \u4E0D\u662F 3 \u7684\u500D\u6570`);
    if (want === null) {
      if (n === 0) issues.push(`${TYPE_IDS[i]} \u5F20\u6570\u4E3A 0`);
    } else if (n !== want) {
      issues.push(`${TYPE_IDS[i]} \u5F20\u6570 ${n} \u2260 \u6863\u4F4D\u914D\u989D ${want}`);
    }
  }
  const expectTotal = data.params && data.params.cardCount ? data.params.cardCount : LEVEL_SPEC[data.params.level].cardCount;
  if (cards.length !== expectTotal) {
    issues.push(`\u724C\u6570 ${cards.length} \u2260 \u6863\u4F4D ${expectTotal}`);
  }
  const inOrder = {};
  for (let i = 0; i < data.order.length; i++) inOrder[data.order[i]] = 1;
  let unreachable = 0;
  for (let i = 0; i < cards.length; i++) if (!inOrder[cards[i].id]) unreachable++;
  if (unreachable) issues.push(`${unreachable} \u5F20\u724C\u4E0D\u5728\u5265\u79BB\u987A\u5E8F\u91CC`);
  if (sameLayerOverlapCount(cards) !== 0) issues.push("\u5B58\u5728\u540C\u5C42\u91CD\u53E0");
  const g = data._graph || buildBlockerGraph(cards);
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const blocked = g.blockers[c.id].length > 0;
    if (blocked !== !!c.blocked) {
      issues.push(`\u724C ${c.id} blocked \u6807\u8BB0\u4E0E\u51E0\u4F55\u4E0D\u4E00\u81F4`);
      break;
    }
  }
  const openingKinds = data.topKinds === void 0 ? null : data.topKinds;
  const needKinds = data.params.level <= 1 ? 4 : 10;
  if (openingKinds !== null && openingKinds < needKinds) {
    issues.push(`\u5F00\u5C40\u53EF\u70B9\u82B1\u8272 ${openingKinds} < ${needKinds}`);
  }
  if (data.requireSolution !== false) {
    if (!data.certificate.ok) issues.push("\u901A\u5173\u8DEF\u5F84\u8BC1\u4E66\u5931\u8D25");
    if (!verify(data)) issues.push("\u51E0\u4F55\u53EF\u89E3\u6027 verify \u5931\u8D25");
  }
  return {
    ok: issues.length === 0,
    issues,
    kinds: kinds.length,
    typeCounts: data.typeCounts,
    total: cards.length,
    visible: data.visible,
    openingKinds,
    solvable: !!data.solvable
  };
}
function refreshBlocked(cards, L) {
  void L;
  const alive = cards.filter((c) => c.state === "board");
  for (let i = 0; i < alive.length; i++) alive[i].blocked = isBlocked(alive[i], alive);
  return alive;
}
function isCovered(card, alive) {
  return isBlocked(card, alive);
}
function verify(levelData) {
  const cards = levelData.cards.map((c) => __spreadProps(__spreadValues({}, c), { state: "board", blocked: false }));
  const graph = levelData._graph || buildBlockerGraph(cards);
  const byId = {};
  const indeg = {};
  for (let i = 0; i < cards.length; i++) {
    byId[cards[i].id] = cards[i];
    indeg[cards[i].id] = graph.blockers[cards[i].id].length;
  }
  const order = levelData.solution || [];
  const slot = [];
  for (let k = 0; k < order.length; k++) {
    const c = byId[order[k]];
    if (!c || c.state !== "board" || indeg[c.id] !== 0) return false;
    c.state = "slot";
    const dep = graph.dependents[c.id];
    for (let i = 0; i < dep.length; i++) indeg[dep[i]] -= 1;
    slot.push(c);
    const cnt = {};
    for (let i = 0; i < slot.length; i++) cnt[slot[i].type] = (cnt[slot[i].type] || 0) + 1;
    let hit = null;
    for (const t in cnt) {
      if (Object.prototype.hasOwnProperty.call(cnt, t) && cnt[t] >= 3) {
        hit = t;
        break;
      }
    }
    if (hit !== null) {
      let need = 3;
      for (let i = 0; i < slot.length && need > 0; i++) {
        if (slot[i].type === hit) {
          slot[i].state = "cleared";
          slot.splice(i, 1);
          i--;
          need--;
        }
      }
    }
    if (slot.length >= SLOT_CAPACITY) return false;
  }
  return cards.every((c) => c.state === "cleared") && slot.length === 0;
}

// core/shared/engine.js
function nowMs() {
  if (typeof performance !== "undefined" && performance.now) return performance.now();
  return Date.now();
}
function slotInsert(slot, card) {
  let idx2 = slot.length;
  for (let i = slot.length - 1; i >= 0; i--) {
    if (slot[i].type === card.type) {
      idx2 = i + 1;
      break;
    }
  }
  slot.splice(idx2, 0, card);
  return idx2;
}
function slotMatchTypes(slot) {
  const count = {};
  const out = [];
  for (let i = 0; i < slot.length; i++) {
    const t = slot[i].type;
    if (count[t] === void 0) count[t] = 0;
    count[t]++;
    if (count[t] === 3) out.push(t);
  }
  return out;
}
function resolveSlot(slot) {
  const types = slotMatchTypes(slot);
  const removed = [];
  for (let k = 0; k < types.length; k++) {
    const t = types[k];
    let need = 3;
    for (let i = 0; i < slot.length && need > 0; i++) {
      if (slot[i].type === t) {
        removed.push(slot.splice(i, 1)[0]);
        i--;
        need--;
      }
    }
  }
  return removed;
}
function slotTargetX(i) {
  return SLOT_X0 + i * SLOT_PITCH + (SLOT_PITCH - SLOT_CARD_W) / 2;
}
var Game = class {
  constructor(audio) {
    this.audio = audio;
    this.screen = "title";
    this.cards = [];
    this.layersMeta = [];
    this.maxZ = 0;
    this.slot = [];
    this.temp = [];
    this.history = [];
    this.props = { shuffle: 0, undo: 0, remove: 0 };
    this.status = "play";
    this.level = 1;
    this.best = 1;
    this.graduated = false;
    this.profile = { l1: 0, l2: 0 };
    this.layout = layoutFor(1);
    this.soundOn = true;
    this.seed = 0;
    this.reviveLeft = 1;
    this.revived = false;
    this.fx = [];
    this.shake = 0;
    this.slotFlash = 0;
    this.levelStartAt = 0;
    this.time = 0;
    this.hoverId = -1;
    this.generatorMode = "-";
    this.paused = false;
    this._topPool = null;
    this.boardRev = 0;
    this.uninstallAsk = false;
    this.settingsAsk = false;
    this._pausedBeforeSettings = false;
    this.sfxVol = 1;
    this.musicOn = true;
    this.musicVol = 0.6;
    this.pendingMatch = null;
    this.resolving = false;
    this.clock = 0;
    this.solution = null;
    this.meta = null;
    this.saveState = null;
  }
  /* -------------------- 生命周期 -------------------- */
  /**
   * 第 2.5 节：每局都按当前关卡的档位生成，层数 / 牌种类 / 张数全部来自档位；
   * 不传 seed 时从第 2 关当前档位的 seed 池抽（第 1 关随机），保证重开必换 seed。
   *
   * 【第二关必须给 templateId】20 套掩膜模板是第二关唯一的几何来源，旧布局生成路径
   * 已删除。UI 的新开局全部走 createNewGame（内含最近 10 局去重与三段校验），
   * 本方法只服务测试 / 工具，因此要求调用方显式写明用哪一套模板。
   */
  startLevel(level, seed, templateId) {
    const lv = Math.min(LEVEL_COUNT, Math.max(1, level | 0));
    const pid = lv <= 1 ? this.profile.l1 : this.profile.l2;
    if (lv === 2 && !templateId) {
      throw new Error("\u7B2C\u4E8C\u5173 startLevel \u5FC5\u987B\u663E\u5F0F\u4F20\u5165 templateId\uFF0820 \u5957\u6A21\u677F\u4E4B\u4E00\uFF09\uFF1B\u6B63\u5F0F\u5F00\u5C40\u8BF7\u8D70 createNewGame()");
    }
    const opt = lv === 2 ? { profile: pid, templateId } : { profile: pid };
    const data = generateLevel(lv, seed === void 0 ? void 0 : seed, opt);
    this.installLevelData(data, null);
  }
  /**
   * 统一生成入口 createNewGame() 的落地点：把**已经生成并校验过**的牌局
   * 一次性装进 Game，不再二次生成，也不再重抽 seed / 档位。
   * meta 携带 gameId / 布局签名 / 最近三局检查等调试面板所需的真实运行数据。
   */
  installLevelData(data, meta, opt) {
    const lv = Math.min(LEVEL_COUNT, Math.max(1, data.params.level | 0));
    const pid = data.profileId;
    const skipCheck = !!(opt && opt.skipFidelityCheck);
    if (lv === 2 && !skipCheck) {
      const f = verifyTemplateFidelity(data.cards, data.templateId, data.profile, data.specFillRot);
      if (!f.ok) {
        const detail = (f.violations || []).map((v) => v.code + ":" + v.detail).join(" / ");
        throw new Error("\u7B2C\u4E8C\u5173\u5E03\u5C40\u5B89\u88C5\u5931\u8D25\uFF1A\u4E0E\u6A21\u677F " + (data.templateId || "<\u7F3A\u5931>") + " \u7684\u7F29\u7565\u56FE\u4E0D\u4E00\u81F4\uFF08" + detail + "\uFF09");
      }
      this.fidelity = f;
    }
    if (typeof console !== "undefined" && console.info) {
      console.info(`[mah] level=${lv} profileId=${pid} seed=${data.seed}` + (meta ? ` gameId=${meta.gameId} reason=${meta.generationReason} tiles=${meta.totalTiles} sig=${meta.layoutSignature.slice(0, 12)}` : ""));
    }
    this.cards = data.cards;
    this.templateId = data.templateId || null;
    this.layoutProfile = data.profile || null;
    this.specFillRot = data.specFillRot === void 0 ? 0 : data.specFillRot;
    this.layersMeta = data.layers || [];
    this.solution = data.solution;
    this.seed = data.seed;
    this.generatorMode = data.mode;
    this.level = lv;
    this.layout = data.params.layout;
    this.slot = [];
    this.temp = [];
    this.history = [];
    this.props = __spreadValues({}, data.params.props);
    this.reviveLeft = data.params.reviveMax;
    this.revived = false;
    this.graduated = false;
    this.status = "play";
    this.screen = "play";
    this.paused = false;
    this.pendingMatch = null;
    this.resolving = false;
    this.clock = 0;
    this.fx.length = 0;
    this.shake = 0;
    this.slotFlash = 0;
    this.hoverId = -1;
    this._topPool = null;
    this.maxZ = this.cards.reduce((m, c) => Math.max(m, c.z), 0);
    this.levelStartAt = nowMs();
    this.meta = meta || null;
    this.refresh(true);
  }
  /**
   * 第 3.2 节：毕业面板「再玩一次」/ 标题页「开始新一轮」。
   * rollProfile 两关（各自 ≠ 当前档位）→ level=1 → startLevel(1)。
   * graduated 由 startLevel 清零；persist(true) 由 main.js 在调用后执行。
   */
  startNewRun(rand = Math.random) {
    this.profile.l1 = rollProfile(1, rand, this.profile.l1);
    this.profile.l2 = rollProfile(2, rand, this.profile.l2);
    this.level = 1;
    this.startLevel(1);
  }
  /** 第 2.3 ②：重开本关只重抽当前关档位（结果 ≠ 当前档位），seed 由 startLevel 重抽 */
  rollCurrentProfile(rand = Math.random) {
    const lv = this.level;
    const key = lv <= 1 ? "l1" : "l2";
    this.profile[key] = rollProfile(lv, rand, this.profile[key]);
    return this.profile[key];
  }
  /**
   * 重开本关（暂停菜单 / 失败面板 / 普通胜利面板共用）。
   * RETRY_KEEPS_PROFILE=false：重抽档位 + 换 seed；true：保持档位、只换 seed。
   * main.js 调用后再 persist(true) 写 p1/p2。
   */
  restartLevel(rand = Math.random, templateId) {
    this.paused = false;
    if (!RETRY_KEEPS_PROFILE) this.rollCurrentProfile(rand);
    this.startLevel(this.level, void 0, templateId);
  }
  refresh(withIntro = false) {
    this.boardRev++;
    const alive = refreshBlocked(this.cards);
    if (withIntro) {
      const n = alive.length;
      const span = Math.min(240, n * 6);
      const t0 = nowMs();
      alive.forEach((c, i) => {
        c.appearAt = t0 + (n > 1 ? i / (n - 1) * span : 0);
      });
    }
    this.maxZ = this.cards.reduce((m, c) => Math.max(m, c.z), 0);
    return alive;
  }
  remaining() {
    return this.cards.reduce((n, c) => n + (c.state === "cleared" ? 0 : 1), 0);
  }
  boardCount() {
    return this.cards.reduce((n, c) => n + (c.state === "board" ? 1 : 0), 0);
  }
  progress() {
    const total = this.cards.length || 1;
    return 1 - this.remaining() / total;
  }
  /* -------------------- 历史栈 -------------------- */
  pushHistory() {
    this.history.push({
      cards: this.cards.map((c) => ({
        id: c.id,
        type: c.type,
        state: c.state,
        layer: c.layer,
        z: c.z,
        x: c.x,
        y: c.y
      })),
      slot: this.slot.map((c) => c.id),
      temp: this.temp.map((c) => c.id),
      status: this.status,
      revived: this.revived
    });
    if (this.history.length > 60) this.history.shift();
  }
  restore(h) {
    for (const sc of h.cards) {
      const c = this.cards[sc.id];
      c.type = sc.type;
      c.state = sc.state;
      c.layer = sc.layer;
      c.z = sc.z;
      c.x = sc.x;
      c.y = sc.y;
    }
    this.slot = h.slot.map((id) => this.cards[id]);
    this.temp = (h.temp || []).map((id) => this.cards[id]);
    for (const c of this.slot) {
      c.vx = null;
      c.vy = null;
    }
    this.pendingMatch = null;
    this.resolving = false;
    this.status = h.status;
    this.revived = h.revived;
    this._topPool = null;
    this.refresh();
  }
  /* -------------------- 核心操作 -------------------- */
  canPick(card) {
    return this.screen === "play" && this.status === "play" && card && card.state === "board" && !card.blocked;
  }
  /** 点击临时区里的牌 → 放回槽位 */
  returnFromTemp(card) {
    var _a;
    if (this.status !== "play" || !card || card.state !== "temp") return false;
    if (this.pendingMatch) this.flushResolve();
    if (this.slot.length >= SLOT_CAPACITY) return false;
    this.pushHistory();
    const i = this.temp.indexOf(card);
    if (i >= 0) this.temp.splice(i, 1);
    card.state = "slot";
    card.vx = card.x;
    card.vy = card.y;
    card.vScale = 1.14;
    slotInsert(this.slot, card);
    (_a = this.audio) == null ? void 0 : _a.pick();
    this.refresh();
    this.queueResolve();
    return true;
  }
  pick(card) {
    var _a, _b;
    if (card && card.state === "temp") return this.returnFromTemp(card);
    if (!this.canPick(card)) {
      if (card && card.state === "board" && card.blocked) {
        this.shake = 1;
        (_a = this.audio) == null ? void 0 : _a.deny();
      }
      return false;
    }
    if (this.pendingMatch) this.flushResolve();
    if (this.status !== "play" || this.slot.length >= SLOT_CAPACITY) return false;
    this.pushHistory();
    card.state = "slot";
    card.vx = card.x;
    card.vy = card.y;
    card.vScale = 1.14;
    slotInsert(this.slot, card);
    (_b = this.audio) == null ? void 0 : _b.pick();
    this.refresh();
    this.queueResolve();
    return true;
  }
  /** 发现三张同花色 → 排一个 200ms 后的消除，期间不重复触发 */
  queueResolve() {
    const types = slotMatchTypes(this.slot);
    if (types.length) {
      this.pendingMatch = {
        due: nowMs() + MATCH_DELAY_MS,
        dueClock: this.clock + MATCH_DELAY_MS,
        types
      };
      return;
    }
    if (this.slot.length >= SLOT_CAPACITY) this.lose();
  }
  /** 真正执行消除（由 tick 或下一次点击推进），resolving 防重入 */
  flushResolve() {
    var _a, _b;
    if (this.resolving || !this.pendingMatch) return false;
    this.resolving = true;
    const removed = resolveSlot(this.slot);
    this.pendingMatch = null;
    if (removed.length) {
      for (let i = 0; i < removed.length; i++) {
        removed[i].state = "cleared";
        const p = this.slotCardPos(i);
        this.spawnBurst(p.x, p.y);
      }
      (_a = this.audio) == null ? void 0 : _a.match();
      this.slotFlash = 1;
    }
    this.refresh();
    this.resolving = false;
    const allClear = this.cards.every((c) => c.state === "cleared");
    if (allClear) {
      this.status = "win";
      this.graduated = this.level >= LEVEL_COUNT;
      this.best = Math.max(this.best, this.graduated ? LEVEL_COUNT : this.level + 1);
      (_b = this.audio) == null ? void 0 : _b.win();
    } else if (this.slot.length >= SLOT_CAPACITY) {
      this.lose();
    }
    return removed.length > 0;
  }
  lose() {
    var _a;
    this.status = "lose";
    (_a = this.audio) == null ? void 0 : _a.lose();
  }
  /** 保留旧方法名：一次性把当前结算做完（测试 / 调试用） */
  resolve() {
    if (this.pendingMatch) return this.flushResolve();
    const removed = resolveSlot(this.slot);
    if (removed.length) {
      for (let i = 0; i < removed.length; i++) removed[i].state = "cleared";
      this.slotFlash = 1;
    }
    this.refresh();
    if (this.cards.every((c) => c.state === "cleared")) this.status = "win";
    else if (this.slot.length >= SLOT_CAPACITY) this.lose();
    return removed.length > 0;
  }
  slotCardPos(index) {
    return { x: slotTargetX(index) + SLOT_CARD_W / 2, y: SLOT_Y + SLOT_CARD_H / 2 };
  }
  /* -------------------- 道具 -------------------- */
  /** 洗牌：只重新分配盘面剩余牌的花色，每种花色数量不变，位置完全不动 */
  useShuffle() {
    var _a, _b;
    if (this.status !== "play" || this.props.shuffle <= 0) {
      (_a = this.audio) == null ? void 0 : _a.deny();
      return false;
    }
    this.pushHistory();
    this.props.shuffle -= 1;
    const board = this.cards.filter((c) => c.state === "board");
    const types = board.map((c) => c.type);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = types[i];
      types[i] = types[j];
      types[j] = t;
    }
    board.forEach((c, i) => {
      c.type = types[i];
    });
    this.refresh();
    (_b = this.audio) == null ? void 0 : _b.shuffle();
    return true;
  }
  /** 撤销：撤回最近一次点击，牌回到原位（历史栈） */
  useUndo() {
    var _a, _b;
    if (this.status !== "play" || this.props.undo <= 0 || this.history.length === 0) {
      (_a = this.audio) == null ? void 0 : _a.deny();
      return false;
    }
    if (this.pendingMatch) this.flushResolve();
    this.props.undo -= 1;
    const h = this.history.pop();
    this.restore(h);
    (_b = this.audio) == null ? void 0 : _b.undo();
    return true;
  }
  /**
   * 移出：把槽内最左 3 张（不足 3 张则全部）移到临时区。
   * 临时区不占槽位；点击临时区的牌可放回槽位。
   */
  useRemove() {
    var _a, _b;
    if (this.status !== "play" || this.props.remove <= 0 || this.slot.length === 0) {
      (_a = this.audio) == null ? void 0 : _a.deny();
      return false;
    }
    if (this.pendingMatch) this.flushResolve();
    this.pushHistory();
    this.props.remove -= 1;
    const take = this.slot.splice(0, Math.min(3, this.slot.length));
    for (let i = 0; i < take.length; i++) {
      take[i].state = "temp";
      take[i].vx = null;
      take[i].vy = null;
      this.temp.push(take[i]);
    }
    this.refresh();
    (_b = this.audio) == null ? void 0 : _b.shuffle();
    return true;
  }
  /** 复活：只清空槽位（临时区里的牌也一并清空），不补道具，不动牌堆 */
  useRevive() {
    var _a;
    if (this.status !== "lose" || this.reviveLeft <= 0) return false;
    this.reviveLeft -= 1;
    this.revived = true;
    const take = this.slot.slice();
    this.slot = [];
    for (let i = 0; i < take.length; i++) {
      take[i].state = "cleared";
      const p = this.slotCardPos(0);
      this.spawnBurst(p.x, p.y);
    }
    this.temp = [];
    this.pendingMatch = null;
    this.status = "play";
    this.refresh();
    (_a = this.audio) == null ? void 0 : _a.revive();
    return true;
  }
  /** 兼容旧接口：把一张牌放回牌堆最上层（落点一定在所有牌之上，必然可点） */
  placeBack(card) {
    const cell = this.nextTopCell();
    const z = this.maxZ + 1;
    card.layer = 6;
    card.z = z;
    card.x = cell.x;
    card.y = cell.y;
    card.state = "board";
    card.vx = null;
    card.vy = null;
    card.appearAt = nowMs();
    this.maxZ = z;
    this.refresh();
  }
  /** 塔顶的空格，打乱后依次取用，避免两张牌叠在同一个点上 */
  nextTopCell() {
    if (!this._topPool || !this._topPool.length) {
      const cells = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) cells.push({ x: 190 + c * 90, y: 250 + r * 100 });
      }
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = cells[i];
        cells[i] = cells[j];
        cells[j] = t;
      }
      this._topPool = cells;
    }
    return this._topPool.pop();
  }
  /* -------------------- 特效 / 帧推进 -------------------- */
  spawnBurst(x, y) {
    for (let i = 0; i < 10; i++) {
      const a = Math.PI * 2 * i / 10 + Math.random() * 0.4;
      const sp = 90 + Math.random() * 130;
      this.fx.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0.55 + Math.random() * 0.25,
        t: 0,
        r: 2 + Math.random() * 3
      });
    }
  }
  tick(dt) {
    this.time += dt;
    this.clock += dt * 1e3;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 4);
    if (this.slotFlash > 0) this.slotFlash = Math.max(0, this.slotFlash - dt * 3);
    if (this.pendingMatch && (this.clock >= this.pendingMatch.dueClock || nowMs() >= this.pendingMatch.due)) {
      this.flushResolve();
    }
    const k = Math.min(1, dt * 15);
    this.slot.forEach((c, i) => {
      const tx = slotTargetX(i);
      if (c.vx == null) {
        c.vx = tx;
        c.vy = SLOT_Y;
      }
      c.vx += (tx - c.vx) * k;
      c.vy += (SLOT_Y - c.vy) * k;
      const ddx = tx - c.vx;
      const ddy = SLOT_Y - c.vy;
      const d2 = Math.sqrt(ddx * ddx + ddy * ddy);
      c.vScale = 1 + Math.min(0.14, d2 / 700);
      if (d2 < 0.4) {
        c.vx = tx;
        c.vy = SLOT_Y;
        c.vScale = 1;
      }
    });
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const p = this.fx[i];
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 620 * dt;
      if (p.t >= p.life) this.fx.splice(i, 1);
    }
  }
  /** 关卡参数预览（标题页展示） */
  nextLevelPreview() {
    return levelParams(this.level + 1);
  }
};

// core/shared/layout_signature.js
var SIGNATURE_ALGORITHM = "MAH-LAYOUT-SIG-v1/SHA-256";
var GEOMETRY_ALGORITHM = "MAH-GEOM-v1/SHA-256";
var DISTRIBUTION_ALGORITHM = "MAH-DIST-v1/SHA-256";
function num(v) {
  var n = Number(v);
  return isFinite(n) ? n : 0;
}
function str(v) {
  return v === void 0 || v === null ? "" : String(v);
}
function cmpStr(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function coordKey(c) {
  return [num(c.x), num(c.y), num(c.layer), str(c.region), num(c.zoneLayer), num(c.z)].join(":");
}
function sortCards(cards) {
  return cards.slice().sort(function(a, b) {
    return num(a.layer) - num(b.layer) || num(a.y) - num(b.y) || num(a.x) - num(b.x) || cmpStr(str(a.region), str(b.region)) || num(a.z) - num(b.z);
  });
}
function calculateLayoutSignature(data) {
  var cards = data && data.cards || [];
  var graph = data && data._graph || null;
  var sorted = sortCards(cards);
  var byId = {};
  var i;
  for (i = 0; i < cards.length; i++) byId[cards[i].id] = cards[i];
  var cardLines = [];
  var playable = [];
  var blocked = [];
  for (i = 0; i < sorted.length; i++) {
    var c = sorted[i];
    cardLines.push([
      num(c.x),
      num(c.y),
      num(c.w),
      num(c.h),
      num(c.layer),
      str(c.region),
      num(c.zoneLayer),
      num(c.z)
    ].join(","));
    if (c.blocked) blocked.push(coordKey(c));
    else playable.push(coordKey(c));
  }
  var edgeLines = [];
  if (graph && graph.blockers) {
    for (i = 0; i < cards.length; i++) {
      var c2 = cards[i];
      var bs = graph.blockers[c2.id] || [];
      var keys = [];
      for (var j = 0; j < bs.length; j++) {
        var b = byId[bs[j]];
        if (b) keys.push(coordKey(b));
      }
      keys.sort(cmpStr);
      edgeLines.push(coordKey(c2) + ">" + keys.join("&"));
    }
  }
  edgeLines.sort(cmpStr);
  var layerMap = {};
  var regionMap = {};
  for (i = 0; i < sorted.length; i++) {
    var c3 = sorted[i];
    var li = num(c3.layer);
    if (!layerMap[li]) layerMap[li] = { n: 0, minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    var L = layerMap[li];
    L.n++;
    if (num(c3.x) < L.minX) L.minX = num(c3.x);
    if (num(c3.y) < L.minY) L.minY = num(c3.y);
    if (num(c3.x) > L.maxX) L.maxX = num(c3.x);
    if (num(c3.y) > L.maxY) L.maxY = num(c3.y);
    var rk = str(c3.region);
    regionMap[rk] = (regionMap[rk] || 0) + 1;
  }
  var layerKeys = [];
  for (var lk in layerMap) if (Object.prototype.hasOwnProperty.call(layerMap, lk)) layerKeys.push(lk);
  layerKeys.sort(function(a, b2) {
    return Number(a) - Number(b2);
  });
  var layerLines = [];
  for (i = 0; i < layerKeys.length; i++) {
    var q = layerMap[layerKeys[i]];
    layerLines.push([layerKeys[i], q.n, q.minX, q.minY, q.maxX, q.maxY].join(","));
  }
  var regionKeys = [];
  for (var rk2 in regionMap) if (Object.prototype.hasOwnProperty.call(regionMap, rk2)) regionKeys.push(rk2);
  regionKeys.sort(cmpStr);
  var regionLines = [];
  for (i = 0; i < regionKeys.length; i++) regionLines.push(regionKeys[i] + ":" + regionMap[regionKeys[i]]);
  var geometryInput = [
    GEOMETRY_ALGORITHM,
    "n=" + cards.length,
    "cards=" + cardLines.join("|"),
    "edges=" + edgeLines.join("|"),
    "playable=" + playable.join("|"),
    "blocked=" + blocked.join("|"),
    "layers=" + layerLines.join("|"),
    "regions=" + regionLines.join("|")
  ].join("\n");
  var geometrySignature = sha256Hex(geometryInput);
  var counts = {};
  var typeLines = [];
  for (i = 0; i < TYPE_IDS.length; i++) {
    var n = 0;
    for (var k = 0; k < cards.length; k++) if (cards[k].type === TYPE_IDS[i]) n++;
    counts[TYPE_IDS[i]] = n;
    typeLines.push(i + ":" + TYPE_IDS[i] + ":" + n);
  }
  var typeSeq = [];
  for (i = 0; i < sorted.length; i++) typeSeq.push(str(sorted[i].type));
  var distributionSignature = sha256Hex([
    DISTRIBUTION_ALGORITHM,
    "counts=" + typeLines.join("|"),
    "byZ=" + typeSeq.join(",")
  ].join("\n"));
  var layoutSignature = sha256Hex([
    SIGNATURE_ALGORITHM,
    geometrySignature,
    distributionSignature
  ].join("|"));
  var usedKinds = 0;
  for (i = 0; i < TYPE_IDS.length; i++) if (counts[TYPE_IDS[i]] > 0) usedKinds++;
  return {
    algorithm: SIGNATURE_ALGORITHM,
    layoutSignature,
    geometrySignature,
    distributionSignature,
    tileCount: cards.length,
    layerCount: layerKeys.length,
    regionCount: regionKeys.length,
    tileTypeCount: usedKinds,
    playableCount: playable.length,
    blockedCount: blocked.length,
    typeCounts: counts,
    regionSignature: sha256Hex(regionLines.join("|"))
  };
}
function cellKey2(c) {
  return num(c.x) + "," + num(c.y);
}
function layoutShape(cards) {
  var list = cards || [];
  var layers = [];
  var silhouette = {};
  var cells = 0;
  for (var i = 0; i < list.length; i++) {
    var c = list[i];
    var li = num(c.layer);
    var k = cellKey2(c);
    if (!layers[li]) layers[li] = {};
    if (!layers[li][k]) {
      layers[li][k] = 1;
      cells++;
    }
    silhouette[k] = 1;
  }
  return { layers, silhouette, cells };
}
function jaccard(a, b) {
  var inter = 0;
  var uni = 0;
  var k;
  for (k in a) {
    if (!Object.prototype.hasOwnProperty.call(a, k)) continue;
    uni++;
    if (b[k]) inter++;
  }
  for (k in b) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
    if (!a[k]) uni++;
  }
  if (!uni) return 0;
  return inter / uni;
}
function layoutSimilarity(a, b) {
  var cardsA = a && a.cards ? a.cards : a;
  var cardsB = b && b.cards ? b.cards : b;
  if (!cardsA || !cardsB) return 0;
  var A = layoutShape(cardsA);
  var B = layoutShape(cardsB);
  var n = A.layers.length > B.layers.length ? A.layers.length : B.layers.length;
  var sum = 0;
  var used = 0;
  for (var i = 0; i < n; i++) {
    var la = A.layers[i] || {};
    var lb = B.layers[i] || {};
    var ea = false;
    var eb = false;
    var k;
    for (k in la) if (Object.prototype.hasOwnProperty.call(la, k)) {
      ea = true;
      break;
    }
    for (k in lb) if (Object.prototype.hasOwnProperty.call(lb, k)) {
      eb = true;
      break;
    }
    if (!ea && !eb) continue;
    sum += jaccard(la, lb);
    used++;
  }
  var layerSim = used ? sum / used : 0;
  var silhouetteSim = jaccard(A.silhouette, B.silhouette);
  return 0.5 * layerSim + 0.5 * silhouetteSim;
}
var SIMILARITY_THRESHOLD = 0.6;

// core/shared/l2_structure.js
var STRUCTURE_ALGORITHM = "MAH-L2-STRUCT-v1/SHA-256";
var CANONICAL_ALGORITHM = "MAH-L2-CANON-v1/SHA-256";
var THRESH_AREA4 = OVERLAP_THRESHOLD * TILE_AREA;
function num2(v) {
  var n = Number(v);
  return isFinite(n) ? n : 0;
}
function str2(v) {
  return v === void 0 || v === null ? "" : String(v);
}
function cmpStr2(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function geomBlocked(cards, i) {
  var a = cards[i];
  for (var j = 0; j < cards.length; j++) {
    if (j === i) continue;
    var b = cards[j];
    if (num2(b.z) <= num2(a.z)) continue;
    if (overlapArea(a, b) > THRESH_AREA4) return true;
  }
  return false;
}
function geomKey(c) {
  return [num2(c.x), num2(c.y), num2(c.layer), str2(c.region), num2(c.zoneLayer), num2(c.z)].join(":");
}
function calculateStructureSignature(data) {
  var cards = data && data.cards || [];
  var sorted = cards.slice().sort(function(a, b) {
    return num2(a.layer) - num2(b.layer) || num2(a.y) - num2(b.y) || num2(a.x) - num2(b.x) || num2(a.z) - num2(b.z);
  });
  var cardLines = [];
  for (var i = 0; i < sorted.length; i++) {
    var c = sorted[i];
    cardLines.push([
      num2(c.x),
      num2(c.y),
      num2(c.layer),
      str2(c.region),
      num2(c.zoneLayer),
      num2(c.z),
      str2(c.seg)
    ].join(","));
  }
  var layerMap = {};
  var regionMap = {};
  var silhouette = {};
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (var k = 0; k < cards.length; k++) {
    var q = cards[k];
    var li = num2(q.layer);
    if (!layerMap[li]) {
      layerMap[li] = { n: 0, sx: 0, sy: 0, minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, cells: {} };
    }
    var L = layerMap[li];
    L.n++;
    L.sx += num2(q.x);
    L.sy += num2(q.y);
    if (num2(q.x) < L.minX) L.minX = num2(q.x);
    if (num2(q.y) < L.minY) L.minY = num2(q.y);
    if (num2(q.x) + TILE_W > L.maxX) L.maxX = num2(q.x) + TILE_W;
    if (num2(q.y) + TILE_H > L.maxY) L.maxY = num2(q.y) + TILE_H;
    var ck = num2(q.x) + "," + num2(q.y);
    L.cells[ck] = 1;
    silhouette[ck] = 1;
    regionMap[str2(q.region)] = (regionMap[str2(q.region)] || 0) + 1;
    if (num2(q.x) < minX) minX = num2(q.x);
    if (num2(q.y) < minY) minY = num2(q.y);
    if (num2(q.x) + TILE_W > maxX) maxX = num2(q.x) + TILE_W;
    if (num2(q.y) + TILE_H > maxY) maxY = num2(q.y) + TILE_H;
  }
  var layerKeys = [];
  for (var lk in layerMap) if (Object.prototype.hasOwnProperty.call(layerMap, lk)) layerKeys.push(lk);
  layerKeys.sort(function(a, b) {
    return Number(a) - Number(b);
  });
  var layerLines = [];
  var contourLines = [];
  for (var li2 = 0; li2 < layerKeys.length; li2++) {
    var M = layerMap[layerKeys[li2]];
    layerLines.push([
      layerKeys[li2],
      M.n,
      Math.round(M.sx / M.n),
      Math.round(M.sy / M.n),
      M.minX,
      M.minY,
      M.maxX,
      M.maxY
    ].join(","));
    var cks = [];
    for (var cell in M.cells) if (Object.prototype.hasOwnProperty.call(M.cells, cell)) cks.push(cell);
    cks.sort(cmpStr2);
    contourLines.push(layerKeys[li2] + "=" + cks.join("&"));
  }
  var silKeys = [];
  for (var sk in silhouette) if (Object.prototype.hasOwnProperty.call(silhouette, sk)) silKeys.push(sk);
  silKeys.sort(cmpStr2);
  var regionKeys = [];
  for (var rk in regionMap) if (Object.prototype.hasOwnProperty.call(regionMap, rk)) regionKeys.push(rk);
  regionKeys.sort(cmpStr2);
  var regionLines = [];
  for (var r = 0; r < regionKeys.length; r++) regionLines.push(regionKeys[r] + ":" + regionMap[regionKeys[r]]);
  var blockedKeys = [];
  var playableKeys = [];
  var edgeLines = [];
  for (var t = 0; t < cards.length; t++) {
    var cc = cards[t];
    var isBlk = geomBlocked(cards, t);
    if (isBlk) blockedKeys.push(geomKey(cc));
    else playableKeys.push(geomKey(cc));
    var blockers = [];
    for (var u = 0; u < cards.length; u++) {
      if (u === t) continue;
      var other = cards[u];
      if (num2(other.z) <= num2(cc.z)) continue;
      if (overlapArea(cc, other) > THRESH_AREA4) blockers.push(geomKey(other));
    }
    blockers.sort(cmpStr2);
    edgeLines.push(geomKey(cc) + ">" + blockers.join("&"));
  }
  blockedKeys.sort(cmpStr2);
  playableKeys.sort(cmpStr2);
  edgeLines.sort(cmpStr2);
  var structureSignature = sha256Hex([
    STRUCTURE_ALGORITHM,
    "n=" + cards.length,
    "box=" + [minX, minY, maxX, maxY].join(","),
    "cards=" + cardLines.join("|"),
    "layers=" + layerLines.join("|"),
    "contours=" + contourLines.join("|"),
    "silhouette=" + silKeys.join("|"),
    "regions=" + regionLines.join("|"),
    "edges=" + edgeLines.join("|"),
    "playable=" + playableKeys.join("|"),
    "blocked=" + blockedKeys.join("|")
  ].join("\n"));
  return {
    algorithm: STRUCTURE_ALGORITHM,
    structureSignature,
    canonicalGeometrySignature: canonicalGeometrySignature(cards),
    tileCount: cards.length,
    layerCount: layerKeys.length,
    regionCount: regionKeys.length,
    playableCount: playableKeys.length,
    blockedCount: blockedKeys.length,
    box: { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY },
    layerCounts: layerMap,
    regionCounts: regionMap,
    contourCellCount: silKeys.length
  };
}
function canonicalGeometrySignature(cards) {
  var list = cards || [];
  if (!list.length) return sha256Hex(CANONICAL_ALGORITHM + "|empty");
  var minX = Infinity, minY = Infinity, maxX = -Infinity;
  for (var i = 0; i < list.length; i++) {
    var x = num2(list[i].x), y = num2(list[i].y);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + TILE_W > maxX) maxX = x + TILE_W;
  }
  var width = maxX - minX;
  function build(mirror) {
    var lines = [];
    for (var j = 0; j < list.length; j++) {
      var c = list[j];
      var rx = num2(c.x) - minX;
      var ry = num2(c.y) - minY;
      if (mirror) rx = width - TILE_W - rx;
      lines.push(num2(c.layer) + ":" + rx + ":" + ry);
    }
    lines.sort(cmpStr2);
    return lines.join("|");
  }
  var a = build(false);
  var b = build(true);
  var canon = a < b ? a : b;
  return sha256Hex(CANONICAL_ALGORITHM + "|w=" + width + "|" + canon);
}
function jaccard2(a, b) {
  var inter = 0, uni = 0, k;
  for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) {
    uni++;
    if (b[k]) inter++;
  }
  for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) {
    if (!a[k]) uni++;
  }
  return uni ? inter / uni : 0;
}
function mainStackCards(cards) {
  var out = [];
  for (var i = 0; i < (cards || []).length; i++) {
    if (cards[i].seg !== "outer") out.push(cards[i]);
  }
  return out;
}
function structureSimilarity(dataA, dataB) {
  var a = mainStackCards(dataA && dataA.cards ? dataA.cards : dataA);
  var b = mainStackCards(dataB && dataB.cards ? dataB.cards : dataB);
  if (!a || !b) return 0;
  var A = layoutShape(a);
  var B = layoutShape(b);
  var n = Math.max(A.layers.length, B.layers.length);
  var sum = 0, used = 0;
  for (var i = 0; i < n; i++) {
    var la = A.layers[i] || {}, lb = B.layers[i] || {};
    var ea = false, eb = false, k;
    for (k in la) if (Object.prototype.hasOwnProperty.call(la, k)) {
      ea = true;
      break;
    }
    for (k in lb) if (Object.prototype.hasOwnProperty.call(lb, k)) {
      eb = true;
      break;
    }
    if (!ea && !eb) continue;
    sum += jaccard2(la, lb);
    used++;
  }
  var layerSim = used ? sum / used : 0;
  var silSim = jaccard2(A.silhouette, B.silhouette);
  function regionSet(cards) {
    var out = {};
    for (var q = 0; q < cards.length; q++) out[str2(cards[q].region) + "@" + num2(cards[q].layer)] = 1;
    return out;
  }
  var regSim = jaccard2(regionSet(a), regionSet(b));
  function playableSet(cards) {
    var out = {};
    var hasFlag = cards.length > 0 && typeof cards[0].blocked === "boolean";
    for (var q = 0; q < cards.length; q++) {
      var free = hasFlag ? !cards[q].blocked : !geomBlocked(cards, q);
      if (free) out[num2(cards[q].x) + "," + num2(cards[q].y)] = 1;
    }
    return out;
  }
  var playSim = jaccard2(playableSet(a), playableSet(b));
  return 0.4 * layerSim + 0.3 * silSim + 0.2 * regSim + 0.1 * playSim;
}
function structureFields(data) {
  var s = calculateStructureSignature(data);
  return {
    structureSignature: s.structureSignature,
    canonicalGeometrySignature: s.canonicalGeometrySignature
  };
}

// core/shared/l2_recent.js
var L2_DEDUP_ALGORITHM = "MAH-L2-DEDUP-v1";
var L2_SIMILARITY_THRESHOLD = SIMILARITY_THRESHOLD;
function idx(arr, v) {
  for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i;
  return -1;
}
function usedTemplateIds(recent) {
  var out = [];
  var list = recent || [];
  for (var i = 0; i < list.length; i++) {
    var id = list[i] && list[i].templateId;
    if (id && idx(out, id) < 0) out.push(id);
  }
  return out;
}
function availableTemplateIds(recent) {
  var used = usedTemplateIds(recent);
  var out = [];
  for (var i = 0; i < L2_TEMPLATE_IDS.length; i++) {
    if (idx(used, L2_TEMPLATE_IDS[i]) < 0) out.push(L2_TEMPLATE_IDS[i]);
  }
  return out;
}
function equivalentRecords(recent, candidate) {
  var out = [];
  var list = recent || [];
  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var sameCanonical = !!(candidate.canonicalGeometrySignature && r.canonicalGeometrySignature === candidate.canonicalGeometrySignature);
    var sameStructure = !!(candidate.structureSignature && r.structureSignature === candidate.structureSignature);
    var sameGeometry = !!(candidate.geometrySignature && r.geometrySignature === candidate.geometrySignature);
    if (sameCanonical || sameStructure || sameGeometry) {
      out.push({
        index: i,
        gameId: r.gameId,
        templateId: r.templateId || "",
        sameCanonical,
        sameStructure,
        sameGeometry
      });
    }
  }
  return out;
}
function checkL2DualDedup(recent, candidate) {
  var c = candidate || {};
  var list = recent || [];
  var used = usedTemplateIds(list);
  var equivalents = equivalentRecords(list, c);
  var templateDifferent = idx(used, c.templateId) < 0 && !!c.templateId;
  var canonicalDifferent = true;
  var structureDifferent = true;
  var geometrySignatureDifferent = true;
  for (var i = 0; i < equivalents.length; i++) {
    if (equivalents[i].sameCanonical) canonicalDifferent = false;
    if (equivalents[i].sameStructure) structureDifferent = false;
    if (equivalents[i].sameGeometry) geometrySignatureDifferent = false;
  }
  var sSim = Number(c.structureSimilarityMax) || 0;
  var lSim = Number(c.layoutSimilarityMax) || 0;
  var similarityDifferent = sSim < L2_SIMILARITY_THRESHOLD && lSim < L2_SIMILARITY_THRESHOLD;
  var seedList = [], idList = [];
  for (var j = 0; j < list.length; j++) {
    seedList.push(list[j].seed);
    idList.push(list[j].gameId);
  }
  var seedFresh = idx(seedList, c.seed) < 0;
  var gameIdUnique = !c.gameId || idx(idList, c.gameId) < 0;
  var failedChecks = [];
  if (!templateDifferent) failedChecks.push("TEMPLATE_ID");
  if (!canonicalDifferent) failedChecks.push("CANONICAL_GEOMETRY");
  if (!structureDifferent) failedChecks.push("STRUCTURE_SIGNATURE");
  if (!geometrySignatureDifferent) failedChecks.push("GEOMETRY_SIGNATURE");
  if (!similarityDifferent) failedChecks.push("GEOMETRY_SIMILARITY");
  if (!seedFresh) failedChecks.push("SEED");
  if (!gameIdUnique) failedChecks.push("GAME_ID");
  return {
    pass: failedChecks.length === 0,
    equivalents,
    failedChecks,
    checks: {
      templateDifferent,
      canonicalDifferent,
      structureDifferent,
      geometrySignatureDifferent,
      similarityDifferent,
      seedFresh,
      gameIdUnique,
      structureSimilarityMax: Math.round(sSim * 1e3) / 1e3,
      layoutSimilarityMax: Math.round(lSim * 1e3) / 1e3,
      usedTemplateIds: used,
      availableTemplateCount: availableTemplateIds(list).length
    }
  };
}

// core/shared/recent_games.js
var HISTORY_LIMIT = 3;
var L2_HISTORY_LIMIT = 10;
function historyLimitFor(level) {
  return level <= 1 ? HISTORY_LIMIT : L2_HISTORY_LIMIT;
}
var GENERATION_REASONS = [
  "application_restart",
  "title_screen_restart",
  "failure_restart",
  "new_game"
];
var RECORD_FIELDS = [
  "gameId",
  "level",
  "difficultyId",
  "seed",
  "totalTiles",
  "tileTypeCount",
  "layoutSignature",
  "geometrySignature",
  "distributionSignature",
  "generatedAt",
  "generationReason",
  "validationResult"
];
var L2_EXTRA_FIELDS = [
  "templateId",
  "structureSignature",
  "canonicalGeometrySignature"
];
var L2_RECORD_FIELDS = RECORD_FIELDS.concat(L2_EXTRA_FIELDS);
function isArray(v) {
  return Object.prototype.toString.call(v) === "[object Array]";
}
function isInt(v, lo, hi) {
  return typeof v === "number" && isFinite(v) && Math.floor(v) === v && v >= lo && v <= hi;
}
function isStr(v, maxLen) {
  return typeof v === "string" && v.length > 0 && v.length <= maxLen;
}
function isObject(v) {
  return !!v && typeof v === "object" && !isArray(v);
}
function isHex64(v) {
  return typeof v === "string" && v.length === 64 && /^[0-9a-f]{64}$/.test(v);
}
function historyKey(level) {
  return level <= 1 ? "level1RecentGames" : "level2RecentGames";
}
function sanitizeRecord(raw, level) {
  if (!isObject(raw)) return null;
  if (!isStr(raw.gameId, 128)) return null;
  if (!isInt(raw.level, 1, 2)) return null;
  if (!isInt(raw.difficultyId, 0, 63)) return null;
  if (!isInt(raw.seed, 0, 4294967295)) return null;
  if (!isInt(raw.totalTiles, 1, 1e4)) return null;
  if (!isInt(raw.tileTypeCount, 0, 16)) return null;
  if (!isHex64(raw.layoutSignature)) return null;
  if (!isHex64(raw.geometrySignature)) return null;
  if (!isHex64(raw.distributionSignature)) return null;
  if (!isStr(raw.generatedAt, 64)) return null;
  if (GENERATION_REASONS.indexOf(raw.generationReason) < 0) return null;
  if (raw.validationResult !== "PASS" && raw.validationResult !== "FAIL") return null;
  var lv = level === 2 ? 2 : level === 1 ? 1 : raw.level === 2 ? 2 : 1;
  var fields = lv === 2 ? L2_RECORD_FIELDS : RECORD_FIELDS;
  var out = {};
  for (var i = 0; i < RECORD_FIELDS.length; i++) out[RECORD_FIELDS[i]] = raw[RECORD_FIELDS[i]];
  if (lv === 2) {
    for (var j = 0; j < L2_EXTRA_FIELDS.length; j++) {
      var k = L2_EXTRA_FIELDS[j];
      var v = raw[k];
      if (v === void 0 || v === null || v === "") continue;
      if (k === "templateId") {
        if (!isStr(v, 32) || L2_TEMPLATE_IDS.indexOf(v) < 0) return null;
      } else if (!isHex64(v)) {
        return null;
      }
      out[k] = v;
    }
  }
  return out;
}
function sanitizeHistory(raw, level) {
  if (!isArray(raw)) return [];
  var lv = level === 2 ? 2 : 1;
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    var r = sanitizeRecord(raw[i], lv);
    if (r) out.push(r);
  }
  var limit = historyLimitFor(lv);
  if (out.length > limit) out = out.slice(out.length - limit);
  return out;
}
function historyFor(save, level) {
  return sanitizeHistory(isObject(save) ? save[historyKey(level)] : null, level);
}
function appendHistory(save, level, record) {
  var clean = sanitizeRecord(record, level);
  var base = {};
  if (isObject(save)) {
    for (var k in save) if (Object.prototype.hasOwnProperty.call(save, k)) base[k] = save[k];
  }
  if (!clean) return base;
  var key = historyKey(level);
  var list = historyFor(base, level);
  list.push(clean);
  var limit = historyLimitFor(level);
  if (list.length > limit) list = list.slice(list.length - limit);
  base[key] = list;
  return base;
}
function previousFrom(save, level) {
  var list = historyFor(save, level);
  var gameIds = [], seeds = [], signatures = [], geometries = [], tileCounts = [];
  var templateIds = [], structures = [], canonicals = [];
  for (var i = 0; i < list.length; i++) {
    gameIds.push(list[i].gameId);
    seeds.push(list[i].seed);
    signatures.push(list[i].layoutSignature);
    geometries.push(list[i].geometrySignature);
    tileCounts.push(list[i].totalTiles);
    templateIds.push(list[i].templateId || "");
    structures.push(list[i].structureSignature || "");
    canonicals.push(list[i].canonicalGeometrySignature || "");
  }
  return {
    recent: list,
    previousGameIds: gameIds,
    previousSeeds: seeds,
    previousSignatures: signatures,
    previousGeometries: geometries,
    previousTileCounts: tileCounts,
    previousTemplateIds: templateIds,
    previousStructureSignatures: structures,
    previousCanonicalSignatures: canonicals
  };
}
var idCounter = 0;
function makeGameId(level, reason, rand) {
  idCounter++;
  var r = typeof rand === "function" ? rand() : Math.random();
  if (!(r >= 0) || r >= 1) r = 0;
  var hex = Math.floor(r * 4294967295).toString(36);
  return "g" + level + "-" + Date.now().toString(36) + "-" + idCounter.toString(36) + "-" + hex + "-" + reason;
}
function checkAgainstRecent(recent, candidate) {
  var tileList = [], sigList = [], geoList = [], seedList = [], idList = [];
  for (var i = 0; i < recent.length; i++) {
    tileList.push(recent[i].totalTiles);
    sigList.push(recent[i].layoutSignature);
    geoList.push(recent[i].geometrySignature);
    seedList.push(recent[i].seed);
    idList.push(recent[i].gameId);
  }
  return {
    tileCountDifferent: tileList.indexOf(candidate.totalTiles) < 0,
    layoutDifferent: sigList.indexOf(candidate.layoutSignature) < 0,
    geometryDifferent: geoList.indexOf(candidate.geometrySignature) < 0,
    seedFresh: seedList.indexOf(candidate.seed) < 0,
    gameIdUnique: idList.indexOf(candidate.gameId) < 0,
    recentTileCounts: tileList,
    recentLayoutSignatures: sigList,
    recentGeometrySignatures: geoList
  };
}

// core/shared/build_info.js
var BUILD_INFO_DEFAULTS = {
  buildVersion: "dev",
  gitCommit: "unknown",
  sourceHash: "unknown",
  buildTimestamp: "",
  sourceFiles: 0
};
function readBuildInfo() {
  var out = {};
  var k;
  for (k in BUILD_INFO_DEFAULTS) {
    if (Object.prototype.hasOwnProperty.call(BUILD_INFO_DEFAULTS, k)) out[k] = BUILD_INFO_DEFAULTS[k];
  }
  if (typeof window !== "undefined" && window.__MAH_BUILD__ && typeof window.__MAH_BUILD__ === "object") {
    var raw = window.__MAH_BUILD__;
    for (k in BUILD_INFO_DEFAULTS) {
      if (Object.prototype.hasOwnProperty.call(raw, k) && raw[k] !== void 0) out[k] = raw[k];
    }
  }
  return out;
}

// core/shared/new_game.js
var MAX_ATTEMPTS = 50;
function indexOf(arr, v) {
  for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i;
  return -1;
}
function isArray2(v) {
  return Object.prototype.toString.call(v) === "[object Array]";
}
function strings(arr) {
  if (!isArray2(arr)) return null;
  var out = [];
  for (var i = 0; i < arr.length; i++) out.push(arr[i]);
  return out;
}
function isoNow() {
  var d2 = /* @__PURE__ */ new Date();
  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = "0" + s;
    return s;
  }
  return d2.getUTCFullYear() + "-" + pad(d2.getUTCMonth() + 1, 2) + "-" + pad(d2.getUTCDate(), 2) + "T" + pad(d2.getUTCHours(), 2) + ":" + pad(d2.getUTCMinutes(), 2) + ":" + pad(d2.getUTCSeconds(), 2) + "." + pad(d2.getUTCMilliseconds(), 3) + "Z";
}
function compact(arr) {
  var out = [];
  for (var i = 0; i < arr.length; i++) if (arr[i]) out.push(arr[i]);
  return out;
}
function legalDifficultyIds(level, current, bannedTiles) {
  var pool = profilesFor(level);
  var out = [];
  for (var i = 0; i < pool.length; i++) {
    var p = pool[i];
    if (p.id === current) continue;
    var tiles = p.mainCount + p.queueCount;
    if (indexOf(bannedTiles, tiles) >= 0) continue;
    out.push(p.id);
  }
  return out;
}
function GenerationFailureError(message, detail) {
  this.name = "GenerationFailureError";
  this.message = message;
  this.detail = detail || {};
}
GenerationFailureError.prototype.toString = function() {
  return this.name + ": " + this.message;
};
var layoutCache = {};
var layoutCacheSize = 0;
var LAYOUT_CACHE_MAX = 128;
function layoutOfRecord(record) {
  var key = record.level + "|" + record.difficultyId + "|" + record.seed;
  if (Object.prototype.hasOwnProperty.call(layoutCache, key)) return layoutCache[key];
  var cards = null;
  try {
    var d2 = generateLevel(record.level, record.seed, { profile: record.difficultyId });
    if (d2 && d2.cards && d2.cards.length === record.totalTiles) cards = d2.cards;
  } catch (e) {
    cards = null;
  }
  if (layoutCacheSize > LAYOUT_CACHE_MAX) {
    layoutCache = {};
    layoutCacheSize = 0;
  }
  layoutCache[key] = cards;
  layoutCacheSize++;
  return cards;
}
var l2LayoutCache = {};
var l2LayoutCacheSize = 0;
var L2_LAYOUT_CACHE_MAX = 320;
function layoutOfRecordL2(record) {
  var key = "2|" + record.difficultyId + "|" + record.seed + "|" + (record.templateId || "-");
  if (Object.prototype.hasOwnProperty.call(l2LayoutCache, key)) return l2LayoutCache[key];
  var result = null;
  if (record.templateId) {
    try {
      var d2 = generateLevel(2, record.seed, {
        profile: record.difficultyId,
        templateId: record.templateId
      });
      if (d2 && d2.cards && d2.cards.length === record.totalTiles) {
        result = { cards: d2.cards, main: mainStackCards(d2.cards) };
      }
    } catch (e) {
      result = null;
    }
  }
  if (l2LayoutCacheSize > L2_LAYOUT_CACHE_MAX) {
    l2LayoutCache = {};
    l2LayoutCacheSize = 0;
  }
  l2LayoutCache[key] = result;
  l2LayoutCacheSize++;
  return result;
}
function createLevel2Game(o) {
  var level = 2;
  var reason = o.generationReason || "new_game";
  if (indexOf(GENERATION_REASONS, reason) < 0) {
    throw new GenerationFailureError("\u975E\u6CD5 generationReason: " + reason, { reason: "BAD_REASON" });
  }
  var game = o.game;
  if (!game) {
    throw new GenerationFailureError("createNewGame \u9700\u8981\u6CE8\u5165 game \u5B9E\u4F8B", { reason: "NO_GAME_INSTANCE" });
  }
  var rand = typeof o.rand === "function" ? o.rand : Math.random;
  var save = o.save && typeof o.save === "object" ? o.save : {};
  var maxAttempts = o.maxAttempts === void 0 ? MAX_ATTEMPTS : o.maxAttempts;
  if (!(maxAttempts >= 1)) maxAttempts = 1;
  if (maxAttempts > MAX_ATTEMPTS) maxAttempts = MAX_ATTEMPTS;
  var prev = previousFrom(save, level);
  var recent = prev.recent;
  var bannedTemplates = usedTemplateIds(recent);
  if (isArray2(o.bannedTemplateIds)) {
    for (var bi2 = 0; bi2 < o.bannedTemplateIds.length; bi2++) {
      if (indexOf(bannedTemplates, o.bannedTemplateIds[bi2]) < 0) {
        bannedTemplates.push(o.bannedTemplateIds[bi2]);
      }
    }
  }
  var pool = [];
  for (var pi = 0; pi < L2_TEMPLATE_IDS.length; pi++) {
    if (indexOf(bannedTemplates, L2_TEMPLATE_IDS[pi]) < 0) pool.push(L2_TEMPLATE_IDS[pi]);
  }
  if (!pool.length) {
    throw new GenerationFailureError(
      "\u7B2C\u4E8C\u5173 20 \u5957\u6A21\u677F\u5DF2\u88AB\u6700\u8FD1 " + recent.length + " \u5C40\u5168\u90E8\u5360\u7528\uFF0C\u65E0\u6CD5\u751F\u6210\u4E0D\u91CD\u590D\u5E03\u5C40\uFF08\u672A\u6E05\u7A7A\u5386\u53F2\u3001\u672A\u9000\u56DE\u91CD\u590D\u5E03\u5C40\uFF09",
      { reason: "TEMPLATE_POOL_EXHAUSTED", level: 2, recent, bannedTemplateIds: bannedTemplates }
    );
  }
  for (var si = pool.length - 1; si > 0; si--) {
    var sj = rand();
    if (!(sj >= 0) || sj >= 1) sj = 0;
    var swap = Math.floor(sj * (si + 1));
    var tmp = pool[si];
    pool[si] = pool[swap];
    pool[swap] = tmp;
  }
  var current = o.currentDifficulty;
  if (current === void 0 || current === null) {
    current = recent.length && typeof recent[recent.length - 1].difficultyId === "number" ? recent[recent.length - 1].difficultyId : game.profile.l2;
  }
  var diffRing = [];
  {
    var dpool = profilesFor(2);
    for (var dp = 0; dp < dpool.length; dp++) if (dpool[dp].id !== current) diffRing.push(dpool[dp].id);
    if (!diffRing.length) diffRing.push(dpool[0].id);
  }
  var build = readBuildInfo();
  var t0 = Date.now();
  var attempts = 0;
  var failures = [];
  while (attempts < maxAttempts) {
    attempts++;
    var templateId = pool[(attempts - 1) % pool.length];
    var difficultyId = attempts <= 8 ? rollProfile(2, rand, current) : diffRing[(attempts - 9) % diffRing.length];
    if (difficultyId === current) difficultyId = diffRing[0];
    var profile = profileFor(2, difficultyId);
    var difficultyValid = profile.id === difficultyId && difficultyId !== current;
    var seed = pickPoolSeed(2, difficultyId, rand) >>> 0;
    var data;
    try {
      data = generateLevel(2, seed, { profile: difficultyId, templateId });
    } catch (e) {
      failures.push({
        attempt: attempts,
        templateId,
        difficultyId,
        seed,
        reason: "GENERATE_THREW",
        detail: String(e && e.message)
      });
      continue;
    }
    if (!data || data.templateId !== templateId) {
      failures.push({ attempt: attempts, reason: "TEMPLATE_MISMATCH", templateId });
      continue;
    }
    var sig = calculateLayoutSignature(data);
    var st = structureFields(data);
    var totalTiles = data.cards.length;
    var recentChecks = [];
    var maxStructSim = 0;
    var maxLayoutSim = 0;
    var mainCards = mainStackCards(data.cards);
    for (var ri = 0; ri < recent.length; ri++) {
      var rec = recent[ri];
      var replay = layoutOfRecordL2(rec);
      var sSim = 0, lSim = 0;
      if (replay) {
        sSim = structureSimilarity(data.cards, replay.cards);
        lSim = layoutSimilarity(mainCards, replay.main);
      }
      if (sSim > maxStructSim) maxStructSim = sSim;
      if (lSim > maxLayoutSim) maxLayoutSim = lSim;
      recentChecks.push({
        gameId: rec.gameId,
        difficultyId: rec.difficultyId,
        templateId: rec.templateId || "",
        totalTiles: rec.totalTiles,
        layoutSignature: rec.layoutSignature,
        geometrySignature: rec.geometrySignature,
        structureSignature: rec.structureSignature || "",
        canonicalGeometrySignature: rec.canonicalGeometrySignature || "",
        structureSimilarity: Math.round(sSim * 1e3) / 1e3,
        layoutSimilarity: Math.round(lSim * 1e3) / 1e3,
        replayOk: !!replay
      });
    }
    var dedup = checkL2DualDedup(recent, {
      templateId,
      structureSignature: st.structureSignature,
      canonicalGeometrySignature: st.canonicalGeometrySignature,
      geometrySignature: sig.geometrySignature,
      seed,
      gameId: "",
      structureSimilarityMax: maxStructSim,
      layoutSimilarityMax: maxLayoutSim
    });
    var externalSigs = strings(o.previousSignatures);
    var externalSeeds = strings(o.previousSeeds);
    if (externalSigs && indexOf(externalSigs, sig.layoutSignature) >= 0) {
      dedup.checks.geometrySignatureDifferent = false;
      dedup.failedChecks.push("EXTERNAL_LAYOUT_SIGNATURE");
      dedup.pass = false;
    }
    if (externalSeeds && indexOf(externalSeeds, seed) >= 0) {
      dedup.checks.seedFresh = false;
      dedup.failedChecks.push("EXTERNAL_SEED");
      dedup.pass = false;
    }
    if (!dedup.pass || !difficultyValid) {
      failures.push({
        attempt: attempts,
        templateId,
        difficultyId,
        seed,
        totalTiles,
        structureSignature: st.structureSignature,
        canonicalGeometrySignature: st.canonicalGeometrySignature,
        structureSimilarityMax: dedup.checks.structureSimilarityMax,
        layoutSimilarityMax: dedup.checks.layoutSimilarityMax,
        reason: "RECENT_CONFLICT",
        failedChecks: dedup.failedChecks.concat(difficultyValid ? [] : ["DIFFICULTY"]),
        equivalents: dedup.equivalents
      });
      continue;
    }
    var validation = validateLevel(data);
    var verifyOk = data.requireSolution === false ? true : !!verify(data);
    var geometryOk = sameLayerOverlapCount(data.cards) === 0 && !!isHalfLattice(data.cards);
    var floatingOk = (data.floatingCount || 0) === 0;
    var playableOk = data.visible >= 19 && data.visible <= 25 && sig.playableCount > 0;
    var fidelityOk = !!(data.fidelity && data.fidelity.ok === true);
    if (!validation.ok || !verifyOk || !geometryOk || !floatingOk || !playableOk || !fidelityOk) {
      failures.push({
        attempt: attempts,
        templateId,
        difficultyId,
        seed,
        totalTiles,
        reason: "VALIDATION_FAILED",
        issues: validation.issues.slice(),
        verifyOk,
        geometryOk,
        floatingOk,
        playableOk,
        visible: data.visible,
        fidelityOk,
        fidelityFailed: data.fidelity ? (data.fidelity.violations || []).map(function(v) {
          return v.code + ":" + v.detail;
        }) : ["NO_FIDELITY"]
      });
      continue;
    }
    var gameId = makeGameId(level, reason, rand);
    if (indexOf(prev.previousGameIds, gameId) >= 0) {
      failures.push({ attempt: attempts, reason: "GAME_ID_COLLISION", gameId });
      continue;
    }
    var generatedAt = isoNow();
    var record = {
      gameId,
      level,
      difficultyId,
      seed,
      totalTiles,
      tileTypeCount: sig.tileTypeCount,
      layoutSignature: sig.layoutSignature,
      geometrySignature: sig.geometrySignature,
      distributionSignature: sig.distributionSignature,
      generatedAt,
      generationReason: reason,
      validationResult: "PASS",
      templateId,
      structureSignature: st.structureSignature,
      canonicalGeometrySignature: st.canonicalGeometrySignature
    };
    var nextSave = appendHistory(save, level, record);
    var savedList = historyFor(nextSave, level);
    var historySaved = savedList.length > 0 && savedList[savedList.length - 1].gameId === gameId && savedList[savedList.length - 1].templateId === templateId;
    if (!historySaved) {
      failures.push({ attempt: attempts, reason: "HISTORY_WRITE_FAILED", gameId });
      continue;
    }
    var previousRecentChecks = [];
    for (var pi2 = 0; pi2 < recentChecks.length; pi2++) {
      var rc = recentChecks[pi2];
      previousRecentChecks.push({
        gameId: rc.gameId,
        difficultyId: rc.difficultyId,
        templateId: rc.templateId,
        totalTiles: rc.totalTiles,
        layoutSignature: rc.layoutSignature,
        structureSignature: rc.structureSignature,
        canonicalGeometrySignature: rc.canonicalGeometrySignature,
        similarity: rc.structureSimilarity,
        layoutSimilarity: rc.layoutSimilarity,
        simCheck: rc.replayOk && (rc.structureSimilarity >= L2_SIMILARITY_THRESHOLD || rc.layoutSimilarity >= L2_SIMILARITY_THRESHOLD) ? "FAIL" : "PASS",
        geometryCheck: "PASS",
        templateCheck: rc.templateId === templateId ? "FAIL" : "PASS"
      });
    }
    var meta = {
      gameId,
      buildVersion: build.buildVersion,
      gitCommit: build.gitCommit,
      sourceHash: build.sourceHash,
      buildTimestamp: build.buildTimestamp,
      level,
      difficultyId,
      seed,
      totalTiles,
      tileTypeCount: sig.tileTypeCount,
      layerCount: sig.layerCount,
      layoutSignature: sig.layoutSignature,
      geometrySignature: sig.geometrySignature,
      distributionSignature: sig.distributionSignature,
      templateId,
      structureSignature: st.structureSignature,
      canonicalGeometrySignature: st.canonicalGeometrySignature,
      dedupAlgorithm: L2_DEDUP_ALGORITHM,
      generatedAt,
      generationReason: reason,
      historyLimit: historyLimitFor(level),
      similarityThreshold: L2_SIMILARITY_THRESHOLD,
      similarityMax: dedup.checks.structureSimilarityMax,
      layoutSimilarityMax: dedup.checks.layoutSimilarityMax,
      availableTemplateCount: dedup.checks.availableTemplateCount,
      usedTemplateIds: dedup.checks.usedTemplateIds,
      previousRecentChecks,
      previousThreeChecks: previousRecentChecks,
      checks: {
        similarityMax: dedup.checks.structureSimilarityMax,
        templateCheck: dedup.checks.templateDifferent ? "PASS" : "FAIL",
        canonicalCheck: dedup.checks.canonicalDifferent ? "PASS" : "FAIL",
        structureCheck: dedup.checks.structureDifferent ? "PASS" : "FAIL",
        tileCountCheck: "N/A\uFF08\u672C\u8F6E L2 \u6309\u6A21\u677F\u7EA7 + \u51E0\u4F55\u7EA7\u53BB\u91CD\uFF0C\u724C\u6570\u6309\u6863\u4F4D\u914D\u7F6E\uFF09",
        layoutCheck: dedup.checks.geometrySignatureDifferent ? "PASS" : "FAIL",
        geometryCheck: dedup.checks.canonicalDifferent && dedup.checks.structureDifferent && dedup.checks.similarityDifferent ? "PASS" : "FAIL",
        similarityCheck: dedup.checks.similarityDifferent ? "PASS" : "FAIL",
        difficultyCheck: difficultyValid ? "PASS" : "FAIL",
        historyCheck: historySaved ? "PASS" : "FAIL"
      },
      attempts,
      retries: attempts - 1,
      validation: { ok: validation.ok, kinds: validation.kinds, total: validation.total, visible: validation.visible }
    };
    if (typeof game.installLevelData === "function") {
      game.profile.l2 = difficultyId;
      game.installLevelData(data, meta);
    } else {
      throw new GenerationFailureError("game \u5B9E\u4F8B\u7F3A\u5C11 installLevelData", { reason: "BAD_GAME_INSTANCE" });
    }
    return {
      game,
      data,
      signature: sig,
      record,
      nextSave,
      meta,
      checks: dedup.checks,
      attempts,
      retries: attempts - 1,
      failures,
      elapsedMs: Date.now() - t0
    };
  }
  throw new GenerationFailureError(
    "\u7B2C 2 \u5173\u8FDE\u7EED " + attempts + " \u6B21\u672A\u80FD\u751F\u6210\u6EE1\u8DB3\u300C\u6700\u8FD1 " + historyLimitFor(level) + " \u5C40\u6A21\u677F\u7EA7 + \u51E0\u4F55\u7EA7\u53CC\u91CD\u53BB\u91CD\u300D\u7684\u5408\u6CD5\u724C\u5C40\uFF08\u672A\u6E05\u7A7A\u5386\u53F2\u3001\u672A\u63A5\u53D7\u91CD\u590D\u5E03\u5C40\uFF09",
    {
      reason: "MAX_ATTEMPTS_EXCEEDED",
      level,
      generationReason: reason,
      attempts,
      availableTemplateIds: pool,
      bannedTemplateIds: bannedTemplates,
      recent,
      failures
    }
  );
}
var locked = false;
function createNewGame(opts) {
  if (locked) {
    throw new GenerationFailureError("\u751F\u6210\u5165\u53E3\u88AB\u5E76\u53D1\u91CD\u5165\uFF08\u5DF2\u62D2\u7EDD\uFF09", { reason: "CONCURRENT_GENERATION" });
  }
  locked = true;
  try {
    return createNewGameInner(opts);
  } finally {
    locked = false;
  }
}
function createNewGameInner(opts) {
  var o = opts || {};
  if (o.level === 2) return createLevel2Game(o);
  var level = o.level === 2 ? 2 : 1;
  if (level > LEVEL_COUNT) level = LEVEL_COUNT;
  var reason = o.generationReason || "new_game";
  if (indexOf(GENERATION_REASONS, reason) < 0) {
    throw new GenerationFailureError("\u975E\u6CD5 generationReason: " + reason, { reason: "BAD_REASON" });
  }
  var game = o.game;
  if (!game) {
    throw new GenerationFailureError("createNewGame \u9700\u8981\u6CE8\u5165 game \u5B9E\u4F8B", { reason: "NO_GAME_INSTANCE" });
  }
  var rand = typeof o.rand === "function" ? o.rand : Math.random;
  var save = o.save && typeof o.save === "object" ? o.save : {};
  var maxAttempts = o.maxAttempts === void 0 ? MAX_ATTEMPTS : o.maxAttempts;
  if (!(maxAttempts >= 1)) maxAttempts = 1;
  if (maxAttempts > MAX_ATTEMPTS) maxAttempts = MAX_ATTEMPTS;
  var prev = previousFrom(save, level);
  var recent = prev.recent;
  var externalIds = strings(o.previousGameIds);
  var externalSeeds = strings(o.previousSeeds);
  var externalSigs = strings(o.previousSignatures);
  var externalTiles = strings(o.previousTileCounts);
  if (externalIds) prev.previousGameIds = externalIds;
  if (externalSeeds) prev.previousSeeds = externalSeeds;
  if (externalSigs) prev.previousSignatures = externalSigs;
  if (externalTiles) prev.previousTileCounts = externalTiles;
  var current = o.currentDifficulty;
  if (current === void 0 || current === null) {
    if (recent.length && typeof recent[recent.length - 1].difficultyId === "number") {
      current = recent[recent.length - 1].difficultyId;
    } else {
      current = level <= 1 ? game.profile.l1 : game.profile.l2;
    }
  }
  var build = readBuildInfo();
  var t0 = Date.now();
  var attempts = 0;
  var failures = [];
  var bannedTiles = [];
  for (var bi2 = 0; bi2 < prev.previousTileCounts.length; bi2++) {
    if (indexOf(bannedTiles, prev.previousTileCounts[bi2]) < 0) bannedTiles.push(prev.previousTileCounts[bi2]);
  }
  for (var br = 0; br < recent.length; br++) {
    if (indexOf(bannedTiles, recent[br].totalTiles) < 0) bannedTiles.push(recent[br].totalTiles);
  }
  var legalRing = legalDifficultyIds(level, current, bannedTiles);
  var configConflict = legalRing.length === 0;
  var rotation = [];
  {
    var pool = profilesFor(level);
    for (var pi = 0; pi < pool.length; pi++) if (pool[pi].id !== current) rotation.push(pool[pi].id);
    if (!rotation.length) for (var pj = 0; pj < pool.length; pj++) rotation.push(pool[pj].id);
  }
  while (attempts < maxAttempts) {
    attempts++;
    var difficultyId;
    if (attempts <= 8) {
      difficultyId = rollProfile(level, rand, current);
      if (legalRing.length && indexOf(legalRing, difficultyId) < 0) {
        var rr2 = rand();
        if (!(rr2 >= 0) || rr2 >= 1) rr2 = 0;
        difficultyId = legalRing[Math.floor(rr2 * legalRing.length) % legalRing.length];
      }
    } else {
      var ring = legalRing.length ? legalRing : rotation;
      difficultyId = ring[attempts % ring.length];
    }
    var profile = profileFor(level, difficultyId);
    var difficultyValid = profile.id === difficultyId && difficultyId !== current;
    var seed;
    if (level <= 1) {
      var rs = rand();
      if (!(rs >= 0) || rs >= 1) rs = 0;
      seed = (Math.floor(rs * 4294967295) ^ Date.now() + attempts * 104729) >>> 0;
    } else {
      seed = pickPoolSeed(level, difficultyId, rand) >>> 0;
    }
    var data;
    try {
      data = generateLevel(level, seed, { profile: difficultyId });
    } catch (e) {
      failures.push({ attempt: attempts, difficultyId, seed, reason: "GENERATE_THREW", detail: String(e && e.message) });
      continue;
    }
    var sig = calculateLayoutSignature(data);
    var totalTiles = data.cards.length;
    var checks = checkAgainstRecent(recent, {
      totalTiles,
      layoutSignature: sig.layoutSignature,
      geometrySignature: sig.geometrySignature,
      seed,
      gameId: ""
    });
    var recentChecks = [];
    var maxSim = 0;
    var dupGeometry = false;
    var dupIndex = -1;
    for (var ri = 0; ri < recent.length; ri++) {
      var rec = recent[ri];
      var replay = layoutOfRecord(rec);
      var sim = replay ? layoutSimilarity(data.cards, replay) : 0;
      var sameGeom = rec.geometrySignature === sig.geometrySignature;
      if (sameGeom) dupGeometry = true;
      if (sim > maxSim) maxSim = sim;
      if (sim >= SIMILARITY_THRESHOLD && dupIndex < 0) dupIndex = ri;
      recentChecks.push({
        gameId: rec.gameId,
        difficultyId: rec.difficultyId,
        totalTiles: rec.totalTiles,
        layoutSignature: rec.layoutSignature,
        geometrySignature: rec.geometrySignature,
        similarity: Math.round(sim * 1e3) / 1e3,
        similar: sim >= SIMILARITY_THRESHOLD,
        sameGeometry: sameGeom,
        replayOk: !!replay
      });
    }
    checks.similarityMax = Math.round(maxSim * 1e3) / 1e3;
    checks.similarityDifferent = maxSim < SIMILARITY_THRESHOLD;
    checks.geometrySignatureDifferent = !dupGeometry;
    checks.difficultyValid = difficultyValid;
    checks.configConflict = configConflict;
    if (indexOf(prev.previousSignatures, sig.layoutSignature) >= 0) checks.layoutDifferent = false;
    if (indexOf(prev.previousSeeds, seed) >= 0) checks.seedFresh = false;
    if (indexOf(prev.previousTileCounts, totalTiles) >= 0) checks.tileCountDifferent = false;
    if (indexOf(prev.previousGeometries, sig.geometrySignature) >= 0) checks.geometryDifferent = false;
    if (!checks.tileCountDifferent || !checks.layoutDifferent || !checks.similarityDifferent || !checks.geometrySignatureDifferent || !checks.geometryDifferent || !checks.seedFresh || !difficultyValid) {
      failures.push({
        attempt: attempts,
        difficultyId,
        seed,
        totalTiles,
        layoutSignature: sig.layoutSignature,
        geometrySignature: sig.geometrySignature,
        similarityMax: checks.similarityMax,
        configConflict,
        reason: configConflict ? "CONFIG_CONFLICT" : "RECENT_CONFLICT",
        failedChecks: compact([
          !checks.tileCountDifferent ? "TILE_COUNT" : "",
          !checks.layoutDifferent ? "LAYOUT_SIGNATURE" : "",
          !checks.similarityDifferent ? "GEOMETRY_SIMILARITY" : "",
          !checks.geometrySignatureDifferent ? "GEOMETRY_SIGNATURE" : "",
          !checks.seedFresh ? "SEED" : "",
          !difficultyValid ? "DIFFICULTY" : "",
          configConflict ? "CONFIG_CONFLICT" : ""
        ])
      });
      continue;
    }
    var validation = validateLevel(data);
    var verifyOk = false;
    try {
      verifyOk = data.requireSolution === false ? true : !!verify(data);
    } catch (e) {
      verifyOk = false;
    }
    var geometryOk = sameLayerOverlapCount(data.cards) === 0 && !!isHalfLattice(data.cards);
    var playableOk = data.visible > 0 && sig.playableCount > 0;
    if (!validation.ok || !verifyOk || !geometryOk || !playableOk) {
      failures.push({
        attempt: attempts,
        difficultyId,
        seed,
        totalTiles,
        reason: "VALIDATION_FAILED",
        issues: validation.issues.slice(),
        verifyOk,
        geometryOk,
        playableOk
      });
      continue;
    }
    var gameId = makeGameId(level, reason, rand);
    if (indexOf(prev.previousGameIds, gameId) >= 0) {
      failures.push({ attempt: attempts, reason: "GAME_ID_COLLISION", gameId });
      continue;
    }
    var generatedAt = isoNow();
    var record = {
      gameId,
      level,
      difficultyId,
      seed,
      totalTiles,
      tileTypeCount: sig.tileTypeCount,
      layoutSignature: sig.layoutSignature,
      geometrySignature: sig.geometrySignature,
      distributionSignature: sig.distributionSignature,
      generatedAt,
      generationReason: reason,
      validationResult: "PASS"
    };
    var nextSave = appendHistory(save, level, record);
    var savedList = historyFor(nextSave, level);
    var historySaved = savedList.length > 0 && savedList[savedList.length - 1].gameId === gameId;
    checks.historySaved = historySaved;
    if (!historySaved) {
      failures.push({ attempt: attempts, reason: "HISTORY_WRITE_FAILED", gameId });
      continue;
    }
    var previousRecentChecks = [];
    for (var i = 0; i < recentChecks.length; i++) {
      var rc = recentChecks[i];
      previousRecentChecks.push({
        gameId: rc.gameId,
        difficultyId: rc.difficultyId,
        totalTiles: rc.totalTiles,
        layoutSignature: rc.layoutSignature,
        geometrySignature: rc.geometrySignature,
        similarity: rc.similarity,
        simCheck: rc.similar && rc.replayOk ? "FAIL" : "PASS",
        geometryCheck: rc.sameGeometry ? "FAIL" : "PASS"
      });
    }
    var meta = {
      gameId,
      buildVersion: build.buildVersion,
      gitCommit: build.gitCommit,
      sourceHash: build.sourceHash,
      buildTimestamp: build.buildTimestamp,
      level,
      difficultyId,
      seed,
      totalTiles,
      tileTypeCount: sig.tileTypeCount,
      layerCount: sig.layerCount,
      layoutSignature: sig.layoutSignature,
      geometrySignature: sig.geometrySignature,
      distributionSignature: sig.distributionSignature,
      generatedAt,
      generationReason: reason,
      historyLimit: HISTORY_LIMIT,
      similarityThreshold: SIMILARITY_THRESHOLD,
      similarityMax: checks.similarityMax,
      previousRecentChecks,
      // 兼容旧调试面板字段名（内容已改为最多 HISTORY_LIMIT 条）
      previousThreeChecks: previousRecentChecks,
      checks: {
        similarityMax: checks.similarityMax,
        tileCountCheck: checks.tileCountDifferent ? "PASS" : "FAIL",
        layoutCheck: checks.layoutDifferent ? "PASS" : "FAIL",
        geometryCheck: checks.similarityDifferent && checks.geometrySignatureDifferent ? "PASS" : "FAIL",
        difficultyCheck: difficultyValid ? "PASS" : "FAIL",
        historyCheck: historySaved ? "PASS" : "FAIL"
      },
      attempts,
      retries: attempts - 1,
      validation: { ok: validation.ok, kinds: validation.kinds, total: validation.total, visible: validation.visible }
    };
    if (typeof game.installLevelData === "function") {
      var key = level <= 1 ? "l1" : "l2";
      game.profile[key] = difficultyId;
      game.installLevelData(data, meta);
    } else {
      throw new GenerationFailureError("game \u5B9E\u4F8B\u7F3A\u5C11 installLevelData", { reason: "BAD_GAME_INSTANCE" });
    }
    return {
      game,
      data,
      signature: sig,
      record,
      nextSave,
      meta,
      checks,
      attempts,
      retries: attempts - 1,
      failures,
      elapsedMs: Date.now() - t0
    };
  }
  throw new GenerationFailureError(
    "\u7B2C " + level + " \u5173\u8FDE\u7EED " + attempts + " \u6B21\u672A\u80FD\u751F\u6210\u6EE1\u8DB3\u300C\u6700\u8FD1\u4E09\u5C40\u724C\u6570 / \u5E03\u5C40\u7B7E\u540D / \u51E0\u4F55\u76F8\u4F3C\u5EA6\u300D\u7684\u5408\u6CD5\u724C\u5C40" + (configConflict ? "\uFF08\u914D\u7F6E\u51B2\u7A81\uFF1A\u73B0\u6709\u5408\u6CD5\u6863\u4F4D\u7684\u724C\u6570\u79CD\u7C7B\u4E0D\u8DB3\u4EE5\u6491\u8D77\u4E09\u5C40\u5DEE\u5F02\u5316\uFF0C\u672A\u4F2A\u9020\u724C\u6570\uFF09" : ""),
    {
      reason: configConflict ? "CONFIG_CONFLICT" : "MAX_ATTEMPTS_EXCEEDED",
      level,
      generationReason: reason,
      attempts,
      configConflict,
      legalDifficultyIds: legalRing,
      bannedTileCounts: bannedTiles,
      recent,
      previousTileCounts: prev.previousTileCounts,
      previousSignatures: prev.previousSignatures,
      failures
    }
  );
}

// core/shared/logo.js
function drawMascot(ctx, cx, cy, s = 1, t = 0) {
  const bob = Math.sin(t * 1.6) * 4;
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.scale(s, s);
  const halo = ctx.createRadialGradient(0, -30, 20, 0, -30, 180);
  halo.addColorStop(0, "rgba(255, 214, 128, 0.30)");
  halo.addColorStop(1, "rgba(255, 214, 128, 0)");
  ctx.fillStyle = halo;
  circle(ctx, 0, -30, 180);
  ctx.fill();
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(0, 140, 92, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const robe = ctx.createLinearGradient(0, 10, 0, 140);
  robe.addColorStop(0, "#C74A38");
  robe.addColorStop(1, "#8C2A21");
  ctx.fillStyle = robe;
  rr(ctx, -78, 6, 156, 126, 50);
  ctx.fill();
  ctx.strokeStyle = "rgba(233,196,106,0.9)";
  ctx.lineWidth = 4;
  rr(ctx, -70, 16, 140, 108, 42);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,235,190,0.8)";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-52, 20);
  ctx.quadraticCurveTo(-24, 44, 2, 72);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(52, 20);
  ctx.quadraticCurveTo(24, 44, 2, 72);
  ctx.stroke();
  ctx.save();
  ctx.translate(84, 34);
  ctx.rotate(0.22);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#B79A6D";
  rr(ctx, -22, -30, 44, 60, 7);
  ctx.fill();
  ctx.restore();
  const face = ctx.createLinearGradient(-22, -32, 22, 28);
  face.addColorStop(0, "#FFFCF2");
  face.addColorStop(1, "#E8D8B3");
  ctx.fillStyle = face;
  rr(ctx, -22, -34, 44, 58, 7);
  ctx.fill();
  ctx.strokeStyle = "#C9B189";
  ctx.lineWidth = 1.5;
  rr(ctx, -22, -34, 44, 58, 7);
  ctx.stroke();
  text(ctx, "\u4E2D", 0, -4, { size: 30, weight: "700", fill: "#B3392E" });
  ctx.fillStyle = "#FFE1BE";
  circle(ctx, -6, 30, 13);
  ctx.fill();
  circle(ctx, 12, 28, 12);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#FFE1BE";
  circle(ctx, -84, 46, 21);
  ctx.fill();
  ctx.strokeStyle = "#E8B98C";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#FFE1BE";
  circle(ctx, -74, -44, 13);
  ctx.fill();
  circle(ctx, 74, -44, 13);
  ctx.fill();
  const skin = ctx.createRadialGradient(-20, -78, 12, 0, -44, 92);
  skin.addColorStop(0, "#FFF0D8");
  skin.addColorStop(1, "#FFD9B0");
  ctx.fillStyle = skin;
  circle(ctx, 0, -46, 74);
  ctx.fill();
  ctx.strokeStyle = "rgba(224,168,122,0.85)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,138,138,0.45)";
  circle(ctx, -46, -24, 12);
  ctx.fill();
  circle(ctx, 46, -24, 12);
  ctx.fill();
  ctx.fillStyle = "#3A2A1E";
  circle(ctx, -26, -52, 9);
  ctx.fill();
  circle(ctx, 26, -52, 9);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  circle(ctx, -23, -55, 3.2);
  ctx.fill();
  circle(ctx, 29, -55, 3.2);
  ctx.fill();
  ctx.strokeStyle = "#8C4A32";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, -30, 15, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.stroke();
  const brim = ctx.createLinearGradient(0, -110, 0, -88);
  brim.addColorStop(0, "#F0D07C");
  brim.addColorStop(1, "#B58B3C");
  ctx.fillStyle = brim;
  rr(ctx, -88, -110, 176, 24, 12);
  ctx.fill();
  const crown = ctx.createLinearGradient(0, -170, 0, -104);
  crown.addColorStop(0, "#C0392B");
  crown.addColorStop(1, "#8C2A21");
  ctx.fillStyle = crown;
  rr(ctx, -64, -166, 128, 62, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(233,196,106,0.8)";
  ctx.lineWidth = 3;
  rr(ctx, -58, -160, 116, 50, 16);
  ctx.stroke();
  text(ctx, "\u798F", 0, -132, { size: 40, weight: "700", fill: "#F7E4B0" });
  ctx.fillStyle = "#E9C46A";
  circle(ctx, 0, -172, 11);
  ctx.fill();
  ctx.restore();
}
function drawTitle(ctx, cx, cy, size = 64) {
  const str3 = "Mah\u4E86\u4E2AMah";
  ctx.save();
  ctx.font = `800 ${size}px "Segoe UI", "Microsoft YaHei", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.lineWidth = size * 0.28;
  ctx.strokeStyle = "#5A2A18";
  ctx.strokeText(str3, cx, cy);
  ctx.restore();
  const g = ctx.createLinearGradient(0, cy - size, 0, cy + size);
  g.addColorStop(0, "#FFF3CE");
  g.addColorStop(0.5, "#E9C46A");
  g.addColorStop(1, "#C08A32");
  ctx.lineWidth = size * 0.2;
  ctx.strokeStyle = "#7A3B1E";
  ctx.strokeText(str3, cx, cy);
  ctx.fillStyle = g;
  ctx.fillText(str3, cx, cy);
  ctx.restore();
}

// core/shared/render.js
function getUI(game) {
  const buttons = [];
  const push = (id, x, y, w, h, label, extra = {}) => buttons.push(__spreadValues({ id, x, y, w, h, label, enabled: true }, extra));
  if (game.uninstallAsk) {
    push("uninstall-no", W / 2 - 150, 690, 300, 76, "\u77E5\u9053\u4E86", { kind: "primary", size: 28 });
    return { buttons };
  }
  if (game.settingsAsk) {
    push("set-sfx", 300, 500, 110, 52, game.soundOn ? "\u5F00" : "\u5173", {
      kind: game.soundOn ? "primary" : "ghost",
      size: 22
    });
    push("set-sfx-minus", 438, 500, 52, 52, "\u2212", { kind: "ghost", size: 28 });
    push("set-sfx-plus", 586, 500, 52, 52, "\uFF0B", { kind: "ghost", size: 24 });
    if (game.musicBuiltin || game.musicAvailable) {
      push("set-music", 300, 596, 110, 52, game.musicOn !== false ? "\u5F00" : "\u5173", {
        kind: game.musicOn !== false ? "primary" : "ghost",
        size: 22
      });
      push("set-music-minus", 438, 596, 52, 52, "\u2212", { kind: "ghost", size: 28 });
      push("set-music-plus", 586, 596, 52, 52, "\uFF0B", { kind: "ghost", size: 24 });
      if (game.musicAvailable) {
        push("music-open", W / 2 - 150, 668, 300, 56, "\u5BFC\u5165 / \u7BA1\u7406\u80CC\u666F\u97F3\u4E50\u2026", { kind: "ghost", size: 19 });
      }
    }
    push("settings-close", W / 2 - 130, 800, 260, 64, "\u5173\u95ED", { kind: "primary", size: 26 });
    return { buttons };
  }
  if (game.screen === "title") {
    push(
      "start",
      W / 2 - 150,
      880,
      300,
      86,
      game.graduated ? "\u5F00\u59CB\u65B0\u4E00\u8F6E" : "\u5F00\u59CB\u6E38\u620F",
      { kind: "primary", size: 32 }
    );
    push("settings", SETTINGS_BTN.x, SETTINGS_BTN.y, SETTINGS_BTN.w, SETTINGS_BTN.h, "", { kind: "icon" });
    push("sound", SOUND_BTN.x, SOUND_BTN.y, SOUND_BTN.w, SOUND_BTN.h, "", { kind: "icon" });
    push("uninstall", W / 2 - 120, 1e3, 240, 56, "\u5982\u4F55\u5378\u8F7D", {
      kind: "ghost",
      size: 18
    });
    return { buttons };
  }
  push("menu", MENU_BTN.x, MENU_BTN.y, MENU_BTN.w, MENU_BTN.h, "", { kind: "icon" });
  push("settings", SETTINGS_BTN.x, SETTINGS_BTN.y, SETTINGS_BTN.w, SETTINGS_BTN.h, "", { kind: "icon" });
  push("sound", SOUND_BTN.x, SOUND_BTN.y, SOUND_BTN.w, SOUND_BTN.h, "", {
    kind: "icon",
    withSound: true
  });
  push("shuffle", TOOL_XS[0] - TOOL_R, TOOL_Y - TOOL_R, TOOL_R * 2, TOOL_R * 2, "\u6D17\u724C", {
    kind: "tool",
    enabled: game.props.shuffle > 0 && game.status === "play",
    count: game.props.shuffle
  });
  push("undo", TOOL_XS[1] - TOOL_R, TOOL_Y - TOOL_R, TOOL_R * 2, TOOL_R * 2, "\u64A4\u9500", {
    kind: "tool",
    enabled: game.props.undo > 0 && game.history.length > 0 && game.status === "play",
    count: game.props.undo
  });
  push("remove", TOOL_XS[2] - TOOL_R, TOOL_Y - TOOL_R, TOOL_R * 2, TOOL_R * 2, "\u79FB\u51FA3\u5F20", {
    kind: "tool",
    enabled: game.props.remove > 0 && game.slot.length > 0 && game.status === "play",
    count: game.props.remove
  });
  if (game.status === "win") {
    if (game.graduated) {
      push("replay", W / 2 - 210, 700, 200, 76, "\u518D\u73A9\u4E00\u6B21", { kind: "primary", size: 26 });
      push("home", W / 2 + 10, 700, 200, 76, "\u56DE\u5230\u6807\u9898", { kind: "ghost", size: 24 });
    } else {
      push("next", 100, 700, 165, 76, "\u8FDB\u5165\u7B2C 2 \u5173", { kind: "primary", size: 22 });
      push("replay", 277, 700, 165, 76, "\u91CD\u73A9\u672C\u5173", { kind: "ghost", size: 22 });
      push("home", 454, 700, 165, 76, "\u56DE\u5230\u6807\u9898", { kind: "ghost", size: 22 });
    }
  } else if (game.status === "lose") {
    if (game.reviveLeft > 0) {
      push("revive", W / 2 - 210, 700, 200, 76, "\u590D\u6D3B", { kind: "primary", size: 28 });
      push("replay", W / 2 + 10, 700, 200, 76, "\u91CD\u5F00\u672C\u5173", { kind: "ghost", size: 22 });
    } else {
      push("replay", W / 2 - 100, 700, 200, 76, "\u91CD\u5F00\u672C\u5173", { kind: "primary", size: 24 });
    }
  }
  if (game.paused) {
    push("resume", W / 2 - 150, 548, 300, 74, "\u7EE7\u7EED\u6E38\u620F", { kind: "primary", size: 26 });
    push("restart", W / 2 - 150, 632, 300, 62, "\u91CD\u65B0\u5F00\u59CB\u672C\u5173", { kind: "ghost", size: 22 });
    push("home", W / 2 - 150, 704, 300, 62, "\u56DE\u5230\u6807\u9898", { kind: "ghost", size: 22 });
    push("uninstall", W / 2 - 150, 780, 300, 52, "\u5982\u4F55\u5378\u8F7D", {
      kind: "ghost",
      size: 18
    });
  }
  return { buttons };
}
function hitButton(ui, x, y) {
  for (const b of ui.buttons) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
  }
  return null;
}
function cardAt(game, x, y) {
  const temp = game.temp || [];
  for (let i = 0; i < temp.length; i++) {
    const tx = TEMP_ZONE.x + i * TEMP_ZONE.pitch;
    if (x >= tx && x <= tx + TILE_W && y >= TEMP_ZONE.y && y <= TEMP_ZONE.y + TILE_H) {
      return temp[i];
    }
  }
  const hits = [];
  for (let i = 0; i < game.cards.length; i++) {
    const c = game.cards[i];
    if (c.state !== "board") continue;
    if (x < c.x || x > c.x + TILE_W || y < c.y || y > c.y + TILE_H) continue;
    hits.push(c);
  }
  if (!hits.length) return null;
  hits.sort((a, b) => b.z - a.z || b.y - a.y || b.x - a.x);
  for (let i = 0; i < hits.length; i++) {
    if (!hits[i].blocked) return hits[i];
  }
  return null;
}
var bgCache = null;
var bgCacheDpr = 0;
function drawBackground(ctx, t) {
  const dpr = typeof ctx.getTransform === "function" ? ctx.getTransform().a || 1 : 1;
  if (!bgCache || bgCacheDpr !== dpr) {
    bgCache = bakeBackground(ctx, dpr);
    bgCacheDpr = dpr;
  }
  if (bgCache) {
    ctx.drawImage(bgCache, 0, 0, W, H);
  } else {
    ctx.fillStyle = C.bgMid;
    ctx.fillRect(0, 0, W, H);
  }
  const glow = ctx.createRadialGradient(W / 2, 90, 30, W / 2, 90, 520);
  glow.addColorStop(0, `rgba(255, 176, 92, ${0.06 + Math.sin(t * 0.6) * 0.012})`);
  glow.addColorStop(1, "rgba(255, 176, 92, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 520);
}
function bakeBackground(ctx, dpr) {
  const doc = ctx.canvas && ctx.canvas.ownerDocument;
  if (!doc || typeof doc.createElement !== "function") return null;
  const cv = doc.createElement("canvas");
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  const c = cv.getContext("2d");
  if (!c) return null;
  c.scale(dpr, dpr);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bgTop);
  g.addColorStop(0.48, C.bgMid);
  g.addColorStop(1, C.bgBot);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.save();
  c.lineWidth = 1.4;
  for (let i = 0; i < 58; i++) {
    const y0 = i * 22 + 6;
    c.strokeStyle = i % 2 ? "rgba(196, 158, 108, 0.10)" : "rgba(255, 255, 255, 0.42)";
    c.beginPath();
    for (let x = -10; x <= W + 10; x += 24) {
      const y = y0 + Math.sin(x * 0.012 + i * 0.7) * 5 + Math.sin(x * 0.031 + i * 1.7) * 2.2 + Math.sin(i * 2.3) * 4;
      if (x <= -10) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }
  c.restore();
  const spot = c.createRadialGradient(W / 2, 560, 60, W / 2, 560, 460);
  spot.addColorStop(0, "rgba(255, 255, 255, 0.55)");
  spot.addColorStop(0.6, "rgba(255, 255, 255, 0.20)");
  spot.addColorStop(1, "rgba(255, 255, 255, 0)");
  c.fillStyle = spot;
  c.fillRect(0, 60, W, 1e3);
  const vig = c.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 820);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(150, 110, 70, 0.16)");
  c.fillStyle = vig;
  c.fillRect(0, 0, W, H);
  return cv;
}
function iconMenu(ctx, cx, cy) {
  ctx.strokeStyle = C.text;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + i * 8);
    ctx.lineTo(cx + 10, cy + i * 8);
    ctx.stroke();
  }
}
function iconSound(ctx, cx, cy, on) {
  ctx.strokeStyle = C.text;
  ctx.fillStyle = C.text;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 11, cy - 6);
  ctx.lineTo(cx - 5, cy - 6);
  ctx.lineTo(cx + 2, cy - 13);
  ctx.lineTo(cx + 2, cy + 13);
  ctx.lineTo(cx - 5, cy + 6);
  ctx.lineTo(cx - 11, cy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  if (on) {
    ctx.arc(cx + 4, cy, 9, -0.8, 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 4, cy, 15, -0.8, 0.8);
    ctx.stroke();
  } else {
    ctx.moveTo(cx + 7, cy - 8);
    ctx.lineTo(cx + 19, cy + 8);
    ctx.moveTo(cx + 19, cy - 8);
    ctx.lineTo(cx + 7, cy + 8);
    ctx.stroke();
  }
}
function iconSettings(ctx, cx, cy) {
  ctx.strokeStyle = C.text;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9);
    ctx.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13);
    ctx.stroke();
  }
}
function roundIconButton(ctx, b, draw, dim = false) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const r = b.w / 2;
  ctx.save();
  ctx.globalAlpha = dim ? 0.4 : 1;
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  circle(ctx, cx, cy, r);
  ctx.fill();
  ctx.strokeStyle = "rgba(150, 112, 70, 0.38)";
  ctx.lineWidth = 1.5;
  circle(ctx, cx, cy, r - 0.75);
  ctx.stroke();
  draw(ctx, cx, cy);
  ctx.restore();
}
function drawIcons(ctx, game, ui) {
  for (const b of ui.buttons) {
    if (b.id === "menu") roundIconButton(ctx, b, iconMenu);
    if (b.id === "sound") roundIconButton(ctx, b, (c, x, y) => iconSound(c, x, y, game.soundOn));
    if (b.id === "settings") roundIconButton(ctx, b, iconSettings);
  }
}
var boardCache = null;
var boardCacheDisabled = false;
function drawBoard(ctx, game) {
  const now2 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const tileW = TILE_W;
  const tileH = TILE_H;
  const alive = [];
  for (const c of game.cards) {
    if (c.state !== "board") continue;
    if (c.x + tileW <= 0 || c.x >= W || c.y + tileH <= 0 || c.y >= H) continue;
    alive.push(c);
  }
  let animating = false;
  for (const c of alive) {
    if (c.appearAt && now2 - c.appearAt < 320) {
      animating = true;
      break;
    }
  }
  const m = typeof ctx.getTransform === "function" ? ctx.getTransform() : null;
  const k = m && m.a > 0 ? m.a : 1;
  if (animating || boardCacheDisabled) {
    boardCache = null;
    paintBoard(ctx, game, alive, now2);
    return;
  }
  let freeCount = 0;
  for (const c of alive) if (!c.blocked) freeCount++;
  const key = `${game.boardRev}|${k.toFixed(3)}|${tileW}|${tileH}|${alive.length}|${freeCount}`;
  if (!boardCache || boardCache.key !== key) {
    const c2 = ensureBoardCanvas(ctx, k);
    if (!c2) {
      boardCacheDisabled = true;
      paintBoard(ctx, game, alive, now2);
      return;
    }
    c2.ctx.clearRect(0, 0, W, H);
    paintBoard(c2.ctx, game, alive, now2);
    boardCache = { cv: c2.cv, key };
  }
  ctx.drawImage(boardCache.cv, 0, 0, W, H);
  for (const c of alive) {
    if (game.hoverId !== c.id || c.blocked) continue;
    drawTile(ctx, c.x, c.y, tileW, tileH, c.type, {
      dimLevel: 0,
      playable: true,
      lift: 2,
      glow: 0.85
    });
  }
}
function ensureBoardCanvas(ctx, k) {
  const doc = ctx.canvas && ctx.canvas.ownerDocument;
  if (!doc || typeof doc.createElement !== "function") return null;
  const cv = doc.createElement("canvas");
  cv.width = Math.round(W * k);
  cv.height = Math.round(H * k);
  const c2 = cv.getContext("2d");
  if (!c2) return null;
  c2.setTransform(k, 0, 0, k, 0, 0);
  return { cv, ctx: c2 };
}
function drawTableMat(ctx) {
  const b = BOARD_BAND;
  const x = b.left - 8;
  const y = b.top - 12;
  const w = b.right - b.left + 16;
  const h = b.bottom - b.top + 24;
  const rad = 28;
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "rgba(214, 240, 226, 0.90)");
  g.addColorStop(0.55, "rgba(226, 240, 250, 0.86)");
  g.addColorStop(1, "rgba(255, 246, 224, 0.90)");
  ctx.fillStyle = g;
  rr(ctx, x, y, w, h, rad);
  ctx.fill();
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rg = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.74);
  rg.addColorStop(0, "rgba(255, 255, 255, 0.55)");
  rg.addColorStop(1, "rgba(120, 90, 60, 0.12)");
  ctx.fillStyle = rg;
  rr(ctx, x, y, w, h, rad);
  ctx.fill();
  ctx.strokeStyle = "rgba(150, 112, 70, 0.30)";
  ctx.lineWidth = 1.5;
  rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, rad);
  ctx.stroke();
  ctx.restore();
}
function paintBoard(ctx, game, alive, now2) {
  const tileW = TILE_W;
  const tileH = TILE_H;
  alive.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  let maxLayer = 0;
  for (const c of alive) if (c.layer > maxLayer) maxLayer = c.layer;
  drawTableMat(ctx);
  if (alive.length) {
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const c of alive) {
      if (c.x < minX) minX = c.x;
      if (c.x + tileW > maxX) maxX = c.x + tileW;
      if (c.y + tileH > maxY) maxY = c.y + tileH;
    }
    const cx = (minX + maxX) / 2;
    const cy = maxY - 14;
    const rx = (maxX - minX) * 0.56;
    const sh = ctx.createRadialGradient(cx, cy, 10, cx, cy, rx);
    sh.addColorStop(0, "rgba(96, 66, 38, 0.32)");
    sh.addColorStop(0.65, "rgba(96, 66, 38, 0.12)");
    sh.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.17);
    ctx.fillStyle = sh;
    circle(ctx, 0, 0, rx);
    ctx.fill();
    ctx.restore();
  }
  for (const c of alive) {
    let scale = 1;
    let alpha = 1;
    if (c.appearAt) {
      const kk = clamp((now2 - c.appearAt) / 300, 0, 1);
      if (kk < 1) {
        scale = 0.72 + 0.28 * easeOutCubic(kk);
        alpha = 0.35 + 0.65 * kk;
      }
    }
    const dimLevel = c.blocked ? Math.max(1, maxLayer - c.layer) : 0;
    drawTile(ctx, c.x, c.y, tileW, tileH, c.type, {
      dimLevel,
      playable: !c.blocked,
      scale,
      alpha,
      /* 模板外廓段被上层牌压住时显示牌背，剥开后自动翻开。
       * 旧的固定四链盲盒队列已取消；这里只是完整布局里外廓塔群的遮挡表现，
       * 点击命中区域与可点判定完全由几何（z + 重叠面积）决定，与段名无关。 */
      back: c.seg === "outer" && c.blocked
    });
  }
}
function drawSlot(ctx, game, ui) {
  const sh = game.shake;
  const dx = sh > 0 ? Math.sin(game.time * 62) * sh * 7 : 0;
  ctx.save();
  ctx.translate(dx, 0);
  ctx.save();
  ctx.fillStyle = C.panel;
  rr(ctx, SLOT_PANEL.x, SLOT_PANEL.y, SLOT_PANEL.w, SLOT_PANEL.h, 24);
  ctx.fill();
  ctx.strokeStyle = game.slotFlash > 0.05 ? `rgba(255, 214, 138, ${0.25 + game.slotFlash * 0.6})` : C.panelLine;
  ctx.lineWidth = 1.6;
  rr(ctx, SLOT_PANEL.x + 0.8, SLOT_PANEL.y + 0.8, SLOT_PANEL.w - 1.6, SLOT_PANEL.h - 1.6, 23);
  ctx.stroke();
  ctx.restore();
  const innerX = SLOT_PANEL.x + 12;
  const innerY = SLOT_PANEL.y + 12;
  const innerW = SLOT_PANEL.w - 24;
  const innerH = SLOT_PANEL.h - 24;
  ctx.save();
  ctx.fillStyle = C.well;
  rr(ctx, innerX, innerY, innerW, innerH, 14);
  ctx.fill();
  ctx.strokeStyle = C.wellLine;
  ctx.lineWidth = 1;
  for (let i = 1; i < SLOT_SIZE; i++) {
    const x = innerX + i * SLOT_PITCH;
    ctx.beginPath();
    ctx.moveTo(x, innerY + 10);
    ctx.lineTo(x, innerY + innerH - 10);
    ctx.stroke();
  }
  ctx.restore();
  for (const c of game.slot) {
    const x = c.vx == null ? c.x : c.vx;
    const y = c.vy == null ? c.y : c.vy;
    const tScale = c.vScale || 1;
    drawTileShadow(ctx, x, y, SLOT_CARD_W, SLOT_CARD_H, 0.4, 0.2);
    drawTile(ctx, x, y, SLOT_CARD_W, SLOT_CARD_H, c.type, {
      covered: false,
      scale: tScale
    });
  }
  ctx.restore();
  const temp = game.temp || [];
  if (temp.length) {
    const w = TEMP_ZONE.max * TEMP_ZONE.pitch + 14;
    const x0 = TEMP_ZONE.x - 7;
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    rr(ctx, x0, TEMP_ZONE.y - 8, w, TILE_H + 16, 12);
    ctx.fill();
    ctx.strokeStyle = C.goldGhost;
    ctx.lineWidth = 1.2;
    rr(ctx, x0 + 0.6, TEMP_ZONE.y - 7.4, w - 1.2, TILE_H + 14.8, 11.4);
    ctx.stroke();
    ctx.restore();
    for (let i = 0; i < temp.length && i < TEMP_ZONE.max; i++) {
      const tx = TEMP_ZONE.x + i * TEMP_ZONE.pitch;
      drawTile(ctx, tx, TEMP_ZONE.y, TILE_W, TILE_H, temp[i].type, {
        covered: false,
        lift: game.hoverId === temp[i].id ? 2 : 0
      });
    }
    text(ctx, "\u4E34\u65F6\u533A \xB7 \u70B9\u51FB\u653E\u56DE\u69FD\u4F4D", W / 2, TEMP_ZONE.y + TILE_H + 18, {
      size: 15,
      fill: C.textDim,
      weight: "600"
    });
  }
  const free = SLOT_SIZE - game.slot.length;
  text(ctx, `\u7A7A\u4F4D ${free}`, W / 2, SLOT_PANEL.y + SLOT_PANEL.h - 10, {
    size: 15,
    fill: free <= 1 ? C.bad : C.textFaint,
    weight: "600"
  });
}
function drawButtons(ctx, ui, game) {
  for (const b of ui.buttons) {
    if (b.kind === "icon" || b.kind === "tool") continue;
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    ctx.save();
    const solid = b.kind === "primary" || b.kind === "danger";
    const danger = b.kind === "danger" || b.kind === "danger-ghost";
    if (solid) {
      const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
      g.addColorStop(0, b.enabled ? "#F5A24A" : "#D9CBB4");
      g.addColorStop(1, b.enabled ? "#DD5B3E" : "#B9A88E");
      ctx.fillStyle = g;
      rr(ctx, b.x, b.y, b.w, b.h, b.h / 2);
      ctx.shadowColor = "rgba(120, 80, 40, 0.28)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      ctx.fill();
      ctx.shadowColor = "rgba(0,0,0,0)";
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
      ctx.lineWidth = 1.8;
      rr(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 2, b.h / 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = danger ? "rgba(221, 91, 62, 0.10)" : "rgba(255,255,255,0.82)";
      rr(ctx, b.x, b.y, b.w, b.h, b.h / 2);
      ctx.fill();
      ctx.strokeStyle = danger ? "rgba(221, 91, 62, 0.72)" : "rgba(150, 112, 70, 0.42)";
      ctx.lineWidth = 1.6;
      rr(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 2, b.h / 2);
      ctx.stroke();
    }
    ctx.restore();
    text(ctx, b.label, cx, cy + 1, {
      size: b.size || 26,
      weight: "700",
      fill: solid ? "#FFFFFF" : danger ? C.coral : C.text
    });
  }
}
function drawTitleScreen(ctx, game, ui, t) {
  drawMascot(ctx, W / 2, 470, 1.35, t);
  drawTitle(ctx, W / 2, 700, 62);
  text(ctx, "\u5806\u53E0 \xB7 \u4E09\u6D88 \xB7 \u53EA\u6709\u4E24\u5173\uFF0C\u7B2C 2 \u5173\u662F\u9053\u574E", W / 2, 764, {
    size: 22,
    fill: C.textDim,
    weight: "600"
  });
  if (game.best >= LEVEL_COUNT) {
    text(ctx, "\u5DF2\u6BD5\u4E1A \xB7 \u4E24\u5173\u5168\u90E8\u901A\u5173", W / 2, 808, { size: 19, fill: C.gold, weight: "700" });
  } else if (game.best > 1) {
    text(ctx, "\u5DF2\u901A\u5173\u7B2C 1 \u5173 \xB7 \u5361\u5728\u7B2C 2 \u5173", W / 2, 808, { size: 19, fill: C.gold, weight: "700" });
  }
  if (!game.audioUnlocked) {
    const a = 0.5 + 0.4 * Math.sin((t || 0) / 420);
    text(ctx, "\u70B9\u51FB\u4EFB\u610F\u5904\u5F00\u542F\u97F3\u6548\u4E0E\u80CC\u666F\u97F3\u4E50", W / 2, 842, {
      size: 20,
      fill: C.gold,
      weight: "700",
      alpha: a
    });
  } else {
    text(
      ctx,
      game.musicBuiltin ? "\u80CC\u666F\u97F3\u4E50\u5DF2\u5185\u7F6E \xB7 \u6309\u573A\u666F\u81EA\u52A8\u5207\u6362" : "\u672C\u7248\u672C\u4EC5\u4FDD\u7559\u97F3\u6548 \xB7 \u65E0\u80CC\u666F\u97F3\u4E50",
      W / 2,
      842,
      { size: 17, fill: C.textFaint }
    );
  }
  if (!game.uninstallAsk && !game.settingsAsk) drawButtons(ctx, ui, game);
  drawIcons(ctx, game, ui);
  text(ctx, "\u70B9\u51FB\u672A\u88AB\u906E\u6321\u7684\u724C \u2192 \u6536\u5165\u5E95\u90E8\u69FD\u4F4D \u2192 \u4E09\u5F20\u76F8\u540C\u81EA\u52A8\u6D88\u9664", W / 2, 1090, {
    size: 17,
    fill: C.textFaint
  });
  text(ctx, "\u69FD\u4F4D 7 \u683C\uFF0C\u653E\u6EE1\u4E14\u65E0\u6CD5\u6D88\u9664\u5373\u5931\u8D25", W / 2, 1122, {
    size: 17,
    fill: C.textFaint
  });
}
function drawFx(ctx, game) {
  for (const p of game.fx) {
    const k = 1 - p.t / p.life;
    ctx.save();
    ctx.globalAlpha = Math.max(0, k);
    ctx.fillStyle = `hsl(${38 + k * 20}, 92%, ${58 + k * 22}%)`;
    circle(ctx, p.x, p.y, p.r * (0.4 + k));
    ctx.fill();
    ctx.restore();
  }
}
