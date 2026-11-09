/** 全部界面绘制（Canvas 2D），无任何外部图片 / 字体 / 图标资源 */
import {
  W,
  H,
  C,
  LEVEL_COUNT,
  BOARD_BAND,
  SLOT_SIZE,
  SLOT_PANEL,
  SLOT_PITCH,
  SLOT_CARD_W,
  SLOT_CARD_H,
  SLOT_X0,
  SLOT_Y,
  TILE_W,
  TILE_H,
  TEMP_ZONE,
  TOOL_Y,
  TOOL_R,
  TOOL_XS,
  MENU_BTN,
  SOUND_BTN,
} from './config.js';
import { rr, circle, text, clamp, easeOutCubic } from './draw.js';
import { drawTile, drawTileShadow } from './tiles.js';
import { drawMascot, drawTitle } from './logo.js';

/* ==================== 交互元素 ==================== */

export function getUI(game) {
  const buttons = [];
  const push = (id, x, y, w, h, label, extra = {}) =>
    buttons.push({ id, x, y, w, h, label, enabled: true, ...extra });

  // 二次确认：只保留这两个按钮，避免误触后面任何控件
  if (game.uninstallAsk) {
    push('uninstall-no', W / 2 - 210, 690, 200, 76, '取消', { kind: 'ghost', size: 26 });
    push('uninstall-yes', W / 2 + 10, 690, 200, 76, '彻底删除', { kind: 'danger', size: 24 });
    return { buttons };
  }

  if (game.screen === 'title') {
    push('start', W / 2 - 150, 880, 300, 86, '开始游戏', { kind: 'primary', size: 32 });
    push('sound', SOUND_BTN.x, SOUND_BTN.y, SOUND_BTN.w, SOUND_BTN.h, '', { kind: 'icon' });
    // 绿色版专属：删数据 + 删自身，无需去「应用和功能」
    push('uninstall', W / 2 - 120, 1000, 240, 56, '卸载并删除数据', {
      kind: 'danger-ghost',
      size: 18,
    });
    // 不提供"回到第 1 关"的入口：一局只有两关，通关第 2 关即毕业
    return { buttons };
  }

  push('menu', MENU_BTN.x, MENU_BTN.y, MENU_BTN.w, MENU_BTN.h, '', { kind: 'icon' });
  push('sound', SOUND_BTN.x, SOUND_BTN.y, SOUND_BTN.w, SOUND_BTN.h, '', {
    kind: 'icon',
    withSound: true,
  });

  push('shuffle', TOOL_XS[0] - TOOL_R, TOOL_Y - TOOL_R, TOOL_R * 2, TOOL_R * 2, '洗牌', {
    kind: 'tool',
    enabled: game.props.shuffle > 0 && game.status === 'play',
    count: game.props.shuffle,
  });
  push('undo', TOOL_XS[1] - TOOL_R, TOOL_Y - TOOL_R, TOOL_R * 2, TOOL_R * 2, '撤销', {
    kind: 'tool',
    enabled: game.props.undo > 0 && game.history.length > 0 && game.status === 'play',
    count: game.props.undo,
  });
  push('remove', TOOL_XS[2] - TOOL_R, TOOL_Y - TOOL_R, TOOL_R * 2, TOOL_R * 2, '移出3张', {
    kind: 'tool',
    enabled: game.props.remove > 0 && game.slot.length > 0 && game.status === 'play',
    count: game.props.remove,
  });

  if (game.status === 'win') {
    if (game.graduated) {
      push('replay', W / 2 - 210, 700, 200, 76, '再玩一次', { kind: 'primary', size: 26 });
      push('home', W / 2 + 10, 700, 200, 76, '回到标题', { kind: 'ghost', size: 24 });
    } else {
      push('next', W / 2 - 210, 700, 200, 76, '进入第 2 关', { kind: 'primary', size: 24 });
      push('home', W / 2 + 10, 700, 200, 76, '回到标题', { kind: 'ghost', size: 24 });
    }
  } else if (game.status === 'lose') {
    if (game.reviveLeft > 0) {
      push('revive', W / 2 - 210, 700, 200, 76, '复活', { kind: 'primary', size: 28 });
      push('replay', W / 2 + 10, 700, 200, 76, '重开本关', { kind: 'ghost', size: 22 });
    } else {
      push('replay', W / 2 - 100, 700, 200, 76, '重开本关', { kind: 'primary', size: 24 });
    }
  }

  if (game.paused) {
    push('resume', W / 2 - 150, 548, 300, 74, '继续游戏', { kind: 'primary', size: 26 });
    push('restart', W / 2 - 150, 632, 300, 62, '重新开始本关', { kind: 'ghost', size: 22 });
    push('home', W / 2 - 150, 704, 300, 62, '回到标题', { kind: 'ghost', size: 22 });
    push('uninstall', W / 2 - 150, 780, 300, 52, '卸载并删除数据', {
      kind: 'danger-ghost',
      size: 18,
    });
  }

  return { buttons };
}

