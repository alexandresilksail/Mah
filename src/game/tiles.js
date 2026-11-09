/**
 * 麻将牌面（全部由 Canvas 2D 路径与系统字体现场绘制，无任何外部图片/字体）。
 *
 * ── 画风：传统麻将的"绿边白底红字" ────────────────────────────────
 *   · 牌面象牙白 #FFFDF5；
 *   · 四周 2px 深绿边框 #2E7D32；
 *   · 边框内侧一条细白高光线，外侧一条浅灰阴影线 → 微立体厚度；
 *   · 汉字牌（万/风/箭）用系统圆润粗体，字高约占牌面 55%~65%，1px 白描边；
 *   · 筒子 = 同心圆环（外环深蓝 / 内环浅蓝 / 中心留白），按传统排布
 *     （五筒 = 四角 + 中心，九筒 = 三行三列，八筒 = 两列四行 …）；
 *   · 条子 = 短竖条（主体深绿 + 顶部浅绿圆点当竹节），多条竖排；
 *   · 没有任何拟人化元素（无眼睛、无腮红）。
 *
 * 图案的最大外接矩形仍限制在「牌宽 65% × 牌高 70%」内，绝不溢出。
 */
import { rr, circle, text } from './draw.js';

const WAN_CHARS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const HONORS = ['東', '南', '西', '北', '中', '發', '白'];

/** 34 种标准牌型（万/条/筒/风/箭，均为公有领域元素） */
export const TYPE_LIST = (() => {
  const list = [];
  for (let i = 1; i <= 9; i++) list.push({ id: `wan-${i}`, kind: 'wan', num: i });
  for (let i = 1; i <= 9; i++) list.push({ id: `tiao-${i}`, kind: 'tiao', num: i });
  for (let i = 1; i <= 9; i++) list.push({ id: `tong-${i}`, kind: 'tong', num: i });
  HONORS.forEach((ch, i) => list.push({ id: `zi-${i + 1}`, kind: 'zi', num: i + 1, ch }));
  return list;
})();

export const TYPE_MAP = Object.fromEntries(TYPE_LIST.map((t) => [t.id, t]));

export function getType(id) {
  return TYPE_MAP[id];
}

/* ---------------- 调色板 ---------------- */

const FACE = '#FFFDF5'; // 象牙白（规范指定）
const FACE_DIM = '#EFE9DA'; // 被压住时（只轻微降调，别糊成灰块）
const RIM = '#2A6B2E'; // 牌身厚度面的深绿（比边框略暗）
const RIM_DIM = '#255C29';

const BORDER = '#2E7D32'; // 2px 深绿边框（规范指定）
const BORDER_DIM = '#3A7A40'; // 被压住时略暗一点，但仍要认得出是绿边

const RED = '#C0392B';
const GREEN = '#2E7D32';
const GREEN_LIGHT = '#7BB661';
const GREEN_DEEP = '#1E5A22';
const BLUE_DARK = '#173F6B';
const BLUE_LIGHT = '#5B8DBE';

/** 圆润粗体字栈：优先系统自带的无衬线黑体 */
const ROUND_FONT =
  '"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Segoe UI", system-ui, sans-serif';

/* ---------------- 传统排列（归一化坐标，范围 -1 ~ 1） ---------------- */

