/**
 * 发布压力测试（Release Stress）—— 与日常快速测试分开。
 *
 *  · 快速测试：npm test（test.js [7]，40 个固定 seed，秒级）
 *  · 发布测试：npm run test:release（本脚本，每关 ≥1000 个 seed）
 *
 * 输出：
 *   · 控制台汇总表
 *   · reports/DIFFICULTY.md —— 难度模拟报告（含实际模拟数量）
 *
 * 口径（需求 5）：
 *   · 每种机器人记录独立通关率；
 *   · 验证证书 / verify 通过率、死局率、平均槽位占用、平均通关进度、决策时间；
 *   · 报告写明实际模拟数量；
 *   · 「机器人 100% 失败」不解释为「游戏难度成功」——如实呈现，
 *     随机策略必败只是难度门槛之一，不是充分条件。
 *
 * 用法：node tools/stress_release.mjs [--seeds 1000] [--levels 1,2]
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { generateLevel, validateLevel, verify, replayTypes } from '../src/game/generator.js';
import { ROBOT_MODES, runDifficultySuite } from '../src/game/robots.js';
import { makeRng } from '../src/game/rng.js';
import { VERSION, LEVEL_SPEC } from '../src/game/config.js';

const args = process.argv.slice(2);
const argOf = (name, dflt) => {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const SEEDS = Math.max(1, parseInt(argOf('seeds', '1000'), 10) || 1000);
const LEVELS = String(argOf('levels', '1,2')).split(',').map((x) => parseInt(x, 10)).filter((x) => x === 1 || x === 2);

const pct = (v) => (v * 100).toFixed(1) + '%';
const line = (s) => console.log(s);
const realVerify = (d) => validateLevel(d).ok && verify(d) && d.certificate.ok && replayTypes(d.typeSeq).ok;

line('============================================================================');
line(` MahLeMah v${VERSION} 发布压力测试 · 每关 ${SEEDS} seed × ${ROBOT_MODES.length} 策略`);
line('============================================================================');

const reports = [];
let totalSims = 0;
const t0 = Date.now();

for (const level of LEVELS) {
  const spec = LEVEL_SPEC[level];
  line(`\n[L${level}] ${spec.cardCount} 张 / 16 种 / ${SEEDS} seed × ${ROBOT_MODES.length} 策略 = ${SEEDS * ROBOT_MODES.length} 局模拟`);
  const start = Date.now();
  const suite = runDifficultySuite(level,
    // 第二关没有默认模板：压测固定用第一套，保证同一 (seed, 档位) 结果可复现
    (lv, s) => (lv === 2 ? generateLevel(2, s, { templateId: 'L2-P01' }) : generateLevel(lv, s)),
    SEEDS, {
    baseSeed: (0x51ee0000 + level * 7919) >>> 0,
    modes: ROBOT_MODES,
    makeRng: (s) => makeRng(s),
    verify: realVerify,
  });
  const elapsed = (Date.now() - start) / 1000;
  totalSims += SEEDS * ROBOT_MODES.length;

  line('   ' + '策略'.padEnd(13) + '通关率'.padEnd(9) + '死局率'.padEnd(9) + '平均进度'.padEnd(11) + '平均槽位'.padEnd(11) + '失败进度中位'.padEnd(13) + '开局死'.padEnd(7) + '决策ms');
  for (const m of ROBOT_MODES) {
    const r = suite.modes[m];
    line('   ' + m.padEnd(13) + pct(r.winRate).padEnd(9) + pct(r.deadlockRate).padEnd(9)
      + pct(r.avgPct).padEnd(11) + r.avgSlot.toFixed(2).padEnd(11)
      + pct(r.failureMedianPct).padEnd(13) + String(r.earlyDeaths).padEnd(7) + r.avgDecisionMs.toFixed(3));
    totalSims += 0;
  }
  line(`   证书/verify 通过 ${suite.verified}/${suite.seeds}（${pct(suite.verifyRate)}）· 耗时 ${elapsed.toFixed(1)}s`);
  reports.push({ level, suite, elapsed, sims: SEEDS * ROBOT_MODES.length });
}

const totalElapsed = (Date.now() - t0) / 1000;

/* ---------------- 写 reports/DIFFICULTY.md ---------------- */
const L = [];
L.push(`# MahLeMah v${VERSION} 难度模拟报告（发布压力测试）`);
L.push('');
L.push(`> 本报告由 \`npm run test:release\`（tools/stress_release.mjs）在真实运行后自动生成。`);
L.push('');
L.push('## 1. 实际模拟数量');
L.push('');
L.push(`- 发布测试样本：每关 **${SEEDS} 个 seed**（连续确定性序列，baseSeed 每关独立），全部 ${LEVELS.map((l) => `L${l}`).join(' / ')} 关；`);
L.push(`- 每个 seed 用 **${ROBOT_MODES.length} 种策略**各模拟 1 局，每关 ${SEEDS * ROBOT_MODES.length} 局，总模拟 **${totalSims} 局**；`);
L.push(`- 每局生成后都跑 证书序列 + 几何可解性 verify 双重校验；总耗时 ${totalElapsed.toFixed(1)}s；`);
L.push(`- 日常快速测试另有 40 个固定 seed（npm test 的 [7] 段），与本发布测试完全分开。`);
L.push('');
L.push('## 2. 六种策略结果（每关独立）');
L.push('');
for (const r of reports) {
  const s = r.suite;
  L.push(`### L${r.level}（${LEVEL_SPEC[r.level].cardCount} 张 · ${r.sims} 局模拟 · 证书/verify ${s.verified}/${s.seeds}）`);
  L.push('');
  L.push('| 策略 | 通关率 | 死局率 | 平均进度 | 平均槽位占用 | 失败进度中位数 | 开局死 | 平均决策ms |');
  L.push('|---|---|---|---|---|---|---|---|');
  for (const m of ROBOT_MODES) {
    const x = s.modes[m];
    L.push(`| ${m} | ${pct(x.winRate)} | ${pct(x.deadlockRate)} | ${pct(x.avgPct)} | ${x.avgSlot.toFixed(2)} | ${pct(x.failureMedianPct)} | ${x.earlyDeaths} | ${x.avgDecisionMs.toFixed(3)} |`);
  }
  L.push('');
}
L.push('## 3. 口径说明（必读）');
L.push('');
L.push('- **随机机器人 100% 失败 ≠ 游戏难度成功**。random 必败只说明「不乱点不行」，是难度门槛之一而非充分条件；');
L.push('- 完整信息贪心（greedy）的高通关率只证明「关卡可解」，不代表真实玩家的难度体验；');
L.push('- 「带 10% 失误」（noisy）与 greedy 的差值衡量「失误惩罚」；失败进度中位数衡量「死局是否后置」；');
L.push('- 平均槽位占用与开局可点花色数是结构指标（7 格槽位 + 波次剥离顺序有数学上限）；');
L.push('- 本报告如实呈现所有数据，不筛选、不修饰；未达标项在 npm test 的软指标中以 ✗ 标注。');
L.push('');
L.push(`## 4. 与快速测试的关系`);
L.push('');
L.push('| 项目 | 快速测试（npm test） | 发布测试（npm run test:release） |');
L.push('|---|---|---|');
L.push(`| 样本 | 40 个固定 seed（池内） | 每关 ${SEEDS} 个 seed（连续序列） |`);
L.push('| 用途 | 每次改动的回归 | 发版前的难度验收 |');
L.push(`| 本报告数据 | （见测试报告） | 每关 ${SEEDS}×${ROBOT_MODES.length} = ${SEEDS * ROBOT_MODES.length} 局 |`);
L.push('');

const outDir = new URL('../reports/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outFile = outDir + '/DIFFICULTY.md';
writeFileSync(outFile, L.join('\n'), 'utf8');
line(`\n难度模拟报告已写入 ${outFile}`);
line(`总模拟 ${totalSims} 局 · 总耗时 ${totalElapsed.toFixed(1)}s`);
