/**
 * Stage 2 视觉审计 · 逐牌检测器阈值标定（可复现证据）。
 *
 *   node tools/l2_visual_detector_calibration.mjs
 *
 * 对 L2-P01 / 主档 4 的真实 Canvas 渲染，比较「完整帧 / 无牌基准帧 / 恢复帧」，
 * 统计每张牌 66x88 矩形内 5x5 网格的平均色差与命中点数，并取不与任何牌相交的
 * 空位作负对照。输出用于确定 l2_visual_audit.mjs 的阈值 mean>=14 && hits>=10。
 * 只读审计，不修改任何源码。
 */
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import os from 'node:os';

const root = resolve(process.cwd());
const exe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9355;
const profile = join(os.tmpdir(), 'mah-l2-calib-' + process.pid);
const child = spawn(exe, ['--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files',
  '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile, 'about:blank'],
  { stdio: 'ignore', windowsHide: true });

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && this.p.has(m.id)) { this.p.get(m.id)(m); this.p.delete(m.id); } }; }
  static async connect(u) { const ws = new WebSocket(u); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }); return new CDP(ws); }
  send(method, params = {}) { const id = ++this.id; return new Promise((r) => { this.p.set(id, r); this.ws.send(JSON.stringify({ id, method, params })); }); }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let ver = null;
for (let i = 0; i < 100; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { ver = await r.json(); break; } } catch (e) {} await wait(200); }
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const cdp = await CDP.connect(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 720, height: 1280, deviceScaleFactor: 1, mobile: false });
await cdp.send('Page.navigate', { url: pathToFileURL(join(root, 'dist', 'index.html')).href + '?lv=2' });
for (let i = 0; i < 60; i++) { const r = await cdp.send('Runtime.evaluate', { expression: '!!(window.__mah && window.__mah.game)', returnByValue: true }); if (r.result?.result?.value) break; await wait(200); }

const FN = `
async function __d() {
  const g = window.__mah.game;
  g.profile.l2 = 4;
  g.startLevel(2, 7000, 'L2-P01');
  await new Promise(r => setTimeout(r, 800));
  const cv = document.getElementById('game'), ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const all = g.cards.filter(c => c.state === 'board');
  const I = ctx.getImageData(0, 0, W, H).data;
  const orig = all.map(c => c.state);
  for (const c of all) c.state = 'removed';
  g.boardRev++;
  await new Promise(r => setTimeout(r, 320));
  const B = ctx.getImageData(0, 0, W, H).data;
  for (let i = 0; i < all.length; i++) all[i].state = orig[i];
  g.boardRev++;
  await new Promise(r => setTimeout(r, 320));
  const R = ctx.getImageData(0, 0, W, H).data;
  const px = (buf, x, y) => { const i = (Math.min(H-1,Math.max(0,Math.round(y)))*W + Math.min(W-1,Math.max(0,Math.round(x))))*4; return [buf[i],buf[i+1],buf[i+2],buf[i+3]]; };
  const df = (a,b) => Math.round((Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]))/3);
  let sameIR = 0, diffIR = 0;
  for (let i = 0; i < I.length; i += 4) { if (Math.abs(I[i]-R[i])+Math.abs(I[i+1]-R[i+1])+Math.abs(I[i+2]-R[i+2]) === 0) sameIR++; else diffIR++; }
  const rows = [];
  for (let i = 0; i < all.length; i++) {
    const c = all[i]; const x = c.x+33, y = c.y+44;
    const pi = px(I,x,y), pb = px(B,x,y), pr = px(R,x,y);
    rows.push({ i, x, y, layer: c.layer, seg: c.seg, blocked: !!c.blocked, z: c.z,
      I: pi.join(','), B: pb.join(','), R: pr.join(','), dIB: df(pi,pb), dRB: df(pr,pb) });
  }
  const miss = rows.filter(r => r.dRB <= 38).slice(0, 4);
  const hit = rows.filter(r => r.dRB > 38).slice(0, 3);
  // 5x5 网格聚合检测的分布
  const grid = [];
  for (const c of all) {
    let sum = 0, hits = 0;
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 5; gx++) {
      const sx = c.x + (gx + 0.5) * 66 / 5, sy = c.y + (gy + 0.5) * 88 / 5;
      const d = df(px(R, sx, sy), px(B, sx, sy));
      sum += d; if (d > 8) hits++;
    }
    grid.push({ mean: +(sum / 25).toFixed(1), hits, seg: c.seg });
  }
  // 负对照：在牌桌区域内取不与任何牌矩形相交的空位，量化「没有牌」时的网格差异
  const neg = [];
  for (let k = 0; k < 60; k++) {
    const x = 33 + ((k * 83) % 10) * 66, y = 220 + ((k * 47) % 7) * 88;
    if (all.some(c => Math.abs(c.x - x) < 66 && Math.abs(c.y - y) < 88)) continue;
    let sum = 0, hits = 0;
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 5; gx++) {
      const sx = x + (gx + 0.5) * 66 / 5, sy = y + (gy + 0.5) * 88 / 5;
      const d = df(px(R, sx, sy), px(B, sx, sy));
      sum += d; if (d > 8) hits++;
    }
    neg.push({ mean: +(sum / 25).toFixed(1), hits });
  }
  const means = grid.map(g => g.mean).sort((a,b)=>a-b);
  const hitsArr = grid.map(g => g.hits).sort((a,b)=>a-b);
  return { W, H, dpr: W/720, boardRev: g.boardRev, alive: all.length,
    sameIR, diffIR, missCount: rows.filter(r => r.dRB <= 38).length, hitCount: rows.filter(r => r.dRB > 38).length,
    miss, hit, queue: rows.filter(r=>r.seg==='queue').length,
    gridMeanMin: means[0], gridMeanP5: means[13], gridMeanP50: means[136], gridMeanMax: means[272],
    gridHitsMin: hitsArr[0], gridHitsP5: hitsArr[13], gridHitsP50: hitsArr[136],
    below14: grid.filter(g=>g.mean<14).length, below20: grid.filter(g=>g.mean<20).length,
    hitsBelow10: grid.filter(g=>g.hits<10).length,
    negCount: neg.length, negMeanMax: neg.length ? Math.max(...neg.map(n=>n.mean)) : null,
    negMeanP50: neg.length ? neg.map(n=>n.mean).sort((a,b)=>a-b)[neg.length>>1] : null,
    negHitsMax: neg.length ? Math.max(...neg.map(n=>n.hits)) : null,
    worst: grid.slice().sort((a,b)=>a.mean-b.mean).slice(0,5) };
}`;
const r = await cdp.send('Runtime.evaluate', { expression: `(${FN})()`, awaitPromise: true, returnByValue: true });
console.log(JSON.stringify(r.result?.result?.value ?? r.result?.exceptionDetails, null, 2));
try { cdp.ws.close(); } catch (e) { /* 忽略 */ }
child.kill();
rmSync(profile, { recursive: true, force: true });
