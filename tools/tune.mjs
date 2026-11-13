/**
 * v2.0.0 难度现场体检：六种策略机器人 × 两关，抽样「实际交付的 seed 池」。
 *
 * 用法：node tools/tune.mjs [每关局数] [起始 seed]
 *   node tools/tune.mjs 40 7000
 *
 * 与 tools/tune_pool.mjs 的区别：这里只做快速回归 / 现场体检，
 * 不重新生成 seed 池。牌面尺寸与两关规格全部只读 config.js。
 */
import { generateLevel, verify } from '../src/game/generator.js';
import { ROBOT_MODES, simulateRobot } from '../src/game/robots.js';
import { makeRng } from '../src/game/rng.js';
import { SEED_POOL as POOL } from '../src/game/seed_pool.js';
import {
  TILE_W, TILE_H, VERSION, LEVEL_SPEC, BAND_RATIOS, DIFFICULTY,
} from '../src/game/config.js';

const N = Math.max(1, parseInt(process.argv[2] || '40', 10));
const SEED0 = parseInt(process.argv[3] || '7000', 10);

console.log(`MahLeMah v${VERSION} · TILE ${TILE_W}x${TILE_H} · 三带 ${BAND_RATIOS.map((r) => (r * 100).toFixed(0) + '%').join('/')}`);
console.log(`难度权重 ${JSON.stringify(DIFFICULTY.pool.weights)}`);
console.log(`局数 ${N} × ${ROBOT_MODES.length} 种机器人 × 2 关（均不使用道具）\n`);

for (const lv of [1, 2]) {
  const spec = LEVEL_SPEC[lv];
  console.log(`第 ${lv} 关：${spec.cardCount} 张 / ${spec.layers} 全局层 / ${spec.types} 种牌型 / 主堆 plan=${spec.plan.join('/')}`);
  for (const mode of ROBOT_MODES) {
    let wins = 0, certOK = 0;
    const pcts = [];
    const visibles = [];
    for (let i = 0; i < N; i++) {
      const seed = (SEED0 + i * 2654435761) >>> 0;
      const d = lv === 2
        ? generateLevel(2, POOL[i % POOL.length], { templateId: 'L2-P01' })
        : generateLevel(1, seed);
      if (verify(d) && d.certificate.ok) certOK++;
      visibles.push(d.visible);
      const r = simulateRobot(d, makeRng((seed ^ 0xabcdef) >>> 0), { mode });
      if (r.win) wins++;
      else pcts.push(r.pct);
    }
    pcts.sort((a, b) => a - b);
    const med = pcts.length ? pcts[Math.floor(pcts.length / 2)] : 1;
    const avgPct = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 1;
    console.log(
      `  ${mode.padEnd(11)} 通关 ${String(wins).padStart(3)}/${N} (${((wins / N) * 100).toFixed(1)}%)` +
      ` · 死局 ${String(pcts.length).padStart(3)}` +
      ` · 平均进度 ${(avgPct * 100).toFixed(1)}%` +
      ` · 失败进度中位 ${(med * 100).toFixed(1)}%` +
      ` · 证书 ${certOK}/${N}` +
      ` · 开局可点 ${Math.min.apply(null, visibles)}~${Math.max.apply(null, visibles)}`
    );
  }
  console.log('');
}
