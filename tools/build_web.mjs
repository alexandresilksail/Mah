/**
 * 打包为「单文件网页版」：dist/Mah了个Mah.html
 *
 *   node tools/build_web.mjs
 *
 * 做的事：
 *   1. 用 esbuild 把 src/main.js 及其 ES Module 依赖打成一段 IIFE；
 *   2. 把 styles.css 内联成 <style>；
 *   3. 把脚本内联成 <script>，产出一个可直接双击、离线运行的 HTML。
 *
 * 产物体积约 60–70 KB，不含任何外部请求、图片、字体或音频文件。
 */
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => path.join(root, ...s);

const OUT_NAME = 'Mah了个Mah.html';

/* ---------- 1. 打包 JS ---------- */
const result = await build({
  entryPoints: [p('src/main.js')],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
  legalComments: 'none',
  write: false,
  charset: 'utf8',
});

const js = result.outputFiles[0].text;

/* ---------- 2. 内联 CSS / HTML ---------- */
const css = await readFile(p('src/styles.css'), 'utf8');
const html = await readFile(p('src/index.html'), 'utf8');

const out = html
  .replace(
    /\s*<link rel="stylesheet" href="styles\.css" \/>/,
    `\n  <style>\n${css.trim()}\n  </style>`
  )
  .replace(
    /\s*<script type="module" src="main\.js"><\/script>/,
    `\n  <script>\n${js.trim()}\n  </script>`
  );

if (out.includes('styles.css') || out.includes('main.js')) {
  throw new Error('内联失败：产物里仍有外部引用');
}

/* ---------- 3. 双击启动器（Windows，纯 ASCII + CRLF） ---------- */
const LAUNCHER = [
  '@echo off',
  'rem Portable launcher: opens the single-file game in a chromeless Edge/Chrome window.',
  'setlocal',
  'set "HERE=%~dp0"',
  'set "HTML=%HERE%MahLeMah.html"',
  'if not exist "%HTML%" set "HTML=%HERE%index.html"',
  'if not exist "%HTML%" (',
  '  echo [x] MahLeMah.html not found next to this script.',
  '  pause',
  '  exit /b 1',
  ')',
  'set "BROWSER="',
  'if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"',
  'if not defined BROWSER if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" set "BROWSER=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"',
  'if not defined BROWSER if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"',
  'if not defined BROWSER (',
  '  start "" "%HTML%"',
  '  exit /b 0',
  ')',
  String.raw`start "" "%BROWSER%" --app="file:///%HTML:\=/%" --window-size=760,1320`,
  'exit /b 0',
  '',
].join('\r\n');

/* ---------- 4. 落盘 ---------- */
await mkdir(p('dist'), { recursive: true });
await writeFile(p('dist/index.html'), out, 'utf8');
await writeFile(p('dist', OUT_NAME), out, 'utf8');
await writeFile(p('dist/MahLeMah.html'), out, 'utf8');
await writeFile(p('dist/Play-MahLeMah.cmd'), LAUNCHER, 'latin1');

const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
console.log(`✔ dist/${OUT_NAME}  (${kb} KB，单文件，零外部依赖)`);
console.log('✔ dist/Play-MahLeMah.cmd  (双击后用 Edge/Chrome 的无边框窗口打开)');
