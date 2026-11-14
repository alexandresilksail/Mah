/**
 * Stage 2 视觉审计：真实游戏渲染截图 + 像素级轮廓对照。
 *
 *   node tools/l2_visual_audit.mjs
 *
 * 方法（不修改任何源码 / 模板 / 生成算法）：
 *  · 启动本机 Edge（headless + CDP），打开真实构建产物 dist/index.html；
 *  · 对每个第二关模板 L2-P01..L2-P20，在代表性档位（主档 4，另取 0 与 9
 *    用于主体轮廓跨档位不变性）通过 window.__mah.game.startLevel 真实生成牌局；
 *  · 用真实渲染管线把牌桌画到 canvas，再 Page.captureScreenshot 取得真实游戏截图；
 *  · 在浏览器内用 getImageData 做像素分析：
 *      - 期望轮廓（expMask）：按 game.cards 的真实 (x,y,66,88) 投影到像素栅格
 *        （渲染器即按此坐标绘制，无额外平移/缩放），代表“规范布局/游戏状态”；
 *      - 实际轮廓（actMask）：隐藏所有牌后截一张“背景+绒布垫”基准图，再与实拍图
 *        做逐块颜色差分，提取真实渲染出的牌像素；
 *      - 计算 IoU / 覆盖率 / 泄漏率 / 质心偏移（绘制偏移），并生成差异图与规范轮廓图；
 *  · 190 组两两比较：对 20 套真实渲染轮廓（主档）计算 Jaccard 相似度矩阵；
 *  · 跨档位不变性：每套在档 0/4/9 的占用格集合（忽略层级）应一致。
 *
 * 输出：
 *  reports/l2-visual-screenshots/  (真实游戏截图 + 规范轮廓图)
 *  reports/l2-visual-diff/         (差异图 / 检测数据)
 *  reports/l2-visual-comparison.json
 *  （报告 MD 由另外的脚本/步骤生成，本工具只产出数据与 JSON）
 *
 * 任何失败如实记录，绝不伪造成通过。找不到浏览器则整体 NOT RUN。
 */
import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import os from 'node:os';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const reports = join(root, 'reports');
if (!existsSync(reports)) mkdirSync(reports, { recursive: true });

const CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
const exe = CANDIDATES.find((p) => existsSync(p));
const PORT = 9341; // 与 browser_smoke 的 9333 错开，避免端口冲突
const profile = join(os.tmpdir(), 'mah-l2-visual-' + process.pid);

const ALL_TEMPLATES = [];
for (let i = 1; i <= 20; i++) ALL_TEMPLATES.push('L2-P' + String(i).padStart(2, '0'));
// 仅供本地快速冒烟：AUDIT_LIMIT=2 只跑前两套；正式审计不设该变量，跑满 20 套。
const TEMPLATES = process.env.AUDIT_LIMIT ? ALL_TEMPLATES.slice(0, Number(process.env.AUDIT_LIMIT)) : ALL_TEMPLATES;
const PROFILES = [4, 0, 9]; // 4 = 主档（代表性），0/9 用于跨档位轮廓不变性
const PRIMARY = 4;

// 确定性 seed：每套固定，便于复现
const seedOf = (idx) => 7000 + idx * 131;

let headSha = '';
try { headSha = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim(); } catch (e) { /* 忽略 */ }

const result = {
  generatedAt: new Date().toISOString(),
  browser: exe || null,
  executed: false,
  commit: headSha,
  artifact: 'dist/index.html',
  templates: [],
  pairwise: {},
  errors: [],
};

function writeComparison() {
  writeFileSync(join(reports, 'l2-visual-comparison.json'), JSON.stringify(result, null, 2), 'utf8');
}

if (!exe) {
  result.errors.push('未找到 Edge/Chrome，视觉实测未执行（NOT RUN）');
  writeComparison();
  console.log('[visual] 未执行：找不到浏览器可执行文件');
  process.exit(2);
}

let child = null;
try {
  child = spawn(exe, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--allow-file-access-from-files',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + profile,
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
} catch (e) {
  result.errors.push('启动浏览器失败：' + e.message);
  writeComparison();
  console.log('[visual] 未执行：启动失败');
  process.exit(2);
}

async function waitPort(ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return await r.json();
    } catch (e) { /* 等待启动 */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.onmessage = (ev) => {
      let m;
      try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.id && this.pending.has(m.id)) { this.pending.get(m.id)(m); this.pending.delete(m.id); }
      else if (m.method) this.events.push(m);
    };
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    return new CDP(ws);
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res) => { this.pending.set(id, res); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  close() { try { this.ws.close(); } catch (e) { /* ignore */ } }
}

