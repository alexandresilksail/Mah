/** 入口：初始化画布缩放、输入、主循环、存档 */
import { W, H, LEVEL_COUNT, SLOT_SIZE } from './game/config.js';
import { Game } from './game/engine.js';
import { Sound } from './game/audio.js';
import * as R from './game/render.js';
import {
  loadSave,
  writeSave,
  syncDesktopSave,
  writeDesktopSave,
  isDesktop,
  fetchDataDir,
} from './game/store.js';
import { generateLevel, verify } from './game/generator.js';

const canvas = document.getElementById('game');
const stage = document.getElementById('stage');

/* IE8/IE7 没有 <canvas>.getContext —— 自动切到 DOM 降级渲染器。
   __MAH_DOM_VIEW__ 由 legacy 构建内联，现代版不含，所以这里不会多占体积。 */
const hasCanvas = !!(canvas.getContext && canvas.getContext('2d'));
const ctx = hasCanvas ? canvas.getContext('2d', { alpha: false }) : null;
const domView = hasCanvas ? null :
  (typeof window.__MAH_DOM_VIEW__ === 'function'
    ? window.__MAH_DOM_VIEW__(stage, canvas, W, H)
    : null);

const sound = new Sound();
const game = new Game(sound);

/* ---------------- 自适应缩放（720x1280 居中） ---------------- */
let dpr = 1;
function viewport() {
  if (typeof window.__mahViewport === 'function') return window.__mahViewport();
  return { w: window.innerWidth, h: window.innerHeight };
}
/* 老浏览器可能没有 performance / requestAnimationFrame，或被宿主做成只读属性。
   优先用兼容垫片提供的安全封装，现代浏览器仍走原生，行为不变。 */
function nowMs() {
  if (typeof window.__mahNow === 'function') return window.__mahNow();
  if (window.performance && typeof window.performance.now === 'function') return window.performance.now();
  return Date.now();
}
function raf(fn) {
  if (typeof window.__mahRaf === 'function') return window.__mahRaf(fn);
  if (window.requestAnimationFrame) return window.requestAnimationFrame(fn);
  return setTimeout(function () { fn(Date.now()); }, 16);
}
function fit() {
  const vp = viewport();
  const legacy = !!window.__MAH_LEGACY__;

  if (legacy) {
    // 老浏览器不认 min() / aspect-ratio / inset / flex，尺寸全靠 JS 算
    const shownW = Math.max(1, Math.min(vp.w, (vp.h * W) / H));
    const shownH = (shownW * H) / W;
    if (domView) {
      domView.resize(shownW, shownH, vp.w, vp.h);
    } else {
      canvas.style.position = 'absolute';
      canvas.style.width = shownW + 'px';
      canvas.style.height = shownH + 'px';
      canvas.style.left = Math.round((vp.w - shownW) / 2) + 'px';
      canvas.style.top = Math.round((vp.h - shownH) / 2) + 'px';
    }
  }

  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const shown = Math.max(1, rect.width || Math.min(vp.w, (vp.h * W) / H));
  dpr = Math.min(Math.max((window.devicePixelRatio || 1) * (shown / W), 1), 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
}

/* ---------------- 输入 ---------------- */
/* IE8 的 TextRectangle 没有 width/height，只有 left/right/top/bottom */
function rectSize(r) {
  return {
    w: r.width != null ? r.width : r.right - r.left,
    h: r.height != null ? r.height : r.bottom - r.top,
  };
}
function pointOf(e) {
  if (e.touches && e.touches.length) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches.length) {
    return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
  }
  return { clientX: e.clientX || 0, clientY: e.clientY || 0 };
}
function toLocal(e) {
  const r = domView ? domView.getRect() : canvas.getBoundingClientRect();
  const sz = rectSize(r);
  const p = pointOf(e);
  return {
    x: ((p.clientX - r.left) / (sz.w || 1)) * W,
    y: ((p.clientY - r.top) / (sz.h || 1)) * H,
  };
}
function on(node, type, fn) {
  if (typeof window.__mahOn === 'function') window.__mahOn(node, type, fn);
  else if (node && node.addEventListener) node.addEventListener(type, fn, false);
}

let dataDir = ''; // <exe 同级>/MahLeMah_Data（只读展示；v2 前端不再据此删除任何文件）

let lastSave = 0;
function persist(force = false) {
  const now = nowMs();
  if (!force && now - lastSave < 800) return;
  lastSave = now;
  const data = { v: 1, level: game.level, best: Math.max(1, game.best), sound: game.soundOn };
  writeSave(data);
  writeDesktopSave(data);
}

