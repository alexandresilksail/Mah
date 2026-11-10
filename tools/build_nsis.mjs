/**
 * Windows 正式安装版（NSIS）构建链 —— 与 Portable 绿色版严格分开。
 *
 * 产物：dist/MahLeMah-Setup-v<版本>.exe（NSIS 安装程序，amd64 原生）
 *   · 标准卸载入口（控制面板 / 设置 → 应用）；
 *   · 卸载确认流程 + 存档默认保留策略（见 tools/make_installer.nsi）。
 *
 * 工具链：64 位 makensis（negrutiu/nsis 发行版）。
 *   官方 NSIS 只有 32 位编译器，在「系统禁跑 32 位 PE」的环境里不可用，
 *   因此本脚本使用可产出 amd64 原生安装包的 negrutiu 构建：
 *     https://github.com/negrutiu/nsis/releases
 *   若 .build/nsis64/Bin/makensis.exe 不存在，脚本会自动下载并静默安装。
 *
 * 前置：先跑 npm run build:portable（本脚本复用其 staging 目录里的文件）。
 * 用法：node tools/build_nsis.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const VERSION = JSON.parse(readFileSync(join(ROOT, 'src-tauri', 'tauri.conf.json'), 'utf8')).version;
const DIST = join(ROOT, 'dist');
const STAGE_NAME = `MahLeMah-Portable-v${VERSION}`; // 复用便携版 staging 里的文件清单
const STAGE = join(DIST, STAGE_NAME);
const OUTFILE = join(DIST, `MahLeMah-Setup-v${VERSION}.exe`);
const NSIS_DIR = join(ROOT, '.build', 'nsis64');
const MAKENSIS = join(NSIS_DIR, 'Bin', 'makensis.exe');
const NSI = join(ROOT, 'tools', 'make_installer.nsi');

const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

console.log(`\n=== NSIS 安装版构建 v${VERSION} ===`);

/* ---------- 0. 前置检查：staging 目录（文件来源） ---------- */
if (!existsSync(join(STAGE, 'MahLeMah.exe'))) {
  console.error(`[NSIS] 缺少 ${STAGE}\\MahLeMah.exe —— 请先运行 npm run build:portable`);
  process.exit(1);
}

/* ---------- 1. 准备 64 位 makensis ---------- */
if (!existsSync(MAKENSIS)) {
  console.log('  未找到 64 位 makensis，开始下载 negrutiu/nsis 发行版 ...');
  const setup = join(NSIS_DIR, 'nsis-amd64-setup.exe');
  mkdirSync(NSIS_DIR, { recursive: true });
  const url = 'https://github.com/negrutiu/nsis/releases/download/v3.13.7507.353/nsis-3.13.7507.353-negrutiu-amd64.exe';
  let r = spawnSync('curl', ['-sL', '-o', setup, url], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0 || !existsSync(setup)) {
    console.error('[NSIS] 下载失败。请手动安装 64 位 NSIS（https://github.com/negrutiu/nsis/releases）后重试。');
    process.exit(1);
  }
  r = spawnSync(setup, ['/S', `/D=${NSIS_DIR.replace(/\//g, '\\')}`], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0 && !existsSync(MAKENSIS)) {
    console.error('[NSIS] 静默安装失败。请手动运行安装包后重试。');
    process.exit(1);
  }
}

/* ---------- 2. 编译安装包 ---------- */
console.log(`  makensis: ${MAKENSIS}`);
const args = [
  `/DVERSION=${VERSION}`,
  `/DBUILD_DIR=${STAGE.replace(/\//g, '\\')}`,
  `/DOUTFILE=${OUTFILE.replace(/\//g, '\\')}`,
  NSI.replace(/\//g, '\\'),
];
console.log(`  $ makensis ${args.join(' ')}`);
const r = spawnSync(MAKENSIS, args, { cwd: join(ROOT, 'tools'), stdio: 'inherit' });
if (r.status !== 0) {
  console.error('[NSIS] 编译失败');
  process.exit(1);
}

if (!existsSync(OUTFILE)) {
  console.error(`[NSIS] 未生成 ${OUTFILE}`);
  process.exit(1);
}

console.log(`\n[NSIS] 完成：`);
console.log(`  ${OUTFILE} (${(statSync(OUTFILE).size / 1024 / 1024).toFixed(2)} MB)`);
console.log(`  SHA256: ${sha256(OUTFILE)}`);
