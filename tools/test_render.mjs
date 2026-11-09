/**
 * 渲染层冒烟测试：用 mock 2D context 跑一遍所有绘制函数，
 * 确认没有拼写错误 / 未定义函数 / 参数错误。
 *   node tools/test_render.mjs
 *
 * 可选实机截图（需要已启动的无头 Edge/Chrome CDP，默认 9333 端口）：
 *   node tools/test_render.mjs --shots
 * 会打开 dist/index.html，用 3 个池内 seed 各截一张第二关开局 PNG 到 .shots/。
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as R from '../src/game/render.js';
import { drawMascot, drawTitle } from '../src/game/logo.js';
import { drawTile } from '../src/game/tiles.js';
import { Game } from '../src/game/engine.js';
import { TYPE_LIST } from '../src/game/tiles.js';
import { TILE_W, TILE_H } from '../src/game/config.js';
import { SEED_POOL } from '../src/game/seed_pool.js';

function makeCtx() {
  const grad = { addColorStop() {} };
  return {
    canvas: { width: 720, height: 1280 },
    globalAlpha: 1,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    imageSmoothingEnabled: true,
    save() {},
    restore() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    arcTo() {},
    quadraticCurveTo() {},
    ellipse() {},
    rect() {},
    fill() {},
    stroke() {},
    clip() {},
    fillRect() {},
    clearRect() {},
    strokeRect() {},
    translate() {},
    scale() {},
    rotate() {},
    setTransform() {},
    fillText() {},
    strokeText() {},
    measureText() {
      return { width: 12 };
    },
    createLinearGradient() {
      return grad;
    },
    createRadialGradient() {
      return grad;
    },
  };
}

const ctx = makeCtx();
const g = new Game(null);
let count = 0;

// 标题页
R.drawBackground(ctx, 1.2);
const uiTitle = R.getUI(g);
R.drawTitleScreen(ctx, g, uiTitle, 1.2);
count++;

// v2：16 种原创多色牌型全部绘制一遍（可点 / 被压 / 默认 / 选中四种状态）
if (TYPE_LIST.length !== 16) {
  console.error('  [FAIL] 牌型数量应为 16，实测 ' + TYPE_LIST.length);
  process.exit(1);
}
for (const t of TYPE_LIST) {
  drawTile(ctx, 10, 10, TILE_W, TILE_H, t.id, { covered: false, glow: 0.5, lift: 2, playable: true });
  drawTile(ctx, 10, 10, TILE_W, TILE_H, t.id, { covered: true, dimLevel: 3 });
  drawTile(ctx, 10, 10, TILE_W, TILE_H, t.id, {});
  drawTile(ctx, 10, 10, TILE_W, TILE_H, t.id, { selected: true });
  count++;
}

// 两关画面
for (let lv = 1; lv <= 2; lv++) {
  g.startLevel(lv, 9000 + lv);
  const ui = R.getUI(g);
  R.drawBoard(ctx, g);
  R.drawSlot(ctx, g, ui);
  R.drawTools(ctx, g, ui);
  R.drawHUD(ctx, g, ui);
  R.drawFx(ctx, g);
  R.drawOverlay(ctx, g, ui);
  count++;
}

// 毕业画面（第 2 关胜利）
g.startLevel(2, 4242);
g.status = 'win';
g.graduated = true;
R.drawOverlay(ctx, g, R.getUI(g));
count++;

// 第 1 关过关画面（有"进入第 2 关"）
g.startLevel(1, 4242);
g.status = 'win';
g.graduated = false;
R.drawOverlay(ctx, g, R.getUI(g));
count++;

// 失败画面（含复活按钮）与无复活画面
g.status = 'lose';
g.reviveLeft = 1;
R.drawOverlay(ctx, g, R.getUI(g));
count++;
g.reviveLeft = 0;
R.drawOverlay(ctx, g, R.getUI(g));
count++;

// 暂停面板
g.paused = true;
R.drawOverlay(ctx, g, R.getUI(g));
count++;

// Logo
drawMascot(ctx, 360, 470, 1.35, 2.4);
drawTitle(ctx, 360, 720, 62);
count++;

/* ---------- v2 卸载说明 UI（纯信息，不执行删除） ---------- */
let uiFail = 0;
{
  const ug = new Game(null); // 默认停在标题页
  const home = R.getUI(ug);
  if (home.buttons.some((b) => b.id === 'uninstall' && b.label === '如何卸载')) {
    console.log('  [PASS] 标题页存在「如何卸载」按钮');
  } else {
    uiFail++;
    console.log('  [FAIL] 标题页缺少卸载说明按钮');
  }

  ug.uninstallAsk = true;
  const ask = R.getUI(ug);
  const ids = ask.buttons.map((b) => b.id).sort().join(',');
  if (ids === 'uninstall-no') {
    console.log('  [PASS] 卸载说明只有一个「知道了」，不存在任何删除确认按钮');
  } else {
    uiFail++;
    console.log('  [FAIL] 卸载说明按钮异常: ' + ids);
  }

  R.drawUninstallConfirm(ctx, ug, ask);
  console.log('  [PASS] 卸载说明面板绘制无异常');

  ug.uninstallAsk = false;
  ug.startLevel(2, 7);
  ug.paused = true;
  const pm = R.getUI(ug);
  if (pm.buttons.some((b) => b.id === 'uninstall' && b.label === '如何卸载')) {
    console.log('  [PASS] 暂停面板存在卸载说明按钮');
  } else {
    uiFail++;
    console.log('  [FAIL] 暂停面板缺少卸载说明按钮');
  }
  count++;
}

