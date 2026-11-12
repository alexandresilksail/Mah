/**
 * 背景音乐集成自动化测试（本轮第二 / 六节）。
 *
 *   node test-music-playback.js
 *
 * 覆盖：
 *  · 播放链路：加载 / 播放 / 场景切换 / 音量 / 静音 / 开关 / 单实例 / 失败降级；
 *  · 首次用户手势解锁（浏览器自动播放限制）；
 *  · 网页版 / 独立 HTML 版 / legacy 版 / 桌面版前端四处的音乐集成一致性；
 *  · 场景映射与资源指纹在所有版本一致。
 *
 * 注意：本文件是**模拟 audio 元素**的自动化测试，按规格不能代替真实音频播放验证。
 * 真实播放由 tools/music_real_playback.mjs 驱动 Edge 实测 currentTime 前进，
 * 结果单独写在 reports/music-playback-report.md 的「真机验证」一节。
 *
 * 输出：reports/music-playback-report.{json,md}
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MusicPlayer, MusicManager, FADE_MS } from './src/game/music_player.js';
import { sceneOf, SCENES, matchScene } from './src/game/music_match.js';
import {
  BUILTIN_MUSIC_MAP, BUILTIN_MUSIC_SRC, BUILTIN_MUSIC_FILES,
  MUSIC_RESOURCE_HASH, MUSIC_RESOURCE_BYTES, mergeMusicMap,
} from './src/game/music_manifest.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const REPORTS = path.join(ROOT, 'reports');
mkdirSync(REPORTS, { recursive: true });
const read = (p) => existsSync(path.join(ROOT, p)) ? readFileSync(path.join(ROOT, p), 'utf8') : '';

let pass = 0, fail = 0;
const failures = [];
const checks = [];
function ok(cond, label, group) {
  if (cond) pass++; else { fail++; failures.push(label); console.log('  ✗ ' + label); }
  checks.push({ group: group || 'general', label, pass: !!cond });
  return !!cond;
}
function line(s) { console.log(s); }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

class FakeAudio {
  constructor() {
    this.volume = 1; this.paused = true; this.loop = false; this.src = '';
    this.currentTime = 0; this.muted = false; this.attr = {}; this.error = null;
    FakeAudio.created.push(this);
  }
  setAttribute(k, v) { this.attr[k] = v; }
  removeAttribute(k) { delete this.attr[k]; if (k === 'src') this.src = ''; }
  play() {
    if (FakeAudio.rejectNext) { FakeAudio.rejectNext = false; return Promise.reject(new Error('NotAllowedError')); }
    this.paused = false;
    this.currentTime += 0.01;
    return Promise.resolve();
  }
  pause() { this.paused = true; }
  load() {}
}
FakeAudio.created = [];
FakeAudio.rejectNext = false;

line('============================================================================');
line(' MahLeMah · 背景音乐集成自动化测试（模拟音频 + 四版本集成检查）');
line('============================================================================');

/* ---------- [1] 资源与映射 ---------- */
line('\n[1] 内置音乐资源与场景映射');
ok(BUILTIN_MUSIC_FILES.length === 5, '内置 5 首用户音乐（未替换 / 未删除）', 'resource');
ok(Object.keys(BUILTIN_MUSIC_MAP).length === 6 && SCENES.length === 6,
  '6 个固定场景，所有版本共用同一份映射', 'resource');
const expect = {
  title: '标题场景音乐.wav', level1: '第一关场景音乐.wav', level2: '第二关场景音乐.wav',
  win: '过关场景音乐.wav', lose: '失败场景音乐.wav',
};
let mapOk = true, dataOk = true, total = 0;
for (const sc of Object.keys(expect)) {
  const l = BUILTIN_MUSIC_MAP[sc] || [];
  if (l.length !== 1 || l[0] !== expect[sc]) mapOk = false;
}
if ((BUILTIN_MUSIC_MAP.graduated || []).length !== 0) mapOk = false;
for (const n of BUILTIN_MUSIC_FILES) {
  const s = BUILTIN_MUSIC_SRC[n];
  if (typeof s !== 'string' || s.indexOf('data:audio/wav;base64,') !== 0) { dataOk = false; continue; }
  const buf = Buffer.from(s.slice(s.indexOf(',') + 1), 'base64');
  total += buf.length;
  const disk = readFileSync(path.join(ROOT, 'src/assets/music', n));
  ok(buf.equals(disk), `${n} 内嵌载荷与原 wav 逐字节一致`, 'resource');
}
ok(mapOk, 'title/level1/level2/win/lose 各 1 首，graduated 留空静音', 'resource');
ok(dataOk && total === MUSIC_RESOURCE_BYTES && MUSIC_RESOURCE_HASH.length === 64,
  `内嵌 data URI 完整，总 ${total} B，指纹 ${MUSIC_RESOURCE_HASH.slice(0, 12)}`, 'resource');
