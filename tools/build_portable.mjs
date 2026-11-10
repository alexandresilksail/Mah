/**
 * Portable 绿色便携版构建链（与 NSIS 安装版完全分开）。
 *
 * 产物（不能与 NSIS 版混淆）：
 *   dist/MahLeMah-Portable-v<版本>/   —— 解压即玩的绿色目录
 *     ├─ MahLeMah.exe                 单文件主程序（Tauri 外壳）
 *     ├─ WebView2Loader.dll           运行时依赖（随附）
 *     └─ 便携版说明.txt                使用 / 数据 / 卸载说明
 *   dist/MahLeMah-Portable-v<版本>.zip —— 上述目录的压缩包
 *
 * 用户数据策略：存档 / WebView2 缓存全部在 `<exe 同级>/MahLeMah_Data/`，
 * 卸载 = 删除整个解压目录（先备份 MahLeMah_Data 如需保留存档）。
 *
 * 用法：node tools/build_portable.mjs [--skip-build]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const VERSION = JSON.parse(readFileSync(join(ROOT, 'src-tauri', 'tauri.conf.json'), 'utf8')).version;
const DIST = join(ROOT, 'dist');
const STAGE_NAME = `MahLeMah-Portable-v${VERSION}`;
const STAGE = join(DIST, STAGE_NAME);
const ZIP_PATH = join(DIST, `${STAGE_NAME}.zip`);
const skipBuild = process.argv.includes('--skip-build');

const run = (cmd, args, opts = {}) => {
  console.log(`  $ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, ...opts });
  return r.status === 0;
};

const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

console.log(`\n=== Portable 绿色便携版构建 v${VERSION} ===`);

/* ---------- 1. 编译原生 exe ---------- */
if (!skipBuild) {
  const env = { ...process.env };
  const mingw = 'D:/tools/mingw/mingw64/bin';
  if (existsSync(mingw)) env.PATH = `${mingw};${env.PATH}`;
  env.CARGO_TARGET_DIR = join(ROOT, 'target-gnu');

  let built = false;
  // 优先：GNU 交叉目标（无需 MSVC 链接器）；退回：本机默认目标
  const attempts = [
    ['rustup', ['run', 'stable-x86_64-pc-windows-gnu', 'cargo', 'build', '--release', '--target', 'x86_64-pc-windows-gnu', '-j', '2'], env],
    ['cargo', ['build', '--release'], { ...process.env }],
  ];
  for (const [cmd, args, e] of attempts) {
    console.log(`\n--- 尝试构建: ${cmd} ${args.join(' ')} ---`);
    if (run(cmd, args, { env: e, cwd: join(ROOT, 'src-tauri') })) { built = true; break; }
  }
  if (!built) {
    console.error('[Portable] 原生 exe 构建失败（需要 rustup GNU 工具链 + MinGW-w64 或 MSVC）');
    process.exit(1);
  }
}

/* ---------- 2. 定位 exe / WebView2Loader.dll ---------- */
const candidates = [
  join(ROOT, 'target-gnu', 'x86_64-pc-windows-gnu', 'release'),
  join(ROOT, 'src-tauri', 'target', 'release'),
];
let exePath = null;
for (const dir of candidates) {
  const p = join(dir, 'MahLeMah.exe');
  if (existsSync(p)) { exePath = p; break; }
}
if (!exePath) {
  console.error('[Portable] 未找到 MahLeMah.exe');
  process.exit(1);
}
const loaderPath = join(dirname(exePath), 'WebView2Loader.dll');
if (!existsSync(loaderPath)) {
  console.error('[Portable] 未找到 WebView2Loader.dll（应与 exe 同目录产出）');
  process.exit(1);
}
console.log(`  exe: ${exePath} (${(statSync(exePath).size / 1024 / 1024).toFixed(2)} MB)`);

/* ---------- 3. 组装绿色目录 ---------- */
if (existsSync(STAGE)) rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });
copyFileSync(exePath, join(STAGE, 'MahLeMah.exe'));
copyFileSync(loaderPath, join(STAGE, 'WebView2Loader.dll'));
writeFileSync(join(STAGE, '便携版说明.txt'), [
  `Mah了个Mah v${VERSION} —— Portable 绿色便携版`,
  '',
  '【运行】',
  '  双击 MahLeMah.exe 即可，无需安装。首次运行若提示缺少',
  '  Microsoft Edge WebView2 Runtime，请按提示安装（Windows 11 已内置）。',
  '',
  '【用户数据】',
  '  存档与 WebView2 缓存都在本目录的 MahLeMah_Data\\ 文件夹里',
  '  （首次运行自动创建）。游戏不会写入注册表或系统目录。',
  '',
  '【卸载 / 数据保留策略】',
  '  便携版没有卸载程序：直接删除整个解压目录即可。',
  '  想保留存档就先把 MahLeMah_Data\\ 复制到别处，删完再放回来。',
  '',
  '【与安装版的区别】',
  '  安装版（MahLeMah-Setup.exe / NSIS）写入「开始菜单 / 应用和功能」，',
  '  提供标准卸载入口与卸载确认流程；便携版零注册表、删目录即净。',
  '  两种产物独立构建，互不混淆。',
].join('\r\n'), 'utf8');
console.log(`  组装: ${STAGE}`);

/* ---------- 4. 打 zip ---------- */
if (existsSync(ZIP_PATH)) rmSync(ZIP_PATH, { force: true });
const py = spawnSync('python', ['-c',
  `import shutil; shutil.make_archive(${JSON.stringify(ZIP_PATH.replace(/\.zip$/, ''))}, 'zip', root_dir=${JSON.stringify(DIST)}, base_dir=${JSON.stringify(STAGE_NAME)})`,
], { cwd: ROOT });
if (py.status !== 0) {
  console.error('[Portable] zip 打包失败');
  process.exit(1);
}

console.log(`\n[Portable] 完成：`);
console.log(`  ${ZIP_PATH}`);
console.log(`  SHA256: ${sha256(ZIP_PATH)}`);
const files = readdirSync(STAGE);
console.log(`  内容: ${files.join(', ')}`);
