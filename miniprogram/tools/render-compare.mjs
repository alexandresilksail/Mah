/**
 * 双端渲染对照：同一 game 实例、同一牌局数据，
 * 分别用 Windows src/game/render.js 与 微信 core/mah-core.js 绘制，
 * 导出 PNG 并逐像素比对。任何差异只可能来自渲染代码本身。
 *
 * 用法：node tools/render-compare.mjs
 * 产物：reports/screenshots/{win,wx}/*.png + 控制台比对结论
 */
import { createCanvas } from '@napi-rs/canvas';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const WX = require('../core/mah-core.js');
const WIN = await import('../../src/game/render.js');

const W = 720, H = 1280;
const OUT = path.resolve(__dirname, '../../reports/screenshots');

/**
 * 冻结时钟：render.js 的入场动画（c.appearAt）与用时显示依赖 performance.now()。
 * 若不冻结，同一牌局两次渲染会落在动画不同帧，产生大片像素差异（并非代码差异）。
 * 对照必须比较"同一稳定帧"，故把时钟钉死、把入场动画推到早已结束。
 */
const FIXED = 1e6;
Object.defineProperty(globalThis, 'performance', {
  value: { now: () => FIXED, timeOrigin: 0 },
  configurable: true,
  writable: true,
});

function freezeFrame(game) {
  for (const c of game.cards || []) {
    if (typeof c.appearAt === 'number') c.appearAt = FIXED - 1e6;
  }
  if (typeof game.levelStartAt === 'number' && game.levelStartAt > 0) game.levelStartAt = FIXED - 5000;
  game.time = 0;
  game.clock = 0;
  game.shake = 0;
  game.slotFlash = 0;
  if (Array.isArray(game.fx)) game.fx.length = 0;
}

function makeCanvas(withDoc) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  let doc = null;
  if (withDoc) {
    doc = {
      createElement(tag) {
        if (tag !== 'canvas') return null;
        const c = createCanvas(1, 1);
        try { Object.defineProperty(c, 'ownerDocument', { value: doc, configurable: true, writable: true }); } catch (e) { /* ignore */ }
        return c;
      },
    };
  }
  try { Object.defineProperty(canvas, 'ownerDocument', { value: doc, configurable: true, writable: true }); } catch (e) { /* ignore */ }
  return { canvas, ctx };
}

function renderFull(mod, game, opts = {}) {
  const { canvas, ctx } = makeCanvas(opts.withDoc !== false);
  const calls = [];
  const names = ['getUI', 'drawBackground', 'drawBoard', 'drawSlot', 'drawTools', 'drawHUD', 'drawFx', 'drawOverlay'];
  const errors = [];
  let ui = null;
  for (const n of names) {
    try {
      if (n === 'getUI') { ui = mod.getUI(game); continue; }
      if (n === 'drawBackground') mod.drawBackground(ctx, 1.0);
      else if (n === 'drawFx') mod.drawFx(ctx, game);
      else mod[n](ctx, game, ui);
      calls.push(n);
    } catch (e) {
      errors.push(n + ': ' + (e && e.message));
    }
  }
  if (game.settingsAsk) {
    try { mod.drawSettingsPanel(ctx, game, ui); calls.push('drawSettingsPanel'); } catch (e) { errors.push('drawSettingsPanel: ' + e.message); }
  }
  if (game.uninstallAsk) {
    try { mod.drawUninstallConfirm(ctx, game, ui); calls.push('drawUninstallConfirm'); } catch (e) { errors.push('drawUninstallConfirm: ' + e.message); }
  }
  return { canvas, calls, errors, buttons: ui && ui.buttons ? ui.buttons.map(b => b.id) : [] };
}