export function hitButton(ui, x, y) {
  for (const b of ui.buttons) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
  }
  return null;
}

/**
 * 点中哪张牌。
 * 第 6 步：从最高层向下遍历，命中第一张「可点」的牌；点到被遮挡的牌不响应。
 * 临时区（移出道具）单独判定 —— 命中后交给 Game.pick 分流回槽位。
 */
export function cardAt(game, x, y) {
  // 1) 临时区：点击可放回槽位
  const temp = game.temp || [];
  for (let i = 0; i < temp.length; i++) {
    const tx = TEMP_ZONE.x + i * TEMP_ZONE.pitch;
    if (x >= tx && x <= tx + TILE_W && y >= TEMP_ZONE.y && y <= TEMP_ZONE.y + TILE_H) {
      return temp[i];
    }
  }

  // 2) 牌堆：收集所有命中矩形的牌，按 z 降序（= 层高 + 同层 y 大者优先）
  const hits = [];
  for (let i = 0; i < game.cards.length; i++) {
    const c = game.cards[i];
    if (c.state !== 'board') continue;
    if (x < c.x || x > c.x + TILE_W || y < c.y || y > c.y + TILE_H) continue;
    hits.push(c);
  }
  if (!hits.length) return null;
  hits.sort((a, b) => b.z - a.z || b.y - a.y || b.x - a.x);
  // 最上面那张如果被压住，就不响应 —— 不允许「透过上层牌点下层」
  return hits[0].blocked ? null : hits[0];
}

/* ==================== 背景 ==================== */

let bgCache = null;
let bgCacheDpr = 0;

/** 深色木质背景：静态内容烘焙一次，之后每帧只 blit */
export function drawBackground(ctx, t) {
  const dpr = typeof ctx.getTransform === 'function' ? (ctx.getTransform().a || 1) : 1;
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

  // 顶部一抹极淡的暖光，作为唯一动态元素
  const glow = ctx.createRadialGradient(W / 2, 90, 30, W / 2, 90, 520);
  glow.addColorStop(0, `rgba(255, 206, 140, ${0.07 + Math.sin(t * 0.6) * 0.012})`);
  glow.addColorStop(1, 'rgba(255, 206, 140, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 520);
}

function bakeBackground(ctx, dpr) {
  const doc = ctx.canvas && ctx.canvas.ownerDocument;
  if (!doc || typeof doc.createElement !== 'function') return null;
  const cv = doc.createElement('canvas');
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  const c = cv.getContext('2d');
  if (!c) return null;
  c.scale(dpr, dpr);

  // 1) 深色底
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bgTop);
  g.addColorStop(0.48, C.bgMid);
  g.addColorStop(1, C.bgBot);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  // 2) 木纹：一束缓慢起伏的横向暗纹
  c.save();
  c.lineWidth = 1.4;
  for (let i = 0; i < 58; i++) {
    const y0 = i * 22 + 6;
    c.strokeStyle = i % 2 ? 'rgba(146, 104, 62, 0.050)' : 'rgba(0, 0, 0, 0.10)';
    c.beginPath();
    for (let x = -10; x <= W + 10; x += 24) {
      const y =
        y0 +
        Math.sin(x * 0.012 + i * 0.7) * 5 +
        Math.sin(x * 0.031 + i * 1.7) * 2.2 +
        Math.sin(i * 2.3) * 4;
      if (x <= -10) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }
  c.restore();

  // 3) 中央承托暗区：让白色牌堆"坐"在光里
  const spot = c.createRadialGradient(W / 2, 560, 60, W / 2, 560, 460);
  spot.addColorStop(0, 'rgba(255, 232, 190, 0.055)');
  spot.addColorStop(0.6, 'rgba(255, 232, 190, 0.018)');
  spot.addColorStop(1, 'rgba(255, 232, 190, 0)');
  c.fillStyle = spot;
  c.fillRect(0, 60, W, 1000);

  // 4) 四角压暗
  const vig = c.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 820);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.62)');
  c.fillStyle = vig;
  c.fillRect(0, 0, W, H);

  return cv;
}

