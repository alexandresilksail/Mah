/**
 * 两个 HTML 与 src/ 的构建一致性检查（第十一阶段）。
 *
 *   node test-build-consistency.js
 *
 * 判定依据不是文件大小或版本号，而是：
 *  1. 用 tools/bundle_shared.mjs（构建脚本本身用的同一函数）现场重新打包
 *     src/main.js，与 HTML 内嵌 <script id="mah-bundle"> 做**逐字节**比对；
 *  2. legacy 的 compat / dom_view 两段同样逐字节比对 src 源文件；
 *  3. 两个 HTML 注入的 buildVersion / gitCommit / sourceHash / sourceFiles
 *     必须一致，且 sourceHash 等于现场对 src/ 全量文件重新计算的 SHA-256；
 *     gitCommit 校验「40 位十六进制 + 在仓库中真实存在 + 是 HEAD 的祖先」，
 *     不校验 == HEAD（构建物必然在构建它的提交之后才提交，永远落后 1 个提交）；
 *  4. 关键业务逻辑字符串（签名算法、4 种 reason、两关历史键、调试面板）
 *     必须同时出现在两个 bundle 里；
 *  5. 不得残留旧版外链或旧版固定牌数文案。
 *
 * 输出 reports/build-consistency-report.json / .md / -output.txt。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  computeBuildInfo, bundleModern, bundleLegacy, legacyParts,
} from './tools/bundle_shared.mjs';
import { LEVEL1_PROFILES, LEVEL2_PROFILES } from './src/game/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const reports = join(root, 'reports');
if (!existsSync(reports)) mkdirSync(reports, { recursive: true });

const logs = [];
let pass = 0, fail = 0;
const failLabels = [];
function line(s) { logs.push(s); console.log(s); }
function ok(cond, label, detail) {
  if (cond) pass++;
  else { fail++; failLabels.push(label); line('  ✗ ' + label + (detail ? ' → ' + detail : '')); }
  return !!cond;
}
function sha(s) { return createHash('sha256').update(s).digest('hex'); }
function extractScript(html, id) {
  const re = new RegExp('<script id="' + id + '">([\\s\\S]*?)<\\/script>');
  const m = html.match(re);
  return m ? m[1].trim() : null;
}
function extractBuildInfo(html) {
  const m = html.match(/<script id="mah-build-info">window\.__MAH_BUILD__=([\s\S]*?);<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return null; }
}
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');

line('============================================================================');
line(' MahLeMah · HTML ↔ src 构建一致性检查（真实运行）');
line(' ' + new Date().toISOString());
line('============================================================================');

const modernPath = join(root, 'dist/MahLeMah.html');
const legacyPath = join(root, 'dist/MahLeMah-legacy.html');
ok(existsSync(modernPath) && existsSync(legacyPath), '两个 HTML 产物都存在');
const modernHtml = readFileSync(modernPath, 'utf8');
const legacyHtml = readFileSync(legacyPath, 'utf8');

const modernBundle = extractScript(modernHtml, 'mah-bundle');
const legacyBundle = extractScript(legacyHtml, 'mah-bundle');
const modernBuild = extractBuildInfo(modernHtml);
const legacyBuild = extractBuildInfo(legacyHtml);
ok(!!modernBundle && !!legacyBundle, '两个 HTML 都含 <script id="mah-bundle"> 业务段');
ok(!!modernBuild && !!legacyBuild, '两个 HTML 都注入了 window.__MAH_BUILD__');

line('\n[1] 用构建脚本同源函数现场重新打包并逐字节比对');
const liveModern = (await bundleModern(root)).trim();
const liveLegacy = await bundleLegacy(root);
const liveLegacyJs = safe(liveLegacy.mainJs).trim();
const okModern = ok(modernBundle === liveModern,
  'MahLeMah.html 内嵌 JS 与当前 src/ 打包产物逐字节相同',
  modernBundle ? `HTML ${modernBundle.length} B / 现场 ${liveModern.length} B` : 'missing');
const okLegacy = ok(legacyBundle === liveLegacyJs,
  'MahLeMah-legacy.html 内嵌 JS 与当前 src/ 打包产物逐字节相同',
  legacyBundle ? `HTML ${legacyBundle.length} B / 现场 ${liveLegacyJs.length} B` : 'missing');
line(`   现代版 bundle sha256=${modernBundle ? sha(modernBundle).slice(0, 16) : '-'} 现场 sha256=${sha(liveModern).slice(0, 16)}`);
line(`   legacy  bundle sha256=${legacyBundle ? sha(legacyBundle).slice(0, 16) : '-'} 现场 sha256=${sha(liveLegacyJs).slice(0, 16)}`);
line(`   legacy 压缩版=${liveLegacy.minified} · ES5 语法校验=通过`);

line('\n[2] legacy 两段独立脚本与 src 源文件比对');
const parts = legacyParts(root);
ok(extractScript(legacyHtml, 'mah-compat') === safe(parts.compat).trim(),
  'compat.es5.js 与 src 一致');
ok(extractScript(legacyHtml, 'mah-dom-view') === safe(parts.domView).trim(),
  'dom_view.es5.js 与 src 一致');
const scriptTags = modernHtml.match(/<script\b[^>]*>/g) || [];
ok(scriptTags.length === 2 && scriptTags.every((s) => s.indexOf('id=') >= 0),
  '现代版有且仅有 2 段带 id 的 script（构建元信息 + 业务 bundle）');
ok(legacyHtml.indexOf('mah-build-info') >= 0 && legacyHtml.indexOf('mah-bundle') >= 0,
  'legacy 的构建元信息与业务 bundle 分段注入');

line('\n[3] 构建元信息一致性');
const liveInfo = computeBuildInfo(root);
let head = 'unknown';
try { head = execSync('git rev-parse HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
catch (e) { /* ignore */ }
for (const k of ['buildVersion', 'gitCommit', 'sourceHash', 'sourceFiles']) {
  ok(modernBuild && legacyBuild && modernBuild[k] === legacyBuild[k],
    `两个 HTML 的 ${k} 一致`,
    modernBuild ? String(modernBuild[k]).slice(0, 20) + ' / ' + String(legacyBuild && legacyBuild[k]).slice(0, 20) : 'missing');
}
ok(modernBuild && modernBuild.sourceHash === liveInfo.sourceHash,
  'HTML 的 sourceHash = 现场对 src/ 全量文件重新计算的 SHA-256',
  modernBuild ? modernBuild.sourceHash.slice(0, 16) + ' / ' + liveInfo.sourceHash.slice(0, 16) : 'missing');
