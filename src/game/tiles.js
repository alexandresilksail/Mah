/**
 * v2.0.0 —— 16 种牌面的 Canvas 绘制（原创路径，无任何外部图片 / 字体 / 数字标签）。
 *
 * 视觉契约（需求 2.2）：
 *  · 牌型元数据唯一来源 = tile_types.js；这里只按 t.icon 分派绘制，不另建 ID 表；
 *  · 每张牌 = 多色牌面（face 底色）+ 彩色边框（rim）+ 图案（ink/accent）+ 顶部彩带；
 *  · 图案外接框 ≤ 牌宽 65% × 牌高 70%，用归一化 -1~1 坐标绘制，手机尺寸可辨；
 *  · 状态区分：被压（分级压暗）/ 可点（浅色描边）/ 悬停（glow + 上浮）/ 选中（金框）；
 *  · 立体感 = 底部厚度边 + 强投影 + 高光；牌尺寸与 TILE_W/TILE_H 常量完全绑定；
 *  · 离屏缓存键包含压暗等级 / 可点 / 选中 / 尺寸，状态变化一定重烘焙。
 */
import { rr, circle, text } from './draw.js';
import { TILE_TYPES, TYPE_BY_ID, TYPE_IDS, TYPE_COUNT } from './tile_types.js';

/* ---------------- 兼容导出（旧模块仍按这些名字 import） ---------------- */

/** 16 种牌型描述；kind = 图案分派名 */
export const TYPE_LIST = [];
for (let i = 0; i < TILE_TYPES.length; i++) {
  const t = TILE_TYPES[i];
  TYPE_LIST.push({ id: t.id, kind: t.icon, label: t.name, index: i });
}

export const TYPE_MAP = {};
for (let i = 0; i < TYPE_LIST.length; i++) TYPE_MAP[TYPE_LIST[i].id] = TYPE_LIST[i];

export function getType(id) {
  return TYPE_MAP[id] || null;
}

/** 两关都完整使用 16 种牌型（v2.0.0 硬要求） */
export const SUITS_L2 = TYPE_IDS.slice();
export const SUITS_L1 = TYPE_IDS.slice();

export function suitsFor(level) {
  void level;
  return TYPE_IDS.slice();
}

export { TILE_TYPES, TYPE_IDS, TYPE_COUNT };

/* ---------------- 牌体常量 ---------------- */

const SHADOW_BLUR = 8;
const SHADOW_DX = 0;
const SHADOW_DY = 5;
const SPRITE_DPR = 2;

const ROUND_FONT =
  '"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Segoe UI", system-ui, sans-serif';

/* ---------------- 离屏缓存（普通对象，兼容 ES5 降级版） ---------------- */

const spriteCache = {};
const shadowCache = {};
let spriteCount = 0;
let shadowCount = 0;
let spriteDisabled = false;

