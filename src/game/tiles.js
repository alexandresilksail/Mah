/**
 * 传统麻将牌面（Canvas 2D 路径 + 系统字体，无任何外部图片 / 字体 / 数字标签）。
 *
 * ── 第 3 轮牌面规格 ────────────────────────────────────────────────
 * · 删除万子与 TYPE_LIST.slice(0, types)：两关各用一张显式的花色清单，
 *   第 2 关 15 种、第 1 关 8 种；风牌只取 東 / 南 两种，避免黑字雷同。
 * · 牌面不出现阿拉伯数字，也不出现任何额外文字标签；筒/条靠图形计数，
 *   字牌本身就是汉字（不是标签）。
 * · 一条 = 幺鸡：侧身站立、朝左、站在一截横向竹节上；
 *   身体深绿渐变、翅膀蓝绿羽纹、圆头红冠黄喙黑眼白环、
 *   尾羽向上弯 3~5 根（绿带红尖）、双腿红色。归一化坐标 -1~1。
 * · 其余：字牌 東/南 黑、中 红、發 绿、白 为蓝色空框；
 *   筒子为红 / 绿 / 蓝同心圆环；条子为绿色竹节加红点，按传统排布。
 *
 * ── 着色（第 3 轮）────────────────────────────────────────────────
 * · 被压住的牌：整牌叠加 rgba(0,0,0,0.45)，压深每多一层 +0.05，上限 0.62。
 * · 可点牌保持原亮度，并加一圈浅色描边，让「可点 / 不可点」一眼可辨。
 * · 只是着色，不缩放：牌尺寸与强投影 rgba(0,0,0,0.5)/blur 8/offsetY 5 不变。
 * · 离屏缓存键包含压暗等级与是否可点。
 */
import { rr, circle, text } from './draw.js';

/* ---------------- 花色清单（显式，不再 slice） ---------------- */

/** 第 2 关 15 种：条 5 / 字 5 / 筒 5，风牌只取 東、南 两种 */
export const SUITS_L2 = [
  'yaoji', 'zi-zhong', 'zi-fa', 'zi-bai', 'zi-dong', 'zi-nan',
  'tong-1', 'tong-2', 'tong-3', 'tong-5', 'tong-8',
  'tiao-2', 'tiao-3', 'tiao-5', 'tiao-9',
];

/** 第 1 关 8 种：条 2 / 字 4 / 筒 2，至少来自 3 个类别 */
export const SUITS_L1 = [
  'yaoji', 'zi-zhong', 'zi-fa', 'zi-bai', 'zi-dong',
  'tong-1', 'tong-5', 'tiao-2',
];

export function suitsFor(level) {
  return (level <= 1 ? SUITS_L1 : SUITS_L2).slice();
}

/** 15 种牌型描述（kind 决定画法；num 用于筒 / 条的传统排布） */
export const TYPE_LIST = [
  { id: 'yaoji', kind: 'yaoji', label: '幺鸡' },
  { id: 'zi-zhong', kind: 'zi', ch: '中' },
  { id: 'zi-fa', kind: 'zi', ch: '發' },
  { id: 'zi-bai', kind: 'zi', ch: '白' },
  { id: 'zi-dong', kind: 'zi', ch: '東' },
  { id: 'zi-nan', kind: 'zi', ch: '南' },
  { id: 'tong-1', kind: 'tong', num: 1 },
  { id: 'tong-2', kind: 'tong', num: 2 },
  { id: 'tong-3', kind: 'tong', num: 3 },
  { id: 'tong-5', kind: 'tong', num: 5 },
  { id: 'tong-8', kind: 'tong', num: 8 },
  { id: 'tiao-2', kind: 'tiao', num: 2 },
  { id: 'tiao-3', kind: 'tiao', num: 3 },
  { id: 'tiao-5', kind: 'tiao', num: 5 },
  { id: 'tiao-9', kind: 'tiao', num: 9 },
];

export const TYPE_MAP = {};
for (let i = 0; i < TYPE_LIST.length; i++) TYPE_MAP[TYPE_LIST[i].id] = TYPE_LIST[i];

