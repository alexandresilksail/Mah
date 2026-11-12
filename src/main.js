/** 入口：初始化画布缩放、输入、主循环、存档 */
import { W, H, LEVEL_COUNT, SLOT_SIZE, rollProfile } from './game/config.js';
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
import { makeSaveData, applySaveToGame } from './game/save_data.js';
import { createNewGame } from './game/new_game.js';
import { historyFor } from './game/recent_games.js';
import { readBuildInfo } from './game/build_info.js';

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
  // v:2 —— 新增 p1 / p2（两关当前档位 id）。毕业时 level=1、best 保持 2；
  // 旧档里的 music / musicVol 已废弃，读入时忽略（Rust 白名单仍兼容）。
  const data = makeSaveData(game);
  writeSave(data);
  writeDesktopSave(data);
}

function applyAudioSettings() {
  sound.setEnabled(game.soundOn);
  sound.setVolume(game.sfxVol);
}

/* ---------------- 开发调试面板（正式版默认隐藏） ----------------
 * 只在 ?dev=1 或 window.__MAH_DEV__ 时创建；所有字段都来自真实运行数据
 * （game.meta），没有任何固定模拟值。用 DOM 而非 Canvas，legacy 兼容版
 * 与现代版看到的是同一份数据。 */
let devPanel = null;
let lastPanelGameId = '';

function ensureDevPanel() {
  if (devPanel) return devPanel;
  const q = new URLSearchParams(location.search);
  const on = q.get('dev') === '1' || window.__MAH_DEV__ === true;
  if (!on || !document.body) return null;
  const el = document.createElement('div');
  el.id = 'mah-dev-panel';
  el.setAttribute('data-mah-dev', '1');
  el.style.cssText = [
    'position:fixed', 'left:8px', 'top:8px', 'z-index:9999',
    'max-width:420px', 'max-height:92vh', 'overflow:auto',
    'background:#fffaf0', 'color:#3a2a18', 'border:1px solid #d79b33',
    'border-radius:8px', 'padding:10px 12px',
    'font:12px/1.55 Consolas,Monaco,monospace',
    'box-shadow:0 6px 20px rgba(0,0,0,.25)', 'white-space:pre-wrap',
  ].join(';');
  document.body.appendChild(el);
  devPanel = el;
  return devPanel;
}

function appendLine(node, s) {
  const row = document.createElement('div');
  row.appendChild(document.createTextNode(s));
  node.appendChild(row);
}

function updateDevPanel(meta) {
  if (!devPanel) return;
  while (devPanel.firstChild) devPanel.removeChild(devPanel.firstChild);
  if (!meta) {
    appendLine(devPanel, '[MahLeMah DEV] 等待新牌局…（本面板仅 ?dev=1 显示）');
    const b = readBuildInfo();
    appendLine(devPanel, 'buildVersion=' + b.buildVersion + ' gitCommit=' + b.gitCommit);
    appendLine(devPanel, 'sourceHash=' + b.sourceHash + ' buildTimestamp=' + b.buildTimestamp);
    return;
  }
  appendLine(devPanel, '=== MahLeMah 开发调试面板（真实运行数据）===');
  const fields = [
    ['gameId', meta.gameId], ['buildVersion', meta.buildVersion],
    ['gitCommit', meta.gitCommit], ['sourceHash', meta.sourceHash],
    ['level', meta.level], ['difficultyId', meta.difficultyId],
    ['seed', meta.seed], ['totalTiles', meta.totalTiles],
    ['tileTypeCount', meta.tileTypeCount], ['layerCount', meta.layerCount],
    ['layoutSignature', meta.layoutSignature], ['geometrySignature', meta.geometrySignature],
    ['distributionSignature', meta.distributionSignature],
    ['generatedAt', meta.generatedAt], ['generationReason', meta.generationReason],
    ['attempts', meta.attempts], ['retries', meta.retries],
  ];
  for (const f of fields) appendLine(devPanel, f[0] + ' = ' + f[1]);
  appendLine(devPanel, '--- 检查 ---');
  const c = meta.checks;
  appendLine(devPanel, '牌数检查     : ' + c.tileCountCheck);
  appendLine(devPanel, '布局检查     : ' + c.layoutCheck);
  appendLine(devPanel, '难度档位检查 : ' + c.difficultyCheck);
  appendLine(devPanel, '历史记录保存 : ' + c.historyCheck);
  appendLine(devPanel, '--- previousThreeChecks（本关最近三局）---');
  const list = meta.previousThreeChecks || [];
  if (!list.length) appendLine(devPanel, '(本关暂无历史)');
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    appendLine(devPanel, '  [' + (i + 1) + '] ' + r.totalTiles + ' 张 · 牌数=' + r.tileCountCheck +
      ' / 布局=' + r.layoutCheck + ' · ' + String(r.layoutSignature).slice(0, 12) + ' · ' + r.gameId);
  }
  appendLine(devPanel, '--- 当前持久化历史 ---');
  appendLine(devPanel, 'L1 = ' + historyFor(game.saveState, 1).length +
    ' 条 / L2 = ' + historyFor(game.saveState, 2).length + ' 条');
}