/** 筒子：1 中心 / 2 竖排 / 3 斜线 / 4 四角 / 5 四角+中心 / 6 两列三行 / 8 两列四行 / 9 三行三列 */
const TONG_POS = {
  1: [[0, 0]],
  2: [[0, -0.46], [0, 0.46]],
  3: [[-0.5, -0.5], [0, 0], [0.5, 0.5]],
  4: [[-0.44, -0.44], [0.44, -0.44], [-0.44, 0.44], [0.44, 0.44]],
  5: [[-0.48, -0.48], [0.48, -0.48], [0, 0], [-0.48, 0.48], [0.48, 0.48]],
  6: [[-0.42, -0.5], [0.42, -0.5], [-0.42, 0], [0.42, 0], [-0.42, 0.5], [0.42, 0.5]],
  7: [[-0.44, -0.56], [0, -0.4], [0.44, -0.56], [-0.42, 0.16], [0.42, 0.16], [-0.42, 0.62], [0.42, 0.62]],
  8: [[-0.4, -0.62], [0.4, -0.62], [-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2], [-0.4, 0.62], [0.4, 0.62]],
  9: [[-0.52, -0.52], [0, -0.52], [0.52, -0.52], [-0.52, 0], [0, 0], [0.52, 0], [-0.52, 0.52], [0, 0.52], [0.52, 0.52]],
};

/** 条子：全部竖排 —— 1 单根 / 2 竖叠 / 3 一上两下 / 4 田字 / 6 三列两行 / 8 四列两行 / 9 三行三列 */
const TIAO_POS = {
  1: [[0, 0]],
  2: [[0, -0.44], [0, 0.44]],
  3: [[0, -0.52], [-0.46, 0.4], [0.46, 0.4]],
  4: [[-0.44, -0.44], [0.44, -0.44], [-0.44, 0.44], [0.44, 0.44]],
  5: [[-0.5, -0.5], [0.5, -0.5], [0, 0], [-0.5, 0.5], [0.5, 0.5]],
  6: [[-0.6, -0.42], [0, -0.42], [0.6, -0.42], [-0.6, 0.42], [0, 0.42], [0.6, 0.42]],
  7: [[0, -0.62], [-0.6, -0.05], [0, -0.05], [0.6, -0.05], [-0.6, 0.52], [0, 0.52], [0.6, 0.52]],
  8: [[-0.66, -0.42], [-0.22, -0.42], [0.22, -0.42], [0.66, -0.42], [-0.66, 0.42], [-0.22, 0.42], [0.22, 0.42], [0.66, 0.42]],
  9: [[-0.55, -0.52], [0, -0.52], [0.55, -0.52], [-0.55, 0], [0, 0], [0.55, 0], [-0.55, 0.52], [0, 0.52], [0.55, 0.52]],
};

/* ---------------- 单牌绘制 ---------------- */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x 左上角
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} typeId
 * @param {{covered?:boolean, alpha?:number, scale?:number, lift?:number, glow?:number,
 *          expose?:{x0:number,y0:number,x1:number,y1:number}}} opt
 *   `expose` = 这张牌**真正露出来**的那块矩形（牌内局部坐标）。被压住时它是
 *   一条缝，花色就画在缝里；不传则按整张牌居中。
 */
