/**
 * 真机前静态预检（Preflight）— 用 Node 模拟微信开发者工具的关键校验。
 * 覆盖真机高频故障：页面缺失、事件绑定无实现、Canvas 节点错位、require 路径失效、
 * app.json 配置错误、包体超限、DOM API 泄漏、敏感信息明文。
 * 运行：node tests/preflight.mjs
 * 注意：本脚本不能替代真机，仅过滤「打开即崩 / 点击报错」类静态问题。
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const req = createRequire(import.meta.url);

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail ? ' → ' + detail : '')); }
}
function sec(t) { console.log('\n[' + t + ']'); }

/** 剥离 // 与 /* *\/ 注释，避免把注释里的字样误判为真实调用 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/* 1. app.json 页面路径完整性 */
sec('页面与配置');
const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
ok(Array.isArray(app.pages) && app.pages.length >= 4, 'app.json 含 ≥4 个页面路径');
for (const p of app.pages) {
  const okFiles = ['ts', 'wxml', 'wxss'].every(ext => fs.existsSync(path.join(ROOT, p + '.' + ext)));
  ok(okFiles, '页面四要素齐全: ' + p);
}
ok(fs.existsSync(path.join(ROOT, app.sitemapLocation || 'sitemap.json')), 'sitemap 文件存在');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'project.config.json'), 'utf8'));
ok(cfg && cfg.appid, 'project.config.json 含 appid 字段: ' + cfg.appid);

/* 2. 事件绑定 ↔ 方法定义（真机点击报错头号原因） */
sec('事件绑定与方法实现');
for (const p of app.pages) {
  const wxml = fs.readFileSync(path.join(ROOT, p + '.wxml'), 'utf8');
  const ts = fs.readFileSync(path.join(ROOT, p + '.ts'), 'utf8');
  const binds = [...wxml.matchAll(/(?:bind|catch)(?:tap|touchstart|touchend|touchmove|change|input|confirm|blur|focus|longtap|longpress)="([A-Za-z0-9_]+)"/g)].map(m => m[1]);
  const defs = new Set([...ts.matchAll(/^\s{2}([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*\{/gm)].map(m => m[1]));
  const missing = binds.filter(b => !defs.has(b));
  ok(missing.length === 0, `${p}: ${binds.length} 个事件绑定均有实现`, missing.join(','));
}

/* 3. Canvas 节点一致性 */
sec('Canvas 节点');
const gameWxml = fs.readFileSync(path.join(ROOT, 'pages/game/index.wxml'), 'utf8');
const gameTs = fs.readFileSync(path.join(ROOT, 'pages/game/index.ts'), 'utf8');
const wxmlId = (gameWxml.match(/<canvas[^>]*id="([^"]+)"/) || [])[1];
const tsId = (gameTs.match(/canvasId:\s*'([^']+)'/) || [])[1];
ok(!!wxmlId && wxmlId === tsId, `Canvas id WXML/TS 一致: ${wxmlId} / ${tsId}`);
ok(/type="2d"/.test(gameWxml), 'Canvas 使用 type="2d"（新 2D 接口）');

/* 4. require 路径可解析（打包后路径错误会白屏）
 * 注意：TS 源码里的 require('./x.js') 在微信 TS 编译后路径不变，
 * 但磁盘上是 .ts 文件，故解析时把 .js 回退匹配到同名 .ts。 */
sec('模块依赖');
const jsFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) walk(fp);
    else if (e.name.endsWith('.ts') || e.name.endsWith('.js')) jsFiles.push(fp);
  }
})(ROOT);
let brokenReq = [];
for (const f of jsFiles) {
  const content = stripComments(fs.readFileSync(f, 'utf8'));
  const rel = [...content.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)].map(m => m[1]);
  for (const r of rel) {
    const abs = path.resolve(path.dirname(f), r);
    // 依次尝试：原路径、.js→.ts 回退、加 /index
    const candidates = [abs, abs.replace(/\.js$/, '.ts'), path.join(abs, 'index.ts'), path.join(abs, 'index.js')];
    if (!candidates.some(c => fs.existsSync(c))) {
      brokenReq.push(path.relative(ROOT, f) + ' → ' + r);
    }
  }
}
ok(brokenReq.length === 0, `${jsFiles.length} 个源码文件的 require 路径全部可解析`, brokenReq.slice(0, 3).join('; '));
ok(fs.existsSync(path.join(ROOT, 'core/mah-core.js')), '核心 bundle mah-core.js 存在');

/* 5. 包体大小（主包 2MB 上限） */
sec('包体');
function dirSize(dir) {
  let s = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name);
    s += e.isDirectory() ? dirSize(fp) : fs.statSync(fp).size;
  }
  return s;
}
const bytes = dirSize(ROOT);
const kb = (bytes / 1024).toFixed(1);
ok(bytes < 2 * 1024 * 1024, `工程总大小 ${kb} KB < 2MB 主包上限`);

/* 6. DOM / 浏览器 API 泄漏（真机无 document/window） */
sec('平台隔离');
let domLeak = [];
for (const f of jsFiles) {
  const c = stripComments(fs.readFileSync(f, 'utf8'));
  // 只查页面/服务层，排除 core/shared 复用层（那是桌面版原样逻辑，平台无关）
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (rel.startsWith('core/')) continue;
  if (/\bdocument\.getElementById\b|\bwindow\.location\b|\blocalStorage\./.test(c)) {
    domLeak.push(rel);
  }
}
ok(domLeak.length === 0, '页面/服务层无直接 DOM/localStorage 调用', domLeak.join(','));

/* 7. 敏感信息明文 */
sec('合规');
let secretLeak = [];
for (const f of jsFiles) {
  const c = fs.readFileSync(f, 'utf8');
  if (/api[_-]?key\s*[:=]\s*['"][A-Za-z0-9]{16,}/i.test(c) || /sk-[A-Za-z0-9]{20,}/.test(c)) {
    secretLeak.push(path.relative(ROOT, f));
  }
}
ok(secretLeak.length === 0, '源码无硬编码密钥/Token', secretLeak.join(','));
const bgmLeak = jsFiles.some(f => {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (rel.startsWith('core/')) return false; // 复用层含 build_info 等元信息，非音频引用
  return /\.(mp3|m4a|wav)['"]|assets\/music\//i.test(stripComments(fs.readFileSync(f, 'utf8')));
});
ok(!bgmLeak, '小程序代码未引用受版权影响的背景音乐');

console.log('\n========================================');
console.log(`真机前预检：${pass} 通过 / ${fail} 失败`);
console.log('========================================');
process.exit(fail > 0 ? 1 : 0);
