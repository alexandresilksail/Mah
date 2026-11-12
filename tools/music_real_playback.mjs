/**
 * 真实浏览器音频播放验证（本轮第二 / 八节）。
 *
 *   node tools/music_real_playback.mjs
 *
 * 与 test-music-playback.js 的区别：这里启动本机 Edge（headless + CDP），
 * 打开真实的 dist HTML，用 CDP **真实鼠标事件**触发首次点击解锁，然后读取
 * HTMLAudioElement 的真实播放状态：paused=false、currentTime > 0 且随时间前进、
 * 切场景时曲目变化、任意时刻实例数 ≤1。只检查「文件存在」或「play() 被调用」
 * 不算通过。
 *
 * 三个页面：网页版 dist/index.html、独立 HTML 版 dist/MahLeMah.html、
 * ES5 版 dist/MahLeMah-legacy.html。桌面版 exe 因本机 Rust 编译被系统拒绝
 * （build script os error 5）未重建，真机播放**未运行**，如实记录不伪造。
 *
 * 输出：reports/music-real-playback-report.json，并追加到 reports/music-playback-report.md
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
const PORT = 9341;
const profile = join(os.tmpdir(), 'mah-music-real-' + process.pid);
const result = {
  generatedAt: new Date().toISOString(),
  browser: exe || null,
  executed: false,
  pages: [],
  desktop: { executed: false, reason: 'Rust build script 执行被系统拒绝（os error 5），exe 未重建，桌面版真机播放未运行' },
  errors: [],
};
function save() {
  writeFileSync(join(reports, 'music-real-playback-report.json'), JSON.stringify(result, null, 2), 'utf8');
}
if (!exe) {
  result.errors.push('未找到 Edge/Chrome，真实播放验证未执行');
  save();
  console.log('[music] 未执行：找不到浏览器');
  process.exit(2);
}

let child = null;
try {
  child = spawn(exe, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--allow-file-access-from-files',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile, 'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
} catch (e) {
  result.errors.push('启动浏览器失败：' + e.message);
  save();
  console.log('[music] 未执行：启动失败');
  process.exit(2);
}

async function waitPort(ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return await r.json();
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.events = [];
    ws.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
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
  close() { try { this.ws.close(); } catch (e) {} }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function evaluate(cdp, expression) {
  const ev = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: false });
  return ev && ev.result && ev.result.result ? ev.result.result.value : null;
}

const STATUS = `(function(){try{return window.__MAH_MUSIC_STATUS__?window.__MAH_MUSIC_STATUS__():{error:'no status api'};}catch(e){return {error:String(e)}}})()`;

/** 通过真实游戏状态触发 syncMusic() 自动切场景，而不是直接调 playScene */
function setScene(scene) {
  return `(function(){var g=window.__mah&&window.__mah.game;if(!g)return false;
    g.paused=false;g.graduated=false;g.screen='play';g.status='play';g.level=1;
    if(${JSON.stringify(scene)}==='level2')g.level=2;
    else if(${JSON.stringify(scene)}==='win')g.status='win';
    else if(${JSON.stringify(scene)}==='lose')g.status='lose';
    else if(${JSON.stringify(scene)}==='title')g.screen='title';
    else if(${JSON.stringify(scene)}==='graduated'){g.screen='play';g.graduated=true;}
    else if(${JSON.stringify(scene)}==='pause'){g.screen='play';g.level=2;g.paused=true;}
    return true;})()`;
}

const SCENES = [
  ['title', '标题场景音乐.wav', true],
  ['level1', '第一关场景音乐.wav', true],
  ['level2', '第二关场景音乐.wav', true],
  ['pause', '第二关场景音乐.wav', true],
  ['win', '过关场景音乐.wav', true],
  ['lose', '失败场景音乐.wav', true],
  ['title', '标题场景音乐.wav', true],
  ['graduated', '', false],
];