export function getType(id) {
  return TYPE_MAP[id];
}

/* ---------------- 调色板 ---------------- */

const FACE = '#FFFDF5';
const RIM = '#2A6B2E';
const BORDER = '#2E7D32';
const RED = '#C0392B';
const RED_LIGHT = '#D95746';
const GREEN = '#2E7D32';
const GREEN_LIGHT = '#7BB661';
const GREEN_DEEP = '#1E5A22';
const BLUE_DARK = '#173F6B';
const BLUE_LIGHT = '#5B8DBE';
const BLACK = '#20261F';

const ROUND_FONT =
  '"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Segoe UI", system-ui, sans-serif';

/* ---------------- 传统排列（归一化 -1~1） ---------------- */

const TONG_POS = {
  1: [[0, 0]],
  2: [[0, -0.46], [0, 0.46]],
  3: [[-0.5, -0.5], [0, 0], [0.5, 0.5]],
  5: [[-0.48, -0.48], [0.48, -0.48], [0, 0], [-0.48, 0.48], [0.48, 0.48]],
  8: [[-0.4, -0.62], [0.4, -0.62], [-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2], [-0.4, 0.62], [0.4, 0.62]],
};

const TIAO_POS = {
  2: [[0, -0.44], [0, 0.44]],
  3: [[0, -0.52], [-0.46, 0.4], [0.46, 0.4]],
  5: [[-0.5, -0.5], [0.5, -0.5], [0, 0], [-0.5, 0.5], [0.5, 0.5]],
  9: [[-0.55, -0.52], [0, -0.52], [0.55, -0.52], [-0.55, 0], [0, 0], [0.55, 0], [-0.55, 0.52], [0, 0.52], [0.55, 0.52]],
};

/* ---------------- 单牌绘制 ---------------- */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x,y,w,h 只从 config 的 TILE_W / TILE_H 传入
 * @param {string} typeId
 * @param {{alpha?,scale?,lift?,glow?,dimLevel?,playable?,covered?}} opt
 *   dimLevel 0 = 可点（亮），≥1 = 被压：0.45 + 0.05·(dimLevel-1)，上限 0.62
 *   playable  = 可点牌加浅色描边
 */
