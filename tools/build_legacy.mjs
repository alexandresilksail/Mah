/**
 * 构建「老浏览器兼容版」单文件：dist/MahLeMah-legacy.html
 *
 *   node tools/build_legacy.mjs
 *
 * 流程：
 *   1. esbuild 把 src/main.js 打成一个 IIFE（不做 ES5 降级，esbuild 不支持）；
 *   2. Babel preset-env targets ie 8 + loose + iterableIsArray，把语法降到 ES5；
 *      · loose  -> class / 属性定义不走 Object.defineProperty（IE8 对普通对象会抛错）
 *      · iterableIsArray -> for...of 编译成索引循环，不引入 Symbol.iterator
 *   3. acorn 以 ecmaVersion:5 解析三段脚本，确认 IE8 能解析；
 *   4. 压缩后再次校验；若压缩引入了 ES6 语法就退回未压缩版；
 *   5. 按「compat 垫片 → DOM 降级渲染器 → 业务代码」顺序内联，配 legacy.css。
 *
 * 产物依然是单文件、零外部请求、可离线双击。
 */
import { build, transform } from 'esbuild';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const babel = require('@babel/core');
const presetEnv = require('@babel/preset-env');
const acorn = require('acorn');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => path.join(root, ...s);

/* ---------- 1. bundle ---------- */
/**
 * 兼容版的"可迭代对象陷阱"体检（在打包前扫源码）。
 *
 * `assumptions.iterableIsArray: true` 让 Babel 把 for...of / 展开当成**数组下标遍历**。
 * 这对数组是对的，对 Map / Set 是灾难：一次都不进循环，而且**不报错** ——
 * 症状是"兼容版里平稳期 140 张牌没分到花色、画面上整片空白"。
 * 这类写法在现代构建里完全正常，只有兼容版会静默失效，所以必须在构建期点名。
 */
const ITER_KEY_GETTER = ['展开迭代器（如 [...m.keys()]）', /\.\.\.\s*[\w$.]+\.(?:keys|values|entries)\s*\(\s*\)/];