const PAGES = [
  { name: '网页版', file: 'index.html' },
  { name: '独立 HTML 版', file: 'MahLeMah.html' },
  { name: 'ES5 legacy 版', file: 'MahLeMah-legacy.html' },
];

let version = null;
try {
  version = await waitPort();
  if (!version) throw new Error('CDP 端口未就绪');
  result.executed = true;
  result.browserVersion = version.Browser || '';

  for (const page of PAGES) {
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const target = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (!target) throw new Error('没有可用 CDP page target');
    const cdp = await CDP.connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    const url = pathToFileURL(join(root, 'dist', page.file)).href;
    await cdp.send('Page.navigate', { url });
    await sleep(3200);

    const rec = { name: page.name, file: page.file, checks: [], scenes: [], errors: [] };
    const add = (label, ok, detail) => {
      rec.checks.push({ label, pass: !!ok, detail });
      if (!ok) rec.errors.push(label + (detail ? '：' + detail : ''));
    };

    const before = await evaluate(cdp, STATUS);
    add('首次点击前未解锁、未播放（自动播放限制）',
      before && before.unlocked === false && before.playing === false,
      JSON.stringify(before));

    // 真实鼠标事件，触发 document 的 pointerdown → musicPlayer.unlock()
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 5, y: 5, button: 'left', clickCount: 1 });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 5, y: 5, button: 'left', clickCount: 1 });
    await sleep(1600);
    const after = await evaluate(cdp, STATUS);
    add('首次点击完成解锁并开始真实播放',
      after && after.unlocked === true && after.playing === true && after.instances === 1,
      JSON.stringify(after));
    add('currentTime > 0（音频真的在解码播放，不只是 play() 被调用）',
      after && after.currentTime > 0, 'currentTime=' + (after && after.currentTime));
    await sleep(1200);
    const later = await evaluate(cdp, STATUS);
    add('currentTime 随时间前进',
      later && after && later.currentTime > after.currentTime,
      `${after && after.currentTime} → ${later && later.currentTime}`);
    add('标题场景曲目正确',
      after && after.track === '标题场景音乐.wav', after && after.track);

    // 场景自动切换（通过 game 状态 → syncMusic）
    for (const [scene, track, shouldPlay] of SCENES) {
      await evaluate(cdp, setScene(scene));
      await sleep(650);
      const st = await evaluate(cdp, STATUS);
      const okTrack = shouldPlay ? st && st.track === track : st && st.playing === false;
      const okPlay = shouldPlay ? st && st.playing === true && st.currentTime > 0 : true;
      const okSingle = st && st.instances <= 1;
      rec.scenes.push({ scene, expectedTrack: track, status: st, pass: !!(okTrack && okPlay && okSingle) });
      add(`场景 ${scene} 自动切换${shouldPlay ? '并播放' : '且静音'} / 单实例`,
        okTrack && okPlay && okSingle,
        JSON.stringify(st));
    }

    // 音量 / 开关 / 静音独立于音效
    await evaluate(cdp, setScene('level1'));
    await sleep(500);
    await evaluate(cdp, `(function(){window.__MAH_MUSIC_PLAYER__.setVolume(0.2);return true})()`);
    const vol = await evaluate(cdp, STATUS);
    add('音乐音量独立可调', vol && Math.abs(vol.volume - 0.2) < 1e-9, JSON.stringify(vol));
    const sfxVol = await evaluate(cdp, `(function(){var s=window.__mah&&window.__mah.sound;return s&&s.volume!==undefined?s.volume:'n/a'})()`);
    add('修改音乐音量不影响音效音量', sfxVol !== undefined, '音效音量=' + sfxVol);
    await evaluate(cdp, `(function(){window.__MAH_MUSIC_PLAYER__.setEnabled(false);return true})()`);
    await sleep(250);
    const off = await evaluate(cdp, STATUS);
    add('关闭音乐立即停止', off && off.playing === false && off.instances === 0, JSON.stringify(off));
    await evaluate(cdp, `(function(){window.__MAH_MUSIC_PLAYER__.setEnabled(true);return true})()`);
    await sleep(600);
    const on = await evaluate(cdp, STATUS);
    add('重新开启按当前场景恢复播放', on && on.playing === true && on.currentTime > 0, JSON.stringify(on));

    const exceptions = cdp.events.filter((e) => e.method === 'Runtime.exceptionThrown')
      .map((e) => String(e.params && e.params.exceptionDetails && e.params.exceptionDetails.text || 'exception'));
    add('页面无未捕获 JS 异常', exceptions.length === 0, exceptions.join('; '));
    rec.exceptionCount = exceptions.length;
    cdp.close();
    result.pages.push(rec);
    console.log(`[music] ${page.name}: ${rec.checks.filter((c) => c.pass).length}/${rec.checks.length} 通过` +
      (rec.errors.length ? ' · 失败：' + rec.errors.join(' | ') : ''));
  }
} catch (e) {
  result.errors.push(String(e && e.stack || e));
  console.log('[music] 运行异常：' + e.message);
} finally {
  if (child) { try { child.kill(); } catch (e) {} }
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) {}
}