/* ==================== 顶部 HUD ==================== */

function iconMenu(ctx, cx, cy) {
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + i * 8);
    ctx.lineTo(cx + 10, cy + i * 8);
    ctx.stroke();
  }
}

function iconSound(ctx, cx, cy, on) {
  ctx.strokeStyle = C.gold;
  ctx.fillStyle = C.gold;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
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

function roundIconButton(ctx, b, draw, dim = false) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const r = b.w / 2;
  ctx.save();
  ctx.globalAlpha = dim ? 0.4 : 1;
  ctx.fillStyle = 'rgba(16, 13, 11, 0.62)';
  circle(ctx, cx, cy, r);
  ctx.fill();
  ctx.strokeStyle = 'rgba(235, 203, 134, 0.35)';
  ctx.lineWidth = 1.5;
  circle(ctx, cx, cy, r - 0.75);
  ctx.stroke();
  draw(ctx, cx, cy);
  ctx.restore();
}

export function drawHUD(ctx, game, ui) {
  // ---- 标题（金色渐变粗体，居中）----
  const tg = ctx.createLinearGradient(0, 30, 0, 74);
  tg.addColorStop(0, '#FFF0C8');
  tg.addColorStop(0.55, C.gold);
  tg.addColorStop(1, '#B98B41');
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  text(ctx, 'Mah了个Mah', W / 2, 50, {
    size: 34,
    weight: '800',
    fill: tg,
    family: '"Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", system-ui, sans-serif',
  });
  ctx.restore();

  // ---- 关卡进度 ----
  text(ctx, `第 ${game.level} 关 · 共 ${LEVEL_COUNT} 关`, W / 2, 92, {
    size: 18,
    weight: '700',
    fill: C.textDim,
  });

  // 细进度条
  const bw = 260;
  const bx = (W - bw) / 2;
  const by = 114;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  rr(ctx, bx, by, bw, 6, 3);
  ctx.fill();
  const p = clamp(game.progress(), 0, 1);
  if (p > 0.005) {
    const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    grad.addColorStop(0, '#8A6A31');
    grad.addColorStop(1, C.gold);
    ctx.fillStyle = grad;
    rr(ctx, bx, by, Math.max(6, bw * p), 6, 3);
    ctx.fill();
  }
  ctx.restore();

  text(ctx, `剩 ${game.remaining()} 张`, W / 2, 140, {
    size: 15,
    weight: '600',
    fill: 'rgba(228, 213, 190, 0.42)',
  });

  for (const b of ui.buttons) {
    if (b.id === 'menu') roundIconButton(ctx, b, iconMenu);
    if (b.id === 'sound') roundIconButton(ctx, b, (c, x, y) => iconSound(c, x, y, game.soundOn));
  }
}

/* ==================== 牌堆 ==================== */

/**
 * 静态牌堆的离屏缓存。
 *
 * 210 张牌 ×（投影 + 牌面）每帧全量重绘，在软件光栅化下要 50ms（19fps）。
 * 但牌堆在一局里只在"点击 / 撤销 / 洗牌 / 复活 / 移出 3 张"时才会变，
 * 所以把整堆烘焙成一张离屏位图，每帧只 drawImage 一次；
 * 只有入场动画期间才退回逐张实时绘制。
 */
let boardCache = null; // { cv, key }
let boardCacheDisabled = false;