function handleButton(id) {
  if (id !== 'sound') sound.click();
  switch (id) {
    case 'start':
      game.startLevel(game.level, undefined);
      break;
    case 'sound':
      game.soundOn = !game.soundOn;
      sound.setEnabled(game.soundOn);
      persist(true);
      break;
    case 'menu':
      game.paused = !game.paused;
      break;
    case 'resume':
      game.paused = false;
      break;
    case 'restart':
    case 'replay':
      game.paused = false;
      game.startLevel(game.level);
      break;
    case 'next':
      game.startLevel(game.level + 1);
      persist(true);
      break;
    case 'home':
      game.paused = false;
      game.screen = 'title';
      game.status = 'play';
      persist(true);
      break;
    case 'revive':
      game.useRevive();
      break;
    case 'shuffle':
      game.useShuffle();
      break;
    case 'undo':
      game.useUndo();
      break;
    case 'remove':
      game.useRemove();
      break;
    case 'uninstall':
      // v2.0.0：游戏内不再自删除，改为展示「如何用正规卸载程序卸载」的说明
      game.paused = true;
      game.uninstallAsk = true;
      break;
    case 'uninstall-no':
      game.uninstallAsk = false;
      game.paused = false;
      break;
    default:
      break;
  }
}

/**
 * v2.0.0 安全边界：前端不再删除任何文件或调用系统命令。
 * 卸载由 NSIS 安装器生成的卸载程序负责；游戏内按钮只展示操作指引，
 * 关闭说明时仅恢复暂停状态，不改动牌局 / 存档 / 磁盘。
 */

function onDown(e) {
  if (e.preventDefault) e.preventDefault();
  sound.ensure();
  const p = toLocal(e);
  const ui = R.getUI(game);
  const btn = R.hitButton(ui, p.x, p.y);
  if (btn) {
    if (btn.enabled === false) {
      sound.deny();
      return;
    }
    handleButton(btn.id);
    return;
  }
  if (game.screen === 'play' && !game.paused && game.status === 'play') {
    const card = R.cardAt(game, p.x, p.y);
    if (card) game.pick(card);
  }
}

function onMove(e) {
  if (game.screen !== 'play') {
    game.hoverId = -1;
    return;
  }
  const p = toLocal(e);
  const c = R.cardAt(game, p.x, p.y);
  game.hoverId = c ? c.id : -1;
  const node = domView ? domView.root : canvas;
  node.style.cursor = c && !c.blocked ? 'pointer' : 'default';
}

const hitNode = domView ? domView.root : canvas;
const usePointer = !window.__MAH_IS_IE__ && typeof window.PointerEvent === 'function';

if (usePointer) {
  on(hitNode, 'pointerdown', onDown);
  on(hitNode, 'pointermove', onMove);
  on(hitNode, 'pointerleave', () => { game.hoverId = -1; });
} else {
  // IE 全系列 + 老浏览器：mouse 事件；顺带补 touch 以支持移动端
  on(hitNode, 'mousedown', onDown);
  on(hitNode, 'mousemove', onMove);
  on(hitNode, 'mouseout', () => { game.hoverId = -1; });
  on(hitNode, 'touchstart', onDown);
  on(hitNode, 'touchmove', onMove);
}
on(hitNode, 'contextmenu', (e) => { if (e.preventDefault) e.preventDefault(); });

on(window, 'resize', fit);
on(window, 'orientationchange', () => setTimeout(fit, 120));
on(window, 'keydown', (e) => {
  // IE8/IE9 只有 keyCode，没有 e.key
  const k = e.key || String.fromCharCode(e.keyCode || 0);
  if (k === 'Escape' || k === 'Esc') {
    if (game.screen === 'play') game.paused = !game.paused;
  } else if (k === 'r' || k === 'R') {
    if (game.screen === 'play') game.startLevel(game.level);
  } else if (k === '1') {
    game.useShuffle();
  } else if (k === '2') {
    game.useUndo();
  } else if (k === '3') {
    game.useRemove();
  }
});

/* ---------------- 主循环 ---------------- */
let prev = nowMs();
let perfFrames = 0;
let perfAcc = 0;
let perfOn = false;