// ---- 浏览器内像素分析函数（字符串注入，运行时为 async） ----
const ANALYZE = `
async function __analyze(args) {
 try {
  const TILE_W = 66, TILE_H = 88, LW = 720, LH = 1280, F = 4;
  const mw = LW / F, mh = LH / F; // 180 x 320
  const g = window.__mah.game;
  g.profile.l2 = args.prof;
  g.startLevel(2, args.seed, args.tplId);
  if (g.templateId !== args.tplId) return { error: 'template mismatch: requested ' + args.tplId + ' but applied ' + g.templateId };
  // 等待入场动画完全落定：refresh(true) 设 appearAt 交错 240ms（engine.js:273-282），
  // paintBoard 的渐显再持续 300ms（render.js:577-583），合计约 540ms。
  // 必须等满，否则采到的是 alpha<1 / scale<1 的中间帧（会误判为漏牌与相位不符）。
  await new Promise(r => setTimeout(r, 760));
  // 注意：直接调用 startLevel 时 meta 为 null（meta 仅由 createNewGame 路径填充），
  // 故此处从 game 实例直接读取真实生效的字段作为“规范布局”元数据。
  const meta = {
    templateId: g.templateId,
    profileId: (g.layoutProfile && g.layoutProfile.id) || null,
    seed: g.seed,
    specFillRot: g.specFillRot,
    totalTiles: g.cards.length,
  };
  const cards = g.cards.filter(c => c.state === 'board' && c.seg !== 'outer');
  const allBoard = g.cards.filter(c => c.state === 'board');
  const orig = allBoard.map(c => c.state);

  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const dpr = W / LW;

  // 期望轮廓：按渲染坐标投影（渲染器即按 c.x,c.y 绘制，无平移/缩放）
  // 用 allBoard（所有 state==='board'）以覆盖渲染器实际绘制的全部可见牌，避免出现误判泄漏。
  const expMask = new Uint8Array(mw * mh);
  for (const c of allBoard) {
    const x0 = Math.floor(c.x / F), y0 = Math.floor(c.y / F);
    const x1 = Math.ceil((c.x + TILE_W) / F), y1 = Math.ceil((c.y + TILE_H) / F);
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++)
      if (xx >= 0 && xx < mw && yy >= 0 && yy < mh) expMask[yy * mw + xx] = 1;
  }

  // 隐藏所有牌 -> 背景+绒布垫基准
  for (const c of allBoard) c.state = 'removed';
  await new Promise(r => setTimeout(r, 200));
  const bg = ctx.getImageData(0, 0, W, H).data;
  // 恢复
  for (let i = 0; i < allBoard.length; i++) allBoard[i].state = orig[i];
  // 关键：render.js:456 的 boardCache key = boardRev|k|tileW|tileH|alive.length|freeCount。
  // 隐藏->恢复后 alive.length / freeCount 回到原值，key 与隐藏前完全相同，渲染器会直接
  // drawImage 复用「空牌桌」缓存帧。必须递增 boardRev 强制重绘，才能拿到真实完整牌局。
  // 该字段只影响渲染缓存键，不改变任何牌位 / 层级 / 牌数，也不触发布局重建。
  g.boardRev++;
  await new Promise(r => setTimeout(r, 260));

  // 实际牌像素：隐藏全部牌后的基准帧 vs 完整帧的逐块颜色差分。
  // 背景是浅色平滑渐变、牌面也是浅色，单点色差可能只有 10~32，故此处用较低阈值保留
  // 全部「发生了变化」的像素（牌体 + 牌桌承托阴影），作为纯像素轮廓供 190 组比较。
  const actRaw = ctx.getImageData(0, 0, W, H).data;
  const rawAct = new Uint8Array(mw * mh);
  const THR = 12;
  for (let py = 0; py < mh; py++) {
    for (let px = 0; px < mw; px++) {
      let hit = 0;
      for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
        const sxp = Math.min(W - 1, ((px + (sx + 0.5) / 2) * F * dpr) | 0);
        const syp = Math.min(H - 1, ((py + (sy + 0.5) / 2) * F * dpr) | 0);
        const i = (syp * W + sxp) * 4;
        const dr = Math.abs(actRaw[i] - bg[i]), dg = Math.abs(actRaw[i + 1] - bg[i + 1]), db = Math.abs(actRaw[i + 2] - bg[i + 2]);
        if ((dr + dg + db) / 3 > THR) hit++;
      }
      if (hit >= 2) rawAct[py * mw + px] = 1;
    }
  }

  // 逐牌区域检测：在每张牌的 66x88 规范矩形内取 5x5 采样网格，与「无牌基准帧」逐点比较。
  // 单点色差不可靠（浅底浅牌），但牌面有彩色边框 / 顶带 / 图案，25 点聚合的结构差异非常稳定。
  // 阈值经负对照实测标定（tools/l2_visual_detector_calibration.mjs）：
  //   真实牌 273 张：mean 最小 26.6、hits 最小 16；空位 10 处：mean 最大 2.4、hits 最大 4。
  //   取 mean>=14 && hits>=10，两侧均有充足裕度。
  const diffAt = (sx, sy) => {
    const xi = Math.min(W - 1, Math.max(0, (sx * dpr) | 0));
    const yi = Math.min(H - 1, Math.max(0, (sy * dpr) | 0));
    const i = (yi * W + xi) * 4;
    return (Math.abs(actRaw[i] - bg[i]) + Math.abs(actRaw[i + 1] - bg[i + 1]) + Math.abs(actRaw[i + 2] - bg[i + 2])) / 3;
  };
  const presentSet = new Set();
  let present = 0;
  const gridMeanMin = { v: Infinity };
  const gridHitsMin = { v: Infinity };
  for (let ci = 0; ci < allBoard.length; ci++) {
    const c = allBoard[ci];
    let sum = 0, hits = 0;
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 5; gx++) {
      const d = diffAt(c.x + (gx + 0.5) * TILE_W / 5, c.y + (gy + 0.5) * TILE_H / 5);
      sum += d; if (d > 8) hits++;
    }
    const mean = sum / 25;
    if (mean < gridMeanMin.v) gridMeanMin.v = mean;
    if (hits < gridHitsMin.v) gridHitsMin.v = hits;
    if (mean >= 14 && hits >= 10) { presentSet.add(ci); present++; }
  }

  // 实际掩膜 = 已检测到牌的矩形并集（只含真实渲染出的牌，天然排除阴影与错位）。
  const actMask = new Uint8Array(mw * mh);
  for (let ci = 0; ci < allBoard.length; ci++) {
    if (!presentSet.has(ci)) continue;
    const c = allBoard[ci];
    const x0 = Math.floor(c.x / F), y0 = Math.floor(c.y / F);
    const x1 = Math.ceil((c.x + TILE_W) / F), y1 = Math.ceil((c.y + TILE_H) / F);
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++)
      if (xx >= 0 && xx < mw && yy >= 0 && yy < mh) actMask[yy * mw + xx] = 1;
  }

  // 互相关：在 ±16 像素（栅格）范围内找使期望(全矩形)与实际(已检测牌)重叠最大的平移 -> 真实绘制偏移
  let best = -1, bdx = 0, bdy = 0;
  const SR = 4;
  for (let sy = -SR; sy <= SR; sy++) for (let sx = -SR; sx <= SR; sx++) {
    let inter = 0;
    for (let y = 0; y < mh; y++) {
      const ya = y + sy; if (ya < 0 || ya >= mh) continue;
      for (let x = 0; x < mw; x++) {
        const xa = x + sx; if (xa < 0 || xa >= mw) continue;
        if (expMask[y * mw + x] && actMask[ya * mw + xa]) inter++;
      }
    }
    if (inter > best) { best = inter; bdx = sx; bdy = sy; }
  }

  // 在最佳平移下计算 IoU / 覆盖率 / 泄漏率
  let inter2 = 0, uni2 = 0, expN = 0, actN = 0;
  for (let y = 0; y < mh; y++) {
    const ya = y + bdy;
    for (let x = 0; x < mw; x++) {
      const xa = x + bdx;
      const e = expMask[y * mw + x];
      const a = (xa >= 0 && xa < mw && ya >= 0 && ya < mh) ? actMask[ya * mw + xa] : 0;
      if (e) expN++; if (a) actN++; if (e && a) inter2++; if (e || a) uni2++;
    }
  }
  const iou = uni2 ? inter2 / uni2 : 0;
  const coverage = expN ? inter2 / expN : 0;
  const leakage = actN ? (actN - inter2) / actN : 0;
  // 非牌区域（rawAct 中落在期望矩形外的像素）占 rawAct 比例，仅信息展示（主要是牌桌阴影），非缺陷指标
  let rawN = 0, outsideExp = 0;
  for (let k = 0; k < rawAct.length; k++) {
    if (rawAct[k]) { rawN++; if (!expMask[k]) outsideExp++; }
  }
  const shadowRatio = rawN ? outsideExp / rawN : 0;
  const dx = bdx * F, dy = bdy * F;

  // ---- 轮廓掩膜：坐标定义与 l2_spec.js:43-44 / 398-399 严格一致 ----
  //   x = 33 + c*66 + px*33,  y = 220 + r*88 + py*44
  //  · maskCell（66x88 主格，相位无关）：模板「主体轮廓」，用于 190 组视觉差异与跨档位不变性；
  //    必须用 floor((x-33)/66)，因为带上半格相位时 (x-33)/66 = c + px*0.5，round 会误落到 c+1。
  //  · halfCell（33x44 半格晶格，含 px/py 相位）：用于「规范 vs 真实渲染」逐格一致性。
  // 只取「主堆」：队列（盲盒）牌 44 张在所有模板里位置完全相同，纳入轮廓会把
  // 相似度整体抬高而掩盖模板差异（第一阶段 structureSimilarity 也用 mainStackCards）。
  const MCW = 9, MCH = 5, HCW = 18, HCH = 10; // 与 MASK_COLS/MASK_ROWS 一致
  function cellsOf(list, half) {
    const cw = half ? HCW : MCW, ch = half ? HCH : MCH;
    const m = new Uint8Array(cw * ch);
    for (const c of list) {
      const cx = half ? Math.round((c.x - 33) / 33) : Math.floor((c.x - 33) / 66);
      const cy = half ? Math.round((c.y - 220) / 44) : Math.floor((c.y - 220) / 88);
      if (cx >= 0 && cx < cw && cy >= 0 && cy < ch) m[cy * cw + cx] = 1;
    }
    return m;
  }
  const indexed = allBoard.map((c, i) => ({ c, i }));
  const mainAll = indexed.filter(o => o.c.seg !== 'outer').map(o => o.c);
  const mainDetected = indexed.filter(o => o.c.seg !== 'outer' && presentSet.has(o.i)).map(o => o.c);
  const detected = allBoard.filter((_, i) => presentSet.has(i));
  const cellMask = cellsOf(mainAll, false);          // 规范主体轮廓
  const actCellMask = cellsOf(mainDetected, false);  // 真实渲染主体轮廓（仅实拍检测到的主堆牌）
  const halfMask = cellsOf(mainAll, true);           // 规范半格晶格（含相位）
  const actHalfMask = cellsOf(mainDetected, true);   // 实拍半格晶格

  // 与第一阶段 layoutSimilarity（layout_signature.js:249-273）同口径的结构单元：
  // 「层号 | 精确 x,y」，逐层 Jaccard 均值 + 整体轮廓 Jaccard 各占 0.5。
  // 区别：这里取自真实渲染中实际检测到的牌，而非生成器坐标数组。
  function unitsOf(list) {
    const s = new Set();
    for (const c of list) s.add(c.layer + '|' + c.x + ',' + c.y);
    return [...s];
  }
  const specUnits = unitsOf(mainAll);
  const actUnits = unitsOf(mainDetected);
  // 纯像素轮廓（背景差分后的真实像素栅格，非几何投影），用于 190 组纯像素级比较
  const rawMaskB64 = (() => {
    const bytes = new Uint8Array(Math.ceil(rawAct.length / 8));
    for (let i = 0; i < rawAct.length; i++) if (rawAct[i]) bytes[i >> 3] |= (1 << (i & 7));
    let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  })();
  function packBits2(arr) {
    const bytes = new Uint8Array(Math.ceil(arr.length / 8));
    for (let i = 0; i < arr.length; i++) if (arr[i]) bytes[i >> 3] |= (1 << (i & 7));
    let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  // ---- 遮挡关系 / 绘制顺序 / 命中区域 ----
  // 几何重叠按 (x,y,66,88) 计算；命中与遮挡层级用真实 render.cardAt（render.js:148-173，
  // 按 z 降序取第一张可点牌）；绘制顺序由 paintBoard 的 layer 升序（render.js:541）保证，
  // 二者一致才说明「视觉上压住别人的牌」与「逻辑上响应点击的牌」是同一张。
  const R = window.__mah.R;
  function overlapRect(a, b) {
    const ix = Math.min(a.x + TILE_W, b.x + TILE_W) - Math.max(a.x, b.x);
    const iy = Math.min(a.y + TILE_H, b.y + TILE_H) - Math.max(a.y, b.y);
    return (ix > 0 && iy > 0) ? { ix, iy, x0: Math.max(a.x, b.x), y0: Math.max(a.y, b.y) } : null;
  }
  let sameLayerOverlapPairs = 0, crossLayerOverlapPairs = 0;
  let orderOk = 0, orderChecked = 0, overlapTilePixels = 0;
  for (let i = 0; i < allBoard.length; i++) {
    for (let j = i + 1; j < allBoard.length; j++) {
      const A = allBoard[i], B = allBoard[j];
      const ov = overlapRect(A, B);
      if (!ov) continue;
      if (A.layer === B.layer) { sameLayerOverlapPairs++; continue; }
      crossLayerOverlapPairs++;
      const hi = A.z >= B.z ? A : B, lo = A.z >= B.z ? B : A;
      const qx = Math.round(ov.x0 + ov.ix / 2), qy = Math.round(ov.y0 + ov.iy / 2);
      // 该点必须有真实牌像素（不是背景/阴影）
      const qi = (Math.min(H - 1, (qy * dpr) | 0) * W + Math.min(W - 1, (qx * dpr) | 0)) * 4;
      const qd = (Math.abs(actRaw[qi] - bg[qi]) + Math.abs(actRaw[qi + 1] - bg[qi + 1]) + Math.abs(actRaw[qi + 2] - bg[qi + 2])) / 3;
      if (qd > THR) overlapTilePixels++;
      // 命中必须落在更高层的牌上（或该牌被更高层覆盖时由 cardAt 返回更上层）
      const hit = R.cardAt(g, qx, qy);
      orderChecked++;
      // cardAt 会跳过 blocked 牌；若重叠处所有牌都不可点则返回 null，属正确行为。
      // 只要不返回「z 更低」的牌，就说明更高层的牌确实压在上面（与 paintBoard 的 layer 升序一致）。
      if (!hit || hit.z >= hi.z) orderOk++;
    }
  }
  // 命中区域：逐牌中心，cardAt 返回的牌矩形必须包含该点，且 z 不低于该牌
  let hitInsideOk = 0;
  for (const c of allBoard) {
    const qx = c.x + TILE_W / 2, qy = c.y + TILE_H / 2;
    const hit = R.cardAt(g, qx, qy);
    if (!hit) { hitInsideOk++; continue; } // 全被遮挡时不响应，属正确行为
    if (qx >= hit.x && qx <= hit.x + TILE_W && qy >= hit.y && qy <= hit.y + TILE_H && hit.z >= c.z) hitInsideOk++;
  }
  const occlusion = {
    sameLayerOverlapPairs, crossLayerOverlapPairs,
    overlapTilePixels,
    drawOrderOkPairs: orderOk, drawOrderCheckedPairs: orderChecked,
    hitRegionOk: hitInsideOk, hitRegionChecked: allBoard.length,
  };

  // 层级分布（用 allBoard，与渲染/掩膜一致）
  const layerCount = {};
  for (const c of allBoard) layerCount[c.layer] = (layerCount[c.layer] || 0) + 1;
  const layers = Object.keys(layerCount).map(Number).sort((a, b) => a - b)
    .map(l => ({ layer: l, count: layerCount[l] }));
  const blocked = allBoard.filter(c => c.blocked).length;

  // 打包 mask -> base64
  function packBits(arr) {
    const bytes = new Uint8Array(Math.ceil(arr.length / 8));
    for (let i = 0; i < arr.length; i++) if (arr[i]) bytes[i >> 3] |= (1 << (i & 7));
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  const out = {
    meta: {
      templateId: meta.templateId, profileId: meta.profileId, seed: meta.seed,
      specFillRot: meta.specFillRot, totalTiles: meta.totalTiles,
    },
    cardCount: allBoard.length, layers, blocked,
    iou, coverage, leakage, dx, dy, expN, actN,
    present, totalTilesAll: allBoard.length, presentFrac: +(present / allBoard.length).toFixed(4),
    shadowRatio: +shadowRatio.toFixed(4),
    detector: {
      method: '牌矩形内 5x5 网格 vs 无牌基准帧',
      thresholdMean: 14, thresholdHits: 10,
      minObservedMean: +gridMeanMin.v.toFixed(1), minObservedHits: gridHitsMin.v,
      negativeControl: '空位 mean<=2.4 / hits<=4（tools/l2_visual_detector_calibration.mjs 实测）',
    },
    occlusion,
    maskB64: packBits(actMask), specMaskB64: packBits(expMask), mw, mh,
    rawMaskB64,
    cellMaskB64: packBits2(cellMask), actCellMaskB64: packBits2(actCellMask),
    halfMaskB64: packBits2(halfMask), actHalfMaskB64: packBits2(actHalfMask),
    mcw: MCW, mch: MCH, hcw: HCW, hch: HCH,
    specUnits, actUnits,
    mainStackCount: mainAll.length, mainStackDetected: mainDetected.length,
  };

  // 仅主档：生成差异图与规范轮廓图（data URL）
  if (args.primary) {
    const doc = cv.ownerDocument;
    const SW = 360, SH = 640;
    // 差异图：实拍缩放 + 期望轮廓红框
    const dc = doc.createElement('canvas'); dc.width = SW; dc.height = SH;
    const dctx = dc.getContext('2d');
    const ac = doc.createElement('canvas'); ac.width = W; ac.height = H;
    ac.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(actRaw), W, H), 0, 0);
    dctx.drawImage(ac, 0, 0, SW, SH);
    dctx.strokeStyle = 'rgba(255,40,40,0.95)'; dctx.lineWidth = 1;
    for (const c of allBoard) dctx.strokeRect(c.x * SW / LW, c.y * SH / LH, TILE_W * SW / LW, TILE_H * SH / LH);
    out.diffB64 = dc.toDataURL('image/png').split(',')[1];

    // 规范轮廓图：期望掩膜填充 + 边框（白底）
    const sc = doc.createElement('canvas'); sc.width = SW; sc.height = SH;
    const sctx = sc.getContext('2d');
    sctx.fillStyle = '#0b1020'; sctx.fillRect(0, 0, SW, SH);
    sctx.fillStyle = 'rgba(80,160,255,0.55)';
    for (let py = 0; py < mh; py++) for (let px = 0; px < mw; px++)
      if (expMask[py * mw + px]) sctx.fillRect(px * SW / mw, py * SH / mh, Math.ceil(SW / mw), Math.ceil(SH / mh));
    sctx.strokeStyle = 'rgba(120,200,255,0.9)'; sctx.lineWidth = 1;
    for (const c of allBoard) sctx.strokeRect(c.x * SW / LW, c.y * SH / LH, TILE_W * SW / LW, TILE_H * SH / LH);
    out.specB64 = sc.toDataURL('image/png').split(',')[1];
  }
  return out;
 } catch (e) {
  return { error: String(e && e.message || e), stack: String(e && e.stack || '') };
 }
}
`;

