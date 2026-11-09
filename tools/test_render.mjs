/**
 * 渲染层冒烟测试：用 mock 2D context 跑一遍所有绘制函数，
 * 确认没有拼写错误 / 未定义函数 / 参数错误。
 *   node tools/test_render.mjs
 */
import * as R from '../src/game/render.js';
import { drawMascot, drawTitle } from '../src/game/logo.js';
import { drawTile } from '../src/game/tiles.js';
import { Game } from '../src/game/engine.js';
import { TYPE_LIST } from '../src/game/tiles.js';
import { TILE_W, TILE_H } from '../src/game/config.js';

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

// 34 种牌全部绘制一遍：统一只用 config.js 的 TILE_W × TILE_H，不再有「按关卡分大小牌」
for (const t of TYPE_LIST) {
  drawTile(ctx, 10, 10, TILE_W, TILE_H, t.id, { covered: false, glow: 0.5, lift: 2 });
  drawTile(ctx, 10, 10, TILE_W, TILE_H, t.id, { covered: true });
  drawTile(ctx, 10, 10, TILE_W, TILE_H, t.id, {});
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

/* ---------- 卸载 UI（绿色版） ---------- */
let uiFail = 0;
{
  const ug = new Game(null); // 默认停在标题页
  const home = R.getUI(ug);
  if (home.buttons.some((b) => b.id === 'uninstall')) {
    console.log('  [PASS] 标题页存在「卸载并删除数据」按钮');
  } else {
    uiFail++;
    console.log('  [FAIL] 标题页缺少卸载按钮');
  }

  ug.uninstallAsk = true;
  const ask = R.getUI(ug);
  const ids = ask.buttons.map((b) => b.id).sort().join(',');
  if (ids === 'uninstall-no,uninstall-yes') {
    console.log('  [PASS] 二次确认只有「取消 / 彻底删除」两个按钮');
  } else {
    uiFail++;
    console.log('  [FAIL] 确认框按钮异常: ' + ids);
  }

  R.drawUninstallConfirm(ctx, ug, ask);
  console.log('  [PASS] 卸载确认面板绘制无异常');

  ug.uninstallAsk = false;
  ug.startLevel(2, 7);
  ug.paused = true;
  const pm = R.getUI(ug);
  if (pm.buttons.some((b) => b.id === 'uninstall')) {
    console.log('  [PASS] 暂停面板存在卸载按钮');
  } else {
    uiFail++;
    console.log('  [FAIL] 暂停面板缺少卸载按钮');
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
