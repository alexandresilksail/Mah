/** mah-core.js（core/shared 纯逻辑的 CJS bundle）的公开类型声明。 */
export interface TileType {
  id: string; name: string; short: string; family: string; icon: string;
  face: string; rim: string; ink: string; accent: string; index: number;
}
export interface Card {
  id: number; type: string; state: 'board' | 'slot' | 'temp' | 'cleared';
  layer: number; z: number; x: number; y: number; blocked: boolean;
  appearAt?: number; vx?: number | null; vy?: number | null; vScale?: number;
}
export interface GameSessionMeta {
  gameId: string; buildVersion: string; gitCommit: string; level: number;
  difficultyId: number; seed: number; totalTiles: number; tileTypeCount: number;
  templateId?: string | null; layoutSignature: string; generatedAt: string;
  generationReason: string; validation: any; [key: string]: any;
}
export interface LevelData {
  cards: Card[]; params: any; profileId: number; seed: number; templateId?: string;
  profile: any; specFillRot?: number; layers?: any[]; visible: number; mode: string;
  requireSolution?: boolean; solution: any;
}
export interface CreateNewGameResult {
  game: Game; data: LevelData; signature: any; record: any;
  nextSave: any; meta: GameSessionMeta; checks: any; attempts: number;
  failures: any[]; elapsedMs: number;
}

export class Game {
  constructor(audio?: any);
  audio: any; cards: Card[]; slot: Card[]; temp: Card[]; status: string;
  screen: string; level: number; best: number; graduated: boolean;
  profile: { l1: number; l2: number }; seed: number; meta: GameSessionMeta | null;
  templateId: string | null; layoutProfile: any; saveState: any;
  props: { shuffle: number; undo: number; remove: number };
  history: any[];
  reviveLeft: number; clock: number; pendingMatch: any; resolving: boolean;
  fx: any[]; shake: number; slotFlash: number; levelStartAt: number;
  installLevelData(data: LevelData, meta?: any, opt?: any): void;
  startLevel(level: number, seed?: number, templateId?: string): void;
  restartLevel(rand?: () => number, templateId?: string): void;
  canPick(card: Card): boolean;
  pick(card: Card): boolean;
  returnFromTemp(card: Card): boolean;
  queueResolve(): void;
  flushResolve(): boolean;
  resolve(): boolean;
  tick(dt: number): void;
  remaining(): number;
  boardCount(): number;
  progress(): number;
  refresh(withIntro?: boolean): Card[];
  useShuffle(): boolean;
  useUndo(): boolean;
  useRemove(): boolean;
  useRevive(): boolean;
  slotCardPos(index: number): { x: number; y: number };
}

export function createNewGame(opts: {
  level: number; generationReason: string; game: Game; save?: any;
  rand?: () => number; maxAttempts?: number; currentDifficulty?: number;
  [key: string]: any;
}): CreateNewGameResult;

export function generateLevel(level: number, seed?: number, opt?: any): LevelData;
export function validateLevel(data: LevelData): { ok: boolean; issues: string[]; [key: string]: any };
export function verify(data: LevelData): boolean;
export function refreshBlocked(cards: Card[]): Card[];
export function isCovered(card: Card, alive: Card[]): boolean;

export const TILE_TYPES: TileType[];
export const TYPE_IDS: string[];
export const TYPE_BY_ID: { [id: string]: TileType };
export const TYPE_COUNT: number;
export function tileType(id: string): TileType | null;
export function validateRegistry(): { ok: boolean; issues: string[]; count: number };
export function mixFor(level: number, profile?: any): number[];

export const W: number;
export const H: number;
export const TILE_W: number;
export const TILE_H: number;
export const SLOT_CAPACITY: number;
export const OVERLAP_THRESHOLD: number;
export const MATCH_DELAY_MS: number;
export const SLOT_X0: number;
export const SLOT_Y: number;
export const SLOT_PITCH: number;
export const SLOT_CARD_W: number;
export const SLOT_CARD_H: number;
/** 移出道具的临时区几何：牌按 index*pitch 排在 x 起，点击牌可放回槽位 */
export const TEMP_ZONE: { x: number; y: number; pitch: number; max: number };
export const C: { [key: string]: string };

export const L2_TEMPLATES: any[];
export const L2_TEMPLATE_IDS: string[];
export function templateById(id: string): any;
export function templateSummary(t: any): any;
export const MASK_COLS: number;
export const MASK_ROWS: number;

export function specFor(templateId: string): any;
export function generateTemplateLayout(seed: number, profile: any, templateId: string): LevelData;
export function verifyTemplateFidelity(cards: Card[], templateId: string, profile: any, fillRot?: number): any;
export function calculateLayoutSignature(data: LevelData): any;
export function layoutSimilarity(a: Card[], b: Card[]): number;
export const SIMILARITY_THRESHOLD: number;

export function checkL2DualDedup(recent: any, candidate: any): any;
export function usedTemplateIds(recent: any): string[];
export function availableTemplateIds(recent: any): string[];

export function makeRng(seed: number): any;
export function randomSeed(): number;
export function pickPoolSeed(level: number, difficultyId: number, rand?: () => number): number;
export function sha256Hex(s: string): string;
export function historyFor(save: any, level: number): any[];
export function sanitizeHistory(raw: any, level: number): any[];
export function appendHistory(save: any, level: number, record: any): any;
export function makeSaveData(game: any): any;

/** 牌面 Canvas 绘制：ctx 需为 Canvas 2D 上下文 */
export function drawTile(
  ctx: any, x: number, y: number, w: number, h: number, typeId: string,
  opt?: { alpha?: number; scale?: number; lift?: number; glow?: number; dimLevel?: number; playable?: boolean; selected?: boolean; covered?: boolean; back?: boolean }
): void;
export function drawTileShadow(ctx: any, x: number, y: number, w: number, h: number, alpha?: number, depth?: number): void;
export function clearTileCache(): void;
export function rr(ctx: any, x: number, y: number, w: number, h: number, r: number): void;
export function circle(ctx: any, cx: number, cy: number, r: number): void;
export function text(ctx: any, str: string, x: number, y: number, o?: any): void;
export function clamp(v: number, a: number, b: number): number;
export function lerp(a: number, b: number, t: number): number;
export function overlapRatio(a: any, b: any): number;

/** 原版整页绘制（画面保真）：牌区主体直接复用原桌面版实现 */
export function drawBackground(ctx: any, t: number): void;
export function drawBoard(ctx: any, game: Game): void;
export function drawSlot(ctx: any, game: Game, ui: any): void;
export function drawFx(ctx: any, game: Game): void;
export function getUI(game: Game): { buttons: any[] };
export function hitButton(ui: any, x: number, y: number): any;
export function cardAt(game: Game, x: number, y: number): Card | null;
export function drawTitleScreen(ctx: any, game: Game, ui: any, t: number): void;
export function drawMascot(ctx: any, x: number, y: number, scale?: number): void;
export function drawTitle(ctx: any, x: number, y: number): void;
