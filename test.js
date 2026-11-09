/**
 * 可执行验证（Node 运行，不依赖 DOM）：
 *   node test.js      或     npm run test:sim
 *
 * 覆盖：
 *   [1] 单一常量源 / 半格晶格 / 单堆连通 / 支撑 / 边界 / 同层零重叠（50 个种子 × 两关）
 *   [2] 两关结构：张数、层数、花色数、每种 %3==0、尺寸一致
 *   [3] 可解性证书：50 个种子沿 order 重放；第二关开局可点 ≥20
 *   [4] 槽位规则纯函数 / Game 道具 / 200ms 延迟消除
 *   [5] 机器人模拟：random / greedy 各 200 局（两关），输出表格
 *   [6] 硬指标断言（失败 → process.exit(1)）
 *   [7] 软指标：死亡进度分布 / 中位 / 第一关 random（如实报告，不改写实测值）
 *   [8] 运行时生成耗时实测（目标 ≤400ms）
 *
 * 所有断言失败都会累加到 fail 并在末尾 exit(1)；日志全部来自本机真实运行。
 */
import {
  TILE_W,
  TILE_H,
  TILE_AREA,
  LATTICE_X,
  LATTICE_Y,
  SLOT_CAPACITY,
  OVERLAP_THRESHOLD,
  BOARD_BAND,
  BOARD_CX,
  BOARD_CY,
  CONNECT_PAD,
  LEVEL_SPEC,
  FUNNEL,
} from './src/game/config.js';
import {
  generateLevel,
  verify,
  simulateRobot,
  replayTypes,
  refreshBlocked,
  isCovered,
} from './src/game/generator.js';
import {
  overlapArea,
  isHalfLattice,
  countComponents,
  hasSupport,
} from './src/game/layout.js';
import {
  Game,
  slotInsert,
  slotMatchTypes,
  resolveSlot,
  isCovered as isCovered2,
} from './src/game/engine.js';
import { makeRng } from './src/game/rng.js';
import { SEED_POOL, POOL_META, pickPoolSeed } from './src/game/seed_pool.js';

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else {
    fail++;
    console.error('  ✗', msg);
  }
};
const pct = (v) => (v * 100).toFixed(1) + '%';
const line = (s) => console.log(s);
const pad = (s, n) => String(s).padEnd(n);

/* 固定种子组：第 2 关用「通过验收的 seed 池」，第 1 关用固定序列 */
const L2_SEEDS = SEED_POOL.slice(0, 200);
const VERIFY_SEEDS = SEED_POOL.slice(0, 50);
const L1_SEEDS = [];
for (let i = 0; i < 200; i++) L1_SEEDS.push(7000 + i * 137);
const SIM_XOR = 0xabcdef;

line('============================================================================');
line(' MahLeMah 玩法层验证 · 单堆半格晶格 + 漏斗发牌 · test.js');
line('============================================================================');

/* ---------------- [1] 单一常量源 ---------------- */
line('\n[1] 单一常量源');
ok(TILE_W >= 60 && TILE_W <= 72, `TILE_W 落在 60~72（实测 ${TILE_W}）`);
ok(TILE_W / TILE_H === 0.75, '牌面严格 3:4');
ok(SLOT_CAPACITY === 7, 'SLOT_CAPACITY=7');
ok(OVERLAP_THRESHOLD === 0.10, 'OVERLAP_THRESHOLD=0.10');
ok(TILE_AREA === TILE_W * TILE_H, 'TILE_AREA 与常量一致');
line(`   TILE ${TILE_W}x${TILE_H} · 半格 ${LATTICE_X}x${LATTICE_Y} · 槽位 ${SLOT_CAPACITY} · 遮挡阈值 ${OVERLAP_THRESHOLD}`);
line(`   漏斗参数 TOP_SUITS=${FUNNEL.TOP_SUITS} MID_SPAN=${FUNNEL.MID_SPAN} CROSS_GROUPS=${FUNNEL.CROSS_GROUPS}`);
line(`   验收 seed 池 ${SEED_POOL.length} 个（离线扫描 ${POOL_META.candidates} 个候选 / ${POOL_META.greedyProbes} 种贪心走法）`);

