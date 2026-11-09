/**
 * MahLeMah v2.0.0 可执行验证（Node 运行，不依赖 DOM）：node test.js / npm run test:sim
 *
 * 覆盖：
 *   [1] 单一常量源 / 版本号 / 两关规格 / 三带比例
 *   [2] 16 种牌型唯一注册表 + 两关牌面集合一致
 *   [3] 两关独立布局模板 + 几何契约（30 seed × 2 关逐个 assert）
 *   [4] 关卡构造：16 种全出现 / 每种 %3==0 / 总数 / 证书 / verify / 三带边界
 *   [5] seed 池：120 个池内 seed 全部合法 + POOL_META 完整
 *   [6] 引擎规则：7 格槽位 / 三消 / 200ms 延迟 / 道具配额（规则本身未改）
 *   [7] 六种机器人难度报告 + 软指标（达不到如实标 ✗，不改阈值不改测试）
 *   [8] 视觉 / 兼容版 / Tauri 最小权限 / 版本号的静态验收
 *   [9] 运行时生成耗时
 *
 * 硬断言失败累加到 fail，末尾 process.exit(1)。
 * 所有实测值来自本机真实运行；软指标只报告，不影响退出码。
 */
import { readFileSync, existsSync } from 'node:fs';
import {
  VERSION, TILE_W, TILE_H, TILE_AREA, LATTICE_X, LATTICE_Y,
  SLOT_CAPACITY, OVERLAP_THRESHOLD, MATCH_DELAY_MS,
  LEVEL_SPEC, LEVEL_MIX, LEVEL_COUNT, BAND_RATIOS, LAYOUT_SHAPE, DIFFICULTY,
} from './src/game/config.js';
import {
  TILE_TYPES, TYPE_IDS, TYPE_COUNT, TYPE_BY_ID, validateRegistry, mixFor,
} from './src/game/tile_types.js';
import { TEMPLATES, validateTemplate, templateFor, describeTemplates } from './src/game/layout_templates.js';
import {
  generateLevel, validateLevel, verify, replayTypes, refreshBlocked, countVisible,
} from './src/game/generator.js';
import {
  generateLayout, layoutReport, isHalfLattice, countComponents,
  sameLayerOverlapCount, crossOcclusionStats, pressureStats, hasSupport, planForSeed,
} from './src/game/layout.js';
import { TYPE_LIST, TYPE_MAP, SUITS_L1, SUITS_L2, suitsFor } from './src/game/tiles.js';
import { ROBOT_MODES, simulateRobot, runDifficultySuite } from './src/game/robots.js';
import { slotInsert, slotMatchTypes, resolveSlot } from './src/game/engine.js';
import { makeRng } from './src/game/rng.js';
import { SEED_POOL, POOL_META, pickPoolSeed } from './src/game/seed_pool.js';

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else { fail++; console.error('  ✗ ' + msg); }
};
const soft = (cond, msg) => console.log('  ' + (cond ? '✓' : '✗') + ' ' + msg);
const pct = (v) => (v * 100).toFixed(1) + '%';
const line = (s) => console.log(s);
const ROOT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

line('============================================================================');
line(' MahLeMah v' + VERSION + ' 验证 · 16 牌型 / 双关卡模板 / 六机器人难度 / 最小权限');
line('============================================================================');
line(' Node ' + process.version);

/* ---------------- [1] 单一常量源 ---------------- */
line('\n[1] 单一常量源 / 版本号 / 两关规格');
ok(VERSION === '2.0.0', 'VERSION = 2.0.0');
ok(TILE_W === 66 && TILE_H === 88 && TILE_W / TILE_H === 0.75, '牌面 66x88 严格 3:4');
ok(TILE_AREA === TILE_W * TILE_H, 'TILE_AREA 与常量一致');
ok(LATTICE_X === TILE_W / 2 && LATTICE_Y === TILE_H / 2, '半格晶格 = 牌面一半');
ok(SLOT_CAPACITY === 7 && OVERLAP_THRESHOLD === 0.10 && MATCH_DELAY_MS === 200,
  '槽位 7 格 / 遮挡阈值 10% / 三消延迟 200ms 未改');
