/**
 * MAH 小程序 — 核心门面（core facade）
 * ------------------------------------------------------------------
 * 这里把从原桌面版字节级复用的纯逻辑模块（core/shared/*，零 DOM / 零 Canvas）
 * 统一聚合导出，作为微信端唯一的核心入口。
 *
 * 设计原则：
 *  · 规则层（Game / createNewGame / generator / l2_* / tile_types / layout）原样复用，
 *    绝不重新实现游戏规则；
 *  · 平台层（渲染 / 触摸 / 音频 / 存储）由微信端独立实现，不进入本文件；
 *  · 本文件由 esbuild 打包为 core/mah-core.js（CommonJS，供小程序 require）。
 */
export { Game, slotInsert, slotMatchTypes, resolveSlot, isCovered, slotTargetX } from './shared/engine.js';
export { createNewGame, GenerationFailureError, HISTORY_LIMIT, L2_HISTORY_LIMIT } from './shared/new_game.js';
export {
  generateLevel, validateLevel, verify, refreshBlocked,
  isCovered as generatorIsCovered, SOLVE_BUDGET, RESHUFFLE_MAX,
} from './shared/generator.js';
export {
  TILE_TYPES, TYPE_IDS, TYPE_BY_ID, TYPE_COUNT, tileType, validateRegistry, mixFor,
} from './shared/tile_types.js';
export {
  W, H, TILE_W, TILE_H, SLOT_CAPACITY, OVERLAP_THRESHOLD, MATCH_DELAY_MS,
  BOARD_BAND, LAYER_OFFSETS, LEVEL_SPEC, LEVEL_MIX, LEVEL2_PROFILES, LEVEL1_PROFILES,
  profilesFor, profileFor, rollProfile, levelParams, clampDifficulty, C, VERSION,
  SLOT_PITCH, SLOT_PANEL, SLOT_X0, SLOT_Y, SLOT_CARD_W, SLOT_CARD_H, TEMP_ZONE,
  LAYOUTS, layoutFor,
} from './shared/config.js';
export {
  L2_TEMPLATES, L2_TEMPLATE_IDS, templateById, templateSummary, templateCategoryStats,
  MASK_COLS, MASK_ROWS, OUTER_TILE_COUNT,
} from './shared/l2_templates.js';
export { specFor, specSummary, SPEC_ALGORITHM } from './shared/l2_spec.js';
export {
  generateTemplateLayout, verifyTemplateFidelity, templateCandidateStats, describeTemplateLayout,
} from './shared/l2_geometry.js';
export { calculateStructureSignature, canonicalGeometrySignature, structureSimilarity } from './shared/l2_structure.js';
export { calculateLayoutSignature, layoutSimilarity, SIMILARITY_THRESHOLD, layoutShape } from './shared/layout_signature.js';
export {
  usedTemplateIds, availableTemplateIds, checkL2DualDedup, L2_DEDUP_ALGORITHM,
} from './shared/l2_recent.js';
export { makeRng, randomSeed } from './shared/rng.js';
export { pickPoolSeed } from './shared/seed_pool.js';
export { sha256Hex } from './shared/sha256.js';
export { hasSupport, buildBlockerGraph, overlapArea, peelOrder } from './shared/layout.js';
export { generateProfileLayout } from './shared/layout_profiles.js';
export {
  historyFor, sanitizeHistory, sanitizeRecord, appendHistory, previousFrom,
  historyLimitFor, makeGameId, checkAgainstRecent, GENERATION_REASONS,
} from './shared/recent_games.js';
// 牌面 Canvas 绘制（原创路径）：微信 Canvas 2D 传入 ctx 即可，离屏缓存会自动降级为直绘
export { drawTile, drawTileShadow, clearTileCache, getType, TYPE_LIST, SUITS_L1, SUITS_L2 } from './shared/tiles.js';
export { rr, circle, text, clamp, lerp, overlapRatio, easeOutCubic } from './shared/draw.js';
// 原版整页绘制（画面保真）：牌区主体直接复用，微信端仅替换 HUD/按钮为原生 WXML
export {
  drawBackground, drawBoard, drawSlot, drawFx,
  getUI, hitButton, cardAt, drawTitleScreen,
} from './shared/render.js';
export { drawMascot, drawTitle } from './shared/logo.js';
