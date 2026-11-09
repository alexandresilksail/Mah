/**
 * 难度调参 / 现场体检（当前规格：单堆半格晶格 + 漏斗三带）。
 *
 * 用法：node tools/tune.mjs [每关局数] [起始 seed]
 *   node tools/tune.mjs 40 7000
 *
 * 旧的 GRID 参数（按网格缩放 tileW/tileH）已删除：牌面尺寸现在是
 * config.js 里唯一的 TILE_W × TILE_H，任何脚本都不允许改写它。
 * 想重新生成验收 seed 池请用 tools/tune_pool.mjs（npm run tune:pool）。
 */
import { generateLevel, simulateRobot, verify } from '../src/game/generator.js';
import { makeRng } from '../src/game/rng.js';
import { TILE_W, TILE_H, FUNNEL, LEVEL_SPEC } from '../src/game/config.js';

const N = parseInt(process.argv[2] || '40', 10);
const SEED0 = parseInt(process.argv[3] || '7000', 10);
const MODES = ['random', 'greedy'];

console.log(`TILE ${TILE_W}x${TILE_H} · FUNNEL TOP_SUITS=${FUNNEL.TOP_SUITS} MID_SPAN=${FUNNEL.MID_SPAN} CROSS_GROUPS=${FUNNEL.CROSS_GROUPS}`);
console.log(`局数 ${N} × ${MODES.length} 种机器人 × 2 关（均不使用道具）\n`);

for (const lv of [1, 2]) {
  const spec = LEVEL_SPEC[lv];
  console.log(`第 ${lv} 关：${spec.cardCount} 张 / ${spec.layers} 层 / ${spec.types} 种花色 / plan=${spec.plan.join('/')}`);
  for (const mode of MODES) {
    let wins = 0;
    const pcts = [];
    const visibles = [];
    let certOK = 0;
    for (let i = 0; i < N; i++) {
      const seed = (SEED0 + i * 2654435761) >>> 0;
      const d = generateLevel(lv, seed);
      if (verify(d) && d.certificate.ok) certOK++;
      visibles.push(d.visible);
      const r = simulateRobot(d, makeRng((seed ^ 0xabcdef) >>> 0), { mode });
      if (r.win) wins++;
      else pcts.push(r.pct);
    }
    pcts.sort((a, b) => a - b);
    const med = pcts.length ? pcts[Math.floor(pcts.length / 2)] : 1;
    const avgPct = pcts.length
      ? pcts.reduce((a, b) => a + b, 0) / pcts.length
      : 1;
    console.log(
      `  ${mode.padEnd(6)} 通关 ${String(wins).padStart(3)}/${N} (${((wins / N) * 100).toFixed(1)}%)` +
      ` · 死局 ${pcts.length}` +
      ` · 平均进度 ${(avgPct * 100).toFixed(1)}%` +
      ` · 失败进度中位 ${(med * 100).toFixed(1)}%` +
      ` · 证书 ${certOK}/${N}` +
      ` · 开局可点 ${Math.min.apply(null, visibles)}~${Math.max.apply(null, visibles)}`
    );
  }
  console.log('');
}