export function drawBoard(ctx, game) {
  const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  // 尺寸只从统一常量源读，绝不按 layer / 关卡 / 数量缩放
  const tileW = TILE_W;
  const tileH = TILE_H;

  const alive = [];
  for (const c of game.cards) {
    if (c.state !== 'board') continue;
    if (c.x + tileW <= 0 || c.x >= W || c.y + tileH <= 0 || c.y >= H) continue;
    alive.push(c);
  }

  // 入场动画：有牌还在"落下"中就实时画
  let animating = false;
  for (const c of alive) {
    if (c.appearAt && now - c.appearAt < 320) {
      animating = true;
      break;
    }
  }

  const m = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
  const k = m && m.a > 0 ? m.a : 1;

  if (animating || boardCacheDisabled) {
    boardCache = null;
    paintBoard(ctx, game, alive, now);
    return;
  }

  const key = `${game.boardRev}|${k.toFixed(3)}|${tileW}|${tileH}`;
  if (!boardCache || boardCache.key !== key) {
    const c2 = ensureBoardCanvas(ctx, k);
    if (!c2) {
      boardCacheDisabled = true;
      paintBoard(ctx, game, alive, now);
      return;
    }
    c2.ctx.clearRect(0, 0, W, H);
    paintBoard(c2.ctx, game, alive, now);
    boardCache = { cv: c2.cv, key };
  }

  ctx.drawImage(boardCache.cv, 0, 0, W, H);

  // 悬停的牌单独补画在最上面（它必然没有被任何牌压住，画在最后不会破坏层级）
  for (const c of alive) {
    if (game.hoverId !== c.id || c.blocked) continue;
    // hover：轻微上浮 2px（第 6 步规范），不再用大幅放大
    drawTile(ctx, c.x, c.y, tileW, tileH, c.type, {
      covered: false,
      lift: 2,
      glow: 0.85,
    });
  }
}

function ensureBoardCanvas(ctx, k) {
  const doc = ctx.canvas && ctx.canvas.ownerDocument;
  if (!doc || typeof doc.createElement !== 'function') return null;
  const cv = doc.createElement('canvas');
  cv.width = Math.round(W * k);
  cv.height = Math.round(H * k);
  const c2 = cv.getContext('2d');
  if (!c2) return null;
  c2.setTransform(k, 0, 0, k, 0, 0);
  return { cv, ctx: c2 };
}

/**
 * 牌桌绒布垫。
 *
 * 牌堆如果直接漂在渐变背景上，看起来就像"贴在屏幕上的一层贴纸"；
 * 垫一块有边界的绒布，牌才有重量、影子才有落点。
 */
function drawTableMat(ctx) {
  const b = BOARD_BAND;
  const x = b.left - 8;
  const y = b.top - 12;
  const w = b.right - b.left + 16;
  const h = b.bottom - b.top + 24;
  const rad = 28;

  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(48, 64, 51, 0.52)');
  g.addColorStop(0.55, 'rgba(33, 46, 38, 0.40)');
  g.addColorStop(1, 'rgba(18, 26, 22, 0.26)');
  ctx.fillStyle = g;
  rr(ctx, x, y, w, h, rad);
  ctx.fill();

  // 边缘压暗、中心微亮 —— 一块被灯照着的桌面
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rg = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.74);
  rg.addColorStop(0, 'rgba(255, 240, 210, 0.055)');
  rg.addColorStop(1, 'rgba(0, 0, 0, 0.34)');
  ctx.fillStyle = rg;
  rr(ctx, x, y, w, h, rad);
  ctx.fill();

  ctx.strokeStyle = 'rgba(235, 203, 134, 0.10)';
  ctx.lineWidth = 1.5;
  rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, rad);
  ctx.stroke();
  ctx.restore();
}

function paintBoard(ctx, game, alive, now) {
  const tileW = TILE_W;
  const tileH = TILE_H;
  // 第 6 步绘制顺序：layer 升序 → 同层 y 升序 → 侧堆最后绘制。
  // z 由 generator.assignZ 按同一套顺序编号，所以「画在后面的」正好就是「压住别人的」。
  alive.sort((a, b) =>
    (a.side ? 1 : 0) - (b.side ? 1 : 0) ||
    a.layer - b.layer ||
    a.y - b.y ||
    a.x - b.x
  );

  // 牌桌绒布垫：把"这些牌是摞在一张桌子上"说清楚，牌堆才有立足的地方
  drawTableMat(ctx);

  // 整堆落在桌面上的承托阴影
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
    sh.addColorStop(0, 'rgba(0,0,0,0.55)');
    sh.addColorStop(0.65, 'rgba(0,0,0,0.22)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
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
      const kk = clamp((now - c.appearAt) / 300, 0, 1);
      if (kk < 1) {
        scale = 0.72 + 0.28 * easeOutCubic(kk);
        alpha = 0.35 + 0.65 * kk;
      }
    }

    // 投影由 drawTile 内部按规范设置（0.5 / blur 8 / offsetY 5），
    // 绘制后立即重置，不会污染下一张牌。被遮挡牌在牌面绘制里整体压暗 0.35。
    drawTile(ctx, c.x, c.y, tileW, tileH, c.type, {
      covered: !!c.blocked,
      scale,
      alpha,
    });
  }
}

