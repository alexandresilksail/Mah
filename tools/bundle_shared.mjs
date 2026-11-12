/**
 * 构建链单一实现（第十一阶段）。
 *
 * build_web.mjs / build_legacy.mjs / test-build-consistency.js 全部引用本文件的
 * 同一份函数，杜绝「构建脚本一套逻辑、一致性检查另一套逻辑」造成的假一致。
 *
 *  · computeBuildInfo()   : buildVersion / gitCommit / sourceHash / buildTimestamp
 *  · bundleModern()       : 现代版 IIFE（minify）
 *  · bundleLegacy()       : ES5 降级 + 压缩 + ES5 语法校验（含失败回退）
 *  · es5Check()           : acorn ecmaVersion:5 + 若干 ES6 残留特征检查
 */
import { build, transform } from 'esbuild';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const babel = require('@babel/core');
const presetEnv = require('@babel/preset-env');
const acorn = require('acorn');

export function computeBuildInfo(root) {
  const files = [];
  function walk(dir) {
    let list = [];
    try { list = readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const ent of list) {
      const fp = join(dir, ent.name);
      if (ent.isDirectory()) walk(fp);
      else if (/\.(js|css|html)$/.test(ent.name)) files.push(fp);
    }
  }
  walk(join(root, 'src'));
  files.sort();
  const h = createHash('sha256');
  for (const f of files) {
    h.update(relative(root, f).replace(/\\/g, '/'));
    h.update('\0');
    h.update(readFileSync(f));
    h.update('\0');
  }
  let gitCommit = 'unknown';
  try {
    gitCommit = execSync('git rev-parse HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch (e) { /* 非 git 工作区：如实标记 */ }
  const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
  return {
    buildVersion: version + '-' + gitCommit.slice(0, 7),
    gitCommit,
    sourceHash: h.digest('hex'),
    buildTimestamp: new Date().toISOString(),
    sourceFiles: files.length,
  };
}

export function buildInfoScriptTag(info) {
  return '  <script id="mah-build-info">window.__MAH_BUILD__=' +
    JSON.stringify(info) + ';</script>';
}

/** 现代版业务 bundle（与 build_web.mjs 历史参数完全一致） */
export async function bundleModern(root) {
  const r = await build({
    entryPoints: [join(root, 'src/main.js')],
    bundle: true,
    format: 'iife',
    target: ['es2020'],
    minify: true,
    legalComments: 'none',
    write: false,
    charset: 'utf8',
  });
  return r.outputFiles[0].text.trim();
}

export function es5Check(label, code) {
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
    ['对象简写属性', /\{\s*[A-Za-z_$][\w$]*\s*,\s*[A-Za-z_$][\w$]*\s*[,}]/],
  ];
  let bad = 0;
  for (const [name, re] of banned) {
    if (re.test(code)) { console.log(`  [!] ${label} 仍含 ${name}`); bad++; }
  }
  const symHits = (code.match(/Symbol\.iterator/g) || []).length;
  if (symHits > 1) {
    console.log(`  [!] ${label} 有 ${symHits} 处 Symbol.iterator（>1 需要人工核查）`);
    bad++;
  }
  if (bad) throw new Error(`[ES5 校验失败] ${label} 仍有 ${bad} 类 ES6+ 残留`);
  return true;
}

/**
 * legacy 业务 bundle：esbuild → Babel(ie8) → esbuild minify(target es5)。
 * 返回 { es5, mainJs, minified, modern }；压缩版未过 ES5 校验时回退未压缩版。
 */
export async function bundleLegacy(root) {
  const bundled = await build({
    entryPoints: [join(root, 'src/main.js')],
    bundle: true,
    format: 'iife',
    target: ['es2020'],
    minify: false,
    legalComments: 'none',
    write: false,
    charset: 'utf8',
  });
  const modern = bundled.outputFiles[0].text;
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
  let mainJs = es5;
  let minified = false;
  try {
    const min = await transform(es5, {
      minify: true,
      target: ['es5'],
      charset: 'utf8',
      legalComments: 'none',
      supported: { 'optional-catch-binding': false },
    });
    es5Check('bundle (minified)', min.code);
    mainJs = min.code;
    minified = true;
  } catch (e) {
    console.log(`  [!] 压缩版未通过 ES5 校验，改用未压缩版：${e.message.split('\n')[0]}`);
  }
  return { modern, es5, mainJs: mainJs.trim(), minified };
}

/** legacy 的两段独立脚本与样式 */
export function legacyParts(root) {
  return {
    compat: readFileSync(join(root, 'src/compat.es5.js'), 'utf8').trim(),
    domView: readFileSync(join(root, 'src/game/dom_view.es5.js'), 'utf8').trim(),
    css: readFileSync(join(root, 'src/legacy.css'), 'utf8').trim(),
  };
}