// 命中测试
const hit = R.cardAt(g, 400, 500);
console.log('cardAt ->', hit ? `card#${hit.id}` : 'null');
console.log(`render smoke OK：${count} 个场景全部绘制通过（无异常）`);
if (uiFail) {
  console.error(`卸载 UI 检查失败 ${uiFail} 项`);
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 可选：实机 PNG 截图（第二关 3 个池内 seed 的开局画面）
 * ------------------------------------------------------------------ */
if (process.argv.includes('--shots')) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const port = parseInt(process.env.CDP_PORT || '9333', 10);
  const pageUrl = 'file:///' + path.join(root, 'dist', 'index.html').replace(/\\/g, '/');
  const seeds = [SEED_POOL[0], SEED_POOL[Math.floor(SEED_POOL.length / 2)], SEED_POOL[SEED_POOL.length - 1]];

  let list;
  try {
    list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  } catch (e) {
    console.error(`无法连接 CDP 127.0.0.1:${port}：${e.message}`);
    process.exit(1);
  }
  const target = list.find((t) => t.type === 'page');
  if (!target) { console.error('CDP 中没有 page 目标'); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  await new Promise((r) => ws.addEventListener('open', r));
  const send = (method, params) => new Promise((res) => {
    const id = ++msgId;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 720, height: 1280, deviceScaleFactor: 1, mobile: false,
  });
  await send('Page.navigate', { url: `${pageUrl}?lv=2` });
  await wait(2600);
  mkdirSync(path.join(root, '.shots'), { recursive: true });

  for (const seed of seeds) {
    const evalRes = await send('Runtime.evaluate', {
      expression: `window.__mah.game.startLevel(2, ${seed}); JSON.stringify({seed:${seed},cards:window.__mah.game.cards.length,free:window.__mah.game.cards.filter(c=>c.state==='board'&&!c.blocked).length})`,
      returnByValue: true,
    });
    await wait(700);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    if (!shot.result || !shot.result.data) {
      console.log(`  [FAIL] seed ${seed} 截图失败`);
      continue;
    }
    const out = path.join(root, '.shots', `l2_multizone_${seed}.png`);
    writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
    console.log(`  saved ${path.relative(root, out)} · ${evalRes.result?.result?.value || ''}`);
  }
  ws.close();
}
