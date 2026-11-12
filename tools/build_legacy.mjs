/**
 * 构建「老浏览器兼容版」单文件：dist/MahLeMah-legacy.html
 *
 *   node tools/build_legacy.mjs
 *
 * 流程（业务 bundle 逻辑全部来自 tools/bundle_shared.mjs，与一致性测试同源）：
 *   1. 体检源码里「把 Map/Set 当数组遍历」的写法（兼容版会静默失效）；
 *   2. bundleLegacy()：esbuild 打包 → Babel preset-env(ie8, loose 逐项声明)
 *      → 压缩(target es5) → acorn ES5 语法校验，失败回退未压缩版；
 *   3. 校验 compat.es5.js / dom_view.es5.js 也是纯 ES5；
 *   4. 按「构建元信息 → compat 垫片 → DOM 降级渲染器 → 业务代码」内联。
 *
 * 产物依然是单文件、零外部请求、可离线双击。
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  computeBuildInfo, buildInfoScriptTag, bundleLegacy, legacyParts, es5Check,
} from './bundle_shared.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => path.join(root, ...s);

/* ---------- 1. 兼容版「可迭代对象陷阱」体检 ---------- */
/**
 * `assumptions.iterableIsArray: true` 让 Babel 把 for...of / 展开当成**数组下标遍历**。
 * 这对数组是对的，对 Map / Set 是灾难：一次都不进循环，而且不报错。
 * 必须在构建期点名，不能等运行时出现「整片牌没分到花色」才发现。
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

/* ---------- 2. 业务 bundle（与 test-build-consistency.js 共用同一实现） ---------- */
const { es5, mainJs, minified } = await bundleLegacy(root);
const { compat, domView, css } = legacyParts(root);
const info = computeBuildInfo(root);

es5Check('compat.es5.js', compat);
es5Check('dom_view.es5.js', domView);
es5Check('bundle (Babel)', es5);
console.log(`  [ok] bundle (Babel) 是纯 ES5（${(Buffer.byteLength(es5, 'utf8') / 1024).toFixed(1)} KB）`);
if (minified) {
  console.log(`  [ok] bundle (minified) 是纯 ES5（${(Buffer.byteLength(mainJs, 'utf8') / 1024).toFixed(1)} KB）`);
}

/* 业务代码里若出现 </script> 会提前闭合标签 */
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');

/* ---------- 3. 组装 ---------- */
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mah了个Mah（兼容版）</title>
${buildInfoScriptTag(info)}
  <style>
${css}
  </style>
</head>
<body>
  <div id="stage">
    <canvas id="game" width="720" height="1280"></canvas>
  </div>
  <noscript>本游戏需要启用 JavaScript。</noscript>
  <script id="mah-compat">
${safe(compat)}
  </script>
  <script id="mah-dom-view">
${safe(domView)}
  </script>
  <script id="mah-bundle">
${safe(mainJs)}
  </script>
</body>
</html>
`;

await mkdir(p('dist'), { recursive: true });
const target = p('dist/MahLeMah-legacy.html');
await writeFile(target, html, 'utf8');

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`✔ dist/MahLeMah-legacy.html  (${kb} KB，单文件，ES5，零外部依赖)`);
console.log(`  buildVersion=${info.buildVersion} sourceHash=${info.sourceHash.slice(0, 16)} gitCommit=${info.gitCommit.slice(0, 12)}`);