{
  const dirs = ['src', 'src/game'];
  let hits = 0;
  for (const dir of dirs) {
    let files = [];
    try { files = await readdir(p(dir)); } catch (e) { continue; }
    for (const f of files) {
      if (!/\.js$/.test(f)) continue;
      const code = await readFile(p(`${dir}/${f}`), 'utf8');
      const lines = code.split('\n');
      const isComment = (ln) => {
        const t = ln.trim();
        return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
      };

      // 收集本文件里由 new Map() / new Set() 得到的标识符
      const iterIds = new Set();
      const reDecl = /\b(?:const|let|var)\s+([\w$]+)\s*=\s*new\s+(?:Map|Set)\s*\(/g;
      let m;
      while ((m = reDecl.exec(code))) iterIds.add(m[1]);

      lines.forEach((ln, i) => {
        if (isComment(ln)) return;
        for (const id of iterIds) {
          const re = new RegExp(`for\\s*\\(\\s*(?:const|let|var)\\s+[^)]*\\bof\\s+${id}\\b`);
          if (re.test(ln)) {
            console.log(`  [!] ${dir}/${f}:${i + 1} 用 for...of 遍历 ${id}（Map/Set）—— 兼容版会静默失效`);
            hits++;
          }
        }
        if (ITER_KEY_GETTER[1].test(ln)) {
          console.log(`  [!] ${dir}/${f}:${i + 1} 疑似 ${ITER_KEY_GETTER[0]} —— 兼容版会静默失效`);
          hits++;
        }
      });
    }
  }
  if (!hits) console.log('  [ok] 源码里没有"把 Map/Set 当数组遍历"的危险写法');
}

const bundled = await build({
  entryPoints: [p('src/main.js')],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: false,
  legalComments: 'none',
  write: false,
  charset: 'utf8',
});
const modern = bundled.outputFiles[0].text;

/* ---------- 2. Babel -> ES5 ---------- */
const out = await babel.transformAsync(modern, {
  babelrc: false,
  configFile: false,
  comments: false,
  compact: false,
  presets: [[presetEnv, {
    targets: { ie: '8' },
    modules: false,
    useBuiltIns: false,
  }]],
  // Babel 8 移除了 loose，必须逐项声明。这里每一项都是为了 IE8：
  //   iterableIsArray / skipForOfIteratorClosing -> for...of 编译成索引循环，不碰 Symbol.iterator
  //   set* / privateFieldsAsProperties          -> class 与展开用普通赋值，不碰 Object.defineProperty
  assumptions: {
    iterableIsArray: true,
    skipForOfIteratorClosing: true,
    arrayLikeIsIterable: false,
    setPublicClassFields: true,
    setClassMethods: true,
    setComputedProperties: true,
    setSpreadProperties: true,
    privateFieldsAsProperties: true,
    objectRestNoSymbols: true,
    noDocumentAll: true,
    noNewArrows: true,
    ignoreFunctionLength: true,
    pureGetters: true,
  },
});
const es5 = out.code;

/* ---------- 3. 语法校验 ---------- */
function es5Check(label, code) {
  try {
    acorn.parse(code, { ecmaVersion: 5, sourceType: 'script' });
  } catch (e) {
    throw new Error(`[ES5 校验失败] ${label}: ${e.message}`);
  }
  const banned = [
    ['箭头函数', /\s=>\s/],
    ['async function', /\basync\s+function\b/],
    ['regeneratorRuntime', /regeneratorRuntime/],
    ['new Promise', /\bnew Promise\b/],
    ['optional catch', /catch\s*\{/],
    // 压缩器会把 {c: c} 打回 ES2015 的对象简写 {c}；acorn 在 ES5 下会直接报
    // "Unexpected token"，但报错位置指向整行压缩代码，极难定位。这里先点名。
    ['对象简写属性', /\{\s*[A-Za-z_$][\w$]*\s*,\s*[A-Za-z_$][\w$]*\s*[,}]/],
  ];
  let bad = 0;
  for (const [name, re] of banned) {
    if (re.test(code)) { console.log(`  [!] ${label} 仍含 ${name}`); bad++; }
  }
  // Babel 的 _typeof helper 里有一处 "typeof Symbol && typeof Symbol.iterator"，
  // 被 typeof 短路保护，IE8 不会执行到属性访问 —— 属于已知安全残留。
  const symHits = (code.match(/Symbol\.iterator/g) || []).length;
  if (symHits > 1) {
    console.log(`  [!] ${label} 有 ${symHits} 处 Symbol.iterator（>1 需要人工核查）`);
    bad++;
  }
  const dprop = (code.match(/Object\.defineProperty/g) || []).length;
  if (dprop) console.log(`  [i] ${label} 含 ${dprop} 处 Object.defineProperty（IE8 只对 DOM 对象支持，需实测）`);
  if (bad) throw new Error(`[ES5 校验失败] ${label} 仍有 ${bad} 类 ES6+ 残留`);
  console.log(`  [ok] ${label} 是纯 ES5（${(Buffer.byteLength(code, 'utf8') / 1024).toFixed(1)} KB）`);
}

const compat = await readFile(p('src/compat.es5.js'), 'utf8');
const domView = await readFile(p('src/game/dom_view.es5.js'), 'utf8');
const css = await readFile(p('src/legacy.css'), 'utf8');

es5Check('compat.es5.js', compat);
es5Check('dom_view.es5.js', domView);
es5Check('bundle (Babel)', es5);

/* ---------- 4. 压缩（压缩后必须仍是 ES5） ---------- */
let mainJs = es5;
try {
  // 必须给 target，而且必须是 es5：
  //   · 不给 target → esbuild 会把空的 catch(e){} 压成 ES2019 的 catch{}，IE8 语法错；
  //   · 给 es2015 → 压缩器有权把 {c: c} 打回对象简写 {c}（ES2015 合法），
  //     IE8 同样语法错，而且会静默退回"未压缩版"，产物从 87 KB 涨到 143 KB。
  const min = await transform(es5, {
    minify: true,
    target: ['es5'],
    charset: 'utf8',
    legalComments: 'none',
    supported: { 'optional-catch-binding': false },
  });
  es5Check('bundle (minified)', min.code);
  mainJs = min.code;
} catch (e) {
  console.log(`  [!] 压缩版未通过 ES5 校验，改用未压缩版：${e.message.split('\n')[0]}`);
}

/* 业务代码里若出现 </script> 会提前闭合标签 */
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');

/* ---------- 5. 组装 ---------- */
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mah了个Mah（兼容版）</title>
  <style>
${css.trim()}
  </style>
</head>
<body>
  <div id="stage">
    <canvas id="game" width="720" height="1280"></canvas>
  </div>
  <noscript>本游戏需要启用 JavaScript。</noscript>
  <script>
${safe(compat.trim())}
  </script>
  <script>
${safe(domView.trim())}
  </script>
  <script>
${safe(mainJs.trim())}
  </script>
</body>
</html>
`;

await mkdir(p('dist'), { recursive: true });
const target = p('dist/MahLeMah-legacy.html');
await writeFile(target, html, 'utf8');

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`✔ dist/MahLeMah-legacy.html  (${kb} KB，单文件，ES5，零外部依赖)`);