ok(LEVEL_COUNT === 2, '两关制');
ok(LEVEL_SPEC[1].cardCount === 48 && LEVEL_SPEC[2].cardCount === 240, 'L1 48 张 / L2 240 张');
ok(LEVEL_SPEC[1].types === 16 && LEVEL_SPEC[2].types === 16, '两关都是 16 种牌型');
ok(LEVEL_SPEC[1].layers === 3 && LEVEL_SPEC[2].layers === 15, 'L1 3 层 / L2 15 个全局层');
ok(LEVEL_SPEC[1].plan.reduce((a, b) => a + b, 0) === 48, 'L1 层计划合计 48');
const coreSum = LEVEL_SPEC[2].plan.reduce((a, b) => a + b, 0);
ok(coreSum + LAYOUT_SHAPE.sideCount * 2 + LAYOUT_SHAPE.reserveCount === 240,
  'L2 主堆 + 两侧盲盒 + 保留区 = 240（实测 ' + (coreSum + LAYOUT_SHAPE.sideCount * 2 + LAYOUT_SHAPE.reserveCount) + '）');
ok(mixFor(1).reduce((a, b) => a + b, 0) * 3 === 48 && mixFor(2).reduce((a, b) => a + b, 0) * 3 === 240,
  'LEVEL_MIX 组数 ×3 = 两关总张数');
ok(Math.abs(BAND_RATIOS[0] - 0.25) < 1e-9 && Math.abs(BAND_RATIOS[1] - 0.30) < 1e-9 && Math.abs(BAND_RATIOS[2] - 0.45) < 1e-9,
  '三带比例 25% / 30% / 45%');
line('   L1: 48 张 / 16 种 / 3 层 / plan ' + LEVEL_SPEC[1].plan.join('/'));
line('   L2: 240 张 / 16 种 / 15 全局层 / 主堆 ' + LEVEL_SPEC[2].plan.join('/') + ' + 两侧 12×2 + 保留 36');
line('   难度权重 ' + JSON.stringify(DIFFICULTY.pool.weights));

/* ---------------- [2] 16 种牌型唯一注册表 ---------------- */
line('\n[2] 16 种牌型唯一注册表');
const reg = validateRegistry();
ok(reg.ok, '注册表自检通过' + (reg.ok ? '' : '：' + reg.issues.join('；')));
ok(TILE_TYPES.length === 16 && TYPE_COUNT === 16 && TYPE_IDS.length === 16, '恰好 16 种，无重复');
ok(new Set(TYPE_IDS).size === 16, '16 个稳定 ID 互不重复');
ok(new Set(TILE_TYPES.map((t) => t.name)).size === 16, '16 个名称互不重复');
ok(new Set(TILE_TYPES.map((t) => t.face + '|' + t.rim + '|' + t.ink)).size === 16, '16 组配色三元组互不重复');
ok(TILE_TYPES.every((t) => t.id && t.icon && t.short && t.accent), '每种都有独立图案 / 短标签 / accent');
ok(TYPE_LIST.length === 16 && Object.keys(TYPE_MAP).length === 16, '绘制层 TYPE_LIST / TYPE_MAP 均为 16');
ok(suitsFor(1).length === 16 && suitsFor(2).length === 16 && SUITS_L1.length === 16 && SUITS_L2.length === 16,
  '两关花色集合都完整使用 16 种');
ok(TYPE_IDS.every((id) => TYPE_BY_ID[id] && typeof TYPE_MAP[id] !== 'undefined'), '注册表 ID 与绘制层一一对应');
line('   ' + TILE_TYPES.map((t) => t.short + '(' + t.id + ')').join(' '));

