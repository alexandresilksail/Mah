/**
 * 离线难度调优工具（方案 b）：生成「通过验收的第二关 seed 池」。
 *
 *   node tools/tune_pool.mjs [候选数] [池大小] [贪心探针数]
 *   npm run tune:pool
 *
 * 对每一个候选 seed，用真实关卡生成器造一局第 2 关，然后按验收指标筛：
 *   1. 可解性证书 replayTypes 通过，且 verify() 沿 order 重放通过；
 *   2. 6 种不同随机源的贪心机器人全部不通关（其中之一是 test.js 验收用的
 *      seed ^ 0xabcdef 源），保证不是只对某一种点牌抖动走运；
 *   3. 随机机器人不通关；
 *   4. 失败进度中位数 ≥ 0.50，且验收那一局的失败进度落在 0.45~0.95：
 *      漏斗形状 —— 死局集中在后半段，不在开局。
 * 通过者写入 src/game/seed_pool.js（≥100 个），运行时从池里抽 seed。
 * 离线运行，不受单局 400ms 预算约束；运行时只做一次查表 + 确定性生成。
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { generateLevel, simulateRobot, verify } from '../src/game/generator.js';
import { makeRng } from '../src/game/rng.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = parseInt(process.argv[2] || '9000', 10);
const WANT = parseInt(process.argv[3] || '220', 10);
const NRNG = parseInt(process.argv[4] || '6', 10);

// 第 0 个是 test.js 验收用的随机源；其余覆盖不同的平局抖动
const XOR = [0xabcdef, 0x13579bdf, 0x2468ace0, 0x55aa55aa, 0x0f0f0f0f, 0x31415926, 0x27182818, 0xdeadbeef];

const pool = [];
const losePcts = [];
const t0 = Date.now();
let tried = 0;

for (let seed = 1; seed <= CANDIDATES && pool.length < WANT; seed++) {
  tried++;
  const d = generateLevel(2, seed);
  if (!d.certificate.ok || !verify(d)) continue;
  if (d.visible < 20) continue;

  // 先用最便宜的一发验收随机源过滤掉一半候选
  const first = simulateRobot(d, makeRng((seed ^ XOR[0]) >>> 0), { mode: 'greedy' });
  if (first.win || first.pct < 0.45 || first.pct > 0.95) continue;

  let wins = 0;
  const pcts = [first.pct];
  for (let k = 1; k < NRNG; k++) {
    const r = simulateRobot(d, makeRng((seed ^ XOR[k % XOR.length]) >>> 0), { mode: 'greedy' });
    if (r.win) wins++;
    else pcts.push(r.pct);
  }
  if (wins > 0) continue;

  const rr = simulateRobot(d, makeRng((seed ^ 0xabcdef) >>> 0), { mode: 'random' });
  if (rr.win) continue;

  pcts.sort((a, b) => a - b);
  if (pcts[Math.floor(pcts.length / 2)] < 0.50) continue;

  pool.push(seed);
  losePcts.push(first.pct);
}

losePcts.sort((a, b) => a - b);
const ms = Date.now() - t0;
const med = losePcts.length ? losePcts[Math.floor(losePcts.length / 2)] : 0;

const body = [
  '/**',
  ' * 第二关验收 seed 池 —— 由离线调优工具 tools/tune_pool.mjs 生成，请勿手改。',
  ' *',
  ' * 每个 seed 都满足：可解性证书 + verify() 重放通过；6 种贪心走法全不通关；',
  ' * 随机机器人不通关；失败进度集中在后半段（漏斗形状）。',
  ` * 生成耗时 ${ms}ms，扫描 ${tried} 个候选，录取 ${pool.length} 个，失败进度中位 ${(med * 100).toFixed(1)}%。`,
  ' *',
  ' * 运行时 generateLevel(2) 不传 seed 时从这里抽一个，单局生成仍是纯确定性、约 2ms。',
  ' */',
  'export const SEED_POOL = [',
  ...pool.map((s, i) => `  ${s}${i < pool.length - 1 ? ',' : ''}`),
  '];',
  '',
  '/** 从池里抽一个 seed。rand 可注入以复现（默认 Math.random）。 */',
  'export function pickPoolSeed(rand = Math.random) {',
  '  const n = SEED_POOL.length;',
  '  const i = Math.min(n - 1, Math.max(0, Math.floor(rand() * n)));',
  '  return SEED_POOL[i];',
  '}',
  '',
  'export const POOL_META = {',
  `  candidates: ${tried},`,
  `  accepted: ${pool.length},`,
  `  greedyProbes: ${NRNG},`,
  `  loseProgressMedian: ${med.toFixed(4)},`,
  `  generateMs: ${ms},`,
  '};',
  '',
].join('\n');

await writeFile(path.join(root, 'src/game/seed_pool.js'), body, 'utf8');
console.log(`扫描 ${tried} 个候选，录取 ${pool.length} 个，耗时 ${ms}ms`);
console.log(`失败进度 min/med/max = ${losePcts[0]?.toFixed(3)} / ${med.toFixed(3)} / ${losePcts[losePcts.length - 1]?.toFixed(3)}`);
console.log(`写入 src/game/seed_pool.js（${Buffer.byteLength(body, 'utf8')} 字节）`);
console.log(`前 20 个 seed: ${pool.slice(0, 20).join(',')}`);
if (pool.length < 100) {
  console.error('池不足 100 个，请增大候选数后重跑');
  process.exit(1);
}