/**
 * 全项目唯一的新牌局包装：所有 UI 入口（应用重启后开始 / 标题页重开 /
 * 失败重开 / 进入下一关 / 毕业再玩 / 键盘 r / ?lv=）都只走这里。
 * createNewGame 内部完成档位重选、seed、签名、最近三局差异化与完整校验；
 * 50 次仍不合格时抛明确错误，绝不退化成「复用上一局」。
 */
let saveState = {};
let firstStart = true;

function newGame(level, generationReason) {
  let result;
  try {
    result = createNewGame({
      level,
      generationReason,
      game,
      save: game.saveState || saveState || {},
      rand: Math.random,
    });
  } catch (e) {
    // 明确的生成失败：保留当前牌局，不自动接受重复布局，也不伪造成功
    console.error('[mah] createNewGame 失败', e && e.name, e && e.message, e && e.detail);
    if (devPanel) {
      appendLine(devPanel, '=== 生成失败 ===');
      appendLine(devPanel, String(e && e.message));
      appendLine(devPanel, 'attempts=' + (e && e.detail && e.detail.attempts));
      appendLine(devPanel, 'reason=' + (e && e.detail && e.detail.reason));
    }
    return null;
  }
  game.saveState = result.nextSave;
  saveState = result.nextSave;
  persist(true);
  if (devPanel) {
    lastPanelGameId = result.meta.gameId;
    updateDevPanel(result.meta);
  }
  return result;
}