/* ==================== 槽位 ==================== */

export function drawSlot(ctx, game, ui) {
  const sh = game.shake;
  const dx = sh > 0 ? Math.sin(game.time * 62) * sh * 7 : 0;

  ctx.save();
  ctx.translate(dx, 0);

  // 深色圆角长条背板
  ctx.save();
  ctx.fillStyle = C.panel;
  rr(ctx, SLOT_PANEL.x, SLOT_PANEL.y, SLOT_PANEL.w, SLOT_PANEL.h, 24);
  ctx.fill();
  ctx.strokeStyle = game.slotFlash > 0.05
    ? `rgba(255, 214, 138, ${0.25 + game.slotFlash * 0.6})`
    : C.panelLine;
  ctx.lineWidth = 1.6;
  rr(ctx, SLOT_PANEL.x + 0.8, SLOT_PANEL.y + 0.8, SLOT_PANEL.w - 1.6, SLOT_PANEL.h - 1.6, 23);
  ctx.stroke();
  ctx.restore();

  // 内部深槽 + 7 格细分线
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

  // 槽内牌：位置由 engine 每帧插值（落入 + 左移）
  for (const c of game.slot) {
    const x = c.vx == null ? c.x : c.vx;
    const y = c.vy == null ? c.y : c.vy;
    const tScale = c.vScale || 1;
    drawTileShadow(ctx, x, y, SLOT_CARD_W, SLOT_CARD_H, 0.4, 0.2);
    drawTile(ctx, x, y, SLOT_CARD_W, SLOT_CARD_H, c.type, {
      covered: false,
      scale: tScale,
    });
  }

  ctx.restore();

  // 移出道具的临时区：不占槽位，点击任一张可放回槽位
  const temp = game.temp || [];
  if (temp.length) {
    const w = TEMP_ZONE.max * TEMP_ZONE.pitch + 14;
    const x0 = TEMP_ZONE.x - 7;
    ctx.save();
    ctx.fillStyle = 'rgba(22, 19, 17, 0.82)';
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
        lift: game.hoverId === temp[i].id ? 2 : 0,
      });
    }
    text(ctx, '临时区 · 点击放回槽位', W / 2, TEMP_ZONE.y + TILE_H + 18, {
      size: 15,
      fill: C.textDim,
      weight: '600',
    });
  }

  const free = SLOT_SIZE - game.slot.length;
  text(ctx, `空位 ${free}`, W / 2, SLOT_PANEL.y + SLOT_PANEL.h - 10, {
    size: 15,
    fill: free <= 1 ? C.bad : C.textFaint,
    weight: '600',
  });
}

/* ==================== 道具栏 ==================== */