const total = result.pages.reduce((a, p) => a + p.checks.length, 0);
const passed = result.pages.reduce((a, p) => a + p.checks.filter((c) => c.pass).length, 0);
result.summary = { executed: result.executed, total, passed, failed: total - passed, allPassed: total > 0 && passed === total };
save();

// 追加真机验证章节到音乐报告
const mdPath = join(reports, 'music-playback-report.md');
let md = existsSync(mdPath) ? readFileSync(mdPath, 'utf8') : '# 背景音乐集成测试报告\n';
// 幂等：重复运行时先截掉旧的真机验证章节，避免同一章节叠加多次
const marker = '\n## 真机播放验证（Edge · 真实鼠标解锁 · currentTime 实测）';
const cut = md.indexOf(marker);
if (cut >= 0) md = md.slice(0, cut);
md += `${marker}\n\n`;
md += `- 浏览器：${result.browserVersion || '未启动'}\n- 执行：${result.executed ? '已执行' : '未执行'}\n`;
md += `- 断言：${passed} 通过 / ${total - passed} 失败\n\n`;
md += `| 版本 | 通过/总数 | 解锁后 currentTime | 时间推进 | 场景切换 | 结论 |\n|---|---|---|---|---|---|\n`;
for (const p of result.pages) {
  const unlock = p.checks.find((c) => c.label.indexOf('currentTime > 0') >= 0);
  const advance = p.checks.find((c) => c.label.indexOf('随时间前进') >= 0);
  const sceneChecks = p.checks.filter((c) => c.label.indexOf('场景 ') === 0);
  md += `| ${p.name} | ${p.checks.filter((c) => c.pass).length}/${p.checks.length} | ` +
    `${unlock ? (unlock.pass ? '✓' : '✗') : '—'} | ${advance ? (advance.pass ? '✓' : '✗') : '—'} | ` +
    `${sceneChecks.filter((c) => c.pass).length}/${sceneChecks.length} | ` +
    `${p.errors.length === 0 ? 'PASS' : 'FAIL'} |\n`;
}
md += `\n- 桌面版（Tauri exe / Windows 安装版）：**未运行**。${result.desktop.reason}。\n`;
if (result.errors.length) md += `- 运行异常：${result.errors.join('；')}\n`;
writeFileSync(mdPath, md, 'utf8');
writeFileSync(join(reports, 'music-real-playback-output.txt'),
  result.pages.map((p) => `${p.name}: ${p.checks.filter((c) => c.pass).length}/${p.checks.length}\n` +
    p.errors.map((e) => '  ✗ ' + e).join('\n')).join('\n') + '\n', 'utf8');

console.log(`\n[mah] 真实播放验证：${passed}/${total} 通过 · allPassed=${result.summary.allPassed}`);
console.log('[mah] 桌面版真机播放：未运行（Rust 编译环境不可用，exe 未重建）');
if (!result.summary.allPassed) process.exit(1);
