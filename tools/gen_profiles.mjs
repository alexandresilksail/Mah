/**
 * 第 1.1 节：LEVEL2_PROFILES 大盘档枚举器。
 *
 * 规格（不放宽）：
 *   layers N ∈ [22,28]、types T ∈ [13,16]
 *   mainCount = round(9.9·N)；调整 mainCount 使 total = mainCount + 44 是 3 的倍数
 *   G = total / 3；只保留 G/T ∈ [6.5, 8.0]
 *   groupsPerType 取 floor(G/T) 或 ceil(G/T)，相差 ≤ 1，且总和 = G
 *   选 8 个：layers 至少 5 种取值、types 至少 3 种取值、必须含 (28 层, 15 种, 321 张)
 *
 * 本脚本只做枚举 / 打印，配置文件中的静态表由它的输出人工固化（需求：静态表，不是运行时随机数）。
 * 运行：node tools/gen_profiles.mjs
 */
const QUEUE = 44;
const GT_MIN = 6.5;
const GT_MAX = 8.0;

/** 取 |delta| 最小、且 total 为 3 的倍数的 mainCount */
function fitMain(N) {
  const raw = Math.round(9.9 * N);
  for (const d of [0, -1, 1, -2, 2, -3, 3]) {
    const m = raw + d;
    if ((m + QUEUE) % 3 === 0) return { main: m, delta: d };
  }
  throw new Error('无法对齐 3 的倍数: N=' + N);
}

/** G 组按 T 种花色分配：floor 或 ceil，相差 1 */
function groupsPerType(G, T) {
  const lo = Math.floor(G / T);
  const hi = lo + 1;
  const hiCount = G - lo * T;           // 取 ceil 的花色数
  const out = new Array(T);
  for (let i = 0; i < T; i++) out[i] = i < hiCount ? hi : lo;
  return out;
}

const all = [];
for (let N = 22; N <= 28; N++) {
  const { main, delta } = fitMain(N);
  const total = main + QUEUE;
  const G = total / 3;
  for (let T = 13; T <= 16; T++) {
    const ratio = G / T;
    if (ratio < GT_MIN || ratio > GT_MAX) continue;
    const gpt = groupsPerType(G, T);
    all.push({ N, T, main, delta, total, G, ratio: +ratio.toFixed(3), gpt });
  }
}

console.log('=== 全部合法 (N,T) 组合 ===');
for (const c of all) {
  console.log(`N=${c.N} T=${c.T} main=${c.main} total=${c.total} G=${c.G} G/T=${c.ratio} groups=${c.gpt.join(',')}`);
}
console.log('合法组合数', all.length);

/** 选 8 个：必须含基准档，layers ≥5 种、types ≥3 种；确定性贪心 */
const BASE = all.find((c) => c.N === 28 && c.T === 15 && c.total === 321);
if (!BASE) throw new Error('枚举结果里没有 (28 层, 15 种, 321 张) 基准档');
const chosen = [BASE];
const pool = all.filter((c) => c !== BASE);
// 优先补齐未出现的 N，其次未出现的 T，再次 G/T 离 7.2 更近（形状更均衡）
while (chosen.length < 8 && pool.length) {
  const Ns = new Set(chosen.map((c) => c.N));
  const Ts = new Set(chosen.map((c) => c.T));
  pool.sort((a, b) => {
    const sa = (Ns.has(a.N) ? 0 : 2) + (Ts.has(a.T) ? 0 : 1) - Math.abs(a.ratio - 7.2) * 0.01;
    const sb = (Ns.has(b.N) ? 0 : 2) + (Ts.has(b.T) ? 0 : 1) - Math.abs(b.ratio - 7.2) * 0.01;
    return sb - sa || a.N - b.N || a.T - b.T;
  });
  chosen.push(pool.shift());
}
const Ns = new Set(chosen.map((c) => c.N));
const Ts = new Set(chosen.map((c) => c.T));
console.log('\n=== 选中的 8 个大盘档 ===');
for (const c of chosen) {
  console.log(`{ N:${c.N}, T:${c.T}, main:${c.main}, total:${c.total}, G:${c.G}, G/T:${c.ratio}, groups:[${c.gpt.join(',')}] }`);
}
console.log('layers 取值', [...Ns].sort((a, b) => a - b).join(','), '共', Ns.size, '种');
console.log('types  取值', [...Ts].sort((a, b) => a - b).join(','), '共', Ts.size, '种');
console.log('含基准档', chosen.some((c) => c.N === 28 && c.T === 15 && c.total === 321));
if (chosen.length !== 8 || Ns.size < 5 || Ts.size < 3) throw new Error('选档不满足多样性约束');

/* ---------- 输出可直接粘进 config.js 的静态表片段 ---------- */
const W = +(0.70 / 8).toFixed(6); // 0.0875
console.log('\n=== 静态表片段 ===');
chosen.forEach((c, i) => {
  console.log(`  { id: ${i}, layers: ${c.N}, types: ${c.T}, mainCount: ${c.main}, queueCount: ${QUEUE}, groups: ${c.G}, groupsPerType: [${c.gpt.join(', ')}], weight: ${W}, kind: 'large' },`);
});
console.log(`  { id: 8, layers: 15, types: 15, mainCount: 148, queueCount: ${QUEUE}, groups: 64, groupsPerType: [5, 5, 5, 5, ${new Array(11).fill(4).join(', ')}], weight: 0.15, kind: 'lite' }, // 档 A 192 张`);
console.log(`  { id: 9, layers: 20, types: 15, mainCount: 211, queueCount: ${QUEUE}, groups: 85, groupsPerType: [${new Array(10).fill(6).join(', ')}, ${new Array(5).fill(5).join(', ')}], weight: 0.15, kind: 'lite' }, // 档 B 255 张`);