function handleButton(id) {
  if (id !== 'sound') sound.click();
  switch (id) {
    case 'start':
      // 三种重新开局入口 A/B 共用 createNewGame：
      //  · 应用重启后第一次开始 → application_restart
      //  · 之后从标题页再开始   → title_screen_restart
      //  · 毕业后「开始新一轮」 → new_game（存档 level 已写 1）
      // 绝不因为读回旧存档而复用档位 / seed / 布局。
      {
        const reason = firstStart
          ? 'application_restart'
          : (game.graduated ? 'new_game' : 'title_screen_restart');
        firstStart = false;
        newGame(game.level, reason);
      }
      break;
    case 'sound':
      game.soundOn = !game.soundOn;
      sound.setEnabled(game.soundOn);
      persist(true);
      break;
    case 'settings':
      game._pausedBeforeSettings = game.paused;
      game.paused = true;
      game.settingsAsk = true;
      break;
    case 'settings-close':
      game.settingsAsk = false;
      game.paused = game._pausedBeforeSettings || false;
      persist(true);
      break;
    case 'set-sfx':
      game.soundOn = !game.soundOn;
      sound.setEnabled(game.soundOn);
      persist(true);
      break;
    case 'set-sfx-minus':
      game.sfxVol = Math.max(0, Math.round((game.sfxVol - 0.1) * 100) / 100);
      sound.setVolume(game.sfxVol);
      persist(true);
      break;
    case 'set-sfx-plus':
      game.sfxVol = Math.min(1, Math.round((game.sfxVol + 0.1) * 100) / 100);
      sound.setVolume(game.sfxVol);
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
      // 三种重新开局入口 C：失败面板 / 暂停菜单 / 普通胜利「重玩」/ 毕业「再玩一次」
      // 全部走同一个 createNewGame，差异化规则与 A、B 完全一致。
      {
        const lv = game.graduated ? 1 : game.level;
        const reason = game.status === 'lose'
          ? 'failure_restart'
          : (game.graduated ? 'new_game' : 'title_screen_restart');
        newGame(lv, reason);
      }
      break;
    case 'next':
      newGame(Math.min(LEVEL_COUNT, game.level + 1), 'new_game');
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

/** 解锁音效：浏览器自动播放策略要求首次用户手势后才允许出声。
 *  Sound 自建唯一 AudioContext，反复调用 ensure() 只会复用同一个实例。 */
function unlockAudio() {
  try {
    sound.ensure();
    game.audioUnlocked = true;
  } catch { /* 音频失败不影响游戏 */ }
}

function onDown(e) {
  if (e.preventDefault) e.preventDefault();
  unlockAudio(); // 自动播放限制：首次交互后才允许出声
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

/* 兜底解锁：即便首次点击落在画布之外（如页面留白、滚动条），
 * 也能通过 document 级的一次性监听解锁音效，避免「点了却没声」。 */
function onceUnlock() {
  unlockAudio();
  if (typeof document !== 'undefined' && document.removeEventListener) {
    document.removeEventListener('pointerdown', onceUnlock);
    document.removeEventListener('keydown', onceUnlock);
    document.removeEventListener('touchstart', onceUnlock);
  }
}
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('pointerdown', onceUnlock, { once: false });
  document.addEventListener('keydown', onceUnlock, { once: false });
  document.addEventListener('touchstart', onceUnlock, { once: false });
}

on(window, 'keydown', (e) => {
  // IE8/IE9 只有 keyCode，没有 e.key
  const k = e.key || String.fromCharCode(e.keyCode || 0);
  if (k === 'Escape' || k === 'Esc') {
    if (game.screen === 'play') game.paused = !game.paused;
  } else if (k === 'r' || k === 'R') {
    if (game.screen === 'play') newGame(game.level, 'title_screen_restart');
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

  // 卸载确认框 / 设置面板永远画在最上层（标题页 / 暂停面板之上）
  if (ctx && game.uninstallAsk) R.drawUninstallConfirm(ctx, game, ui);
  if (ctx && game.settingsAsk) R.drawSettingsPanel(ctx, game, ui);

  if (game.screen === 'play' && game.status === 'win') persist(true);
  // 调试面板跟随真实 meta 变化刷新（不是每帧重画）
  if (devPanel && game.meta && game.meta.gameId !== lastPanelGameId) {
    lastPanelGameId = game.meta.gameId;
    updateDevPanel(game.meta);
  }

  raf(frame);
}

/* ---------------- 启动 ---------------- */
function applySave(saved, preserveProfile = false) {
  if (!saved || typeof saved !== 'object') return;
  // 第 4.3 节：p1/p2 容错读取（旧存档缺字段按缺省档位 0，不判非法）
  applySaveToGame(game, saved, preserveProfile);
  applyAudioSettings();
}

function boot() {
  fit();
  fetchDataDir(function (dir) {
    dataDir = dir; // 仅桌面版有值；只读诊断，卸载由安装器的卸载程序处理
    if (dir) console.info('[mah] 数据目录 ' + dir);
  });
  applySave(loadSave());          // 同步：所有浏览器
  // 第 2.3 ①：启动后两关都重抽档位，各自 ≠ 存档里上次的 p1 / p2。
  // 第 2.4 节：抽取后立即 persist(true) 写入 p1/p2。
  game.profile.l1 = rollProfile(1, Math.random, game.profile.l1);
  game.profile.l2 = rollProfile(2, Math.random, game.profile.l2);
  persist(true);
  // 异步桌面存档只覆盖音量等设置，不覆盖刚抽好的档位
  syncDesktopSave((raw) => applySave(raw, true));

  // 启动自检：第 1 关校验可解性；第 2 关只做"发牌是否合法"的体检（不校验可解）
  try {
    const l1 = generateLevel(1, 1234, { profile: game.profile.l1 });
    const l2 = generateLevel(2, 5678, { profile: game.profile.l2 });
    const kinds = new Set(l2.cards.map((c) => c.type)).size;
    const legal = l2.cards.length % 3 === 0;
    console.info(
      `[selfcheck] L1 可解=${verify(l1)} · L2 ${l2.cards.length}张/${kinds}型/可点${l2.visible}张/模式=${l2.mode}/三倍数=${legal} · desktop=${isDesktop}`
    );
  } catch (e) {
    console.warn('[selfcheck] failed', e);
  }

  // 供自动化验证与调试使用（IE COM 测试脚本会读它）
  window.__mah = {
    game, sound, R, hasCanvas, domView,
    createNewGame, newGame,
    getSaveState: () => game.saveState || saveState,
    getDevPanel: () => devPanel,
  };

  ensureDevPanel();
  updateDevPanel(game.meta);

  // 开发调试：?lv=2 直接进第 2 关；?pick=N 先点 N 张可点的牌（用来看槽位动画）
  const q = new URLSearchParams(location.search);
  if (q.has('lv')) {
    firstStart = false;
    newGame(Math.max(1, parseInt(q.get('lv'), 10) || 1), 'new_game');
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