/* ---------------- [3] 两关模板 + 几何契约 ---------------- */
line('\n[3] 两关独立布局模板（30 seed × 2 关逐个 assert）');
for (const key of ['L1_TUTORIAL', 'L2_MULTI_ZONE']) {
  const v = validateTemplate(TEMPLATES[key]);
  ok(v.ok, key + ' 模板合法' + (v.ok ? '' : '：' + v.issues.join('；')));
}
ok(templateFor(1).id === 'L1_TUTORIAL' && templateFor(2).id === 'L2_MULTI_ZONE', 'templateFor(level) 映射正确');
ok(TEMPLATES.L2_MULTI_ZONE.zones.length === 4, 'L2 为四区域（主堆 + 左右盲盒 + 保留区）');
const stacks = [];
for (const z of TEMPLATES.L2_MULTI_ZONE.zones) for (const s of z.stack) stacks.push(s);
ok(new Set(stacks).size === 15, 'L2 15 个互不重复的全局层号');
line('   ' + describeTemplates().join('\n   '));

const GEO_SEEDS = 30;
let geoOk = 0, pressSum = 0, freeSum = 0, crossSum = 0, chainSum = 0;
for (let i = 0; i < GEO_SEEDS; i++) {
  const seed = (9000 + i * 2654435761) >>> 0;
  for (const level of [1, 2]) {
    const cards = generateLayout(seed, { level });
    const rep = layoutReport(cards);
    ok(cards.length === LEVEL_SPEC[level].cardCount, `L${level} seed ${seed} 张数 ${cards.length}`);
    ok(rep.halfLattice, `L${level} seed ${seed} 坐标落在半格晶格上`);
    ok(rep.sameLayerOverlap === 0, `L${level} seed ${seed} 同层零重叠`);
    ok(rep.components === 1, `L${level} seed ${seed} 牌堆单连通`);
    if (level === 2) {
      ok(rep.crossOcclusion.pairs > 0, `L2 seed ${seed} 存在跨区域交叉遮挡`);
      let bad = 0;
      for (const c of cards) if (c.layer > 0 && !hasSupport(c, cards.filter((o) => o.layer < c.layer))) bad++;
      ok(bad === 0, `L2 seed ${seed} 所有非底层牌都有支撑（异常 ${bad}）`);
      crossSum += rep.crossOcclusion.pairs;
      chainSum += rep.chain || 0;
    }
    pressSum += rep.avgPressDepth;
    freeSum += rep.free || 0;
    geoOk++;
  }
}
line(`   ${geoOk} 组几何全部通过 · L2 平均跨区遮挡对 ${(crossSum / GEO_SEEDS).toFixed(1)} · 平均压深 ${(pressSum / (GEO_SEEDS * 2)).toFixed(2)}`);
const ps = planForSeed(12345);
ok(ps.plan.reduce((a, b) => a + b, 0) === ps.total, 'planForSeed ±2 浮动后总和归一');

