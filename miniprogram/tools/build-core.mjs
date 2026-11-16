/**
 * 把 core/shared/*（从原桌面版字节级复用的纯逻辑）打包成微信小程序可 require 的
 * CommonJS 单文件：core/mah-core.js。
 *
 * 为什么打包：微信小程序的 require 不支持 ESM 的目录 / 扩展名解析差异，
 * 且 shared/* 使用 `import './config.js'` 这类显式 ESM。esbuild 把它们
 * 折叠成一个 CJS bundle，平台层只需 require('./core/mah-core.js')。
 *
 * 注意：这是【独立构建】，输出到 miniprogram/core/，绝不触碰仓库根 dist/。
 */
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const result = await build({
  entryPoints: [path.join(root, 'core', 'index.js')],
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: ['es2017'],
  outfile: path.join(root, 'core', 'mah-core.js'),
  sourcemap: false,
  minify: false,
  logLevel: 'info',
  legalComments: 'none',
  define: {
    // 保证纯逻辑层在任何环境下都走「无 window / 无 document」分支
    'process.env.NODE_ENV': '"production"',
  },
});

if (result.errors?.length) {
  console.error('core 打包失败', result.errors);
  process.exit(1);
}
console.log('core 打包完成 → core/mah-core.js');