function toolIcon(ctx, id, cx, cy, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (id === 'shuffle') {
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 7);
    ctx.quadraticCurveTo(cx + 2, cy - 15, cx + 11, cy - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 11, cy - 2);
    ctx.lineTo(cx + 12, cy - 9);
    ctx.moveTo(cx + 11, cy - 2);
    ctx.lineTo(cx + 4, cy - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 8);
    ctx.quadraticCurveTo(cx + 2, cy + 16, cx + 11, cy + 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 11, cy + 3);
    ctx.lineTo(cx + 12, cy + 10);
    ctx.moveTo(cx + 11, cy + 3);
    ctx.lineTo(cx + 4, cy + 5);
    ctx.stroke();
  } else if (id === 'undo') {
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 11, Math.PI * 0.95, Math.PI * 2.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 7);
    ctx.lineTo(cx - 11, cy + 2);
    ctx.lineTo(cx - 2, cy + 2);
    ctx.stroke();
  } else {
    // 移出：托盘 + 向上箭头
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy + 1);
    ctx.lineTo(cx - 9, cy + 12);
    ctx.lineTo(cx + 9, cy + 12);
    ctx.lineTo(cx + 13, cy + 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 5);
    ctx.lineTo(cx, cy - 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 5.5, cy - 6);
    ctx.lineTo(cx, cy - 13);
    ctx.lineTo(cx + 5.5, cy - 6);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawTools(ctx, game, ui) {
  for (const b of ui.buttons) {
    if (b.kind !== 'tool') continue;
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const on = b.enabled;
    const color = on ? C.gold : 'rgba(170, 150, 120, 0.35)';

    // 半透明圆形底框
    ctx.save();
    ctx.globalAlpha = on ? 1 : 0.55;
    ctx.fillStyle = on ? 'rgba(52, 44, 36, 0.85)' : 'rgba(28, 24, 21, 0.7)';
    circle(ctx, cx, cy, b.w / 2);
    ctx.fill();
    ctx.strokeStyle = on ? 'rgba(235, 203, 134, 0.5)' : 'rgba(150, 128, 96, 0.22)';
    ctx.lineWidth = 1.8;
    circle(ctx, cx, cy, b.w / 2 - 1);
    ctx.stroke();
    // 顶部一道细高光，增强"玻璃片"质感
    ctx.strokeStyle = on ? 'rgba(255, 240, 205, 0.28)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, b.w / 2 - 4, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.restore();

    toolIcon(ctx, b.id, cx, cy, color);

    // 剩余次数：右上角红色小圆点徽章
    const n = b.count ?? 0;
    const bx = cx + b.w / 2 - 6;
    const by = cy - b.h / 2 + 6;
    ctx.save();
    ctx.fillStyle = n > 0 ? C.red : 'rgba(70, 58, 46, 0.95)';
    circle(ctx, bx, by, 11);
    ctx.fill();
    ctx.strokeStyle = 'rgba(12, 9, 7, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    text(ctx, String(n), bx, by + 0.5, {
      size: 14,
      weight: '800',
      fill: n > 0 ? '#FFF3DE' : 'rgba(200, 180, 150, 0.55)',
    });

    text(ctx, b.label, cx, b.y - 16, {
      size: 16,
      weight: '600',
      fill: on ? C.textDim : C.textFaint,
    });
  }
}

/* ==================== 按钮 ==================== */

export function drawButtons(ctx, ui, game) {
  for (const b of ui.buttons) {
    if (b.kind === 'icon' || b.kind === 'tool') continue;
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    ctx.save();
    const solid = b.kind === 'primary' || b.kind === 'danger';
    const danger = b.kind === 'danger' || b.kind === 'danger-ghost';

    if (solid) {
      const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
      g.addColorStop(0, b.enabled ? '#D2543C' : '#5C4438');
      g.addColorStop(1, b.enabled ? '#96291A' : '#3E2E26');
      ctx.fillStyle = g;
      rr(ctx, b.x, b.y, b.w, b.h, b.h / 2);
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      ctx.fill();
      ctx.shadowColor = 'rgba(0,0,0,0)';
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 220, 160, 0.6)';
      ctx.lineWidth = 1.8;
      rr(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 2, b.h / 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = danger ? 'rgba(200, 69, 47, 0.10)' : 'rgba(255,255,255,0.05)';
      rr(ctx, b.x, b.y, b.w, b.h, b.h / 2);
      ctx.fill();
      ctx.strokeStyle = danger ? 'rgba(224, 112, 92, 0.72)' : 'rgba(235, 203, 134, 0.4)';
      ctx.lineWidth = 1.6;
      rr(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 2, b.h / 2);
      ctx.stroke();
    }
    ctx.restore();
    text(ctx, b.label, cx, cy + 1, {
      size: b.size || 26,
      weight: '700',
      fill: solid ? '#FFF6E2' : danger ? C.redSoft : C.text,
    });
  }
}

/* ==================== 标题页 ==================== */

export function drawTitleScreen(ctx, game, ui, t) {
  drawMascot(ctx, W / 2, 470, 1.35, t);
  drawTitle(ctx, W / 2, 700, 62);
  text(ctx, '堆叠 · 三消 · 只有两关，第 2 关是道坎', W / 2, 764, {
    size: 22,
    fill: C.textDim,
    weight: '600',
  });

  if (game.best >= LEVEL_COUNT) {
    text(ctx, '已毕业 · 两关全部通关', W / 2, 808, { size: 19, fill: C.gold, weight: '700' });
  } else if (game.best > 1) {
    text(ctx, '已通关第 1 关 · 卡在第 2 关', W / 2, 808, { size: 19, fill: C.gold, weight: '700' });
  }
  if (!game.uninstallAsk) drawButtons(ctx, ui, game);

  text(ctx, '点击未被遮挡的牌 → 收入底部槽位 → 三张相同自动消除', W / 2, 1090, {
    size: 17,
    fill: C.textFaint,
  });
  text(ctx, '槽位 7 格，放满且无法消除即失败', W / 2, 1122, {
    size: 17,
    fill: 'rgba(228, 213, 190, 0.22)',
  });
}

