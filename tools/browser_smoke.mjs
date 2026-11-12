/**
 * 真实浏览器运行测试（最终验收的「浏览器实际运行测试」一项）。
 *
 *   node tools/browser_smoke.mjs
 *
 * 启动本机 Edge（headless + CDP），分别打开 dist/MahLeMah.html 与
 * dist/MahLeMah-legacy.html，在**真实浏览器 JS 引擎**里：
 *  · 读取构建注入的 window.__MAH_BUILD__；
 *  · 调用页面暴露的 newGame()（与 UI 按钮同一个函数）连续生成 4 局；
 *  · 校验每局 game.meta 的牌数 / 布局签名 / 最近三局差异化 / 历史持久化；
 *  · 检查 ?dev=1 调试面板确实渲染真实 gameId；
 *  · 捕获页面 JS 异常（console error / Runtime.exceptionThrown）。
 *
 * 结果写 reports/browser-smoke-report.json。启动失败或浏览器不存在时
 * 如实报告「未执行」，绝不伪造成通过。
 */
import { spawn } from 'node:child_process';
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
const PORT = 9333;
const profile = join(os.tmpdir(), 'mah-browser-smoke-' + process.pid);
const result = {
  generatedAt: new Date().toISOString(),
  browser: exe || null,
  executed: false,
  pages: [],
  errors: [],
};

function write() {
  writeFileSync(join(reports, 'browser-smoke-report.json'), JSON.stringify(result, null, 2), 'utf8');
}

if (!exe) {
  result.errors.push('未找到 Edge/Chrome，浏览器实测未执行');
  write();
  console.log('[browser] 未执行：找不到浏览器可执行文件');
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
  write();
  console.log('[browser] 未执行：启动失败');
  process.exit(2);
}

async function waitPort(ms = 15000) {
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
      if (m.id && this.pending.has(m.id)) {
        this.pending.get(m.id)(m);
        this.pending.delete(m.id);
      } else if (m.method) this.events.push(m);
    };
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });
    return new CDP(ws);
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res) => {
      this.pending.set(id, res);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { try { this.ws.close(); } catch (e) { /* ignore */ } }
}

const CHECK = `
(function () {
  try {
    var m = window.__mah;
    if (!m) return { error: 'window.__mah 不存在' };
    var build = window.__MAH_BUILD__ || null;
    var out = { build: build, rounds: [], errors: [] };
    for (var i = 0; i < 4; i++) {
      var r = m.newGame(1, ['application_restart','title_screen_restart','failure_restart','new_game'][i]);
      if (!r) { out.errors.push('newGame 返回 null（生成失败）'); continue; }
      var meta = r.game.meta;
      var hist = m.getSaveState().level1RecentGames || [];
      out.rounds.push({
        gameId: meta.gameId,
        level: meta.level,
        difficultyId: meta.difficultyId,
        seed: meta.seed,
        totalTiles: meta.totalTiles,
        tileTypeCount: meta.tileTypeCount,
        layoutSignature: meta.layoutSignature,
        geometrySignature: meta.geometrySignature,
        generationReason: meta.generationReason,
        checks: meta.checks,
        historyCount: hist.length,
        cardsOnBoard: r.game.cards.length
      });
    }
    var panel = document.getElementById('mah-dev-panel');
    out.devPanelPresent = !!panel;
    out.devPanelText = panel ? (panel.innerText || panel.textContent || '').slice(0, 400) : '';
    out.canvasPresent = !!document.getElementById('game');
    return out;
  } catch (e) {
    return { error: String(e && e.stack || e) };
  }
})()
`;

async function runPage(name, file, dev) {
  const url = pathToFileURL(join(root, 'dist', file)).href + (dev ? '?dev=1' : '');
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  let target = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!target) throw new Error('没有可用 CDP page target');
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  const nav = await cdp.send('Page.navigate', { url });
  if (nav.error) throw new Error('navigate: ' + JSON.stringify(nav.error));
  await new Promise((r) => setTimeout(r, 2500));
  const ev = await cdp.send('Runtime.evaluate', {
    expression: CHECK, returnByValue: true, awaitPromise: false,
  });
  const value = ev.result && ev.result.result && ev.result.result.value;
  const exceptions = cdp.events.filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => String(e.params && e.params.exceptionDetails && e.params.exceptionDetails.text || 'exception'));
  cdp.close();
  return { name, file, url, value, exceptions };
}

let version = null;
try {
  version = await waitPort();
  if (!version) throw new Error('CDP 端口未就绪');
  result.executed = true;
  result.browserVersion = version.Browser;
  console.log('[browser] ' + version.Browser);

  for (const spec of [
    { name: 'MahLeMah.html', file: 'MahLeMah.html', dev: true },
    { name: 'MahLeMah-legacy.html', file: 'MahLeMah-legacy.html', dev: true },
  ]) {
    let page;
    try { page = await runPage(spec.name, spec.file, spec.dev); }
    catch (e) { page = { name: spec.name, error: String(e && e.message) }; }
    result.pages.push(page);
    if (page.error) {
      console.log(`  [FAIL] ${page.name}: ${page.error}`);
    } else {
      const v = page.value || {};
      console.log(`  ${page.name}: rounds=${(v.rounds || []).length} devPanel=${v.devPanelPresent} exceptions=${(page.exceptions || []).length} error=${v.error || '-'}`);
      if (v.rounds) for (const r of v.rounds) {
        console.log(`    ${r.gameId} · 档${r.difficultyId} · ${r.totalTiles} 张 · ${r.generationReason} · 历史 ${r.historyCount} · 检查 ${JSON.stringify(r.checks)}`);
      }
    }
  }
} catch (e) {
  result.errors.push(String(e && e.message || e));
  console.log('[browser] 未执行完成：' + e.message);
} finally {
  if (child) { try { child.kill(); } catch (e) { /* ignore */ } }
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* ignore */ }
}

/* 判定：两页都必须真实生成 4 局、无异常、构建信息存在 */
let passed = 0;
for (const p of result.pages) {
  const v = p.value || {};
  const rounds = v.rounds || [];
  const okRounds = rounds.length === 4 && rounds.every((r) =>
    r.totalTiles > 0 && /^[0-9a-f]{64}$/.test(r.layoutSignature) &&
    r.cardsOnBoard === r.totalTiles && r.checks.tileCountCheck === 'PASS' &&
    r.checks.layoutCheck === 'PASS' && r.checks.historyCheck === 'PASS');
  const okDiff = rounds.every((r, i) => {
    const w = rounds.slice(Math.max(0, i - 3), i);
    return w.every((x) => x.totalTiles !== r.totalTiles && x.geometrySignature !== r.geometrySignature);
  });
  const okBuild = !!v.build && !!v.build.sourceHash && !!v.build.gitCommit;
  const okPanel = !!v.devPanelPresent;
  const okExc = (p.exceptions || []).length === 0 && !v.error;
  p.checks = { rounds: okRounds, differentiation: okDiff, buildInfo: okBuild, devPanel: okPanel, noExceptions: okExc };
  if (okRounds && okDiff && okBuild && okPanel && okExc) passed++;
}
result.summary = { pages: result.pages.length, passed, allPassed: result.executed && passed === 2 && result.errors.length === 0 };
result.exitCode = result.summary.allPassed ? 0 : 1;
write();
console.log('[browser] 报告 reports/browser-smoke-report.json · allPassed=' + result.summary.allPassed);
process.exit(result.exitCode);