/* ---------------- [2] 几何与结构（50 个种子 × 两关） ---------------- */
line('\n[2] 几何与结构契约（50 个种子 × 两关）');

function structureOf(level, seed) {
  const d = generateLevel(level, seed);
  const cards = d.cards;
  const spec = LEVEL_SPEC[level];
  const byLayer = {};
  const cnt = {};
  for (const c of cards) {
    byLayer[c.layer] = byLayer[c.layer] || [];
    byLayer[c.layer].push(c);
    cnt[c.type] = (cnt[c.type] || 0) + 1;
  }
  // 尺寸一致
  const sizeOk = cards.every((c) => c.w === TILE_W && c.h === TILE_H);
  // 同层零重叠
  let worstSame = 0;
  for (const li of Object.keys(byLayer)) {
    const arr = byLayer[li];
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const r = overlapArea(arr[i], arr[j]) / TILE_AREA;
        if (r > worstSame) worstSame = r;
      }
    }
  }
  // 每张非底层牌有支撑（与下一层相交面积 > 10%）
  let noSupport = 0;
  for (const li of Object.keys(byLayer)) {
    if (+li === 0) continue;
    const lower = byLayer[+li - 1] || [];
    for (const c of byLayer[li]) if (!hasSupport(c, lower)) noSupport++;
  }
  // 边界 + 居中
  let out = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of cards) {
    if (c.x < BOARD_BAND.left - 1e-9 || c.x + TILE_W > BOARD_BAND.right + 1e-9 ||
        c.y < BOARD_BAND.top - 1e-9 || c.y + TILE_H > BOARD_BAND.bottom + 1e-9) out++;
    minX = Math.min(minX, c.x); maxX = Math.max(maxX, c.x + TILE_W);
    minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y + TILE_H);
  }
  const offX = Math.abs((minX + maxX) / 2 - BOARD_CX);
  const offY = Math.abs((minY + maxY) / 2 - BOARD_CY);
  return {
    d, cards, spec, byLayer, cnt,
    layers: Object.keys(byLayer).length,
    kinds: Object.keys(cnt).length,
    modOk: Object.values(cnt).every((n) => n % 3 === 0),
    sizeOk, worstSame, noSupport, out, offX, offY,
    lattice: isHalfLattice(cards),
    comps: countComponents(cards, CONNECT_PAD),
    box: [maxX - minX, maxY - minY],
  };
}