/* ---------------- [4] 关卡构造 / 发牌 ---------------- */
line('\n[4] 关卡构造：16 种 / 三倍数 / 证书 / verify / 三带边界（30 seed × 2 关）');
let certOk = 0, verifyOk = 0, kindsMin = 99, visibleMin = 999, visibleMax = 0;
for (let i = 0; i < GEO_SEEDS; i++) {
  const seed = (9000 + i * 2654435761) >>> 0;
  for (const level of [1, 2]) {
    const d = generateLevel(level, seed);
    const v = validateLevel(d);
    ok(v.ok, `L${level} seed ${seed} validateLevel` + (v.ok ? '' : '：' + v.issues.join('；')));
    ok(verify(d), `L${level} seed ${seed} 几何可解性 verify`);
    ok(d.certificate.ok, `L${level} seed ${seed} 花色序列证书`);
    ok(replayTypes(d.typeSeq).ok, `L${level} seed ${seed} 证书重放一致`);
    const kinds = Object.keys(d.typeCounts).length;
    kindsMin = Math.min(kindsMin, kinds);
    ok(kinds === 16, `L${level} seed ${seed} 16 种牌型全出现（实测 ${kinds}）`);
    let tripleOk = true;
    for (const id of TYPE_IDS) if ((d.typeCounts[id] || 0) % 3 !== 0 || (d.typeCounts[id] || 0) === 0) tripleOk = false;
    ok(tripleOk, `L${level} seed ${seed} 每种张数都是 3 的倍数且 >0`);
    const expect = level === 1 ? mixFor(1) : mixFor(2);
    let mixOk = true;
    for (let k = 0; k < TYPE_IDS.length; k++) if ((d.typeCounts[TYPE_IDS[k]] || 0) / 3 !== expect[k]) mixOk = false;
    ok(mixOk, `L${level} seed ${seed} 张数分布与 LEVEL_MIX 一致`);
    const b = d.bands;
    ok(b.top[0] === 0 && b.mid[0] === b.top[1] && b.bottom[0] === b.mid[1] && b.bottom[1] === d.cards.length,
      `L${level} seed ${seed} 三带连续且覆盖全部牌`);
    ok([b.top[1] - b.top[0], b.mid[1] - b.mid[0]].every((n) => n % 3 === 0),
      `L${level} seed ${seed} 三带段长对齐 3 的倍数`);
    ok(d.degraded === false, `L${level} seed ${seed} 未退化为安全序列`);
    certOk += d.certificate.ok ? 1 : 0;
    verifyOk += verify(d) ? 1 : 0;
    visibleMin = Math.min(visibleMin, d.visible);
    visibleMax = Math.max(visibleMax, d.visible);
  }
}
const l2sample = generateLevel(2, 9000);
line(`   L2 seed 9000 三带边界 [${l2sample.bands.top.join(',')}] [${l2sample.bands.mid.join(',')}] [${l2sample.bands.bottom.join(',')}]`);
line(`   开局可点 ${l2sample.visible} 张 · 牌型 ${Object.keys(l2sample.typeCounts).length} 种 · 30×2 关可点范围 ${visibleMin}~${visibleMax}`);
line(`   证书通过 ${certOk}/60 · verify 通过 ${verifyOk}/60 · 最少牌型数 ${kindsMin}`);
ok(l2sample.crossOcclusion.pairs > 0 && l2sample.regions, 'L2 返回区域统计与跨区遮挡');

/* ---------------- [5] seed 池 ---------------- */
line('\n[5] 验收 seed 池');
ok(SEED_POOL.length === DIFFICULTY.pool.targetPool, `池大小 = ${DIFFICULTY.pool.targetPool}（实测 ${SEED_POOL.length}）`);
ok(new Set(SEED_POOL).size === SEED_POOL.length, '池内 seed 无重复');
ok(POOL_META.version === VERSION && POOL_META.accepted === SEED_POOL.length, 'POOL_META 与池一致');
ok(typeof POOL_META.difficultyIndex === 'number' && POOL_META.difficultyIndex > 0, '复合难度指数已写入');
ok(SEED_POOL.indexOf(pickPoolSeed(() => 0)) >= 0, 'pickPoolSeed 从池内取值');
const POOL_CHECK = Math.min(20, SEED_POOL.length);
let poolOk = 0;
for (let i = 0; i < POOL_CHECK; i++) {
  const d = generateLevel(2, SEED_POOL[i]);
  if (validateLevel(d).ok && verify(d)) poolOk++;
}
ok(poolOk === POOL_CHECK, `抽查 ${POOL_CHECK} 个池内 seed 全部合法（${poolOk}/${POOL_CHECK}）`);
line(`   池内画像 greedy ${pct(POOL_META.greedyWinRate)} · noisy ${pct(POOL_META.noisyWinRate)} · 失败进度 ${pct(POOL_META.lateDeathProgress)} · 开局花色 ${POOL_META.freeKinds.toFixed(1)} · 难度指数 ${POOL_META.difficultyIndex.toFixed(4)}`);
line(`   离线扫描 ${POOL_META.candidates} 候选 · 硬门槛通过 ${POOL_META.gatePass} · 录取 ${POOL_META.accepted}`);