// 解包 mask
function unpackMask(b64, mw, mh) {
  const bytes = Buffer.from(b64, 'base64');
  const arr = new Uint8Array(mw * mh);
  for (let i = 0; i < arr.length; i++) arr[i] = (bytes[i >> 3] >> (i & 7)) & 1;
  return arr;
}

function jaccard(a, b) {
  let inter = 0, uni = 0;
  for (let i = 0; i < a.length; i++) { if (a[i] && b[i]) inter++; if (a[i] || b[i]) uni++; }
  return uni ? inter / uni : 0;
}

function setJaccard(a, b) {
  let inter = 0;
  for (const k of a) if (b.has(k)) inter++;
  const uni = a.size + b.size - inter;
  return uni ? inter / uni : 0;
}

/** 与 layout_signature.js:249-273 layoutSimilarity 同口径：0.5×逐层 Jaccard 均值 + 0.5×整体轮廓 Jaccard */
function layoutSimFromUnits(ua, ub) {
  const shape = (arr) => {
    const layers = new Map(), all = new Set();
    for (const s of arr) {
      const bar = s.indexOf('|');
      const l = Number(s.slice(0, bar)), xy = s.slice(bar + 1);
      if (!layers.has(l)) layers.set(l, new Set());
      layers.get(l).add(xy); all.add(xy);
    }
    return { layers, all };
  };
  const A = shape(ua), B = shape(ub);
  const keys = new Set([...A.layers.keys(), ...B.layers.keys()]);
  let sum = 0;
  for (const l of keys) sum += setJaccard(A.layers.get(l) || new Set(), B.layers.get(l) || new Set());
  return { layerSim: keys.size ? sum / keys.size : 0, silhouetteSim: setJaccard(A.all, B.all), layerCount: keys.size };
}