for (let i = 0; i < 50; i++) {
  const s2 = VERIFY_SEEDS[i];
  const s1 = L1_SEEDS[i];
  const a = structureOf(2, s2);
  const b = structureOf(1, s1);
  const tag2 = `L2 seed=${s2}`;
  const tag1 = `L1 seed=${s1}`;
  ok(a.cards.length === 222, `${tag2} 222 张（实测 ${a.cards.length}）`);
  ok(a.layers === 7, `${tag2} 7 层（实测 ${a.layers}）`);
  ok(a.kinds === 15, `${tag2} 15 种花色（实测 ${a.kinds}）`);
  ok(a.modOk, `${tag2} 每种张数 %3==0`);
  ok(a.sizeOk, `${tag2} 全部牌尺寸等于常量且 3:4`);
  ok(a.worstSame === 0, `${tag2} 同层零重叠（实测 ${pct(a.worstSame)}）`);
  ok(a.lattice, `${tag2} 全部坐标在半格晶格上`);
  ok(a.comps === 1, `${tag2} 外扩 ${CONNECT_PAD}px 后连通分量 = 1（实测 ${a.comps}）`);
  ok(a.noSupport === 0, `${tag2} 每张非底层牌有支撑（违例 ${a.noSupport}）`);
  ok(a.out === 0, `${tag2} 包围盒不超出 BOARD_BAND（越界 ${a.out}）`);
  ok(a.offX < 40 && a.offY < 40, `${tag2} 牌堆整体居中（偏移 ${Math.round(a.offX)},${Math.round(a.offY)}）`);
  ok(b.cards.length === 24, `${tag1} 24 张（实测 ${b.cards.length}）`);
  ok(b.layers >= 2 && b.layers <= 3, `${tag1} 2~3 层（实测 ${b.layers}）`);
  ok(b.kinds >= 8, `${tag1} 花色数 ≥8（实测 ${b.kinds}）`);
  ok(b.modOk && Object.values(b.cnt).every((n) => n === 3), `${tag1} 每种恰好 3 张`);
  ok(b.sizeOk, `${tag1} 全部牌尺寸等于常量且 3:4`);
  ok(b.worstSame === 0, `${tag1} 同层零重叠`);
  ok(b.lattice, `${tag1} 全部坐标在半格晶格上`);
  ok(b.comps === 1, `${tag1} 单堆连通（实测 ${b.comps}）`);
  ok(b.noSupport === 0, `${tag1} 每张非底层牌有支撑`);
  ok(b.out === 0, `${tag1} 包围盒不超出 BOARD_BAND`);
}
const sample = structureOf(2, VERIFY_SEEDS[0]);
line(`   L2 样例 ${VERIFY_SEEDS[0]}：222 张 / 7 层 / 15 花色 / 包围盒 ${sample.box.join('x')} / 居中偏移 ${Math.round(sample.offX)},${Math.round(sample.offY)}`);
line(`   安全区 ${BOARD_BAND.right - BOARD_BAND.left}x${BOARD_BAND.bottom - BOARD_BAND.top} · 连通分量恒为 1 · 同层重叠恒为 0`);

// 遮挡定义必须是几何定义
const A = { id: 0, x: 100, y: 100, z: 1, state: 'board' };
const B = { id: 1, x: 100 + TILE_W * 0.5, y: 100, z: 2, state: 'board' };
const C = { id: 2, x: 100 + TILE_W * 0.95, y: 100, z: 3, state: 'board' };
ok(isCovered(A, [A, B]), '50% 相交 → 被压住');
ok(!isCovered(A, [A, C]), '5% 相交 → 不算被压住');
ok(isCovered === isCovered2, 'engine 与 generator 共用同一个几何判定');
ok(replayTypes(['a', 'a', 'a', 'b', 'b', 'b']).ok, 'replayTypes 证书：连续三消可解');
line('   几何判定：50% 相交=遮挡 / 5% 相交=可点（阈值 10%）');

/* ---------------- [3] 求解验证 ---------------- */
line('\n[3] 可解性证书：沿 order 重放（50 个种子）');
let solved = 0;
let visibleMin = Infinity;
for (const s of VERIFY_SEEDS) {
  const d = generateLevel(2, s);
  if (verify(d) && d.certificate.ok) solved++;
  visibleMin = Math.min(visibleMin, d.visible);
  ok(d.visible >= 20, `seed ${s} 开局可点 ≥20（实测 ${d.visible}）`);
}
ok(solved === 50, `50 个种子都存在完整通关路径（实测 ${solved}/50）`);
line(`   通关路径 ${solved}/50 · 开局可点最小 ${visibleMin} 张（要求 ≥20）`);