function frame(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;
  const t = now / 1000;
  game.tick(dt);

  // 开发用帧率采样：?fps=1 → 120 帧后把结果写进 document.title
  if (perfOn) {
    perfAcc += dt;
    perfFrames++;
    if (perfFrames >= 120) {
      perfOn = false;
      const ms = (perfAcc / perfFrames) * 1000;
      document.title = `fps=${(1000 / ms).toFixed(1)} frame=${ms.toFixed(2)}ms`;
    }
  }

  const ui = R.getUI(game);

  if (domView) {
    // 无 Canvas：DOM 渲染器只重画离散状态变化，悬停只改边框
    domView.render(game, ui);
  } else if (ctx) {
    ctx.clearRect(0, 0, W, H);
    R.drawBackground(ctx, t);

    if (game.screen === 'title') {
      R.drawTitleScreen(ctx, game, ui, t);
    } else {
      R.drawBoard(ctx, game);
      R.drawSlot(ctx, game, ui);
      R.drawTools(ctx, game, ui);
      R.drawHUD(ctx, game, ui);
      R.drawFx(ctx, game);
      R.drawOverlay(ctx, game, ui);
    }
  }

  // 卸载确认框永远画在最上层（标题页 / 暂停面板之上）
  if (ctx && game.uninstallAsk) R.drawUninstallConfirm(ctx, game, ui);

  if (game.screen === 'play' && game.status === 'win') persist(true);

  raf(frame);
}

/* ---------------- 启动 ---------------- */
function applySave(saved) {
  if (!saved || typeof saved !== 'object') return;
  game.level = Math.max(1, saved.level || 1);
  game.best = Math.max(1, saved.best || 1);
  game.soundOn = saved.sound !== false;
  sound.setEnabled(game.soundOn);
}

function boot() {
  fit();
  fetchDataDir(function (dir) {
    dataDir = dir; // 仅桌面版有值；只读诊断，卸载由安装器的卸载程序处理
    if (dir) console.info('[mah] 数据目录 ' + dir);
  });
  applySave(loadSave());          // 同步：所有浏览器
  syncDesktopSave(applySave);     // 异步：仅 Tauri 桌面端，稍晚覆盖

  // 启动自检：第 1 关校验可解性；第 2 关只做"发牌是否合法"的体检（不校验可解）
  try {
    const l1 = generateLevel(1, 1234);
    const l2 = generateLevel(2, 5678);
    const kinds = new Set(l2.cards.map((c) => c.type)).size;
    const legal = l2.cards.length % 3 === 0;
    console.info(
      `[selfcheck] L1 可解=${verify(l1)} · L2 ${l2.cards.length}张/${kinds}型/可点${l2.visible}张/模式=${l2.mode}/三倍数=${legal} · desktop=${isDesktop}`
    );
  } catch (e) {
    console.warn('[selfcheck] failed', e);
  }

  // 供自动化验证与调试使用（IE COM 测试脚本会读它）
  window.__mah = { game, sound, R, hasCanvas, domView };

  // 开发调试：?lv=2 直接进第 2 关；?pick=N 先点 N 张可点的牌（用来看槽位动画）
  const q = new URLSearchParams(location.search);
  if (q.has('lv')) {
    game.startLevel(Math.max(1, parseInt(q.get('lv'), 10) || 1));
  }
  if (q.has('pick')) {
    const n = Math.max(0, parseInt(q.get('pick'), 10) || 0);
    for (let i = 0; i < n; i++) {
      const free = game.cards.filter((c) => c.state === 'board' && !c.blocked);
      const pick = free.find((c) => !game.slot.some((s) => s.type === c.type)) || free[0];
      if (!pick) break;
      game.pick(pick);
    }
  }
  if (q.has('hover')) {
    const free = game.cards.filter((c) => c.state === 'board' && !c.blocked);
    if (free.length) game.hoverId = free[Math.floor(free.length / 2)].id;
  }
  if (q.has('fps')) perfOn = true;

  // 开发调试用的面板预览：?demo=win / ?demo=lose
  if (q.get('demo') === 'win') {
    game.status = 'win';
    game.graduated = game.level >= LEVEL_COUNT;
  }
  if (q.get('demo') === 'lose') {
    // 造一个"真的会失败"的槽：每种最多 2 张，凑不出三消，填满 7 格
    let guard = 0;
    while (game.slot.length < SLOT_SIZE && guard++ < 400) {
      const cnt = new Map();
      for (const c of game.slot) cnt.set(c.type, (cnt.get(c.type) || 0) + 1);
      const cand = game.cards.find(
        (x) => x.state === 'board' && !x.blocked && (cnt.get(x.type) || 0) < 2
      );
      if (!cand) break;
      game.pick(cand);
    }
    if (game.slot.length >= SLOT_SIZE) game.status = 'lose';
  }
  if (q.get('demo') === 'used') {
    const c = game.cards.find((x) => x.state === 'board' && !x.blocked);
    if (c) game.pick(c);
    game.useShuffle();
    game.useRemove();
    game.useUndo();
  }
  if (q.get('demo') === 'pause') game.paused = true;

  raf(frame);
}

boot();