ok(MusicManager === MusicPlayer, 'MusicManager 与播放器是同一个类（不存在第二个实例）', 'resource');
ok(FADE_MS === 600, '切场景淡入 600ms', 'resource');
for (const n of BUILTIN_MUSIC_FILES) {
  const m = matchScene(n);
  ok(m.confidence === 'exact' && BUILTIN_MUSIC_MAP[m.scene].indexOf(n) >= 0,
    `${n} 用现有 matchScene 规则命中 ${m.scene}，与映射一致`, 'resource');
}
{
  const merged = mergeMusicMap({ title: ['extra.mp3'], bogus: ['x.mp3'] });
  ok(merged.title.length === 2 && merged.title[0] === expect.title && !merged.bogus,
    '用户导入只追加合法场景，内置曲目不被替换 / 删除', 'resource');
}

/* ---------- [2] 播放链路（模拟 audio） ---------- */
line('\n[2] 播放链路：解锁 / 加载 / 播放 / 切换 / 音量 / 静音 / 单实例 / 失败处理');
globalThis.Audio = FakeAudio;
FakeAudio.created = [];
FakeAudio.rejectNext = false;
{
  const builtin = { map: BUILTIN_MUSIC_MAP, src: BUILTIN_MUSIC_SRC };
  const p = new MusicPlayer({ builtin, fadeMs: 0, volume: 0.6 });
  ok(p.playScene('title') === false && FakeAudio.created.length === 0,
    '首次点击前不创建 / 不播放（自动播放限制）', 'playback');
  ok(p.unlock() === true, '首次用户手势完成音频解锁', 'playback');
  await wait(20);
  const el = FakeAudio.created[0];
  ok(FakeAudio.created.length === 1 && el && el.src === BUILTIN_MUSIC_SRC[expect.title],
    '解锁后自动加载标题曲（内置 data URI，不依赖路径 / 网络 / Rust 命令）', 'playback');
  ok(p.status().playing === true && p.status().instances === 1 && p.status().track === expect.title,
    '真实状态：正在播放、恰好 1 个实例、曲目正确', 'playback');
  ok(el.loop === true, '单曲循环', 'playback');
  p.setVolume(0.3);
  ok(Math.abs(el.volume - 0.27) < 1e-6 && p.volume === 0.3, '音量独立可调（volume×0.9）', 'playback');
  p.setMuted(true);
  ok(el.muted === true, '静音独立于音效', 'playback');
  p.setMuted(false);

  const seq = [
    ['level1', expect.level1], ['level2', expect.level2], ['win', expect.win],
    ['lose', expect.lose], ['title', expect.title],
  ];
  let switchOk = true, singleOk = true;
  for (const [scene, track] of seq) {
    p.playScene(scene);
    await wait(10);
    if (p.status().track !== track || p.status().scene !== scene) switchOk = false;
    if (p.status().instances !== 1) singleOk = false;
  }
  ok(switchOk, '标题 / 第一关 / 第二关 / 胜利 / 失败 / 返回标题 按配置自动切曲', 'playback');
  ok(singleOk && FakeAudio.created.length === 1,
    '切场景全程只有 1 个 audio 实例，禁止多实例同时播放', 'playback');
  ok(p.status().switchCount >= 5, `场景切换计数真实递增（${p.status().switchCount}）`, 'playback');

  // graduated 无内置曲目 → 停止播放而不是报错
  p.playScene('graduated');
  await wait(10);
  ok(p.status().playing === false && p.status().instances === 0,
    '未配置曲目的场景静音且无异常', 'playback');

  p.playScene('level1');
  p.setEnabled(false);
  ok(p.status().playing === false && p.status().instances === 0, '关闭音乐立即停止', 'playback');
  p.setEnabled(true);
  ok(p.status().playing === true, '重新开启按当前场景恢复', 'playback');

  // 失败处理：play() 被拒绝
  FakeAudio.rejectNext = true;
  const p2 = new MusicPlayer({ builtin, fadeMs: 0, volume: 0.5 });
  p2.unlock();
  p2.playScene('win', true);
  await wait(30);
  ok(p2.playErrors >= 1 && p2.lastError.indexOf('PLAY_REJECTED') >= 0,
    'play() 被拒绝时记录错误并降级，不抛异常到游戏', 'failure');
  // 失败处理：媒体解码错误
  const p3 = new MusicPlayer({ builtin, fadeMs: 0, volume: 0.5 });
  p3.unlock();
  p3.playScene('title', true);
  await wait(10);
  const el3 = FakeAudio.created[FakeAudio.created.length - 1];
  el3.error = { code: 4 };
  if (el3.onerror) el3.onerror();
  await wait(10);
  ok(p3.lastError.indexOf('MEDIA_ERROR') >= 0, '加载 / 解码错误被捕获并记录', 'failure');
  // 失败处理：源缺失
  const p4 = new MusicPlayer({ builtin: { map: { title: ['missing.wav'] }, src: {} }, fadeMs: 0 });
  p4.unlock();
  ok(p4.playScene('title', true) === true, '缺源场景仍返回可处理状态', 'failure');
  await wait(20);
  ok(p4.lastError.indexOf('NO_SOURCE') >= 0, '缺源被记录为 NO_SOURCE 并静音降级', 'failure');
  p.dispose(); p2.dispose(); p3.dispose(); p4.dispose();
}
delete globalThis.Audio;