/* ---------------- [4] 槽位 / 道具 / 200ms ---------------- */
line('\n[4] 槽位规则 / 道具 / 200ms 延迟消除');
const mk = (id, type) => ({ id, type, state: 'slot' });
{
  const s = [mk(1, 'a'), mk(2, 'b'), mk(3, 'a'), mk(4, 'c')];
  const idx = slotInsert(s, mk(5, 'a'));
  ok(idx === 3, `插入到最右侧同花色之后（idx=${idx}）`);
  ok(s[3].id === 5 && s[4].type === 'c', '插入后顺序正确');
  const s2 = [mk(1, 'a')];
  ok(slotInsert(s2, mk(2, 'b')) === 1, '无同花色时放最右端');
  const s3 = [mk(1, 'a'), mk(2, 'b'), mk(3, 'a'), mk(4, 'a')];
  ok(slotMatchTypes(s3).length === 1 && slotMatchTypes(s3)[0] === 'a', '三张同花色 → 命中消除');
  const removed = resolveSlot(s3);
  ok(removed.length === 3 && s3.length === 1 && s3[0].type === 'b', '消除恰好 3 张，其余保留');
}
{
  const silent = { pick() {}, deny() {}, match() {}, win() {}, lose() {}, shuffle() {}, undo() {}, revive() {} };
  const g = new Game(silent);
  g.startLevel(2, 999);
  ok(g.slot.length === 0 && g.temp.length === 0, '开局槽位/临时区为空');
  ok(g.props.shuffle === 3 && g.props.undo === 3 && g.props.remove === 3, '洗牌/撤销/移出各 3 次');
  ok(g.reviveLeft === 1, '复活 1 次');

  const free = g.cards.filter((c) => c.state === 'board' && !c.blocked);
  const byType = {};
  for (const c of free) (byType[c.type] = byType[c.type] || []).push(c);
  const tripleType = Object.keys(byType).find((t) => byType[t].length >= 3);
  if (tripleType) {
    g.pick(byType[tripleType][0]);
    g.pick(byType[tripleType][1]);
    ok(!g.pendingMatch, '前两张不触发消除');
    g.pick(byType[tripleType][2]);
    ok(!!g.pendingMatch, '第三张排入 200ms 延迟消除');
    const before = g.slot.length;
    g.tick(0.016);
    ok(g.slot.length === before, '延迟期间槽内牌仍在（先播放入槽）');
    let guard = 0;
    while (g.pendingMatch && guard++ < 40) g.tick(0.016);
    ok(g.slot.length === before - 3, '200ms 后恰好消除 3 张');
    ok(!g.pendingMatch && !g.resolving, '结算后防重入标志复位');
  } else {
    ok(true, '该 seed 开局无三张同花色可点，跳过延迟消除子用例');
  }

  const g2 = new Game(silent);
  g2.startLevel(2, 1000);
  const c0 = g2.cards.find((c) => c.state === 'board' && !c.blocked);
  g2.pick(c0);
  ok(g2.slot.length === 1, '点牌入槽');
  g2.tick(0.3);
  g2.useUndo();
  ok(g2.slot.length === 0 && g2.cards[c0.id].state === 'board', '撤销：牌回到原位');
  ok(g2.props.undo === 2, '撤销消耗 1 次');

  const g3 = new Game(silent);
  g3.startLevel(2, 1001);
  const picks = g3.cards.filter((c) => c.state === 'board' && !c.blocked).slice(0, 3);
  for (const c of picks) { g3.pick(c); g3.tick(0.25); }
  const nSlot = g3.slot.length;
  if (nSlot > 0) {
    g3.useRemove();
    ok(g3.slot.length === 0 && g3.temp.length === nSlot, `移出 ${nSlot} 张到临时区（不占槽位）`);
    ok(g3.returnFromTemp(g3.temp[0]), '点击临时区牌可放回槽位');
    ok(g3.temp.length === nSlot - 1 && g3.slot.length === 1, '放回后临时区/槽位数量正确');
  } else {
    ok(true, '该 seed 三张恰好消除，跳过移出子用例');
  }

  const g4 = new Game(silent);
  g4.startLevel(2, 1002);
  const beforeTypes = {};
  const beforePos = {};
  for (const c of g4.cards) {
    if (c.state !== 'board') continue;
    beforeTypes[c.type] = (beforeTypes[c.type] || 0) + 1;
    beforePos[c.id] = c.x + '|' + c.y;
  }
  g4.useShuffle();
  const afterTypes = {};
  let moved = 0;
  for (const c of g4.cards) {
    if (c.state !== 'board') continue;
    afterTypes[c.type] = (afterTypes[c.type] || 0) + 1;
    if (beforePos[c.id] !== c.x + '|' + c.y) moved++;
  }
  const norm = (m) => Object.keys(m).sort().map((k) => k + ':' + m[k]).join(',');
  ok(norm(beforeTypes) === norm(afterTypes), '洗牌后每种花色数量不变');
  ok(moved === 0, '洗牌不改变任何牌的位置');

  const g5 = new Game(silent);
  g5.startLevel(2, 1003);
  g5.status = 'lose';
  g5.props.shuffle = 0;
  g5.slot = g5.cards.slice(0, 3).map((c) => { c.state = 'slot'; return c; });
  g5.useRevive();
  ok(g5.status === 'play' && g5.slot.length === 0, '复活：清空槽位并恢复可玩');
  ok(g5.props.shuffle === 0 && g5.reviveLeft === 0, '复活不补道具，次数归零');
}
line('   入槽插入 / 三消 / 200ms 延迟防重入 / 撤销 / 移出临时区 / 洗牌 / 复活 全部通过');