export function drawTile(ctx, x, y, w, h, typeId, opt = {}) {
  const { covered = false, alpha = 1, scale = 1, lift = 0, glow = 0, expose = null } = opt;
  const type = TYPE_MAP[typeId];
  if (!type) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (scale !== 1 || lift !== 0) {
    const mx = x + w / 2;
    const my = y + h / 2;
    ctx.translate(mx, my - lift);
    ctx.scale(scale, scale);
    ctx.translate(-mx, -my);
  }

  // 第 6 步：每张牌绘制前设置强投影，绘制完立刻 restore 重置，
  // 绝不让 shadowColor 泄漏到 HUD / 槽位 / 后续牌上。
  // 用内层 save/restore 包住，外层的 scale / alpha / lift 变换仍然有效。
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = SHADOW_BLUR;
  ctx.shadowOffsetX = SHADOW_DX;
  ctx.shadowOffsetY = SHADOW_DY;

  // 一张牌几十个路径，逐帧重画会掉帧 —— 按「牌型+尺寸+是否被压」烘焙成离屏位图。
  // 几何一律用传入的 w / h（调用方只传 TILE_W / TILE_H），不存在按层缩放。
  const sprite = spriteFor(ctx, typeId, w, h, covered);
  if (sprite) ctx.drawImage(sprite, x, y, w, h);
  else paintTile(ctx, x, y, w, h, type, covered);
  ctx.restore(); // 阴影在此重置

  // 悬停：金色描边 + 外发光，明确告诉玩家"这张可以点"
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

/**
 * 单张牌的投影。规范值：shadowColor rgba(0,0,0,0.6) / blur 10 / offsetX 4 / offsetY 6。
 *
 * 真实 `ctx.shadowBlur` 逐帧对 225 张牌开一遍会直接把帧率打到个位数，
 * 所以这里把"模糊圆角矩形"烘焙成离屏位图，每帧只 drawImage ——
 * 视觉效果与规范里的四个参数完全一致，代价只有一次纹理采样。
 *
 * 分两层：贴身的硬阴影（1.8px 模糊）压出牌身厚度的实边，
 * 外面再叠一层 10px 模糊的柔影，让上层牌真正"浮"在下层牌面上。
 *
 * @param {number} alpha 阴影浓度
 * @param {number} depth 0=最底层 … 1=最顶层（越高投影略重）
 */
export function drawTileShadow(ctx, x, y, w, h, alpha = 0.55, depth = 0) {
  if (alpha <= 0.01) return;
  const spr = shadowSprite(ctx, w, h);
  const pad = shadowPad(w);
  const dx = SHADOW_DX;
  const dy = SHADOW_DY;
  if (spr) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha * (1.1 + depth * 0.25));
    ctx.drawImage(spr, x - pad + dx, y - pad + dy, w + pad * 2, h + pad * 2);
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = '#000';
    rr(ctx, x + dx, y + dy, w, h, w * 0.14);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------------- 离屏缓存 ---------------- */

const SPRITE_DPR = 2; // 2 倍分辨率烘焙，缩放后依然清晰
const spriteCache = new Map();
const shadowCache = new Map();
let spriteDisabled = false; // 没有 DOM 环境（单元测试的 mock canvas）时直接走实时绘制

/** 第 6 步规范值：rgba(0,0,0,0.5) / blur 8 / offsetX 0 / offsetY 5 */
const SHADOW_BLUR = 8;
const SHADOW_DX = 0;
const SHADOW_DY = 5;

function spriteFor(ctx, typeId, w, h, covered) {
  if (spriteDisabled) return null;
  const key = `${typeId}|${w.toFixed(1)}|${h.toFixed(1)}|${covered ? 1 : 0}`;
  const hit = spriteCache.get(key);
  if (hit) return hit;

  const c2 = offscreen(ctx, w, h);
  if (!c2) return null;
  paintTile(c2, 0, 0, w, h, TYPE_MAP[typeId], covered);

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

  // ① 紧贴牌的硬阴影：制造"牌有厚度"的实边
  c2.save();
  if (hasFilter) c2.filter = 'blur(1.8px)';
  c2.globalAlpha = 0.55;
  c2.fillStyle = '#000';
  rr(c2, pad + SHADOW_DX - 2, pad + SHADOW_DY - 2, w, h, rad);
  c2.fill();
  c2.restore();

  // ② 规范阴影：blur 8px / offset (0,5) —— 强烈、清晰，落在下层牌面上
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
  if (!doc || typeof doc.createElement !== 'function') {
    spriteDisabled = true;
    return null;
  }
  const cv = doc.createElement('canvas');
  cv.width = Math.max(1, Math.round(w * SPRITE_DPR));
  cv.height = Math.max(1, Math.round(h * SPRITE_DPR));
  const c2 = cv.getContext('2d');
  if (!c2) {
    spriteDisabled = true;
    return null;
  }
  c2.scale(SPRITE_DPR, SPRITE_DPR);
  return c2;
}

/** 清空缓存（换关换尺寸时无需调用，键里已含尺寸；仅在极端情况下兜底） */
export function clearTileCache() {
  spriteCache.clear();
  shadowCache.clear();
}

/* ---------------- 牌体 ---------------- */

function paintTile(ctx, x, y, w, h, type, covered) {
  const rad = w * 0.14;
  // 牌身厚度：5px 左右。太薄会像一张纸片，看不出"摞起来"这件事。
  const thick = Math.max(4, Math.round(h * 0.06));
  const fh = h - thick;

  ctx.save();

  // 1) 底部厚度面（深绿，露出 2~3px 的"牌边"，和绿边框连成一体）
  ctx.fillStyle = covered ? RIM_DIM : RIM;
  rr(ctx, x, y + thick, w, fh, rad);
  ctx.fill();

  // 2) 正面：象牙白
  ctx.fillStyle = covered ? FACE_DIM : FACE;
  rr(ctx, x, y, w, fh, rad);
  ctx.fill();

  // 3) 外侧浅灰阴影线：贴着牌的外轮廓，压出"实心块"的边界
  ctx.strokeStyle = covered ? 'rgba(120,116,104,0.45)' : 'rgba(150,146,132,0.6)';
  ctx.lineWidth = 1;
  rr(ctx, x + 0.5, y + 0.5, w - 1, fh - 1, rad);
  ctx.stroke();

  // 4) 2px 深绿边框
  const bw = Math.max(2, w * 0.022);
  const inset = bw / 2 + 1.2;
  ctx.strokeStyle = covered ? BORDER_DIM : BORDER;
  ctx.lineWidth = bw;
  rr(ctx, x + inset, y + inset, w - inset * 2, fh - inset * 2, Math.max(2, rad - inset * 0.6));
  ctx.stroke();

  // 5) 边框内侧的细白高光线 → 倒角质感
  ctx.strokeStyle = covered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.1;
  const in2 = inset + bw / 2 + 1.1;
  rr(ctx, x + in2, y + in2, w - in2 * 2, fh - in2 * 2, Math.max(1.5, rad - in2 * 0.6));
  ctx.stroke();

  // 6) 图案：所有牌都画，且用 save + translate 居中绘制（不变形）。
  //    被压住的牌也要能认出花色，玩家才知道下面埋着什么。
  const pad = in2 + 2.5;
  drawFace(ctx, type, x + pad, y + pad, w - pad * 2, fh - pad * 2);

  // 7) 被上层压住 → 整体叠加 rgba(0,0,0,0.35)（第 2 步规范）。
  //    压暗只作用于牌面，绿边框仍保留，叠起来时边界不会糊成一片。
  if (covered) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    rr(ctx, x + bw * 0.5, y + bw * 0.5, w - bw, h - bw, rad);
    ctx.fill();
  }

  ctx.restore();
}