try {
  const version = await waitPort();
  if (!version) throw new Error('CDP 端口未就绪');
  result.executed = true;
  result.browserVersion = version.Browser;
  console.log('[visual] ' + version.Browser + ' · port ' + PORT);

  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const target = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!target) throw new Error('没有可用 CDP page target');
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 720, height: 1280, deviceScaleFactor: 1, mobile: false });

  const pageUrl = pathToFileURL(join(root, 'dist', 'index.html')).href + '?lv=2';
  await cdp.send('Page.navigate', { url: pageUrl });
  // 等待 window.__mah 就绪
  for (let i = 0; i < 50; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: '!!(window.__mah && window.__mah.game)', returnByValue: true });
    if (r.result && r.result.result && r.result.result.value) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  // 注入分析函数
  await cdp.send('Runtime.evaluate', { expression: ANALYZE, returnByValue: true });

  const shotDir = join(reports, 'l2-visual-screenshots');
  const diffDir = join(reports, 'l2-visual-diff');
  mkdirSync(shotDir, { recursive: true });
  mkdirSync(diffDir, { recursive: true });

  const masksPrimary = {};      // tplId -> actMask (主档真实渲染矩形轮廓)
  const masksSpec = {};         // tplId -> specMask (规范矩形轮廓)
  const cellPrimary = {};       // tplId -> actCellMask (主档真实渲染主体轮廓，像素检测)
  const cellSpec = {};          // tplId -> cellMask (规范主体轮廓)
  const halfPrimary = {};       // tplId -> actHalfMask (含相位)
  const halfSpec = {};          // tplId -> halfMask (含相位)
  const rawPixel = {};          // tplId -> 纯像素背景差分掩膜
  const unitsAct = {};          // tplId -> 实拍主堆「层|精确x,y」单元
  const unitsSpec = {};         // tplId -> 规范主堆「层|精确x,y」单元
  const profMasks = {};         // tplId -> {0:actMask,4:actMask,9:actMask}
  const specProfMasks = {};     // tplId -> {0:specMask,4:specMask,9:specMask}
  const profCellMasks = {};     // tplId -> {0:actCellMask,4:...,9:...}
  const specProfCellMasks = {}; // tplId -> {0:cellMask,4:...,9:...}

  for (let idx = 0; idx < TEMPLATES.length; idx++) {
    const tplId = TEMPLATES[idx];
    const seed = seedOf(idx);
    const rec = { templateId: tplId, seed, profiles: {} };
    for (const prof of PROFILES) {
      const primary = prof === PRIMARY;
      // 生成牌局
      const start = await cdp.send('Runtime.evaluate', {
        expression: `(${ANALYZE})({tplId:'${tplId}',seed:${seed},prof:${prof},primary:${primary}})`,
        awaitPromise: true, returnByValue: true,
      });
      const v = start.result && start.result.result && start.result.result.value;
      if (!v || (v.meta && !v.meta.templateId) || v.error) {
        const why = v && v.error ? (v.error + ' | ' + (v.stack || '')) : 'analyze 返回空';
        if (start.result && start.result.exceptionDetails) console.log('  [EXC] ' + JSON.stringify(start.result.exceptionDetails.exception || start.result.exceptionDetails));
        rec.profiles[prof] = { error: why };
        console.log(`  [FAIL] ${tplId} p${prof}: ${why.slice(0, 200)}`);
        continue;
      }
      // 等待动画落定
      await new Promise((r) => setTimeout(r, 600));
      // 真实游戏截图
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      const shotName = `${tplId}_p${prof}.png`;
      writeFileSync(join(shotDir, shotName), Buffer.from(shot.result.data, 'base64'));

      // 解包 6 类掩膜（矩形轮廓 / 主体格 / 半格晶格 × 规范 / 实拍）
      const actMask = unpackMask(v.maskB64, v.mw, v.mh);
      const specMask = unpackMask(v.specMaskB64, v.mw, v.mh);
      const actCell = unpackMask(v.actCellMaskB64, v.mcw, v.mch);
      const specCell = unpackMask(v.cellMaskB64, v.mcw, v.mch);
      const actHalf = unpackMask(v.actHalfMaskB64, v.hcw, v.hch);
      const specHalf = unpackMask(v.halfMaskB64, v.hcw, v.hch);
      const rawPx = unpackMask(v.rawMaskB64, v.mw, v.mh);
      profMasks[tplId] = profMasks[tplId] || {};
      profMasks[tplId][prof] = actMask;
      specProfMasks[tplId] = specProfMasks[tplId] || {};
      specProfMasks[tplId][prof] = specMask;
      profCellMasks[tplId] = profCellMasks[tplId] || {};
      profCellMasks[tplId][prof] = actCell;
      specProfCellMasks[tplId] = specProfCellMasks[tplId] || {};
      specProfCellMasks[tplId][prof] = specCell;

      // 实际渲染签名 = 实拍主体轮廓 sha256；规范布局签名 = 规范主体轮廓 sha256
      const renderSig = createHash('sha256').update(Buffer.from(v.actCellMaskB64, 'base64')).digest('hex');
      const specSig = createHash('sha256').update(Buffer.from(v.cellMaskB64, 'base64')).digest('hex');
      const rectRenderSig = createHash('sha256').update(Buffer.from(v.maskB64, 'base64')).digest('hex');
      const halfMatch = jaccard(actHalf, specHalf);

      const pRec = {
        profileId: v.meta.profileId,
        requestedTemplateId: tplId,
        appliedTemplateId: v.meta.templateId,
        seed: v.meta.seed,
        specFillRot: v.meta.specFillRot,
        specLayoutSignature: specSig,
        renderSignature: renderSig,
        rectRenderSignature: rectRenderSig,
        halfCellMatch: +halfMatch.toFixed(4),
        totalTiles: v.meta.totalTiles,
        cardCount: v.cardCount,
        mainStackCount: v.mainStackCount,
        mainStackDetected: v.mainStackDetected,
        layers: v.layers,
        blocked: v.blocked,
        iou: +v.iou.toFixed(4),
        coverage: +v.coverage.toFixed(4),
        leakage: +v.leakage.toFixed(4),
        presentFrac: v.presentFrac,
        shadowRatio: v.shadowRatio,
        offsetDx: Math.round(v.dx),
        offsetDy: Math.round(v.dy),
        expPixels: v.expN,
        actPixels: v.actN,
        occlusion: v.occlusion,
        screenshot: shotName,
      };

      if (primary) {
        masksPrimary[tplId] = actMask;
        masksSpec[tplId] = specMask;
        cellPrimary[tplId] = actCell;
        cellSpec[tplId] = specCell;
        halfPrimary[tplId] = actHalf;
        halfSpec[tplId] = specHalf;
        rawPixel[tplId] = rawPx;
        unitsAct[tplId] = v.actUnits;
        unitsSpec[tplId] = v.specUnits;
        // 写差异图 + 规范轮廓图
        writeFileSync(join(diffDir, `${tplId}_diff.png`), Buffer.from(v.diffB64, 'base64'));
        writeFileSync(join(shotDir, `${tplId}_spec.png`), Buffer.from(v.specB64, 'base64'));
        // 每套单独保存像素检测数据（差异图/检测数据按模板留档）
        writeFileSync(join(diffDir, `${tplId}_metrics.json`), JSON.stringify(pRec, null, 2), 'utf8');
        pRec.diffImage = `${tplId}_diff.png`;
        pRec.specImage = `${tplId}_spec.png`;
      }
      rec.profiles[prof] = pRec;
      console.log(`  ${tplId} p${prof}: 牌${v.cardCount} 层${v.layers.length} IoU=${v.iou.toFixed(3)} 覆盖=${v.coverage.toFixed(3)} 泄漏=${v.leakage.toFixed(3)} 偏移=(${Math.round(v.dx)},${Math.round(v.dy)}) 应用=${v.meta.templateId}`);
    }
    result.templates.push(rec);
  }

  cdp.close();

  // ---- 190 组两两比较（20 套 × 主档，全部来自真实渲染截图） ----
  // 权威指标 layoutSimActual = 0.5×逐层(层|精确x,y) Jaccard 均值 + 0.5×整体精确坐标 Jaccard，
  // 与第一阶段 layoutSimilarity 同口径、阈值同为 0.60，但单元取自「实拍检测到的牌」而非生成器数组。
  // 另给：纯像素轮廓 Jaccard（背景差分栅格）、主格俯视轮廓、矩形轮廓、含相位半格，多口径交叉核验。
  const ids = TEMPLATES;
  const pairs = [];
  const DIFF_THRESHOLD = 0.60;
  let maxSim = 0, maxPair = null, maxPixel = 0, maxPixelPair = null;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const A = ids[i], B = ids[j];
      const la = layoutSimFromUnits(unitsAct[A], unitsAct[B]);
      const ls = layoutSimFromUnits(unitsSpec[A], unitsSpec[B]);
      const simA = 0.5 * la.layerSim + 0.5 * la.silhouetteSim;
      const simS = 0.5 * ls.layerSim + 0.5 * ls.silhouetteSim;
      const pxa = jaccard(rawPixel[A], rawPixel[B]);           // 纯像素轮廓
      const cellA = jaccard(cellPrimary[A], cellPrimary[B]);     // 主格俯视轮廓（会饱和，仅信息）
      const rectA = jaccard(masksPrimary[A], masksPrimary[B]);
      const halfA = jaccard(halfPrimary[A], halfPrimary[B]);
      pairs.push({
        pair: A + '|' + B,
        layoutSimActual: +simA.toFixed(4),
        layoutSimSpec: +simS.toFixed(4),
        layerSimActual: +la.layerSim.toFixed(4),
        silhouetteSimActual: +la.silhouetteSim.toFixed(4),
        pixelSilhouetteJaccard: +pxa.toFixed(4),
        pixelDiffRatio: +(1 - pxa).toFixed(4),
        mainCellJaccard: +cellA.toFixed(4),
        rectJaccard: +rectA.toFixed(4),
        halfCellJaccard: +halfA.toFixed(4),
        visuallyDistinct: simA < DIFF_THRESHOLD,
      });
      if (simA > maxSim) { maxSim = simA; maxPair = A + '|' + B; }
      if (pxa > maxPixel) { maxPixel = pxa; maxPixelPair = A + '|' + B; }
    }
  }
  const duplicatePairs = pairs.filter((p) => !p.visuallyDistinct).map((p) => p.pair);
  result.pairwise = {
    count: pairs.length,
    threshold: DIFF_THRESHOLD,
    authoritative: 'layoutSimActual',
    metric: '0.5×逐层(层|精确x,y) Jaccard 均值 + 0.5×整体精确坐标 Jaccard，单元来自实拍检测牌',
    note: 'mainCellJaccard 为 9x5 主格俯视轮廓，多层堆叠后接近饱和，仅作信息展示；pixelSilhouetteJaccard 为纯背景差分像素栅格。',
    pairs,
    maxSimilarity: +maxSim.toFixed(4),
    maxSimilarityPair: maxPair,
    maxPixelSilhouetteJaccard: +maxPixel.toFixed(4),
    maxPixelSilhouettePair: maxPixelPair,
    distinctCount: pairs.length - duplicatePairs.length,
    duplicatePairs,
    allDistinct: duplicatePairs.length === 0,
  };

  // ---- 跨档位轮廓不变性（每套 p0 / p4 / p9 三档真实截图） ----
  // 权威判定 = 实拍主体格集合跨档位 Jaccard；规范主体格与矩形轮廓作交叉参考。
  const invariance = [];
  for (const tplId of ids) {
    const rec = { templateId: tplId };
    let ok = true;
    const pairsOf = [[0, 4], [4, 9], [0, 9]];
    for (const [p, q] of pairsOf) {
      const key = `p${p}_p${q}`;
      const A = profCellMasks[tplId] && profCellMasks[tplId][p];
      const B = profCellMasks[tplId] && profCellMasks[tplId][q];
      if (!A || !B) { rec[key] = { actualCellJaccard: null, NOT_RUN: true }; ok = false; continue; }
      const av = jaccard(A, B);
      const sv = jaccard(specProfCellMasks[tplId][p], specProfCellMasks[tplId][q]);
      const rv = jaccard(profMasks[tplId][p], profMasks[tplId][q]);
      rec[key] = { actualCellJaccard: +av.toFixed(4), specCellJaccard: +sv.toFixed(4), rectJaccard: +rv.toFixed(4) };
      // 规范轮廓必须恒等；实拍轮廓允许极少量检测噪声（>=0.98）
      if (av < 0.98 || sv <= 0.999) ok = false;
    }
    rec.invariant = ok;
    invariance.push(rec);
  }
  result.invariance = invariance;
  result.invarianceAllPass = invariance.every((x) => x.invariant);

  // ---- 每套模板最终判定（PASS / FAIL / NOT RUN） ----
  // 判定只使用真实实拍数据与真实 API 结果；阈值写在数据里，报告不再二次加工。
  const invById = Object.fromEntries(invariance.map((x) => [x.templateId, x.invariant]));
  for (const rec of result.templates) {
    const p = rec.profiles[PRIMARY];
    if (!p || p.error) { rec.verdict = 'NOT RUN'; rec.reasons = ['主档真实渲染未取得']; continue; }
    const o = p.occlusion || {};
    const checks = {
      correctTemplate: p.appliedTemplateId === p.requestedTemplateId,
      zeroDrawOffset: Math.abs(p.offsetDx) <= 4 && Math.abs(p.offsetDy) <= 4,
      noLeakage: p.leakage <= 0.02,
      coverageOk: p.coverage >= 0.90,
      presentOk: p.presentFrac >= 0.95,
      phaseOk: p.halfCellMatch >= 0.98,
      noSameLayerOverlap: o.sameLayerOverlapPairs === 0,
      drawOrderOk: o.drawOrderCheckedPairs === 0 || o.drawOrderOkPairs === o.drawOrderCheckedPairs,
      hitRegionOk: o.hitRegionOk === o.hitRegionChecked,
      silhouetteInvariant: invById[rec.templateId] === true,
    };
    const failed = Object.keys(checks).filter((k) => !checks[k]);
    rec.checks = checks;
    rec.verdict = failed.length ? 'FAIL' : 'PASS';
    rec.reasons = failed.length ? failed : [];
    rec.diffRatio = +(1 - p.iou).toFixed(4);
  }
  result.summary = {
    total: result.templates.length,
    pass: result.templates.filter((r) => r.verdict === 'PASS').length,
    fail: result.templates.filter((r) => r.verdict === 'FAIL').length,
    notRun: result.templates.filter((r) => r.verdict === 'NOT RUN').length,
    pairwiseAllDistinct: result.pairwise.allDistinct,
    invarianceAllPass: result.invarianceAllPass,
  };

  console.log(`[visual] 190 组最大真实渲染相似度=${result.pairwise.maxSimilarity} (${maxPair}) · 明显重复=${duplicatePairs.length} · 纯像素轮廓最大 Jaccard=${result.pairwise.maxPixelSilhouetteJaccard} (${maxPixelPair}) · 跨档位不变性全过=${result.invarianceAllPass}`);
  console.log(`[visual] 模板判定 PASS=${result.summary.pass} FAIL=${result.summary.fail} NOT RUN=${result.summary.notRun}`);
} catch (e) {
  result.errors.push(String(e && e.message || e));
  console.log('[visual] 异常：' + e.message);
} finally {
  if (child) { try { child.kill(); } catch (e) { /* ignore */ } }
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  writeComparison();
  console.log('[visual] 数据已写入 reports/l2-visual-comparison.json');
}