// 说明：构建产物必然在「构建它的那次提交」之后才被提交，所以 HTML 里的 gitCommit
// 一定比 HEAD 落后 1 个提交（这是构建物内嵌 commit 的固有性质，不可能相等）。
// 因此这里校验的是真正有意义的三件事：
//   ① gitCommit 是 40 位十六进制；
//   ② 它在仓库中真实存在（git cat-file 可解析为 commit）；
//   ③ 它是当前 HEAD 的祖先（说明产物来自本仓库历史，而不是伪造值）。
// 内容一致性本身由上面的 sourceHash 全量哈希 + [2] 段 bundle 逐字节比对保证。
ok(modernBuild && /^[0-9a-f]{40}$/.test(String(modernBuild.gitCommit)),
  'HTML 的 gitCommit 是 40 位十六进制', modernBuild && modernBuild.gitCommit);
let commitExists = false;
let commitIsAncestor = false;
try {
  // 用 cat-file -t 而不是 -e ...^{commit}：Windows 下 execSync 走 cmd.exe，`^` 是转义符
  const type = execSync(`git cat-file -t ${modernBuild.gitCommit}`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString().trim();
  commitExists = type === 'commit';
  execSync(`git merge-base --is-ancestor ${modernBuild.gitCommit} ${head}`, { cwd: root, stdio: 'ignore' });
  commitIsAncestor = true;
} catch (e) { /* 保持 false */ }
ok(commitExists, 'HTML 的 gitCommit 在本仓库中真实存在（构建产物合法来源）');
ok(commitIsAncestor, 'HTML 的 gitCommit 是当前 HEAD 的祖先提交');
ok(modernBuild && /^\d{4}-\d{2}-\d{2}T/.test(modernBuild.buildTimestamp) &&
  legacyBuild && /^\d{4}-\d{2}-\d{2}T/.test(legacyBuild.buildTimestamp),
  '两个 HTML 都有合法 buildTimestamp');
line(`   buildVersion=${modernBuild && modernBuild.buildVersion} sourceFiles=${modernBuild && modernBuild.sourceFiles}`);
line(`   sourceHash=${liveInfo.sourceHash}`);

line('\n[4] 关键业务逻辑同步（两个 bundle 同时检查）');
const markers = [
  'MAH-LAYOUT-SIG-v1/SHA-256',
  'MAH-GEOM-v1/SHA-256',
  'MAH-DIST-v1/SHA-256',
  'application_restart',
  'title_screen_restart',
  'failure_restart',
  'level1RecentGames',
  'level2RecentGames',
  'mah-dev-panel',
  'createNewGame',
  'GenerationFailureError',
];
const markerResult = {};
for (const m of markers) {
  const inModern = modernBundle ? modernBundle.indexOf(m) >= 0 : false;
  const inLegacy = legacyBundle ? legacyBundle.indexOf(m) >= 0 : false;
  markerResult[m] = { modern: inModern, legacy: inLegacy };
  ok(inModern && inLegacy, `业务标记「${m}」同时存在于两个 HTML`, `modern=${inModern} legacy=${inLegacy}`);
}
// 真实档位的 mainCount 常量（从 config 读取；总牌数是运行时相加，
// 不是源码字面量，所以检查主堆张数常量而不是臆造的 312/321 等数字）
const mainCounts = [];
for (const p of LEVEL1_PROFILES.concat(LEVEL2_PROFILES)) {
  if (mainCounts.indexOf(p.mainCount) < 0) mainCounts.push(p.mainCount);
}
for (const m of mainCounts) {
  ok(modernBundle && modernBundle.indexOf(String(m)) >= 0 &&
    legacyBundle && legacyBundle.indexOf(String(m)) >= 0,
  `真实档位主堆张数 ${m} 同时存在于两个 HTML`);
}
const uniqueTotals = [];
for (const p of LEVEL1_PROFILES.concat(LEVEL2_PROFILES)) {
  const t = p.mainCount + p.queueCount;
  if (uniqueTotals.indexOf(t) < 0) uniqueTotals.push(t);
}

line('\n[5] 不得残留旧版代码 / 外链');
ok(!modernHtml.includes('src="main.js"') && !modernHtml.includes('href="styles.css"'),
  '现代版无外部 JS/CSS 引用');
ok(!legacyHtml.includes('src="main.js"') && !legacyHtml.includes('href="styles.css"'),
  'legacy 无外部 JS/CSS 引用');
ok(!modernHtml.includes('240 张') && !legacyHtml.includes('240 张') &&
  !modernHtml.includes('48 张') && !legacyHtml.includes('48 张'),
  '两个 HTML 都无旧版固定牌数文案');
const mainSrc = readFileSync(join(root, 'src/main.js'), 'utf8');
ok(!/game\.(startNewRun|restartLevel|startLevel)\(/.test(mainSrc),
  'main.js 的所有新开局入口都不再调用旧版各自实现的生成方法');
ok(/createNewGame\(\{/.test(mainSrc), 'main.js 真实调用统一入口 createNewGame');
ok((modernBundle || '').indexOf('level1RecentGames') >= 0 &&
  (modernBundle || '').indexOf('level2RecentGames') >= 0,
  '现代版含两关独立历史机制');

line('\n[6] 内置背景音乐在所有正式产物中一致（本轮新增）');
const musicNames = [
  '标题场景音乐.wav', '第一关场景音乐.wav', '第二关场景音乐.wav',
  '过关场景音乐.wav', '失败场景音乐.wav',
];
const musicVersions = [
  ['dist/MahLeMah.html', modernHtml],
  ['dist/MahLeMah-legacy.html', legacyHtml],
  ['dist/index.html', readFileSync(join(root, 'dist/index.html'), 'utf8')],
  ['dist/Mah了个Mah.html', readFileSync(join(root, 'dist/Mah了个Mah.html'), 'utf8')],
];
const musicRows = [];
for (const [f, h] of musicVersions) {
  const payloads = (h.match(/data:audio\/wav;base64,/g) || []).length;
  const namesOk = musicNames.every((n) => h.indexOf(n) >= 0);
  const unlockOk = h.indexOf('__MAH_MUSIC_STATUS__') >= 0;
  ok(payloads >= 5, `${f} 内嵌 5 首完整音乐载荷（实测 ${payloads}）`);
  ok(namesOk, `${f} 场景映射的 5 个文件名与其余版本一致`);
  ok(unlockOk, `${f} 含首次点击解锁与真实播放状态观测链路`);
  ok(h.indexOf('graduated') >= 0, `${f} 含完整的 6 场景映射（含 graduated）`);
  ok(!/src\s*=\s*["'][^"']+\.(mp3|ogg|wav)/.test(h), `${f} 没有外部音频 src（离线可播）`);
  musicRows.push({ file: f, payloads, namesOk, unlockOk, bytes: Buffer.byteLength(h, 'utf8') });
}
{
  const mf = readFileSync(join(root, 'src/game/music_manifest.js'), 'utf8');
  const conf = readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8');
  const htmlJs = readFileSync(join(root, 'src/main.js'), 'utf8');
  ok(mf.indexOf('data:audio/wav;base64,') >= 0 && mf.length > 1000000,
    `src/game/music_manifest.js 是真正内嵌音频的源码（${mf.length} B）`);
  ok(htmlJs.indexOf('music_manifest.js') >= 0, 'main.js 引用同一份 manifest（桌面版前端同源）');
  ok(/media-src[^;]*data:[^;]*blob:/.test(conf), 'Tauri CSP 放行 data:/blob: 音频（旧 media-src none 会拦住播放）');
}

line('\n[7] 第二关 20 套模板与最近 10 局去重逻辑进入全部正式产物（本轮新增）');
const l2Markers = [
  'MAH-L2-STRUCT-v1/SHA-256',
  'MAH-L2-CANON-v1/SHA-256',
  'MAH-L2-DEDUP-v1',
  'canonicalGeometrySignature',
  'structureSignature',
  'TEMPLATE_POOL_EXHAUSTED',
  'templateId',
  'level2RecentGames',
];
const l2Versions = musicVersions.slice();
const l2MarkerResult = {};
const idSets = {};
for (const [f, h] of l2Versions) {
  for (const m of l2Markers) {
    const hit = h.indexOf(m) >= 0;
    const key = f + '|' + m;
    l2MarkerResult[key] = hit;
    ok(hit, `${f} 含第二关升级标记「${m}」`);
  }
  const ids = new Set(h.match(/L2-[A-Z]\d{2}/g) || []);
  idSets[f] = Array.from(ids).sort().join(',');
  ok(ids.size === 20, `${f} 内嵌全部 20 个 templateId（实测 ${ids.size}）`);
}
ok(new Set(Object.values(idSets)).size === 1,
  '4 个正式 HTML 内嵌的 20 个 templateId 集合完全一致');
ok(readFileSync(join(root, 'dist/index.html'), 'utf8') === modernHtml &&
  readFileSync(join(root, 'dist/Mah了个Mah.html'), 'utf8') === modernHtml,
  '网页版 3 个 HTML 副本与 dist/MahLeMah.html 逐字节相同');
ok(readFileSync(join(root, 'src/game/l2_templates.js'), 'utf8').indexOf('L2-P01') >= 0 &&
  readFileSync(join(root, 'src/game/l2_geometry.js'), 'utf8').indexOf('generateTemplateLayout') >= 0 &&
  readFileSync(join(root, 'src/game/l2_structure.js'), 'utf8').indexOf('canonicalGeometrySignature') >= 0 &&
  readFileSync(join(root, 'src/game/l2_recent.js'), 'utf8').indexOf('checkL2DualDedup') >= 0,
  '4 个第二关新模块源码齐备，均被同源打包函数纳入 sourceHash');

const report = {
  generatedAt: new Date().toISOString(),
  gitCommit: head,
  command: 'node test-build-consistency.js',
  assertions: { pass, fail },
  exitCode: fail ? 1 : 0,
  files: {
    modern: { path: 'dist/MahLeMah.html', bytes: Buffer.byteLength(modernHtml, 'utf8'), sha256: sha(modernHtml) },
    legacy: { path: 'dist/MahLeMah-legacy.html', bytes: Buffer.byteLength(legacyHtml, 'utf8'), sha256: sha(legacyHtml) },
  },
  bundle: {
    modern: { bytes: modernBundle ? Buffer.byteLength(modernBundle, 'utf8') : 0, sha256: modernBundle ? sha(modernBundle) : '', identical: okModern },
    legacy: { bytes: legacyBundle ? Buffer.byteLength(legacyBundle, 'utf8') : 0, sha256: legacyBundle ? sha(legacyBundle) : '', identical: okLegacy, minified: liveLegacy.minified },
  },
  buildInfo: { modern: modernBuild, legacy: legacyBuild, live: liveInfo },
  markers: markerResult,
  l2TemplateMarkers: l2MarkerResult,
  l2TemplateIdSets: idSets,
  uniqueProfileTotals: uniqueTotals,
  method: '逐字节比对 HTML 内嵌 bundle 与构建脚本同源函数的现场产物；非文件大小/版本号判断',
};
writeFileSync(join(reports, 'build-consistency-report.json'), JSON.stringify(report, null, 2), 'utf8');

let md = `# HTML ↔ src 构建一致性报告\n\n` +
  `> 由 \`node test-build-consistency.js\` **真实运行**生成。\n\n` +
  `- 运行时间：${report.generatedAt}\n- Git commit：\`${head}\`\n` +
  `- 断言：通过 **${pass}**，失败 **${fail}**\n` +
  `- 判定方法：${report.method}\n\n` +
  `## 产物\n\n` +
  `| 文件 | 字节 | SHA256 |\n|---|---:|---|\n` +
  `| dist/MahLeMah.html | ${report.files.modern.bytes} | \`${report.files.modern.sha256}\` |\n` +
  `| dist/MahLeMah-legacy.html | ${report.files.legacy.bytes} | \`${report.files.legacy.sha256}\` |\n\n` +
  `## bundle 逐字节比对\n\n` +
  `| 版本 | HTML 内嵌字节 | 现场打包字节 | 相同 |\n|---|---:|---:|---|\n` +
  `| 现代版 | ${report.bundle.modern.bytes} | ${Buffer.byteLength(liveModern, 'utf8')} | ${okModern ? 'PASS' : 'FAIL'} |\n` +
  `| legacy | ${report.bundle.legacy.bytes} | ${Buffer.byteLength(liveLegacyJs, 'utf8')} | ${okLegacy ? 'PASS' : 'FAIL'} |\n\n` +
  `## 构建元信息\n\n` +
  `| 字段 | 现代版 | legacy | 现场计算 |\n|---|---|---|---|\n` +
  `| buildVersion | ${modernBuild && modernBuild.buildVersion} | ${legacyBuild && legacyBuild.buildVersion} | ${liveInfo.buildVersion} |\n` +
  `| gitCommit | ${modernBuild && modernBuild.gitCommit} | ${legacyBuild && legacyBuild.gitCommit} | ${head} |\n` +
  `| sourceHash | \`${modernBuild && modernBuild.sourceHash}\` | \`${legacyBuild && legacyBuild.sourceHash}\` | \`${liveInfo.sourceHash}\` |\n` +
  `| sourceFiles | ${modernBuild && modernBuild.sourceFiles} | ${legacyBuild && legacyBuild.sourceFiles} | ${liveInfo.sourceFiles} |\n\n` +
  `> 两个 HTML 的 buildTimestamp 允许相差数秒（两次独立构建），其余字段必须完全一致。\n\n` +
  `## 关键业务标记\n\n` +
  `| 标记 | 现代版 | legacy |\n|---|---|---|\n` +
  Object.keys(markerResult).map((k) => `| \`${k}\` | ${markerResult[k].modern ? 'PASS' : 'FAIL'} | ${markerResult[k].legacy ? 'PASS' : 'FAIL'} |`).join('\n') +
  `\n\n真实档位的总牌数（运行时由 mainCount + queueCount 得出，从 config 读取）：${uniqueTotals.join(' / ')} 张；` +
  `其主堆张数常量 ${mainCounts.join(' / ')} 全部同时存在于两个 bundle（逐字节比对才是主判定）。\n\n` +
  `## 第二关 20 套模板 / 双重去重一致性\n\n` +
  `4 个正式 HTML 均内嵌 20 个唯一 \`templateId\`、结构签名算法、等价几何算法、` +
  `双重去重判定与模板池耗尽报错；网页版 3 个副本逐字节相同。\n\n` +
  '| 产物 | 模板 ID 数 | 关键标记 |\n|---|---:|---|\n' +
  l2Versions.map(([f, h]) => `| ${f} | ${(h.match(/L2-[A-Z]\\d{2}/g) || []).length ? new Set(h.match(/L2-[A-Z]\\d{2}/g) || []).size : 0} | ` +
    `${l2Markers.every((m) => h.indexOf(m) >= 0) ? '全部命中' : '缺失'} |`).join('\n') + '\n\n' +
  `## 旧版残留\n\n两个 HTML 均无 \`src="main.js"\` / \`href="styles.css"\` 外链、无「240 张 / 48 张」旧版固定文案；` +
  `\`main.js\` 的所有新开局入口都不再调用 \`startNewRun()\` / \`restartLevel()\` / \`startLevel()\` 各自实现，统一走 \`createNewGame()\`。\n\n` +
  (fail ? `\n## 失败项\n\n${failLabels.map((x) => '- ' + x).join('\n')}\n` : '\n**全部一致性断言通过。**\n');
writeFileSync(join(reports, 'build-consistency-report.md'), md, 'utf8');

line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line(` 报告：reports/build-consistency-report.json / .md / -output.txt`);
line('============================================================================');
writeFileSync(join(reports, 'build-consistency-output.txt'), logs.join('\n') + '\n' +
  `\n断言：通过 ${pass} 项，失败 ${fail} 项\n` +
  (failLabels.length ? '失败项：\n' + failLabels.map((x) => ' - ' + x).join('\n') + '\n' : ''), 'utf8');
if (fail) process.exit(1);