function diffPixels(a, b) {
  const da = a.getContext('2d').getImageData(0, 0, W, H).data;
  const db = b.getContext('2d').getImageData(0, 0, W, H).data;
  let diff = 0, maxDelta = 0, firstDiff = null;
  for (let i = 0; i < da.length; i += 4) {
    const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) + Math.abs(da[i + 3] - db[i + 3]);
    if (d > 0) {
      diff++;
      if (!firstDiff) firstDiff = [(i / 4) % W, Math.floor((i / 4) / W)];
      if (d > maxDelta) maxDelta = d;
    }
  }
  return { diffPixels: diff, totalPixels: W * H, ratio: diff / (W * H), maxDelta, firstDiff };
}

function newGame(level) {
  const noop = () => {};
  const game = new WX.Game({ pick: noop, match: noop, deny: noop, win: noop, lose: noop, shuffle: noop, undo: noop, remove: noop, revive: noop });
  game.saveState = { level1RecentGames: [], level2RecentGames: [] };
  WX.createNewGame({ level, generationReason: 'new_game', game, save: game.saveState });
  game.screen = 'play';
  game.audioUnlocked = true;
  return game;
}

const scenarios = [];
for (const level of [1, 2]) {
  scenarios.push({ id: `level${level}-play`, build: () => newGame(level) });
}
scenarios.push({ id: 'level1-win', build: () => { const g = newGame(1); g.status = 'win'; return g; } });
scenarios.push({ id: 'level1-lose-revive', build: () => { const g = newGame(1); g.status = 'lose'; g.reviveLeft = 1; return g; } });
scenarios.push({ id: 'level1-lose-norevive', build: () => { const g = newGame(1); g.status = 'lose'; g.reviveLeft = 0; return g; } });
scenarios.push({ id: 'level1-paused', build: () => { const g = newGame(1); g.paused = true; return g; } });
scenarios.push({ id: 'level1-settings', build: () => { const g = newGame(1); g.paused = true; g.settingsAsk = true; return g; } });

fs.mkdirSync(path.join(OUT, 'win'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'wx'), { recursive: true });

const results = [];
for (const sc of scenarios) {
  const game = sc.build();
  freezeFrame(game);
  const w = renderFull(WIN, game, { withDoc: true });
  const x = renderFull(WX, game, { withDoc: true });
  fs.writeFileSync(path.join(OUT, 'win', sc.id + '.png'), w.canvas.toBuffer('image/png'));
  fs.writeFileSync(path.join(OUT, 'wx', sc.id + '.png'), x.canvas.toBuffer('image/png'));
  const d = diffPixels(w.canvas, x.canvas);
  results.push({ id: sc.id, winCalls: w.calls.length, wxCalls: x.calls.length, winErr: w.errors, wxErr: x.errors, winButtons: w.buttons.length, wxButtons: x.buttons.length, ...d });
  console.log(`\n[${sc.id}]`);
  console.log(`  Windows: 阶段 ${w.calls.length}/8  按钮 ${w.buttons.length}  错误 ${w.errors.length}${w.errors.length ? ' -> ' + w.errors.join(' | ') : ''}`);
  console.log(`  微信:    阶段 ${x.calls.length}/8  按钮 ${x.buttons.length}  错误 ${x.errors.length}${x.errors.length ? ' -> ' + x.errors.join(' | ') : ''}`);
  console.log(`  像素差异: ${d.diffPixels}/${d.totalPixels} (${(d.ratio * 100).toFixed(4)}%)  最大通道差 ${d.maxDelta}${d.firstDiff ? '  首个差异点 ' + d.firstDiff : ''}`);
}

const bad = results.filter(r => r.diffPixels > 0 || r.winErr.length || r.wxErr.length);
console.log('\n================ 汇总 ================');
console.log('场景数:', results.length, ' 完全一致:', results.length - bad.length, ' 存在差异:', bad.length);
if (bad.length) {
  for (const b of bad) console.log('  ✗', b.id, 'diff=', b.diffPixels, 'winErr=', b.winErr.length, 'wxErr=', b.wxErr.length);
  process.exit(1);
} else {
  console.log('✓ 全部场景 Windows 与微信端渲染逐像素完全一致（0 差异）');
}
fs.writeFileSync(path.join(OUT, 'compare-result.json'), JSON.stringify(results, null, 2));