/* ---------------- 图案区域 ---------------- */

/**
 * 图案最大外接框：可用区的 65% x 70%，居中。
 *
 * 传入 `expose`（牌内局部的「可读缝」）时，图案框改成**塞进这条缝里**：
 * 缝在哪就把花色挪到哪、能画多大就画多大。链式铺砌下缝只有 36px 高，
 * 于是图案从 49px 收到 ~26px —— 但它是**完整**的一个字/一组圆环，
 * 而不是原来那种"上半截字"。玩家一眼就能认出是什么牌。
 */
function faceBox(x, y, w, fh) {
  // 图案框必须是**正方形**：筒子的圆环一旦按牌面的长宽去拉伸，就会变成椭圆，
  // 玩家第一眼看到的就是"这张牌变形了"。正方形框 + 居中定位是不变形的根本。
  const side = Math.min(w * 0.78, fh * 0.82);
  return {
    cx: x + w / 2,
    cy: y + fh / 2,
    w: side,
    h: side,
    left: x + w / 2 - side / 2,
    top: y + fh / 2 - side / 2,
    compact: false,
  };
}

/**
 * 第 6 步：用 ctx.save() + ctx.translate() 把坐标系原点移到图案框中心，
 * 再以**局部坐标**画花色。所有子函数拿到的 box 都是正方形、以 (0,0) 为中心，
 * 因此没有任何一步会按牌宽 / 牌高做非等比缩放 —— 筒子的圆环永远是正圆。
 */