function dimAlphaOf(dimLevel) {
  return dimLevel > 0 ? Math.min(0.62, 0.45 + 0.05 * (dimLevel - 1)) : 0;
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

function spriteFor(ctx, typeId, w, h, dimLevel, playable, selected) {
  if (spriteDisabled) return null;
  const dimAlpha = dimAlphaOf(dimLevel);
  const key = typeId + '|' + w.toFixed(1) + '|' + h.toFixed(1) +
    '|d' + dimAlpha.toFixed(2) + '|p' + (playable ? 1 : 0) + '|s' + (selected ? 1 : 0);
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
  const key = w.toFixed(1) + '|' + h.toFixed(1);
  if (shadowCache[key]) return shadowCache[key];
  const pad = shadowPad(w);
  const c2 = offscreen(ctx, w + pad * 2, h + pad * 2);
  if (!c2) return null;
  const rad = w * 0.14;
  const hasFilter = typeof c2.filter === 'string';
  c2.save();
  if (hasFilter) c2.filter = 'blur(1.8px)';
  c2.globalAlpha = 0.5;
  c2.fillStyle = '#5A3A22';
  rr(c2, pad + SHADOW_DX - 2, pad + SHADOW_DY - 2, w, h, rad);
  c2.fill();
  c2.restore();
  c2.save();
  if (hasFilter) c2.filter = 'blur(' + SHADOW_BLUR + 'px)';
  c2.globalAlpha = 0.45;
  c2.fillStyle = '#5A3A22';
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

export function clearTileCache() {
  for (const k in spriteCache) if (Object.prototype.hasOwnProperty.call(spriteCache, k)) delete spriteCache[k];
  for (const k in shadowCache) if (Object.prototype.hasOwnProperty.call(shadowCache, k)) delete shadowCache[k];
  spriteCount = 0;
  shadowCount = 0;
}

/* ---------------- 入口 ---------------- */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x,y,w,h 只从 config 的 TILE_W / TILE_H 传入
 * @param {string} typeId
 * @param {{alpha?,scale?,lift?,glow?,dimLevel?,playable?,selected?,covered?}} opt
 */
export function drawTile(ctx, x, y, w, h, typeId, opt = {}) {
  const alpha = opt.alpha === undefined ? 1 : opt.alpha;
  const scale = opt.scale === undefined ? 1 : opt.scale;
  const lift = opt.lift === undefined ? 0 : opt.lift;
  const glow = opt.glow === undefined ? 0 : opt.glow;
  const type = TYPE_BY_ID[typeId];
  if (!type) return;
  const dimLevel = opt.dimLevel === undefined ? (opt.covered ? 1 : 0) : opt.dimLevel;
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
  ctx.shadowColor = 'rgba(96, 66, 38, 0.42)';
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
    ctx.strokeStyle = 'rgba(255, 236, 178, 0.95)';
    ctx.lineWidth = 2.5;
    rr(ctx, x - 2, y - 2, w + 4, h + 2, w * 0.14 + 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** 兼容旧调用：单独画投影 */
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
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = 'rgba(96, 66, 38, 0.6)';
    rr(ctx, x + SHADOW_DX, y + SHADOW_DY, w, h, w * 0.14);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------------- 牌背（盲盒队列里未翻开的那几张，第 1.3 节） ---------------- */

/**
 * 牌背：不泄露花色，只画统一的青灰底 + 回纹边 + 中心小花。
 * 被压得越深越暗（dimAlpha 与牌面同规则），可点的那张（队首）在翻开前
 * 仍画牌背，所以 `playable` 只加一圈浅色描边表示「这张能点」。
 */
function paintBack(ctx, x, y, w, h, dimLevel, playable) {
  const rad = w * 0.14;
  const thick = Math.max(4, Math.round(h * 0.06));
  const fh = h - thick;
  const rim = '#3E6E6A';
  const face = '#E8F1EC';
  const inset = Math.max(3.4, w * 0.07);
  ctx.save();

  // 厚度边
  ctx.fillStyle = rim;
  rr(ctx, x, y + thick, w, fh, rad);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  rr(ctx, x + 2, y + thick - 1, w - 4, 3, 2);
  ctx.fill();

  // 牌背底
  const g = ctx.createLinearGradient(x, y, x + w, y + fh);
  g.addColorStop(0, '#F4FAF6');
  g.addColorStop(1, face);
  ctx.fillStyle = g;
  rr(ctx, x, y, w, fh, rad);
  ctx.fill();

  // 回纹边框（两道）
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(2, w * 0.032);
  rr(ctx, x + inset, y + inset, w - inset * 2, fh - inset * 2, Math.max(2, rad - inset * 0.5));
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  rr(ctx, x + inset * 1.9, y + inset * 1.9, w - inset * 3.8, fh - inset * 3.8, Math.max(2, rad * 0.6));
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 中心对称小花（四瓣 + 圆心），完全不带花色信息
  const cx = x + w / 2;
  const cy = y + fh / 2;
  const r = Math.min(w, fh) * 0.13;
  ctx.fillStyle = rim;
  ctx.globalAlpha = 0.85;
  for (let k = 0; k < 4; k++) {
    const a = (Math.PI / 2) * k + Math.PI / 4;
    circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.52);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  circle(ctx, cx, cy, r * 0.42);
  ctx.fill();

  // 压深着色（与牌面同一规则：0.45 + 0.05/层，上限 0.62）
  const dimAlpha = dimLevel > 0 ? Math.min(0.62, 0.45 + 0.05 * (dimLevel - 1)) : 0;
  if (dimAlpha > 0) {
    ctx.fillStyle = 'rgba(28, 22, 16, ' + dimAlpha.toFixed(2) + ')';
    rr(ctx, x, y + thick, w, fh, rad);
    ctx.fill();
  }
  if (playable) {
    ctx.strokeStyle = 'rgba(255, 248, 220, 0.95)';
    ctx.lineWidth = 2.4;
    rr(ctx, x + 1, y + 1, w - 2, fh + thick - 2, rad);
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------------- 牌体 ---------------- */

function paintTile(ctx, x, y, w, h, type, dimAlpha, playable, selected) {
  const rad = w * 0.14;
  const thick = Math.max(4, Math.round(h * 0.06));
  const fh = h - thick;
  ctx.save();

  // 底部厚度边（立体感）
  ctx.fillStyle = type.rim;
  rr(ctx, x, y + thick, w, fh, rad);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  rr(ctx, x + 2, y + thick - 1, w - 4, 3, 2);
  ctx.fill();

  // 多色牌面
  const g = ctx.createLinearGradient(x, y, x, y + fh);
  g.addColorStop(0, '#FFFFFF');
  g.addColorStop(0.4, type.face);
  g.addColorStop(1, type.face);
  ctx.fillStyle = g;
  rr(ctx, x, y, w, fh, rad);
  ctx.fill();

  // 彩色边框（每种牌型独立的 rim）
  const bw = Math.max(2.4, w * 0.035);
  const inset = bw / 2 + 1.2;
  ctx.strokeStyle = type.rim;
  ctx.lineWidth = bw;
  rr(ctx, x + inset, y + inset, w - inset * 2, fh - inset * 2, Math.max(2, rad - inset * 0.6));
  ctx.stroke();

  // 顶部彩带（accent 色，第二重识别）
  ctx.save();
  rr(ctx, x + inset, y + inset, w - inset * 2, fh - inset * 2, Math.max(2, rad - inset * 0.6));
  ctx.clip();
  ctx.fillStyle = type.accent;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(x + inset, y + inset, w - inset * 2, Math.max(5, h * 0.075));
  ctx.globalAlpha = 0.30;
  ctx.fillRect(x + inset, y + fh - inset - Math.max(4, h * 0.05), w - inset * 2, Math.max(4, h * 0.05));
  ctx.restore();

  // 左上高光
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.1;
  rr(ctx, x + inset + bw, y + inset + bw, w - (inset + bw) * 2, fh - (inset + bw) * 2, rad * 0.6);
  ctx.stroke();

  // 图案：外接框 ≤ 65% 宽 × 70% 高
  const boxW = w * 0.62;
  const boxH = fh * 0.66;
  drawIcon(ctx, type, x + w / 2, y + fh / 2 + h * 0.02, boxW, boxH);

  // 右下角小色点（第三重识别 + 方向感）
  ctx.fillStyle = type.ink;
  circle(ctx, x + w - inset - 7, y + fh - inset - 7, 2.6);
  ctx.fill();

  // 被压：整牌叠加暗色（0.45 + 0.05/层，上限 0.62）
  if (dimAlpha > 0) {
    ctx.fillStyle = 'rgba(28, 22, 16, ' + dimAlpha.toFixed(2) + ')';
    rr(ctx, x, y + thick, w, fh, rad);
    ctx.fill();
  }

  // 可点：浅色描边；选中：金框
  if (playable) {
    ctx.strokeStyle = 'rgba(255, 248, 220, 0.95)';
    ctx.lineWidth = 2.4;
    rr(ctx, x + 1, y + 1, w - 2, fh + thick - 2, rad);
    ctx.stroke();
  }
  if (selected) {
    ctx.strokeStyle = '#FFD35C';
    ctx.lineWidth = 3;
    rr(ctx, x - 1, y - 1, w + 2, fh + thick + 2, rad + 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------------- 16 种原创图案（归一化 -1~1） ---------------- */

/** 在归一化坐标系里绘制；lineWidth 用归一化单位 */
function withBox(ctx, t, cx, cy, boxW, boxH, fn) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(boxW / 2, boxH / 2);
  ctx.lineWidth = 0.10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
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
    const a = -Math.PI / 2 + (i * Math.PI) / points;
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
  ctx.moveTo(x - 0.10, y - h / 2);
  ctx.lineTo(x + 0.10, y - h / 2);
  ctx.lineTo(x + 0.10, y + h / 2);
  ctx.lineTo(x - 0.10, y + h / 2);
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

const ICONS = {
  bird(ctx, t) {
    // 幺鸡：侧身朝左，站在横向竹节上
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 0.13;
    ctx.beginPath();
    ctx.moveTo(-0.85, 0.68); ctx.lineTo(0.85, 0.68);
    ctx.stroke();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 0.07;
    ctx.beginPath(); ctx.moveTo(-0.45, 0.62); ctx.lineTo(-0.45, 0.74);
    ctx.moveTo(0.35, 0.62); ctx.lineTo(0.35, 0.74); ctx.stroke();
    // 身体
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.ellipse(0.15, 0.02, 0.52, 0.40, -0.22, 0, Math.PI * 2);
    ctx.fill();
    // 翅膀（蓝绿）
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.ellipse(0.28, 0.02, 0.32, 0.20, -0.35, 0, Math.PI * 2);
    ctx.fill();
    // 头 + 喙 + 冠
    filledCircle(ctx, -0.38, -0.32, 0.26, t.ink);
    ctx.fillStyle = '#F6C33C';
    ctx.beginPath();
    ctx.moveTo(-0.60, -0.28); ctx.lineTo(-0.92, -0.18); ctx.lineTo(-0.58, -0.12);
    ctx.closePath(); ctx.fill();
    filledCircle(ctx, -0.34, -0.58, 0.10, '#DD4A3A');
    filledCircle(ctx, -0.42, -0.36, 0.085, '#FFFFFF');
    filledCircle(ctx, -0.44, -0.36, 0.045, '#20261F');
    // 尾羽
    ctx.strokeStyle = t.ink; ctx.lineWidth = 0.085;
    ctx.beginPath();
    ctx.moveTo(0.55, 0.12); ctx.quadraticCurveTo(0.95, -0.15, 0.82, -0.62);
    ctx.moveTo(0.58, 0.18); ctx.quadraticCurveTo(1.02, 0.0, 0.98, -0.40);
    ctx.stroke();
    // 腿
    ctx.strokeStyle = '#D84536'; ctx.lineWidth = 0.075;
    ctx.beginPath();
    ctx.moveTo(0.02, 0.38); ctx.lineTo(-0.02, 0.68);
    ctx.moveTo(0.28, 0.38); ctx.lineTo(0.32, 0.68);
    ctx.stroke();
  },
  diamond(ctx, t) {
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(0, -0.82); ctx.lineTo(0.66, 0); ctx.lineTo(0, 0.82); ctx.lineTo(-0.66, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = t.accent; ctx.lineWidth = 0.10;
    ctx.beginPath();
    ctx.moveTo(0, -0.48); ctx.lineTo(0.38, 0); ctx.lineTo(0, 0.48); ctx.lineTo(-0.38, 0);
    ctx.closePath(); ctx.stroke();
    filledCircle(ctx, 0, 0, 0.12, t.accent);
  },
  leaf(ctx, t) {
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(-0.72, 0.62);
    ctx.quadraticCurveTo(-0.55, -0.72, 0.72, -0.62);
    ctx.quadraticCurveTo(0.62, 0.62, -0.72, 0.62);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = t.accent; ctx.lineWidth = 0.08;
    ctx.beginPath(); ctx.moveTo(-0.62, 0.56); ctx.lineTo(0.60, -0.52); ctx.stroke();
    ctx.lineWidth = 0.05;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-0.25 + i * 0.20, 0.20 + i * 0.12);
      ctx.lineTo(0.05 + i * 0.18, -0.05 + i * 0.12);
      ctx.stroke();
    }
  },
  frame(ctx, t) {
    ctx.strokeStyle = t.ink; ctx.lineWidth = 0.16;
    ctx.beginPath();
    ctx.moveTo(-0.72, -0.72); ctx.lineTo(0.72, -0.72); ctx.lineTo(0.72, 0.72);
    ctx.lineTo(-0.72, 0.72); ctx.closePath(); ctx.stroke();
    ctx.strokeStyle = t.accent; ctx.lineWidth = 0.09;
    ctx.beginPath();
    ctx.moveTo(-0.44, -0.44); ctx.lineTo(0.44, -0.44); ctx.lineTo(0.44, 0.44);
    ctx.lineTo(-0.44, 0.44); ctx.closePath(); ctx.stroke();
    filledCircle(ctx, -0.72, -0.72, 0.12, t.accent);
    filledCircle(ctx, 0.72, 0.72, 0.12, t.accent);
  },
  coin1(ctx, t) {
    strokedCircle(ctx, 0, 0, 0.74, t.ink, 0.16);
    strokedCircle(ctx, 0, 0, 0.48, t.accent, 0.13);
    filledCircle(ctx, 0, 0, 0.22, t.ink);
    filledCircle(ctx, 0, 0, 0.10, t.accent);
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
    bambooStick(ctx, -0.35, 0, 1.30, t);
    bambooStick(ctx, 0.35, 0, 1.30, t);
  },
  bamboo5(ctx, t) {
    bambooStick(ctx, 0, -0.42, 0.72, t);
    bambooStick(ctx, -0.48, 0.32, 0.72, t);
    bambooStick(ctx, 0.48, 0.32, 0.72, t);
    bambooStick(ctx, -0.26, -0.05, 0.60, t);
    bambooStick(ctx, 0.26, -0.05, 0.60, t);
    filledCircle(ctx, 0, 0.10, 0.13, t.accent);
  },
  blossom(ctx, t) {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      petal(ctx, Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0.32, t.ink);
    }
    filledCircle(ctx, 0, 0, 0.26, t.accent);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      filledCircle(ctx, Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0.045, t.ink);
    }
  },
  orchid(ctx, t) {
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(0, 0.62); ctx.quadraticCurveTo(-0.92, 0.10, -0.55, -0.68);
    ctx.quadraticCurveTo(-0.10, -0.35, 0, 0.62); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0.62); ctx.quadraticCurveTo(0.92, 0.10, 0.55, -0.68);
    ctx.quadraticCurveTo(0.10, -0.35, 0, 0.62); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0.55); ctx.quadraticCurveTo(-0.30, -0.35, 0, -0.86);
    ctx.quadraticCurveTo(0.30, -0.35, 0, 0.55); ctx.fill();
    filledCircle(ctx, 0, 0.20, 0.17, t.accent);
    ctx.strokeStyle = t.accent; ctx.lineWidth = 0.07;
    ctx.beginPath(); ctx.moveTo(0, 0.60); ctx.lineTo(0, 0.88); ctx.stroke();
  },
  chrys(ctx, t) {
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
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
    ctx.moveTo(0.52, 0); ctx.lineTo(0.94, -0.46); ctx.lineTo(0.94, 0.46);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.moveTo(-0.12, -0.30); ctx.lineTo(0.20, -0.62); ctx.lineTo(0.32, -0.28);
    ctx.closePath(); ctx.fill();
    filledCircle(ctx, -0.38, -0.10, 0.09, '#FFFFFF');
    filledCircle(ctx, -0.40, -0.10, 0.045, '#20261F');
    ctx.strokeStyle = t.accent; ctx.lineWidth = 0.07;
    ctx.beginPath(); ctx.moveTo(-0.10, 0.18); ctx.lineTo(0.38, 0.18); ctx.stroke();
  },
  moon(ctx, t) {
    filledCircle(ctx, 0.05, 0, 0.76, t.ink);
    filledCircle(ctx, 0.42, -0.16, 0.64, t.face);
    filledCircle(ctx, -0.48, -0.52, 0.10, t.accent);
    filledCircle(ctx, -0.22, 0.56, 0.07, t.accent);
  },
  sun(ctx, t) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      ctx.strokeStyle = t.accent; ctx.lineWidth = 0.12;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 0.52, Math.sin(a) * 0.52);
      ctx.lineTo(Math.cos(a) * 0.90, Math.sin(a) * 0.90);
      ctx.stroke();
    }
    filledCircle(ctx, 0, 0, 0.48, t.ink);
    filledCircle(ctx, 0, 0, 0.30, t.accent);
  },
  cloud(ctx, t) {
    filledCircle(ctx, -0.45, 0.10, 0.36, t.ink);
    filledCircle(ctx, 0, -0.20, 0.48, t.ink);
    filledCircle(ctx, 0.48, 0.10, 0.34, t.ink);
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(-0.78, 0.14); ctx.lineTo(0.78, 0.14);
    ctx.lineTo(0.78, 0.50); ctx.lineTo(-0.78, 0.50);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = t.accent; ctx.lineWidth = 0.09;
    ctx.beginPath();
    ctx.moveTo(-0.58, 0.34); ctx.lineTo(0.58, 0.34); ctx.stroke();
  },
  star(ctx, t) {
    ctx.fillStyle = t.ink;
    starPath(ctx, 0, 0, 0.88, 0.38, 5);
    ctx.fill();
    ctx.fillStyle = t.accent;
    starPath(ctx, 0, 0, 0.52, 0.22, 5);
    ctx.fill();
    filledCircle(ctx, 0, 0, 0.13, t.ink);
  },
};

function drawIcon(ctx, type, cx, cy, boxW, boxH) {
  const fn = ICONS[type.icon];
  if (!fn) return;
  withBox(ctx, type, cx, cy, boxW, boxH, (c, t) => {
    // 图案底座：白色圆形衬底，保证任何底色上都能看清
    c.fillStyle = 'rgba(255,255,255,0.72)';
    c.beginPath();
    c.ellipse(0, 0, 0.98, 0.98, 0, 0, Math.PI * 2);
    c.fill();
    fn(c, t);
  });
}

/** 保留旧导出名：幺鸡图案（供 art_preview / 测试直接调用） */
export function drawYaoji(ctx, box) {
  const x = box.x === undefined ? 0 : box.x;
  const y = box.y === undefined ? 0 : box.y;
  const w = box.w === undefined ? 60 : box.w;
  const h = box.h === undefined ? 80 : box.h;
  withBox(ctx, TILE_TYPES[0], x + w / 2, y + h / 2, w, h, ICONS.bird);
}

/** 供样张工具：绘制带名称的牌（文字只出现在样张里，不在游戏牌面） */
export function drawTileSampleLabel(ctx, typeId, x, y, w) {
  const t = TYPE_BY_ID[typeId];
  if (!t) return;
  text(ctx, t.name, x + w / 2, y, { size: 15, weight: '700', fill: t.rim, family: ROUND_FONT });
}