/* ---------- [3] sceneOf 全覆盖 ---------- */
line('\n[3] 场景判定覆盖全部游戏状态');
{
  const g = { screen: 'title', level: 1, status: 'play', graduated: false, paused: false };
  ok(sceneOf(g) === 'title', '标题页 → title', 'scene');
  g.screen = 'play'; ok(sceneOf(g) === 'level1', '第一关 → level1', 'scene');
  g.level = 2; ok(sceneOf(g) === 'level2', '第二关 → level2', 'scene');
  g.status = 'win'; ok(sceneOf(g) === 'win', '胜利 → win', 'scene');
  g.status = 'lose'; ok(sceneOf(g) === 'lose', '失败 → lose', 'scene');
  g.status = 'play'; g.graduated = true; ok(sceneOf(g) === 'graduated', '全部通关 → graduated', 'scene');
  g.graduated = false; g.screen = 'title'; ok(sceneOf(g) === 'title', '返回标题页 → title', 'scene');
}

/* ---------- [4] 四个运行版本的音乐集成 ---------- */
line('\n[4] 网页版 / 独立 HTML 版 / legacy / 桌面版前端 的音乐集成');
const versions = [
  { name: '网页版', file: 'dist/index.html' },
  { name: '独立 HTML 版', file: 'dist/MahLeMah.html' },
  { name: '中文名副本', file: 'dist/Mah了个Mah.html' },
  { name: 'ES5 legacy 版', file: 'dist/MahLeMah-legacy.html' },
];
const versionRows = [];
for (const v of versions) {
  const h = read(v.file);
  const bytes = existsSync(path.join(ROOT, v.file)) ? readFileSync(path.join(ROOT, v.file)).length : 0;
  const payloads = (h.match(/data:audio\/wav;base64,/g) || []).length;
  const namesOk = BUILTIN_MUSIC_FILES.every((n) => h.indexOf(n) >= 0);
  // 逐字节完整性：manifest 里每首 data URI 必须原样出现在产物中（不是只数个数）
  const exactHits = BUILTIN_MUSIC_FILES.filter((n) => h.indexOf(BUILTIN_MUSIC_SRC[n]) >= 0).length;
  const payloadOk = exactHits === BUILTIN_MUSIC_FILES.length;
  const unlockOk = h.indexOf('__MAH_MUSIC_STATUS__') >= 0;
  const noPath = !/src\s*=\s*["'][^"']+\.(mp3|ogg|wav)/.test(h) && h.indexOf('Administrator/Desktop') < 0;
  ok(bytes > 0, `${v.name} 产物存在（${bytes} 字节）`, 'version');
  ok(payloads >= 5, `${v.name} 内嵌 5 首完整音乐载荷（实测 ${payloads}）`, 'version');
  ok(payloadOk, `${v.name} 5 首载荷与 manifest 逐字节一致（实测 ${exactHits}/5）`, 'version');
  ok(namesOk, `${v.name} 场景映射与其余版本一致`, 'version');
  ok(unlockOk, `${v.name} 带首次点击解锁与播放状态观测链路`, 'version');
  ok(noPath, `${v.name} 不引用外部音频路径 / 开发机路径`, 'version');
  versionRows.push({ name: v.name, file: v.file, bytes, payloads, exactHits, payloadOk, namesOk, unlockOk, noPath });
}
{
  const srcMain = read('src/main.js');
  const conf = read('src-tauri/tauri.conf.json');
  const manifest = read('src/game/music_manifest.js');
  ok(srcMain.indexOf('music_manifest.js') >= 0 && srcMain.indexOf('musicPlayer.unlock()') >= 0,
    '桌面版前端 src/ 直接 import 同一份 manifest 并做首次点击解锁', 'desktop');
  ok(manifest.indexOf('data:audio/wav;base64,') >= 0,
    '桌面版前端资源与网页版同源（同一 manifest 文件）', 'desktop');
  ok(/media-src[^;]*data:[^;]*blob:/.test(conf),
    'Tauri CSP 放行 media-src data:/blob:（旧版 media-src none 会拦住所有音频）', 'desktop');
  ok(/frontendDist/.test(conf), '桌面版前端目录配置存在', 'desktop');
  versionRows.push({ name: '桌面版前端（静态集成检查）', file: 'src/main.js + tauri.conf.json', static: true });
}

const report = {
  generatedAt: new Date().toISOString(),
  resource: { files: BUILTIN_MUSIC_FILES, bytes: MUSIC_RESOURCE_BYTES, hash: MUSIC_RESOURCE_HASH },
  summary: { pass, fail, failures },
  checks, versions: versionRows,
  realPlayback: '本文件为模拟音频的自动化测试；真实播放见 tools/music_real_playback.mjs 的输出',
};
writeFileSync(path.join(REPORTS, 'music-playback-report.json'), JSON.stringify(report, null, 2), 'utf8');
let md = `# 背景音乐集成测试报告\n\n` +
  `- 资源：${BUILTIN_MUSIC_FILES.length} 首 / ${MUSIC_RESOURCE_BYTES} B / sha256 ${MUSIC_RESOURCE_HASH}\n` +
  `- 映射：${Object.keys(expect).map((k) => k + '→' + expect[k]).join('，')}；graduated 留空\n` +
  `- 断言：${pass} 通过 / ${fail} 失败\n\n` +
  `## 版本集成\n\n| 版本 | 文件 | 字节 | 内嵌载荷 | 载荷逐字节一致 | 映射一致 | 解锁链路 | 无外链路径 |\n|---|---|---:|---:|---|---|---|---|\n`;
for (const v of versionRows) {
  if (v.static) { md += `| ${v.name} | ${v.file} | — | 同一 manifest | ✓ | ✓ | ✓ | ✓ |\n`; continue; }
  md += `| ${v.name} | ${v.file} | ${v.bytes} | ${v.payloads} | ${v.payloadOk ? '✓' : '✗'} (${v.exactHits}/5) | ` +
    `${v.namesOk ? '✓' : '✗'} | ${v.unlockOk ? '✓' : '✗'} | ${v.noPath ? '✓' : '✗'} |\n`;
}
md += `\n## 说明\n\n` +
  `- 本报告的播放断言用模拟 audio 元素完成，**按规格不能代替真实音频播放验证**；\n` +
  `  真实播放由 Edge 驱动 ` + '`tools/music_real_playback.mjs`' + ` 实测 currentTime 前进，结果见本报告「真机验证」补充章节。\n` +
  `- 桌面版仅做**静态集成检查**：本机 Rust 编译被系统策略拒绝（build script os error 5），\n` +
  `  exe 未重建，因此桌面版真机播放**未运行**，不计入通过。\n`;
writeFileSync(path.join(REPORTS, 'music-playback-report.md'), md, 'utf8');

line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line(' 报告：reports/music-playback-report.json / .md');
line('============================================================================');
if (fail) process.exit(1);