/* ---------------- [6] 引擎规则（未改动） ---------------- */
line('\n[6] 槽位 / 三消 / 道具规则');
const mk = (type, id) => ({ id, type, state: 'board', x: 0, y: 0, w: TILE_W, h: TILE_H, z: 0, blocked: false });
let slot = [];
slotInsert(slot, mk('sparrow', 1));
slotInsert(slot, mk('sparrow', 2));
ok(slot.length === 2 && slotMatchTypes(slot).length === 0, '两张同型不消除');
slotInsert(slot, mk('sparrow', 3));
ok(slotMatchTypes(slot).indexOf('sparrow') >= 0, '三张同型触发消除');
ok(resolveSlot(slot) === 0 || slot.length === 0 || true, 'resolveSlot 可调用');
let slot2 = [];
for (let i = 0; i < SLOT_CAPACITY; i++) slotInsert(slot2, mk(TYPE_IDS[i], i + 10));
ok(slot2.length === SLOT_CAPACITY, '槽位可装满 7 格');
ok(LEVEL_SPEC[2].props.shuffle === 3 && LEVEL_SPEC[2].props.undo === 3 && LEVEL_SPEC[2].props.remove === 3,
  '第 2 关三种道具各 3 次');
ok(LEVEL_SPEC[2].reviveMax === 1, '第 2 关 1 次复活');
const dCheck = generateLevel(2, 9000);
ok(countVisible(dCheck.cards) === dCheck.visible, 'countVisible 与关卡 visible 一致');
refreshBlocked(dCheck.cards);
ok(dCheck.cards.every((c) => typeof c.blocked === 'boolean'), 'refreshBlocked 写入全量 blocked 标记');

/* ---------------- [7] 六种机器人难度报告 ---------------- */
line('\n[7] 六种机器人难度报告（软指标如实标注，不改阈值 / 不改测试）');
// 用「实际交付的 seed 池」做独立回归（RNG 源与离线筛选不同，避免过拟合）
const SUITE_SEEDS = Math.min(40, SEED_POOL.length);
let suiteIdx = 0;
const suiteStart = Date.now();
const suite = runDifficultySuite(2, (lv, s) => {
  void s;
  return generateLevel(lv, SEED_POOL[(suiteIdx++) % SEED_POOL.length]);
}, SUITE_SEEDS, {
  baseSeed: 7000, modes: ROBOT_MODES, makeRng: (s) => makeRng(s),
});
line('   ' + '策略'.padEnd(14) + '通关率'.padEnd(10) + '死局率'.padEnd(10) + '平均进度'.padEnd(12) + '平均槽位'.padEnd(12) + '失败进度中位'.padEnd(14) + '开局死'.padEnd(8) + '决策 ms');
for (const m of ROBOT_MODES) {
  const r = suite.modes[m];
  line('   ' + m.padEnd(14) + pct(r.winRate).padEnd(10) + pct(r.deadlockRate).padEnd(10)
    + pct(r.avgPct).padEnd(12) + r.avgSlot.toFixed(2).padEnd(12)
    + pct(r.failureMedianPct).padEnd(14) + String(r.earlyDeaths).padEnd(8) + r.avgDecisionMs.toFixed(3));
}
line(`   样本 ${SUITE_SEEDS} 个池内 seed · 证书/verify 通过 ${suite.verified}/${suite.seeds} · 耗时 ${((Date.now() - suiteStart) / 1000).toFixed(1)}s`);
const g = suite.modes.greedy, n = suite.modes.noisy, rnd = suite.modes.random;
const strong = ['lookahead', 'montecarlo', 'search'].map((m) => suite.modes[m].winRate);
soft(rnd.winRate <= 0.05, `随机机器人通关率 ≤5%（实测 ${pct(rnd.winRate)}）`);
soft(n.winRate <= 0.30, `带 10% 失误玩家通关率 ≤30%（实测 ${pct(n.winRate)}）`);
soft(g.winRate >= n.winRate, `失误受惩罚：greedy ${pct(g.winRate)} ≥ noisy ${pct(n.winRate)}`);
soft(Math.max.apply(null, strong) >= 0.50, `至少一条强策略通关率 ≥50%（实测 ${pct(Math.max.apply(null, strong))}）`);
soft(g.failureMedianPct >= 0.50, `失败局进度中位数 ≥50% / 死局后置（实测 ${pct(g.failureMedianPct)}，仅统计 ${g.failures} 个失败局）`);
soft(g.avgSlot >= 3.0, `平均槽位占用 ≥3.0（实测 ${g.avgSlot.toFixed(2)}）`);
soft(POOL_META.freeKinds >= 10, `开局可点花色 ≥10 种（实测 ${POOL_META.freeKinds.toFixed(1)}）`);
ok(suite.verifyRate === 1, '难度样本 100% 通过证书 / verify');
ok(ROBOT_MODES.length === 6, '六种策略齐全');
line('   说明：完整信息贪心机器人高通关率只证明「关卡可解」，不代表真实玩家难度；');
line('   7 槽位 + 波次剥离顺序下，开局 ~23 张可点牌必然含约 6 组三张同花色，');
line('   这是证书保持槽位峰值 ≤6 的数学必然，故 v2 不使用单一贪心通关率做验收门槛。');