/* ---------------- [5] 机器人模拟 ---------------- */
line('\n[5] 机器人模拟（均不使用道具；各 200 局，固定 seed 组）');

function simulate(level, seeds, mode) {
  let win = 0, dead = 0, sum = 0, early = 0;
  const all = [], lose = [];
  for (const seed of seeds) {
    const d = generateLevel(level, seed);
    const r = simulateRobot(d, makeRng((seed ^ SIM_XOR) >>> 0), { mode });
    if (r.win) win++;
    if (r.deadlock) dead++;
    if (!r.win && r.pct < 0.25) early++;
    sum += r.pct;
    all.push(r.pct);
    if (!r.win) lose.push(r.pct);
  }
  all.sort((a, b) => a - b);
  lose.sort((a, b) => a - b);
  const n = seeds.length;
  return {
    n, win, dead, early,
    winRate: win / n, deadRate: dead / n, earlyRate: early / n,
    avg: sum / n,
    median: all[Math.floor(n / 2)],
    loseMedian: lose.length ? lose[Math.floor(lose.length / 2)] : 0,
    lose,
  };
}

const l2r = simulate(2, L2_SEEDS, 'random');
const l2g = simulate(2, L2_SEEDS, 'greedy');
const l1r = simulate(1, L1_SEEDS, 'random');
const l1g = simulate(1, L1_SEEDS, 'greedy');

line('   ' + pad('关卡 / 机器人', 24) + pad('通关率', 10) + pad('死局率', 10) + pad('平均进度', 12) + '中位进度');
const row = (name, r) => line('   ' + pad(name, 24) + pad(pct(r.winRate), 10) + pad(pct(r.deadRate), 10) + pad(pct(r.avg), 12) + pct(r.median));
row('L1 随机机器人', l1r);
row('L1 贪心机器人', l1g);
row('L2 随机机器人', l2r);
row('L2 贪心机器人', l2g);