export function drawTile(ctx, x, y, w, h, typeId, opt = {}) {
  const { alpha = 1, scale = 1, lift = 0, glow = 0 } = opt;
  const type = TYPE_MAP[typeId];
  if (!type) return;
  const dimLevel = opt.dimLevel === undefined ? (opt.covered ? 1 : 0) : opt.dimLevel;
  const playable = !!opt.playable && dimLevel === 0;
  const dimAlpha = dimLevel > 0 ? Math.min(0.62, 0.45 + 0.05 * (dimLevel - 1)) : 0;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (scale !== 1 || lift !== 0) {
    const mx = x + w / 2;
    const my = y + h / 2;
    ctx.translate(mx, my - lift);
    ctx.scale(scale, scale);
    ctx.translate(-mx, -my);
  }

  // 强投影：绘制完立即 restore 重置，绝不让 shadow 泄漏到 HUD / 槽位 / 后续牌
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = SHADOW_BLUR;
  ctx.shadowOffsetX = SHADOW_DX;
  ctx.shadowOffsetY = SHADOW_DY;
  const sprite = spriteFor(ctx, typeId, w, h, dimLevel, playable);
  if (sprite) ctx.drawImage(sprite, x, y, w, h);
  else paintTile(ctx, x, y, w, h, type, dimAlpha, playable);
  ctx.restore();

  if (glow > 0) {
    ctx.save();
    ctx.globalAlpha *= Math.min(1, glow + 0.2);
    const rad = w * 0.14;
    ctx.save();
    ctx.shadowColor = 'rgba(255, 208, 120, 0.95)';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#FFE6A6';
    ctx.lineWidth = 3;
    rr(ctx, x - 1, y - 1, w + 2, h - 1, rad + 2);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 234, 172, 0.45)';
    ctx.lineWidth = 2;
    rr(ctx, x - 5, y - 5, w + 10, h + 8, rad + 6);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** 投影离屏位图（与规范 rgba(0,0,0,0.5)/blur 8/offsetY 5 视觉一致） */
export function drawTileShadow(ctx, x, y, w, h, alpha = 0.55, depth = 0) {
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
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = '#000';
    rr(ctx, x + SHADOW_DX, y + SHADOW_DY, w, h, w * 0.14);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------------- 离屏缓存（键含压暗等级 / 可点描边） ---------------- */

const SPRITE_DPR = 2;
const spriteCache = new Map();
const shadowCache = new Map();
let spriteDisabled = false;

const SHADOW_BLUR = 8;
const SHADOW_DX = 0;
const SHADOW_DY = 5;

function spriteFor(ctx, typeId, w, h, dimLevel, playable) {
  if (spriteDisabled) return null;
  const dimAlpha = dimLevel > 0 ? Math.min(0.62, 0.45 + 0.05 * (dimLevel - 1)) : 0;
  const key = `${typeId}|${w.toFixed(1)}|${h.toFixed(1)}|d${dimAlpha.toFixed(2)}|p${playable ? 1 : 0}`;
  const hit = spriteCache.get(key);
  if (hit) return hit;
  const c2 = offscreen(ctx, w, h);
  if (!c2) return null;
  paintTile(c2, 0, 0, w, h, TYPE_MAP[typeId], dimAlpha, playable);
  if (spriteCache.size > 300) spriteCache.clear();
  spriteCache.set(key, c2.canvas);
  return c2.canvas;
}

function shadowPad(w) {
  return Math.max(20, Math.round(w * 0.3));
}

function shadowSprite(ctx, w, h) {
  if (spriteDisabled) return null;
  const key = `${w.toFixed(1)}|${h.toFixed(1)}`;
  const hit = shadowCache.get(key);
  if (hit) return hit;
  const pad = shadowPad(w);
  const c2 = offscreen(ctx, w + pad * 2, h + pad * 2);
  if (!c2) return null;
  const rad = w * 0.14;
  const hasFilter = typeof c2.filter === 'string';
  c2.save();
  if (hasFilter) c2.filter = 'blur(1.8px)';
  c2.globalAlpha = 0.55;
  c2.fillStyle = '#000';
  rr(c2, pad + SHADOW_DX - 2, pad + SHADOW_DY - 2, w, h, rad);
  c2.fill();
  c2.restore();
  c2.save();
  if (hasFilter) c2.filter = `blur(${SHADOW_BLUR}px)`;
  c2.globalAlpha = 0.5;
  c2.fillStyle = '#000';
  rr(c2, pad + SHADOW_DX, pad + SHADOW_DY, w, h, rad);
  c2.fill();
  c2.restore();
  if (shadowCache.size > 16) shadowCache.clear();
  shadowCache.set(key, c2.canvas);
  return c2.canvas;
}

function offscreen(ctx, w, h) {
  const doc = ctx.canvas && ctx.canvas.ownerDocument;
  if (!doc || typeof doc.createElement !== 'function') { spriteDisabled = true; return null; }
  const cv = doc.createElement('canvas');
  cv.width = Math.max(1, Math.round(w * SPRITE_DPR));
  cv.height = Math.max(1, Math.round(h * SPRITE_DPR));
  const c2 = cv.getContext('2d');
  if (!c2) { spriteDisabled = true; return null; }
  c2.scale(SPRITE_DPR, SPRITE_DPR);
  return c2;
}

export function clearTileCache() {
  spriteCache.clear();
  shadowCache.clear();
}

/* ---------------- 牌体 ---------------- */

function paintTile(ctx, x, y, w, h, type, dimAlpha, playable) {
  const rad = w * 0.14;
  const thick = Math.max(4, Math.round(h * 0.06));
  const fh = h - thick;
  ctx.save();

  ctx.fillStyle = RIM;
  rr(ctx, x, y + thick, w, fh, rad);
  ctx.fill();

  ctx.fillStyle = FACE;
  rr(ctx, x, y, w, fh, rad);
  ctx.fill();

  ctx.strokeStyle = 'rgba(150,146,132,0.6)';
  ctx.lineWidth = 1;
  rr(ctx, x + 0.5, y + 0.5, w - 1, fh - 1, rad);
  ctx.stroke();

  const bw = Math.max(2, w * 0.022);
  const inset = bw / 2 + 1.2;
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = bw;
  rr(ctx, x + inset, y + inset, w - inset * 2, fh - inset * 2, Math.max(2, rad - inset * 0.6));
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.1;
  const in2 = inset + bw / 2 + 1.1;
  rr(ctx, x + in2, y + in2, w - in2 * 2, fh - in2 * 2, Math.max(1.5, rad - in2 * 0.6));
  ctx.stroke();

  const pad = in2 + 2.5;
  drawFace(ctx, type, x + pad, y + pad, w - pad * 2, fh - pad * 2);

  // 整牌压暗（不是缩放，也不改尺寸）：绿边框一起变暗，层级靠明暗区分
  if (dimAlpha > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
    rr(ctx, x + bw * 0.5, y + bw * 0.5, w - bw, h - bw, rad);
    ctx.fill();
  }
  // 可点牌：一圈浅色描边，与压暗牌一眼可分
  if (playable) {
    ctx.strokeStyle = 'rgba(255, 246, 214, 0.92)';
    ctx.lineWidth = 1.7;
    rr(ctx, x + 2.2, y + 2.2, w - 4.4, h - 4.4, rad - 1);
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------------- 图案区域（正方形，不变形） ---------------- */

function faceBox(x, y, w, fh) {
  const side = Math.min(w * 0.78, fh * 0.82);
  return { cx: x + w / 2, cy: y + fh / 2, w: side, h: side, left: x + w / 2 - side / 2, top: y + fh / 2 - side / 2 };
}

function drawFace(ctx, type, x, y, w, fh) {
  const box = faceBox(x, y, w, fh);
  const local = { cx: 0, cy: 0, w: box.w, h: box.h, left: -box.w / 2, top: -box.h / 2 };
  ctx.save();
  ctx.translate(box.cx, box.cy);
  if (type.kind === 'yaoji') {
    // 幺鸡外接框 ≤ 牌宽 65% × 牌高 70%（这里取正方形，宽约 60%、高约 45%）
    const side = Math.min(box.w * 0.92, 42.9, 61.6);
    drawYaoji(ctx, { cx: 0, cy: 0, w: side, h: side });
  } else if (type.kind === 'tiao') drawTiao(ctx, type, local);
  else if (type.kind === 'tong') drawTong(ctx, type, local);
  else drawHonor(ctx, type, local);
  ctx.restore();
}

function layout(box, pos) {
  const pts = pos.map(([u, v]) => [box.cx + (u * box.w) / 2, box.cy + (v * box.h) / 2]);
  let dmin = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d < dmin) dmin = d;
    }
  }
  if (!Number.isFinite(dmin)) dmin = Math.min(box.w, box.h) * 0.9;
  return { pts, dmin };
}

/* ---------------- 幺鸡（一条）：归一化路径 -1~1 ---------------- */

/**
 * 侧身站立、朝左的小鸟，站在一截横向竹节上。
 * @param {{cx:number,cy:number,w:number,h:number}} box 归一化框（图案必须落在框内）
 */
export function drawYaoji(ctx, box) {
  const X = (u) => box.cx + (u * box.w) / 2;
  const Y = (v) => box.cy + (v * box.h) / 2;
  const S = Math.min(box.w, box.h) / 2;
  ctx.save();

  // 1) 横向竹节（棕色托底 + 两道绿节）
  ctx.fillStyle = '#8A6A3A';
  rr(ctx, X(-0.92), Y(0.66), box.w * 0.92, S * 0.15, S * 0.07);
  ctx.fill();
  ctx.strokeStyle = GREEN_DEEP;
  ctx.lineWidth = Math.max(1, S * 0.045);
  for (const u of [-0.5, 0.06, 0.58]) {
    ctx.beginPath();
    ctx.moveTo(X(u), Y(0.63));
    ctx.lineTo(X(u), Y(0.78));
    ctx.stroke();
  }

  // 2) 双腿（红色），从身体下方伸到竹节
  ctx.strokeStyle = RED;
  ctx.lineWidth = Math.max(1.4, S * 0.09);
  ctx.lineCap = 'round';
  for (const u of [-0.12, 0.2]) {
    ctx.beginPath();
    ctx.moveTo(X(u), Y(0.28));
    ctx.lineTo(X(u + 0.02), Y(0.68));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(X(u + 0.02), Y(0.68));
    ctx.lineTo(X(u - 0.1), Y(0.68));
    ctx.moveTo(X(u + 0.02), Y(0.68));
    ctx.lineTo(X(u + 0.13), Y(0.68));
    ctx.stroke();
  }

  // 3) 尾羽：向上弯 4 根，绿色带红尖
  const tails = [
    [-0.02, -0.72, 0.42, -0.98],
    [0.12, -0.68, 0.58, -0.86],
    [0.24, -0.62, 0.68, -0.68],
    [0.34, -0.5, 0.76, -0.44],
  ];
  for (let i = 0; i < tails.length; i++) {
    const [x0, y0, x1, y1] = tails[i];
    ctx.strokeStyle = i % 2 ? GREEN_DEEP : GREEN;
    ctx.lineWidth = Math.max(1.4, S * 0.11);
    ctx.beginPath();
    ctx.moveTo(X(0.22), Y(0.16));
    ctx.quadraticCurveTo(X(x0 + 0.2), Y(y0 - 0.12), X(x1), Y(y1));
    ctx.stroke();
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(X(x1), Y(y1), Math.max(1.2, S * 0.075), 0, Math.PI * 2);
    ctx.fill();
  }

  // 4) 身体：深绿渐变椭圆（侧身、略倾斜）
  const grad = ctx.createLinearGradient(X(-0.5), Y(-0.3), X(0.45), Y(0.45));
  grad.addColorStop(0, '#1E5A22');
  grad.addColorStop(0.55, '#2E7D32');
  grad.addColorStop(1, '#4E9E52');
  ctx.save();
  ctx.translate(X(0.04), Y(0.02));
  ctx.rotate(-0.32);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, S * 0.46, S * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5) 翅膀：蓝绿羽纹（小椭圆 + 3 道弧线）
  ctx.save();
  ctx.translate(X(0.16), Y(0.02));
  ctx.rotate(-0.42);
  ctx.fillStyle = '#2E8B8B';
  ctx.beginPath();
  ctx.ellipse(0, 0, S * 0.28, S * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8FD3D0';
  ctx.lineWidth = Math.max(0.8, S * 0.045);
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.arc(-S * 0.06, S * (0.02 + k * 0.11), S * 0.22, 0.15, 1.55);
    ctx.stroke();
  }
  ctx.restore();

  // 6) 圆头
  ctx.fillStyle = GREEN_DEEP;
  ctx.beginPath();
  ctx.arc(X(-0.3), Y(-0.44), S * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // 7) 红色鸡冠（头顶三瓣）
  ctx.fillStyle = RED;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.arc(X(-0.44 + k * 0.13), Y(-0.68 - (k === 1 ? 0.07 : 0)), S * 0.085, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8) 黄色短喙（朝左）
  ctx.fillStyle = '#F2C14E';
  ctx.beginPath();
  ctx.moveTo(X(-0.5), Y(-0.42));
  ctx.lineTo(X(-0.78), Y(-0.34));
  ctx.lineTo(X(-0.5), Y(-0.28));
  ctx.closePath();
  ctx.fill();

  // 9) 黑眼 + 白环
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(X(-0.36), Y(-0.48), S * 0.105, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#101510';
  ctx.beginPath();
  ctx.arc(X(-0.38), Y(-0.48), S * 0.058, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ---------------- 筒 / 条 / 字 ---------------- */

/** 筒：红 / 绿 / 蓝同心圆环 */
function drawTong(ctx, type, box) {
  const pos = TONG_POS[type.num] || TONG_POS[1];
  const { pts, dmin } = layout(box, pos);
  const r = Math.min(dmin * 0.46, Math.min(box.w, box.h) * 0.42);
  for (let i = 0; i < pts.length; i++) ring(ctx, pts[i][0], pts[i][1], r);
}

function ring(ctx, cx, cy, r) {
  ctx.fillStyle = RED;
  circle(ctx, cx, cy, r);
  ctx.fill();
  ctx.fillStyle = GREEN;
  circle(ctx, cx, cy, r * 0.72);
  ctx.fill();
  ctx.fillStyle = BLUE_DARK;
  circle(ctx, cx, cy, r * 0.46);
  ctx.fill();
  ctx.fillStyle = BLUE_LIGHT;
  circle(ctx, cx, cy, r * 0.26);
  ctx.fill();
  ctx.strokeStyle = RED_LIGHT;
  ctx.lineWidth = Math.max(0.8, r * 0.1);
  circle(ctx, cx, cy, r * 0.86);
  ctx.stroke();
}

/** 条：绿色竹节 + 红点 */
function drawTiao(ctx, type, box) {
  const pos = TIAO_POS[type.num] || TIAO_POS[2];
  const { pts, dmin } = layout(box, pos);
  const swCap = box.w * 0.3;
  const sw = Math.min(dmin * 0.46, swCap, box.w * 0.28);
  const sh = Math.min(sw * 2.35, box.h * 0.86);
  for (let i = 0; i < pts.length; i++) bamboo(ctx, pts[i][0], pts[i][1], sw, sh);
}

function bamboo(ctx, cx, cy, w, h) {
  const bw = Math.max(3, w);
  const bh = Math.max(8, h);
  const r = Math.min(bw, bh) * 0.34;
  const top = cy - bh / 2;
  ctx.fillStyle = GREEN;
  rr(ctx, cx - bw / 2, top, bw, bh, r);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.24)';
  rr(ctx, cx - bw * 0.26, top + bh * 0.22, bw * 0.15, bh * 0.4, bw * 0.075);
  ctx.fill();
  // 竹节 + 红点
  const dotR = Math.max(1.2, bw * 0.42);
  ctx.fillStyle = RED;
  circle(ctx, cx, top + dotR, dotR);
  ctx.fill();
  ctx.strokeStyle = GREEN_DEEP;
  ctx.lineWidth = Math.max(0.5, bw * 0.1);
  circle(ctx, cx, top + dotR, dotR);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.4, top + dotR * 2.2);
  ctx.lineTo(cx + bw * 0.4, top + dotR * 2.2);
  ctx.stroke();
  ctx.strokeStyle = GREEN_DEEP;
  ctx.lineWidth = Math.max(0.8, bw * 0.11);
  rr(ctx, cx - bw / 2, top, bw, bh, r);
  ctx.stroke();
}

/** 字牌：風牌黑、中红、發绿、白为蓝色空框 */
function drawHonor(ctx, type, box) {
  if (type.ch === '白') {
    const bw = box.w * 0.8;
    const bh = box.h * 0.82;
    ctx.lineWidth = Math.max(2.2, box.w * 0.075);
    ctx.strokeStyle = BLUE_DARK;
    rr(ctx, box.cx - bw / 2, box.cy - bh / 2, bw, bh, Math.min(bw, bh) * 0.18);
    ctx.stroke();
    ctx.lineWidth = Math.max(1.1, box.w * 0.03);
    ctx.strokeStyle = BLUE_LIGHT;
    rr(ctx, box.cx - bw * 0.32, box.cy - bh * 0.32, bw * 0.64, bh * 0.64, Math.min(bw, bh) * 0.14);
    ctx.stroke();
    return;
  }
  const size = Math.round(box.h * 0.62);
  const color = type.ch === '發' ? GREEN : type.ch === '中' ? RED : BLACK;
  text(ctx, type.ch, box.cx, box.cy, {
    size,
    weight: '700',
    family: ROUND_FONT,
    fill: color,
    stroke: '#FFFFFF',
    strokeWidth: Math.max(1, size * 0.045),
  });
}