function drawFace(ctx, type, x, y, w, fh) {
  const box = faceBox(x, y, w, fh);
  const local = {
    cx: 0,
    cy: 0,
    w: box.w,
    h: box.h,
    left: -box.w / 2,
    top: -box.h / 2,
    compact: box.compact,
  };
  const faceColor = FACE;
  ctx.save();
  ctx.translate(box.cx, box.cy);
  if (type.kind === 'wan') drawWan(ctx, type, local);
  else if (type.kind === 'tiao') drawTiao(ctx, type, local);
  else if (type.kind === 'tong') drawTong(ctx, type, local, faceColor);
  else drawHonor(ctx, type, local, faceColor);
  ctx.restore();
}

/** 归一化坐标 → 像素；同时返回最小中心距，用来推算半径/条宽 */
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

/** 万：上面圆体数字，下面"萬"，红字白边 */
function drawWan(ctx, type, box) {
  // 紧凑档（被压住、只剩一条缝）：只画上面那个数字。
  // 一 / 二 / 三 这类单字本身就认得出，硬塞"数字 + 萬"只会两个都糊成一团。
  if (box.compact) {
    const size = Math.round(box.h * 0.92);
    text(ctx, WAN_CHARS[type.num - 1], box.cx, box.cy, {
      size,
      weight: '700',
      family: ROUND_FONT,
      fill: RED,
      stroke: '#FFFFFF',
      strokeWidth: Math.max(1, size * 0.055),
    });
    return;
  }

  const numSize = Math.round(box.h * 0.4);
  const wanSize = Math.round(box.h * 0.255);
  const strokeW = Math.max(1, numSize * 0.055);
  text(ctx, WAN_CHARS[type.num - 1], box.cx, box.cy - box.h * 0.22, {
    size: numSize,
    weight: '700',
    family: ROUND_FONT,
    fill: RED,
    stroke: '#FFFFFF',
    strokeWidth: strokeW,
  });
  text(ctx, '萬', box.cx, box.cy + box.h * 0.21, {
    size: wanSize,
    weight: '700',
    family: ROUND_FONT,
    fill: RED,
    stroke: '#FFFFFF',
    strokeWidth: Math.max(1, wanSize * 0.055),
  });
}

/** 筒：同心圆环 —— 外环深蓝、内环浅蓝、中心留白 */
function drawTong(ctx, type, box, faceColor) {
  const pos = TONG_POS[type.num] || TONG_POS[1];
  const { pts, dmin } = layout(box, pos);
  const r = Math.min(dmin * 0.46, Math.min(box.w, box.h) * 0.42);
  for (const [px, py] of pts) ring(ctx, px, py, r, faceColor);
}

function ring(ctx, cx, cy, r, faceColor) {
  // 外环：深蓝实心
  ctx.fillStyle = BLUE_DARK;
  circle(ctx, cx, cy, r);
  ctx.fill();

  // 内环：浅蓝
  ctx.fillStyle = BLUE_LIGHT;
  circle(ctx, cx, cy, r * 0.66);
  ctx.fill();

  // 中心：留白
  ctx.fillStyle = faceColor;
  circle(ctx, cx, cy, r * 0.36);
  ctx.fill();

  // 环线收口，强化"三层同心"
  ctx.strokeStyle = BLUE_DARK;
  ctx.lineWidth = Math.max(0.8, r * 0.11);
  circle(ctx, cx, cy, r * 0.66);
  ctx.stroke();

  // 左上 45° 高光弧
  if (r > 5) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = Math.max(1, r * 0.2);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.84, -2.6, -1.95);
    ctx.stroke();
    ctx.restore();
  }
}