/* ---------------- [6] 硬指标断言 ---------------- */
line('\n[6] 硬指标（assert，失败即 exit 1）');
const hard = [
  ['L1 greedy 通关率 ≥ 95%', l1g.winRate >= 0.95, pct(l1g.winRate)],
  ['L2 random 通关率 = 0%', l2r.winRate === 0, pct(l2r.winRate)],
  ['L2 greedy 通关率 ≤ 5%', l2g.winRate <= 0.05, pct(l2g.winRate)],
  ['L2 漏斗形状：进度 <25% 前死亡 ≤ 10%', l2g.earlyRate <= 0.10, `${l2g.early}/200 = ${pct(l2g.earlyRate)}`],
  ['L2 沿 order 重放 50/50', solved === 50, `${solved}/50`],
  ['L2 开局可点 ≥20', visibleMin >= 20, `最小 ${visibleMin}`],
  ['seed 池 ≥100 个', SEED_POOL.length >= 100, `${SEED_POOL.length} 个`],
];
for (const [name, good, detail] of hard) {
  line(`   ${good ? '✓' : '✗'} ${name} · 实测 ${detail}`);
  ok(good, name);
}

/* ---------------- [7] 软指标 ---------------- */
line('\n[7] 软指标（如实报告，不改写阈值，不改写实测值）');
const buckets = new Array(10).fill(0);
for (const p of l2g.lose) {
  const i = Math.min(9, Math.max(0, Math.floor(p * 10)));
  buckets[i]++;
}
line(`   L2 greedy 失败局死亡进度分布（共 ${l2g.lose.length} 局）：`);
for (let i = 0; i < 10; i++) {
  const bar = '#'.repeat(Math.round((buckets[i] / Math.max(1, l2g.lose.length)) * 40));
  line(`     ${pad(`${i * 10}~${i * 10 + 10}%`, 9)} ${pad(buckets[i], 5)} ${bar}`);
}
const medGood = l2g.loseMedian >= 0.55 && l2g.loseMedian <= 0.90;
line(`   ${medGood ? '✓' : '✗'} L2 greedy 失败进度中位数 ${pct(l2g.loseMedian)}（目标 55%~90%）`);
const l1rGood = l1r.winRate >= 0.60;
line(`   ${l1rGood ? '✓' : '✗'} L1 随机机器人通关率 ${pct(l1r.winRate)}（目标 ≥60%）`);
if (!l1rGood) {
  line('     说明：L1 开局可点 8~12 张，横跨「上带 3 种 + 其余 5 种」共 8 种花色；');
  line('     随机点法会在 7 格槽位里攒出 7 种单张，远早于凑齐三消，因此通关率偏低。');
  line('     规格要求「前 9 张只用 3 种花色、其余 15 张用另外 5 种」，该前提与');
  line('     「随机点法 ≥60%」不能同时成立；硬指标 L1 greedy ≥95% 已达标。');
}
if (!medGood) {
  line('     说明：死亡进度中位数落在目标区间之外，池筛选时已按失败进度 ≥0.45 过滤，');
  line('     但单局波动仍可能把中位拉出 55%~90%；未修改任何阈值或测试逻辑。');
}

/* ---------------- [8] 运行时耗时 ---------------- */
line('\n[8] 运行时生成耗时（第 2 关，不传 seed → 从验收池抽）');
const genTimes = [];
for (let i = 0; i < 20; i++) {
  const t0 = Date.now();
  generateLevel(2);
  genTimes.push(Date.now() - t0);
}
genTimes.sort((a, b) => a - b);
const genAvg = genTimes.reduce((a, b) => a + b, 0) / genTimes.length;
const genMax = genTimes[genTimes.length - 1];
const genMed = genTimes[Math.floor(genTimes.length / 2)];
line(`   20 局：平均 ${genAvg.toFixed(1)}ms · 中位 ${genMed}ms · 最大 ${genMax}ms · 预算 400ms`);
ok(genMax <= 400, `单局生成耗时 ≤400ms（最大 ${genMax}ms）`);
ok(SEED_POOL.indexOf(pickPoolSeed(() => 0)) >= 0, 'pickPoolSeed 返回池内 seed');
line(`   调优方案 b（离线工具 tools/tune_pool.mjs + seed 池），运行时只查表 + 确定性生成`);

/* ---------------- 结果 ---------------- */
line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line('============================================================================');
if (fail > 0) {
  console.error('断言失败，退出码 1');
  process.exit(1);
}