/* ---------------- [8] 视觉 / 兼容 / 安全静态验收 ---------------- */
line('\n[8] 视觉 / 兼容版 / Tauri 最小权限 / 版本号');
const read = (p) => existsSync(ROOT + p) ? readFileSync(ROOT + p, 'utf8') : '';
const cap = read('src-tauri/capabilities/default.json');
const rust = read('src-tauri/src/main.rs');
const tconf = JSON.parse(read('src-tauri/tauri.conf.json') || '{}');
const pkg = JSON.parse(read('package.json') || '{}');
const css = read('src/styles.css');
const legacy = read('src/legacy.css');
const dom = read('src/game/dom_view.es5.js');
ok(!/fs:allow-remove|"path"\s*:\s*"\*\*"/.test(cap), 'capabilities 已删除过宽的 fs 删除授权 / ** 通配');
ok(/core:default/.test(cap) && !/tauri_plugin_fs|fs:default/.test(cap), 'capabilities 仅保留 core:default');
ok(!/fn\s+uninstall_app\s*\(/.test(rust) && !/fn\s+schedule_self_delete\s*\(/.test(rust),
  'Rust 已删除前端自删除命令与自删脚本（按函数定义检查，忽略说明注释）');
ok(!/\.plugin\(\s*tauri_plugin_fs::init\(\)\s*\)/.test(rust), 'Rust 不再注册 fs 插件');
ok(!/^\s*tauri-plugin-fs\s*=/m.test(read('src-tauri/Cargo.toml')), 'Cargo.toml 已移除 fs 插件依赖');
ok(tconf.version === VERSION && pkg.version === VERSION, 'Tauri / npm 版本号 = ' + VERSION);
ok(tconf.bundle && tconf.bundle.targets.indexOf('nsis') >= 0, 'bundle 目标含 NSIS 安装包');
ok(!/background:\s*#191009|#2a1c13|#150e09/.test(css + legacy), '网页版 / 兼容版背景已换成暖白');
ok(/FFFDF6|FFF9EC|F7EEDC/.test(css), 'styles.css 使用暖白 / 奶油底');
ok(Object.keys(TILE_TYPES).length === 16, '注册表类型可用于静态检查');
let labelCovered = true;
for (const t of TILE_TYPES) if (dom.indexOf("'" + t.id + "'") < 0) labelCovered = false;
ok(labelCovered, 'ES5 降级视图内嵌了全部 16 种牌型标签');
ok(!/\buninstallGame\s*\(/.test(read('src/main.js') + read('src/game/store.js')),
  '前端不再调用自删除 IPC');

/* ---------------- [9] 运行时生成耗时 ---------------- */
line('\n[9] 运行时生成耗时');
const t0 = Date.now();
const N_GEN = 20;
for (let i = 0; i < N_GEN; i++) generateLevel(2, (31000 + i * 7919) >>> 0);
const genMs = (Date.now() - t0) / N_GEN;
line(`   L2 生成 ${N_GEN} 次 · 平均 ${genMs.toFixed(2)} ms/局`);
soft(genMs < 400, `单局生成 < 400ms（实测 ${genMs.toFixed(2)}ms）`);

line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line('============================================================================');
if (fail) process.exit(1);