/** 条：短竖条 + 顶部浅绿圆点（竹节） */
function drawTiao(ctx, type, box) {
  const pos = TIAO_POS[type.num] || TIAO_POS[1];
  const { pts, dmin } = layout(box, pos);
  // 一条单独放宽一点，否则会是一根又长又宽的"绿棒"
  const swCap = type.num === 1 ? box.w * 0.23 : box.w * 0.32;
  const sw = Math.min(dmin * 0.48, swCap, box.w * 0.3);
  const sh = Math.min(sw * (type.num === 1 ? 2.0 : 2.4), box.h * 0.86);
  for (const [px, py] of pts) bamboo(ctx, px, py, sw, sh);
}

function bamboo(ctx, cx, cy, w, h) {
  const bw = Math.max(3, w);
  const bh = Math.max(8, h);
  const r = Math.min(bw, bh) * 0.34;
  const top = cy - bh / 2;

  // 杆身：深绿圆角短条
  ctx.fillStyle = GREEN;
  rr(ctx, cx - bw / 2, top, bw, bh, r);
  ctx.fill();

  // 杆身左侧竖向高光
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  rr(ctx, cx - bw * 0.26, top + bh * 0.24, bw * 0.15, bh * 0.42, bw * 0.075);
  ctx.fill();

  // 竹节：顶部一颗浅绿小圆点（坐在杆帽上，不凸出去）
  const dotR = Math.max(1.2, bw * 0.42);
  const dy = top + dotR * 0.92;
  ctx.fillStyle = GREEN_LIGHT;
  circle(ctx, cx, dy, dotR);
  ctx.fill();
  ctx.strokeStyle = GREEN_DEEP;
  ctx.lineWidth = Math.max(0.5, bw * 0.1);
  circle(ctx, cx, dy, dotR);
  ctx.stroke();

  // 竹节下方的深色分节线
  ctx.strokeStyle = GREEN_DEEP;
  ctx.lineWidth = Math.max(0.5, bw * 0.12);
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.4, dy + dotR * 1.25);
  ctx.lineTo(cx + bw * 0.4, dy + dotR * 1.25);
  ctx.stroke();

  // 外描边收口
  ctx.strokeStyle = GREEN_DEEP;
  ctx.lineWidth = Math.max(0.8, bw * 0.11);
  rr(ctx, cx - bw / 2, top, bw, bh, r);
  ctx.stroke();
}

/** 风牌 / 箭牌：一个大字 + 1px 白描边 */
function drawHonor(ctx, type, box, faceColor) {
  if (type.ch === '白') {
    // 白板：绿框套绿框（传统"白板"就是一块空白牌面 + 方框）
    const bw = box.w * 0.8;
    const bh = box.h * 0.82;
    ctx.lineWidth = Math.max(2.2, box.w * 0.075);
    ctx.strokeStyle = GREEN;
    rr(ctx, box.cx - bw / 2, box.cy - bh / 2, bw, bh, Math.min(bw, bh) * 0.18);
    ctx.stroke();
    ctx.lineWidth = Math.max(1.1, box.w * 0.03);
    ctx.strokeStyle = 'rgba(46,125,50,0.55)';
    rr(ctx, box.cx - bw * 0.32, box.cy - bh * 0.32, bw * 0.64, bh * 0.64, Math.min(bw, bh) * 0.14);
    ctx.stroke();
    void faceColor;
    return;
  }

  const size = Math.round(box.h * (box.compact ? 0.92 : 0.6));
  const color = type.ch === '發' ? GREEN : RED;
  text(ctx, type.ch, box.cx, box.cy, {
    size,
    weight: '700',
    family: ROUND_FONT,
    fill: color,
    stroke: '#FFFFFF',
    strokeWidth: Math.max(1, size * 0.045),
  });
}