/* ==================== 结算 / 暂停面板 ==================== */

function panel(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.66)';
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#2B2521');
  g.addColorStop(1, '#141110');
  ctx.fillStyle = g;
  rr(ctx, x, y, w, h, 28);
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(235, 203, 134, 0.45)';
  ctx.lineWidth = 2;
  rr(ctx, x + 1, y + 1, w - 2, h - 2, 27);
  ctx.stroke();
  ctx.restore();
}

export function drawOverlay(ctx, game, ui) {
  // 卸载确认框是独立的一层，避免和胜负/暂停面板叠在一起
  if (game.uninstallAsk) return;
  if (game.status === 'win') {
    panel(ctx, 90, 380, W - 180, 420);
    if (game.graduated) {
      text(ctx, '毕业啦！', W / 2, 456, { size: 44, weight: '800', fill: C.gold });
      text(ctx, '全部牌都清空了', W / 2, 516, { size: 22, fill: C.text });
      text(ctx, `用时 ${((performance.now() - game.levelStartAt) / 1000).toFixed(1)} 秒`, W / 2, 556, {
        size: 22,
        fill: C.textDim,
      });
      text(ctx, '你把这堆牌清空了 —— 没有下一关了', W / 2, 616, { size: 19, fill: C.textDim });
    } else {
      text(ctx, '这一关过啦！', W / 2, 460, { size: 40, weight: '800', fill: C.gold });
      text(ctx, `第 ${game.level} 关 · 全部消除完成`, W / 2, 520, { size: 22, fill: C.text });
      text(ctx, `用时 ${((performance.now() - game.levelStartAt) / 1000).toFixed(1)} 秒`, W / 2, 560, {
        size: 22,
        fill: C.textDim,
      });
      text(ctx, '下一关：225 张 · 12 条牌链 · 深渊在后头', W / 2, 610, { size: 19, fill: '#E8A66F' });
      text(ctx, '开局管够，越往下越不讲道理', W / 2, 642, { size: 18, fill: C.textDim });
    }
    drawButtons(ctx, ui, game);
  } else if (game.status === 'lose') {
    panel(ctx, 90, 380, W - 180, 460);
    text(ctx, '槽位满了', W / 2, 460, { size: 40, weight: '800', fill: '#E8836F' });
    text(ctx, '7 个格子都被占住，没能凑出三张相同', W / 2, 516, { size: 20, fill: C.text });
    text(
      ctx,
      game.reviveLeft > 0 ? '还有 1 次本地复活机会，可清空槽位继续' : '本关复活机会已用完',
      W / 2,
      560,
      { size: 19, fill: C.textDim }
    );
    text(ctx, `牌堆还剩 ${game.boardCount()} 张`, W / 2, 610, { size: 20, fill: C.textDim });
    drawButtons(ctx, ui, game);
  }

  if (game.paused) {
    panel(ctx, 90, 420, W - 180, 440);
    text(ctx, '暂停', W / 2, 500, { size: 38, weight: '800', fill: C.gold });
    text(ctx, `当前第 ${game.level} 关　剩余 ${game.remaining()} 张`, W / 2, 548, {
      size: 20,
      fill: C.textDim,
    });
    drawButtons(ctx, ui, game);
  }
}

/* ==================== 卸载确认（绿色版专属） ==================== */

export function drawUninstallConfirm(ctx, game, ui) {
  if (!game.uninstallAsk) return;
  panel(ctx, 80, 400, W - 160, 420);
  text(ctx, '卸载并删除数据', W / 2, 470, { size: 34, weight: '800', fill: '#E8836F' });
  text(ctx, '确定要彻底删除本游戏及所有存档吗？', W / 2, 540, { size: 21, fill: C.text });
  text(ctx, '将删除 exe 同级的 MahLeMah_Data 文件夹、全部存档', W / 2, 584, {
    size: 17,
    fill: C.textDim,
  });
  text(ctx, '以及游戏程序本身，此操作不可撤销', W / 2, 614, { size: 17, fill: C.textDim });
  drawButtons(ctx, ui, game);
}

/* ==================== 特效 ==================== */

export function drawFx(ctx, game) {
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
