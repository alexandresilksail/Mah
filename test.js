/**
 * MahLeMah v2.0.0 可执行验证（Node 运行，不依赖 DOM）：node test.js / npm run test:sim
 *
 * 覆盖：
 *   [1]  单一常量源 / 版本号 / 两关旧规格（无档位兼容路径）
 *   [2]  16 种牌型唯一注册表
 *   [3]  两关独立布局模板 + 几何契约（30 seed × 2 关）
 *   [3b] 模板校验反例
 *   [4]  旧路径关卡构造：16 种 / 三倍数 / 证书 / verify / 三带边界
 *   [5]  分档 seed 池 SEED_POOL['L2-<id>'] 与 POOL_META（第 5.1 节）
 *   [6]  槽位 / 三消 / 道具规则
 *   [7]  两关静态档位表 / 层张数插值 / levelParams（第 1、2.5 节）
 *   [8]  视觉 / 兼容版 / Tauri 最小权限 / 版本号
 *   [8b] Rust 存档加固 + p1/p2 白名单（第 4.2 节）
 *   [8c] 生产包零 BGM / 仅音效 + 运行时音频回归
 *   [9]  运行时生成耗时
 *   [10] 分档关卡构造与几何验收（第 5.2 节结构部分）
 *   [11] 分档机器人难度验收（第 5.2 节统计部分）
 *   [12] rollProfile / 重开 / 通关 / 存档（第 5.3 节）
 *   [13] 界面文案与源码一致性（第 2.5 / 3.2 / 3.3 / 4.2 节）
 *
 * 硬断言失败累加到 fail，末尾 process.exit(1)。
 * 所有实测值来自本机真实运行；阈值按规格原文写死，不放宽、不改测试凑数。
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  VERSION, TILE_W, TILE_H, TILE_AREA, LATTICE_X, LATTICE_Y,
  SLOT_CAPACITY, OVERLAP_THRESHOLD, MATCH_DELAY_MS,
  LEVEL_SPEC, LEVEL_MIX, LEVEL_COUNT, BAND_RATIOS, LAYOUT_SHAPE, DIFFICULTY,
  LEVEL2_PROFILES, LEVEL1_PROFILES, profilesFor, profileFor, rollProfile,
  RETRY_KEEPS_PROFILE, setRetryKeepsProfile, layerPlanFor, groupsPerTypeFor,
  levelParams,
} from './src/game/config.js';
import {
  TILE_TYPES, TYPE_IDS, TYPE_COUNT, TYPE_BY_ID, validateRegistry, mixFor,
} from './src/game/tile_types.js';
import {
  TEMPLATES, validateTemplate, clampTemplate, templateFor, describeTemplates,
} from './src/game/layout_templates.js';
import {
  generateLevel, validateLevel, verify, replayTypes, refreshBlocked, countVisible,
} from './src/game/generator.js';
import {
  generateLayout, layoutReport, isHalfLattice, countComponents,
  sameLayerOverlapCount, crossOcclusionStats, pressureStats, hasSupport, planForSeed,
  buildBlockerGraph,
} from './src/game/layout.js';
import { generateProfileLayout, describeProfileLayout } from './src/game/layout_profiles.js';
import { TYPE_LIST, TYPE_MAP, SUITS_L1, SUITS_L2, suitsFor } from './src/game/tiles.js';
import { ROBOT_MODES, simulateRobot, runDifficultySuite } from './src/game/robots.js';
import { Game, slotInsert, slotMatchTypes, resolveSlot } from './src/game/engine.js';
import { makeRng } from './src/game/rng.js';
import { SEED_POOL, POOL_META, pickPoolSeed } from './src/game/seed_pool.js';
import { makeSaveData, applySaveToGame } from './src/game/save_data.js';
import { sha256Hex } from './src/game/sha256.js';
import { calculateLayoutSignature, SIGNATURE_ALGORITHM } from './src/game/layout_signature.js';
import { createNewGame, GenerationFailureError, MAX_ATTEMPTS } from './src/game/new_game.js';
import {
  HISTORY_LIMIT, GENERATION_REASONS, sanitizeHistory, sanitizeRecord,
  historyFor, checkAgainstRecent,
} from './src/game/recent_games.js';
import { readBuildInfo } from './src/game/build_info.js';
import { createHash } from 'node:crypto';

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else { fail++; console.error('  ✗ ' + msg); }
};
const soft = (cond, msg) => console.log('  ' + (cond ? '✓' : '✗') + ' ' + msg);
const pct = (v) => (v * 100).toFixed(2) + '%';
const line = (s) => console.log(s);
const ROOT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

/** 95% Wilson 二项比例上界（规格 5.2 用） */
function wilsonUpper(k, n, z = 1.96) {
  if (n <= 0) return 1;
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  return (centre + margin) / denom;
}

/** 最长遮挡链：与 tools/tune_pool.mjs 完全相同的定义 */
function longestChain(cards, graph) {
  const memo = {};
  let visiting = 0;
  const dfs = (id) => {
    if (memo[id] !== undefined) return memo[id];
    if (++visiting > 1000000) return 1;
    let m = 1;
    const bs = graph.blockers[id] || [];
    for (let i = 0; i < bs.length; i++) m = Math.max(m, 1 + dfs(bs[i]));
    memo[id] = m;
    return m;
  };
  let best = 0;
  for (const c of cards) best = Math.max(best, dfs(c.id));
  return best;
}

line('============================================================================');
line(' MahLeMah v' + VERSION + ' 验证 · 动态档位 / 分档 seed 池 / 六机器人难度 / 最小权限');
line('============================================================================');
line(' Node ' + process.version);

/* ---------------- [1] 单一常量源 ---------------- */
line('\n[1] 单一常量源 / 版本号 / 两关旧规格（无档位兼容路径）');
ok(VERSION === '2.0.0', 'VERSION = 2.0.0');
ok(TILE_W === 66 && TILE_H === 88 && TILE_W / TILE_H === 0.75, '牌面 66x88 严格 3:4');
ok(TILE_AREA === TILE_W * TILE_H, 'TILE_AREA 与常量一致');
ok(LATTICE_X === TILE_W / 2 && LATTICE_Y === TILE_H / 2, '半格晶格 = 牌面一半');
ok(SLOT_CAPACITY === 7 && OVERLAP_THRESHOLD === 0.10 && MATCH_DELAY_MS === 200,
  '槽位 7 格 / 遮挡阈值 10% / 三消延迟 200ms 未改');
ok(LEVEL_COUNT === 2, '两关制');
ok(LEVEL_SPEC[1].cardCount === 48 && LEVEL_SPEC[2].cardCount === 240, '旧兼容规格 L1 48 张 / L2 240 张');
ok(LEVEL_SPEC[1].types === 16 && LEVEL_SPEC[2].types === 16, '旧兼容规格两关都是 16 种牌型');
ok(LEVEL_SPEC[1].layers === 3 && LEVEL_SPEC[2].layers === 15, '旧兼容规格 L1 3 层 / L2 15 个全局层');
ok(LEVEL_SPEC[1].plan.reduce((a, b) => a + b, 0) === 48, 'L1 旧层计划合计 48');
const coreSum = LEVEL_SPEC[2].plan.reduce((a, b) => a + b, 0);
ok(coreSum + LAYOUT_SHAPE.sideCount * 2 + LAYOUT_SHAPE.reserveCount === 240,
  'L2 旧主堆 + 两侧盲盒 + 保留区 = 240');
ok(mixFor(1).reduce((a, b) => a + b, 0) * 3 === 48 && mixFor(2).reduce((a, b) => a + b, 0) * 3 === 240,
  'LEVEL_MIX 组数 ×3 = 旧两关总张数');
ok(Math.abs(BAND_RATIOS[0] - 0.25) < 1e-9 && Math.abs(BAND_RATIOS[1] - 0.30) < 1e-9 && Math.abs(BAND_RATIOS[2] - 0.45) < 1e-9,
  '三带比例 25% / 30% / 45%');
line('   旧 L1: 48 张 / 16 种 / 3 层 / plan ' + LEVEL_SPEC[1].plan.join('/'));
line('   旧 L2: 240 张 / 16 种 / 15 全局层 / 主堆 ' + LEVEL_SPEC[2].plan.join('/') + ' + 两侧 12×2 + 保留 36');
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

/* ---------------- [3] 旧两关模板 + 几何契约 ---------------- */
line('\n[3] 旧两关独立布局模板（30 seed × 2 关逐个 assert）');
for (const key of ['L1_TUTORIAL', 'L2_MULTI_ZONE']) {
  const v = validateTemplate(TEMPLATES[key]);
  ok(v.ok, key + ' 模板合法' + (v.ok ? '' : '：' + v.issues.join('；')));
}
ok(templateFor(1).id === 'L1_TUTORIAL' && templateFor(2).id === 'L2_MULTI_ZONE', 'templateFor(level) 映射正确');
ok(TEMPLATES.L2_MULTI_ZONE.zones.length === 4, 'L2 旧模板为四区域');
const stacks = [];
for (const z of TEMPLATES.L2_MULTI_ZONE.zones) for (const s of z.stack) stacks.push(s);
ok(new Set(stacks).size === 15, 'L2 旧模板 15 个互不重复的全局层号');
line('   ' + describeTemplates().join('\n   '));

const GEO_SEEDS = 30;
let geoOk = 0, pressSum = 0, freeSum = 0, crossSum = 0, chainSum = 0;
for (let i = 0; i < GEO_SEEDS; i++) {
  const seed = (9000 + i * 2654435761) >>> 0;
  for (const level of [1, 2]) {
    const cards = generateLayout(seed, { level });
    const rep = layoutReport(cards);
    ok(cards.length === LEVEL_SPEC[level].cardCount, `旧 L${level} seed ${seed} 张数 ${cards.length}`);
    ok(rep.halfLattice, `旧 L${level} seed ${seed} 坐标落在半格晶格上`);
    ok(rep.sameLayerOverlap === 0, `旧 L${level} seed ${seed} 同层零重叠`);
    ok(rep.components === 1, `旧 L${level} seed ${seed} 牌堆单连通`);
    if (level === 2) {
      ok(rep.crossOcclusion.pairs > 0, `旧 L2 seed ${seed} 存在跨区域交叉遮挡`);
      let bad = 0;
      for (const c of cards) if (c.layer > 0 && !hasSupport(c, cards.filter((o) => o.layer < c.layer))) bad++;
      ok(bad === 0, `旧 L2 seed ${seed} 所有非底层牌都有支撑（异常 ${bad}）`);
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

/* ---- [3b] 模板严格校验反例 ---- */
line('\n[3b] 模板校验反例（validateTemplate 直查原始模板 / clampTemplate 非法即 throw）');
{
  const clone = () => JSON.parse(JSON.stringify(TEMPLATES.L1_TUTORIAL));
  const expectBad = (name, mutate, keyword) => {
    const t = clone();
    mutate(t);
    const v = validateTemplate(t);
    const hit = v.issues.some((s) => s.indexOf(keyword) >= 0);
    ok(!v.ok && hit, `反例「${name}」被拒绝（含「${keyword}」）` + (v.ok ? '：竟然通过了' : (hit ? '' : '：' + v.issues.join('；'))));
  };
  expectBad('坐标不在半格晶格', (t) => { t.zones[0].origin[0] = [130, 440]; }, '不在半格晶格');
  expectBad('坐标越出牌桌', (t) => { t.zones[0].origin[0] = [132, 880]; }, '越出牌桌');
  expectBad('牌数超过网格容量', (t) => { t.zones[0].plan[0] = 25; t.cardCount = 52; }, '网格容量');
  expectBad('牌数为 0', (t) => { t.zones[0].plan[0] = 0; t.cardCount = 27; }, '牌数非法');
  expectBad('数组长度不一致', (t) => { t.zones[0].stack.push(3); }, '长度不一致');
  expectBad('全局层号重复', (t) => { t.zones[0].stack[1] = 0; }, '重复');
  expectBad('cardCount 与 Σ plan 不符', (t) => { t.cardCount = 47; }, 'cardCount');
  const t2 = JSON.parse(JSON.stringify(TEMPLATES.L2_MULTI_ZONE));
  t2.zones[1].crosses = [...t2.zones[1].crosses, 'ghost'];
  const v2 = validateTemplate(t2);
  ok(!v2.ok && v2.issues.some((s) => s.indexOf('不存在') >= 0), '反例「crosses 目标不存在」被拒绝');
  const t3 = JSON.parse(JSON.stringify(TEMPLATES.L2_MULTI_ZONE));
  t3.zones[1].crosses = ['core'];
  t3.zones[3].crosses = ['core', 'sideRight'];
  const v3 = validateTemplate(t3);
  ok(!v3.ok && v3.issues.some((s) => s.indexOf('未在 crosses 声明') >= 0), '反例「漏声明实际交叉遮挡」被拒绝');
  const t3b = JSON.parse(JSON.stringify(TEMPLATES.L2_MULTI_ZONE));
  t3b.zones[1].crosses = ['core', 'reserve', 'sideRight'];
  t3b.zones[2].crosses = ['core', 'reserve', 'sideLeft'];
  const v3b = validateTemplate(t3b);
  ok(!v3b.ok && v3b.issues.some((s) => s.indexOf('与实际几何不符') >= 0), '反例「声明幽灵交叉遮挡」被拒绝');
  const t3c = JSON.parse(JSON.stringify(TEMPLATES.L2_MULTI_ZONE));
  t3c.zones[1].crosses = ['core'];
  const v3c = validateTemplate(t3c);
  ok(!v3c.ok && v3c.issues.some((s) => s.indexOf('不对称') >= 0), '反例「交叉声明不对称」被拒绝');
  const t4 = JSON.parse(JSON.stringify(TEMPLATES.L2_MULTI_ZONE));
  t4.zones[0].crosses = ['sideLeft', 'sideRight', 'reserve', 'core'];
  ok(!validateTemplate(t4).ok, '反例「自己与自己交叉」被拒绝');
  let threw = 0;
  const bad1 = clone(); bad1.zones[0].origin[0] = [130, 440];
  try { clampTemplate(bad1); } catch (e) { threw++; }
  const bad2 = clone(); bad2.zones[0].plan[0] = 25;
  try { clampTemplate(bad2); } catch (e) { threw++; }
  const bad3 = clone(); bad3.zones[0].stack[1] = 0;
  try { clampTemplate(bad3); } catch (e) { threw++; }
  ok(threw === 3, 'clampTemplate 对 3 类非法输入全部 throw（不静默修正 / 不截断）');
  const cl = clampTemplate(TEMPLATES.L2_MULTI_ZONE);
  ok(JSON.stringify(cl.zones[0].origin) === JSON.stringify(TEMPLATES.L2_MULTI_ZONE.zones[0].origin)
    && JSON.stringify(cl.zones[0].plan) === JSON.stringify(TEMPLATES.L2_MULTI_ZONE.zones[0].plan),
    'clampTemplate 对合法模板不改坐标 / 不改牌数');
}

/* ---------------- [4] 旧路径关卡构造 ---------------- */
line('\n[4] 旧路径关卡构造：16 种 / 三倍数 / 证书 / verify / 三带边界（30 seed × 2 关）');
let certOk = 0, verifyOk = 0, kindsMin = 99, visibleMin = 999, visibleMax = 0;
for (let i = 0; i < GEO_SEEDS; i++) {
  const seed = (9000 + i * 2654435761) >>> 0;
  for (const level of [1, 2]) {
    const d = generateLevel(level, seed);
    const v = validateLevel(d);
    ok(v.ok, `旧 L${level} seed ${seed} validateLevel` + (v.ok ? '' : '：' + v.issues.join('；')));
    ok(verify(d), `旧 L${level} seed ${seed} 几何可解性 verify`);
    ok(d.certificate.ok, `旧 L${level} seed ${seed} 花色序列证书`);
    ok(replayTypes(d.typeSeq).ok, `旧 L${level} seed ${seed} 证书重放一致`);
    const kinds = Object.keys(d.typeCounts).length;
    kindsMin = Math.min(kindsMin, kinds);
    ok(kinds === 16, `旧 L${level} seed ${seed} 16 种牌型全出现（实测 ${kinds}）`);
    let tripleOk = true;
    for (const id of TYPE_IDS) if ((d.typeCounts[id] || 0) % 3 !== 0 || (d.typeCounts[id] || 0) === 0) tripleOk = false;
    ok(tripleOk, `旧 L${level} seed ${seed} 每种张数都是 3 的倍数且 >0`);
    const expect = level === 1 ? mixFor(1) : mixFor(2);
    let mixOk = true;
    for (let k = 0; k < TYPE_IDS.length; k++) if ((d.typeCounts[TYPE_IDS[k]] || 0) / 3 !== expect[k]) mixOk = false;
    ok(mixOk, `旧 L${level} seed ${seed} 张数分布与 LEVEL_MIX 一致`);
    const b = d.bands;
    ok(b.top[0] === 0 && b.mid[0] === b.top[1] && b.bottom[0] === b.mid[1] && b.bottom[1] === d.cards.length,
      `旧 L${level} seed ${seed} 三带连续且覆盖全部牌`);
    ok([b.top[1] - b.top[0], b.mid[1] - b.mid[0]].every((n) => n % 3 === 0),
      `旧 L${level} seed ${seed} 三带段长对齐 3 的倍数`);
    ok(d.degraded === false, `旧 L${level} seed ${seed} 未退化为安全序列`);
    certOk += d.certificate.ok ? 1 : 0;
    verifyOk += verify(d) ? 1 : 0;
    visibleMin = Math.min(visibleMin, d.visible);
    visibleMax = Math.max(visibleMax, d.visible);
  }
}
const l2sample = generateLevel(2, 9000);
line(`   旧 L2 seed 9000 三带边界 [${l2sample.bands.top.join(',')}] [${l2sample.bands.mid.join(',')}] [${l2sample.bands.bottom.join(',')}]`);
line(`   开局可点 ${l2sample.visible} 张 · 牌型 ${Object.keys(l2sample.typeCounts).length} 种 · 30×2 关可点范围 ${visibleMin}~${visibleMax}`);
line(`   证书通过 ${certOk}/60 · verify 通过 ${verifyOk}/60 · 最少牌型数 ${kindsMin}`);
ok(l2sample.crossOcclusion.pairs > 0 && l2sample.regions, '旧 L2 返回区域统计与跨区遮挡');

/* ---------------- [5] 分档 seed 池（第 5.1 节） ---------------- */
line('\n[5] 分档验收 seed 池（SEED_POOL[\'L2-<id>\'] / POOL_META）');
const POOL_KEYS = Object.keys(SEED_POOL);
ok(POOL_KEYS.length === LEVEL2_PROFILES.length, `10 个分档池（实测 ${POOL_KEYS.length}）`);
ok(POOL_META.version === VERSION, 'POOL_META.version 与 VERSION 一致');
ok(POOL_META.totalShort === 0, `全档合格种子零缺口（实测 ${POOL_META.totalShort}）`);
line('   档位  N  T  张数  候选/合格/录取  缺口  minPending最小  遮挡链最小  压深最小  耗时');
for (const p of LEVEL2_PROFILES) {
  const key = 'L2-' + p.id;
  const list = SEED_POOL[key];
  const m = POOL_META.profiles[key];
  ok(Array.isArray(list) && list.length >= 40, `${key} 池 ≥40 个种子（实测 ${list ? list.length : '缺失'}）`);
  ok(Array.isArray(list) && new Set(list).size === list.length, `${key} 池内 seed 无重复`);
  ok(!!m && m.accepted === list.length && m.target === 40 && m.short === 0,
    `${key} POOL_META 录取数 / 目标 / 缺口一致`);
  ok(!!m && m.badPendingSeeds === 0, `${key}「minPending ≤ 4 的种子数 = 0」（实测 ${m ? m.badPendingSeeds : '缺失'}）`);
  ok(!!m && m.solvableOk === true && m.solvableDeviation <= 0.03,
    `${key} SOLVABLE_SHARE 偏差 ≤3%（实测 ${m ? (m.solvableDeviation * 100).toFixed(2) + '%' : '缺失'}）`);
  ok(pickPoolSeed(2, p.id, () => 0) === list[0], `${key} pickPoolSeed 只从当前档位池取值`);
  line(`   ${key.padEnd(6)} ${String(p.layers).padStart(2)} ${String(p.types).padStart(2)} ${String(p.mainCount + p.queueCount).padStart(5)}`
    + `   ${String(m ? m.candidates : '-').padStart(3)}/${String(m ? m.gatePass : '-').padStart(3)}/${String(m ? m.accepted : '-').padStart(3)}`
    + `      ${String(m ? m.short : '-').padStart(2)}       ${String(m ? m.minPendingMin : '-').padStart(3)}`
    + `          ${String(m ? m.chainMin : '-').padStart(3)}        ${String(m ? m.avgPressDepthMin : '-').padStart(6)}`
    + `   ${m ? (m.ms / 1000).toFixed(1) + 's' : '-'}`);
}
line(`   tune_pool 总耗时 ${(POOL_META.generateMs / 1000).toFixed(1)}s · 每档候选 ${POOL_META.candidatesPerProfile} · 目标 ${POOL_META.targetPerProfile} · 总缺口 ${POOL_META.totalShort}`);

/* ---------------- [6] 引擎规则 ---------------- */
line('\n[6] 槽位 / 三消 / 道具规则');
const mk = (type, id) => ({ id, type, state: 'board', x: 0, y: 0, w: TILE_W, h: TILE_H, z: 0, blocked: false });
let slot = [];
slotInsert(slot, mk('sparrow', 1));
slotInsert(slot, mk('sparrow', 2));
ok(slot.length === 2 && slotMatchTypes(slot).length === 0, '两张同型不消除');
ok(resolveSlot(slot).length === 0 && slot.length === 2, '两张同型 resolveSlot 不移除任何牌');
slotInsert(slot, mk('sparrow', 3));
ok(slotMatchTypes(slot).indexOf('sparrow') >= 0, '三张同型触发消除');
const removed3 = resolveSlot(slot);
ok(removed3.length === 3, 'resolveSlot 恰好移除 3 张（实测 ' + removed3.length + '）');
ok(removed3.every((c) => c.type === 'sparrow'), '移除的都是目标花色');
ok(slot.length === 0, '消除后槽位清空');
let slotMix = [];
slotInsert(slotMix, mk('sparrow', 11));
slotInsert(slotMix, mk('red-centre', 12));
slotInsert(slotMix, mk('sparrow', 13));
slotInsert(slotMix, mk('red-centre', 14));
slotInsert(slotMix, mk('sparrow', 15));
const removedMix = resolveSlot(slotMix);
ok(removedMix.length === 3 && slotMix.length === 2 && slotMatchTypes(slotMix).length === 0,
  '混合槽只消除满三的花色，余牌保留');
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

/* ---------------- [7] 静态档位表（第 1 / 2.5 节） ---------------- */
line('\n[7] 两关静态档位表 / 层张数插值 / levelParams');
ok(LEVEL2_PROFILES.length === 10, 'LEVEL2_PROFILES 恰好 10 个预设');
ok(LEVEL1_PROFILES.length === 4, 'LEVEL1_PROFILES 恰好 4 个预设');
ok(LEVEL2_PROFILES.every((p, i) => p.id === i), 'L2 档位 id 连续 0..9');
ok(LEVEL1_PROFILES.every((p, i) => p.id === i), 'L1 档位 id 连续 0..3');
const large = LEVEL2_PROFILES.filter((p) => p.kind === 'large');
const lite = LEVEL2_PROFILES.filter((p) => p.kind === 'lite');
ok(large.length === 8 && lite.length === 2, 'L2 大盘档 8 个 + 轻量档 2 个');
ok(Math.abs(large.reduce((a, p) => a + p.weight, 0) - 0.70) < 1e-9
  && Math.abs(lite.reduce((a, p) => a + p.weight, 0) - 0.30) < 1e-9,
  '大盘档 weight 合计 0.70 / 轻量档合计 0.30');
ok(new Set(large.map((p) => p.layers)).size >= 5, `大盘档 layers 至少 5 种取值（实测 ${new Set(large.map((p) => p.layers)).size}）`);
ok(new Set(large.map((p) => p.types)).size >= 3, `大盘档 types 至少 3 种取值（实测 ${new Set(large.map((p) => p.types)).size}）`);
ok(large.some((p) => p.layers === 28 && p.types === 15 && p.mainCount + p.queueCount === 321),
  '包含原作基准档 (28 层, 15 种, 321 张)');
ok(large.every((p) => p.queueCount === 44 && Math.abs(p.mainCount - Math.round(9.9 * p.layers)) <= 3),
  '大盘档 mainCount = round(9.9·N) ±3（对齐 3 的倍数）');
ok(large.every((p) => {
  const total = p.mainCount + p.queueCount;
  const G = total / 3;
  const ratio = G / p.types;
  return total % 3 === 0 && G === p.groups && ratio >= 6.5 && ratio <= 8.0;
}), '大盘档 总数 %3==0、G/T ∈ [6.5, 8.0]、groups = G');
ok(large.every((p) => {
  const G = p.groups;
  const lo = Math.floor(G / p.types), hi = lo + 1;
  return p.groupsPerType.length === p.types
    && p.groupsPerType.every((n) => n === lo || n === hi)
    && p.groupsPerType.reduce((a, b) => a + b, 0) === G;
}), '大盘档 每种花色组数只取 floor/ceil(G/T)，相差 ≤1 且总和 = G');
ok(lite.some((p) => p.layers === 15 && p.types === 15 && p.mainCount === 148
  && p.queueCount === 44 && p.groups === 64
  && p.groupsPerType.filter((n) => n === 4).length === 11
  && p.groupsPerType.filter((n) => n === 5).length === 4),
  '轻量档 A：192 张 = 64 组 / 15 种 / 11×4 + 4×5 / 148+44 / 15 层');
ok(lite.some((p) => p.layers === 20 && p.types === 15 && p.mainCount === 211
  && p.queueCount === 44 && p.groups === 85
  && p.groupsPerType.filter((n) => n === 6).length === 10
  && p.groupsPerType.filter((n) => n === 5).length === 5),
  '轻量档 B：255 张 = 85 组 / 15 种 / 10×6 + 5×5 / 211+44 / 20 层（按确认值实现）');
const configSrcForProfile = readFileSync(ROOT + 'src/game/config.js', 'utf8');
ok(/9\.9 张\/层估算|按 9\.9 张\/层/.test(configSrcForProfile), 'config 注释标明轻量档层数系 9.9 张/层估算，非原作数据');
const l1Spec = [[2, 8, 24], [3, 10, 30], [3, 12, 36], [3, 16, 48]];
ok(LEVEL1_PROFILES.every((p, i) => p.layers === l1Spec[i][0] && p.types === l1Spec[i][1]
  && p.mainCount === l1Spec[i][2] && p.queueCount === 0 && p.groups === p.types
  && p.groupsPerType.length === p.types && p.groupsPerType.every((n) => n === 1)
  && p.weight === 0.25), 'L1 四档：2/8/24、3/10/30、3/12/36、3/16/48，每种 1 组、权重各 0.25');
ok(LEVEL1_PROFILES[0].layers === 2 && layerPlanFor(LEVEL1_PROFILES[0]).every((n, i, a) => i === 0 || a.length === 2),
  'L1 2 层档使用 60/40 曲线');
ok(RETRY_KEEPS_PROFILE === false, 'config.RETRY_KEEPS_PROFILE = false（重开本关重抽档位）');
ok(profilesFor(1) === LEVEL1_PROFILES && profilesFor(2) === LEVEL2_PROFILES, 'profilesFor(level) 返回对应静态表');
ok(profileFor(2, 99).id === 0 && profileFor(1, -1).id === 0, 'profileFor 非法 id 回退到该关第 0 档');
for (const p of [...LEVEL2_PROFILES, ...LEVEL1_PROFILES]) {
  const plan = layerPlanFor(p);
  const sum = plan.reduce((a, b) => a + b, 0);
  ok(plan.length === p.layers && sum === p.mainCount && plan.every((n) => n >= 1),
    `${p.kind === 'l1' ? 'L1' : 'L2'}-${p.id} 层计划 ${p.layers} 层 / 合计 ${p.mainCount} / 每层 ≥1`);
  const par = levelParams(p.kind === 'l1' ? 1 : 2, Math.random, p.id);
  ok(par.cardCount === p.mainCount + p.queueCount && par.layers === p.layers
    && par.types === p.types && par.groups === p.groups && par.profileId === p.id,
    `${p.kind === 'l1' ? 'L1' : 'L2'}-${p.id} levelParams 从档位读取张数 / 层数 / 牌种数`);
  const gpt = groupsPerTypeFor(p.kind === 'l1' ? 1 : 2, p);
  ok(gpt && gpt.length === 16 && gpt.reduce((a, b) => a + b, 0) === p.groups,
    `${p.kind === 'l1' ? 'L1' : 'L2'}-${p.id} groupsPerTypeFor 补齐为 16 长度配额`);
}
ok(LEVEL1_PROFILES.every((p) => {
  const plan = layerPlanFor(p);
  const t = plan.reduce((a, b) => a + b, 0);
  return plan.length === 2
    ? Math.abs(plan[0] / t - 0.60) < 0.02
    : Math.abs(plan[0] / t - 0.50) < 0.02 && Math.abs(plan[1] / t - 0.33) < 0.02;
}), 'L1 层张数 2 层 60/40、3 层 50/33/17（±2%）');
for (const p of LEVEL2_PROFILES) {
  const desc = describeProfileLayout(p);
  ok(desc.globalLayers === p.layers + 8 && desc.total === p.mainCount + p.queueCount,
    `L2-${p.id} 布局说明：全局层 ${p.layers}+8、总张数来自档位`);
}
ok(generateProfileLayout(12345, LEVEL2_PROFILES[0]).length === LEVEL2_PROFILES[0].mainCount + 44,
  'generateProfileLayout 张数 = 档位 mainCount + queueCount');

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
  'Rust 已删除前端自删除命令与自删脚本');
ok(!/\.plugin\(\s*tauri_plugin_fs::init\(\)\s*\)/.test(rust), 'Rust 不再注册 fs 插件');
ok(!/^\s*tauri-plugin-fs\s*=/m.test(read('src-tauri/Cargo.toml')), 'Cargo.toml 已移除 fs 插件依赖');
ok(tconf.version === VERSION && pkg.version === VERSION, 'Tauri / npm 版本号 = ' + VERSION);
ok(tconf.bundle && Array.isArray(tconf.bundle.targets) && tconf.bundle.targets.indexOf('nsis') >= 0,
  'bundle.targets 含 NSIS（正式安装版）');
ok(tconf.bundle && tconf.bundle.windows && tconf.bundle.windows.nsis
  && tconf.bundle.windows.nsis.installMode === 'currentUser',
  'NSIS 配置 installMode=currentUser');
ok(tconf.mainBinaryName === 'MahLeMah', 'mainBinaryName = MahLeMah（Portable 单文件名）');
ok(pkg.scripts && pkg.scripts['build:portable'] && pkg.scripts['build:nsis'],
  'package.json 提供 build:portable / build:nsis 两条独立构建链');
ok(!/background:\s*#191009|#2a1c13|#150e09/.test(css + legacy), '网页版 / 兼容版背景已换成暖白');
ok(/FFFDF6|FFF9EC|F7EEDC/.test(css), 'styles.css 使用暖白 / 奶油底');
ok(Object.keys(TILE_TYPES).length === 16, '注册表类型可用于静态检查');
let labelCovered = true;
for (const t of TILE_TYPES) if (dom.indexOf("'" + t.id + "'") < 0) labelCovered = false;
ok(labelCovered, 'ES5 降级视图内嵌了全部 16 种牌型标签');
ok(!/\buninstallGame\s*\(/.test(read('src/main.js') + read('src/game/store.js')),
  '前端不再调用自删除 IPC');

/* ---- [8b] Rust 存档接口安全加固 + p1/p2（第 4.2 节） ---- */
line('\n[8b] Rust 存档加固 / p1-p2 白名单 / 生产音频配置（仅音效）');
ok(/MAX_SAVE_BYTES[^=]*=\s*(64\s*\*\s*1024|65536)/.test(rust), 'save_state 设置 64 KB 大小上限');
ok(/serde_json::from_str/.test(rust) && /serde_json\s*=/.test(read('src-tauri/Cargo.toml')),
  'save_state 用 serde_json 做 JSON 合法性校验');
ok(/SAVE_FIELDS/.test(rust) && ['"v"', '"level"', '"best"', '"sound"', '"sfxVol"', '"music"', '"musicVol"', '"p1"', '"p2"', '"level1RecentGames"', '"level2RecentGames"'].every((f) => rust.indexOf(f) >= 0),
  'SAVE_FIELDS 白名单 11 个字段：含新增的两关历史');
ok(/const SAVE_FIELDS:\s*\[&str;\s*11\]/.test(rust), 'SAVE_FIELDS 数组长度声明为 11');
ok(/RECORD_FIELDS:\s*\[&str;\s*12\]/.test(rust) && /GENERATION_REASONS:\s*\[&str;\s*4\]/.test(rust),
  'Rust 定义历史记录字段白名单与 4 种 generationReason');
ok(/fn validate_history_field/.test(rust) && /HISTORY_LIMIT:\s*usize = 3/.test(rust)
  && /最多 \{HISTORY_LIMIT\}|最多 3 条/.test(rust),
  'Rust 对两关历史做 ≤3 条、字段完整、签名格式等校验');
ok(/validate_history_field\(obj, "level1RecentGames"\)/.test(rust)
  && /validate_history_field\(obj, "level2RecentGames"\)/.test(rust),
  'Rust 分别校验 level1RecentGames / level2RecentGames（关卡隔离）');
ok(/for key in \["p1", "p2"\]/.test(rust) && /if let Some\(val\) = obj\.get\(key\)/.test(rust)
  && /as_i64\(\)/.test(rust) && /\(0\.\.=63\)\.contains\(&n\)/.test(rust),
  'Rust 对 p1/p2 做「存在才校验」+ 整数 + 0..=63 范围校验，旧档缺字段不判非法');
ok(/validate_save_json/.test(rust) && /fn save_state\(data: String\)/.test(rust),
  'save_state 先校验后写入，且不接受任何路径参数');
ok(/save\.json\.tmp/.test(rust) && /fs::rename/.test(rust), 'save_state 保持原子写入（tmp + rename）');
ok(/v != 1 && v != 2 && v != 3/.test(rust), 'save_state 校验存档版本 v ∈ {1,2,3}（v3 含两关历史，旧档仍兼容）');
{
  // 语义复刻：把 Rust 的 p1/p2 校验规则在 JS 里跑一遍真实边界值
  const rustP = (raw) => {
    if (!('p1' in raw) && !('p2' in raw)) return true;           // 旧档缺字段 → 合法
    for (const key of ['p1', 'p2']) {
      if (!(key in raw)) continue;
      const n = raw[key];
      if (!Number.isInteger(n)) return false;                    // as_i64 失败
      if (n < 0 || n > 63) return false;                         // 0..=63
    }
    return true;
  };
  ok(rustP({ v: 2, level: 1, best: 2, sound: true, sfxVol: 1 }), 'Rust 规则：旧档无 p1/p2 → 合法');
  ok(rustP({ p1: 0, p2: 63 }), 'Rust 规则：p1=0 / p2=63 边界合法');
  ok(!rustP({ p1: 64 }) && !rustP({ p2: -1 }), 'Rust 规则：p1=64 / p2=-1 越界被拒');
  ok(!rustP({ p1: 1.5 }) && !rustP({ p2: '3' }), 'Rust 规则：非整数 p1/p2 被拒');
  ok(rustP({ p1: 3 }), 'Rust 规则：只提供 p1 也合法（p2 缺省）');
}

const audioSrc = read('src/game/audio.js');
const mainSrc = read('src/main.js');
const renderSrc = read('src/game/render.js');
const engineSrc = read('src/game/engine.js');
const configSrc = read('src/game/config.js');
const prodSrc = mainSrc + audioSrc + renderSrc + engineSrc + configSrc;

const bgmFiles = ['src/game/music.js', 'src/game/music_tracks.js', 'src/game/music_composer.js'];
ok(bgmFiles.every((f) => !existsSync(ROOT + f)),
  '生产源码目录已彻底移除 BGM 引擎 / 曲谱 / 作曲器（3 个文件均不存在）');
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
ok(!/getMusic|music\.js|music_tracks|music_composer|MUSIC_BTN|bgmOn|bgmVol|iconMusic/.test(codeOnly(prodSrc)),
  '入口 / 渲染 / 音效 / 引擎 / 配置均不再引用任何背景音乐模块或状态');
ok(/setEnabled/.test(audioSrc) && /setVolume/.test(audioSrc) && /new AC\(\)/.test(audioSrc),
  '音效引擎保留独立开关 / 音量，并自建唯一 AudioContext');
ok(/sound\.ensure\(\)/.test(mainSrc) && /首次用户手势/.test(audioSrc),
  '音效遵守自动播放策略：首次用户手势后才创建 AudioContext');
{
  const audioExt = /\.(mp3|wav|ogg|m4a|flac|aac|wma)$/i;
  const skip = new Set(['node_modules', '.build', '.git', 'target-gnu', '.shots', '.workbuddy']);
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 4 || found.length) return;
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of entries) {
      if (skip.has(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (audioExt.test(e.name)) found.push(p);
    }
  };
  walk(ROOT.replace(/\/[A-Za-z]:/, (m) => m.slice(1)).replace(/\/$/, ''), 0);
  ok(found.length === 0, '工程不含外部音频文件，全部实时合成' + (found.length ? '：' + found.join(',') : ''));
}
ok(!/new Audio\s*\(|new AudioBuffer/.test(audioSrc + mainSrc),
  '音效不加载任何音频文件对象（全部 Web Audio 实时合成）');
ok(/set-sfx/.test(mainSrc) && /drawSettingsPanel/.test(renderSrc)
    && !/set-bgm|set-next-track|'music'|♪|背景音乐/.test(mainSrc),
  '设置面板只保留音效控制；音乐开关 / 换一首 / 音乐图标全部移除');
ok(!/set-bgm|set-next-track|'music'|iconMusic|trackInfo|bgmVol/.test(renderSrc),
  '渲染层不再绘制音乐按钮 / 图标 / 曲目信息');
ok(!/music:\s*game\.bgmOn/.test(mainSrc) && !/saved\.music/.test(mainSrc)
    && /"music"/.test(rust) && /"musicVol"/.test(rust),
  '前端不再写入音乐设置，Rust 白名单仍兼容旧存档的 music / musicVol 字段');

/* ---- [8c] 最终生产包：零 BGM，仅音效 ---- */
line('\n[8c] 生产包零 BGM / 仅音效');
ok(/createBiquadFilter/.test(audioSrc) && /highpass/.test(audioSrc) && /HP_HZ\s*=\s*1600/.test(audioSrc),
  '音效链路就位：master → 1600Hz 高通 → destination');
ok(/SFX_LEVEL\s*=\s*0\.10/.test(audioSrc) && /freq:\s*(1900|2100|2200)/.test(audioSrc),
  '音效仍是极轻的高频反馈（0.10 电平 / 1.8–4.2kHz）');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const audioCode = stripComments(audioSrc);
ok(!/_duck\s*\(/.test(audioCode) && !/\.duck\s*\(/.test(audioCode)
    && !/getSfxBus|getContext|createDynamicsCompressor/.test(audioCode),
  '音效引擎完全独立：无闪避、无共享总线、无压缩器');
ok(!/setInterval|_startTimer|_tick\s*\(/.test(audioCode + stripComments(mainSrc)),
  '生产代码不再有音乐调度定时器');
const distNames = ['dist/index.html', 'dist/MahLeMah.html', 'dist/Mah了个Mah.html', 'dist/MahLeMah-legacy.html'];
const distHtml = distNames.filter((f) => existsSync(ROOT + f)).map((f) => read(f));
ok(distHtml.length === 4, '四个生产网页版产物齐全（含 IE8 兼容版）');
const BGM_MARKERS = ['原创即兴', '♪ 换一首', '♪ 本次即兴', 'musicBus', 'trackGain', 'composeLibrary', 'getMusic', 'sessionSeed'];
for (let i = 0; i < distHtml.length; i++) {
  const hits = BGM_MARKERS.filter((m) => distHtml[i].indexOf(m) >= 0);
  ok(hits.length === 0, distNames[i] + ' 不含任何背景音乐代码' + (hits.length ? '（残留：' + hits.join(',') + '）' : ''));
  ok(distHtml[i].indexOf('createOscillator') >= 0 && distHtml[i].indexOf('声音设置') >= 0,
    distNames[i] + ' 保留音效合成与「声音设置」面板');
}

/* [8c-2] 运行时音频回归 */
{
  const soundMod = await import(new URL('./src/game/audio.js', import.meta.url).href);
  let oscStarts = 0;
  let ctxCount = 0;
  class P { constructor(v){ this.value = v; } setValueAtTime(_, v){ this.value = v; } exponentialRampToValueAtTime(v){ this.value = Math.max(0.0001, v); } }
  class G { constructor(){ this.gain = new P(1); this.ins = []; } connect(n){ this.ins.push(n); } }
  class N { constructor(){ this.frequency = new P(440); this.Q = new P(1); this.buffer = null; this.ins = []; } connect(n){ this.ins.push(n); } start(){} stop(){} }
  class O { constructor(){ this.frequency = new P(440); } connect(n){ this.dest = n; } start(){ oscStarts++; } stop(){} }
  class Ctx {
    constructor(){ ctxCount++; this.state = 'running'; this.currentTime = 0; this.sampleRate = 44100; this.destination = new G(); }
    createGain(){ return new G(); }
    createBiquadFilter(){ return new N(); }
    createOscillator(){ return new O(); }
    createBuffer(_c, len){ return { getChannelData(){ return new Float32Array(len); } }; }
    createBufferSource(){ return new N(); }
    resume(){ return Promise.resolve(); }
  }
  globalThis.window = { AudioContext: Ctx };
  const s = new soundMod.Sound();
  s.click(); s.pick(); s.match(); s.click(); s.pick(); s.win(); s.lose(); s.shuffle(); s.deny();
  ok(oscStarts >= 10, '无音乐模块时点击 / 消除 / 道具 / 胜负音效仍真实发声（' + oscStarts + ' 个音源启动）');
  ok(ctxCount === 1 && s.ctx instanceof Ctx, '音效自建且全局只有一个 AudioContext');
  ok(!!s.master && s.master.ins.includes(s.hp) && s.hp.ins.includes(s.ctx.destination),
    '音效链路正确：master → 1600Hz 高通 → destination');
  ok(s.hp.frequency.value === 1600 && Math.abs(s.master.gain.value - 0.10) < 1e-9,
    '音效电平 0.10 / 高通 1600Hz 生效');
  s.setEnabled(false);
  const muted = s.master.gain.value === 0;
  s.setEnabled(true); s.setVolume(0.5);
  ok(muted && Math.abs(s.master.gain.value - 0.05) < 1e-9, '音效独立开关与独立音量真实生效');
  s.setVolume(0); s.click();
  ok(s.master.gain.value === 0, '音量归零后点击不再产生任何音频输出');
  delete globalThis.window;
}

/* ---------------- [9] 运行时生成耗时 ---------------- */
line('\n[9] 运行时生成耗时');
const t0 = Date.now();
const N_GEN = 20;
for (let i = 0; i < N_GEN; i++) generateLevel(2, (31000 + i * 7919) >>> 0, { profile: i % 10 });
const genMs = (Date.now() - t0) / N_GEN;
line(`   L2 分档生成 ${N_GEN} 次 · 平均 ${genMs.toFixed(2)} ms/局`);
soft(genMs < 400, `单局生成 < 400ms（实测 ${genMs.toFixed(2)}ms）`);

/* ---------------- [10] 分档关卡构造与几何（第 5.2 节结构部分） ---------------- */
line('\n[10] 分档关卡构造与几何验收（10 个 L2 档位 × 40 个池内 seed + 4 个 L1 档位）');
const L2_LEVELS = {};
const tGeo = Date.now();
for (const p of LEVEL2_PROFILES) {
  const key = 'L2-' + p.id;
  const seeds = SEED_POOL[key];
  const levels = [];
  const errs = [];
  let visMin = 999, visMax = 0, pressMin = Infinity, chainMin = Infinity;
  for (const seed of seeds) {
    const d = generateLevel(2, seed, { profile: p.id });
    levels.push({ seed, data: d });
    const v = validateLevel(d);
    if (!v.ok) errs.push(`${seed}:validate:${v.issues.join('/')}`);
    if (!verify(d) || !d.certificate.ok) errs.push(`${seed}:cert/verify`);
    if (d.cards.length !== p.mainCount + p.queueCount) errs.push(`${seed}:张数${d.cards.length}`);
    if (Object.keys(d.typeCounts).length !== p.types) errs.push(`${seed}:种类${Object.keys(d.typeCounts).length}`);
    const quota = mixFor(2, p);
    for (let i = 0; i < TYPE_IDS.length; i++) {
      const n = d.typeCounts[TYPE_IDS[i]] || 0;
      if (n !== quota[i] * 3) errs.push(`${seed}:${TYPE_IDS[i]}=${n}≠${quota[i] * 3}`);
    }
    if (d.visible < 19 || d.visible > 25) errs.push(`${seed}:可点${d.visible}`);
    if (!isHalfLattice(d.cards)) errs.push(`${seed}:晶格`);
    if (countComponents(d.cards) !== 1) errs.push(`${seed}:连通`);
    if (sameLayerOverlapCount(d.cards) !== 0) errs.push(`${seed}:同层重叠`);
    if (!d.crossOcclusion || d.crossOcclusion.pairs <= 0) errs.push(`${seed}:跨区遮挡`);
    const press = pressureStats(d.cards).avgPressDepth;
    const chain = longestChain(d.cards, d._graph || buildBlockerGraph(d.cards));
    if (press < 0.28 * p.layers) errs.push(`${seed}:压深${press.toFixed(2)}<${(0.28 * p.layers).toFixed(2)}`);
    if (chain < p.layers - 8) errs.push(`${seed}:链${chain}<${p.layers - 8}`);
    visMin = Math.min(visMin, d.visible); visMax = Math.max(visMax, d.visible);
    pressMin = Math.min(pressMin, press); chainMin = Math.min(chainMin, chain);
  }
  L2_LEVELS[p.id] = levels;
  ok(errs.length === 0, `${key} 40 个池内 seed 全部通过结构/几何/配额验收（异常 ${errs.length}${errs.length ? '：' + errs.slice(0, 3).join('；') : ''}）`);
  ok(visMin >= 19 && visMax <= 25, `${key} 开局可点 19–25 张（实测 ${visMin}~${visMax}）`);
  ok(pressMin >= 0.28 * p.layers, `${key} 平均压深 ≥ 0.28·N=${(0.28 * p.layers).toFixed(2)}（实测最小 ${pressMin.toFixed(2)}）`);
  ok(chainMin >= p.layers - 8, `${key} 最长遮挡链 ≥ N−8=${p.layers - 8}（实测最小 ${chainMin}）`);
  line(`   ${key} N=${String(p.layers).padStart(2)} T=${String(p.types).padStart(2)} 张=${String(p.mainCount + p.queueCount).padStart(3)}`
    + ` · 可点 ${visMin}~${visMax} · 压深 ≥${pressMin.toFixed(2)} · 链 ≥${chainMin} · 全局层 ${p.layers + 8}`);
}
for (const p of LEVEL1_PROFILES) {
  const errs = [];
  for (let i = 0; i < 40; i++) {
    const seed = (7000 + i * 2654435761) >>> 0;
    const d = generateLevel(1, seed, { profile: p.id });
    const v = validateLevel(d);
    if (!v.ok) errs.push(`${seed}:${v.issues.join('/')}`);
    if (!verify(d) || !d.certificate.ok) errs.push(`${seed}:cert/verify`);
    if (d.cards.length !== p.mainCount) errs.push(`${seed}:张数${d.cards.length}`);
    if (Object.keys(d.typeCounts).length !== p.types) errs.push(`${seed}:种类`);
    const quota = mixFor(1, p);
    for (let k = 0; k < TYPE_IDS.length; k++) {
      if ((d.typeCounts[TYPE_IDS[k]] || 0) !== quota[k] * 3) errs.push(`${seed}:配额`);
    }
    if (!isHalfLattice(d.cards) || sameLayerOverlapCount(d.cards) !== 0) errs.push(`${seed}:几何`);
  }
  ok(errs.length === 0, `L1-${p.id} 40 个 seed 全部通过结构 / 配额验收（异常 ${errs.length}${errs.length ? '：' + errs.slice(0, 2).join('；') : ''}）`);
}
line(`   几何验收耗时 ${((Date.now() - tGeo) / 1000).toFixed(1)}s`);

/* ---------------- [11] 分档机器人难度验收（第 5.2 节统计部分） ---------------- */
line('\n[11] 分档机器人难度验收（每档 5 种机器人各 400 局，池内种子循环 10 轮）');
line('   说明：greedy 单独用于第 5.2 节「4 个第一关档位 greedy ≥95%」，L2 的 5 种机器人取其余 5 种。');
const DIFF_MODES = ['random', 'noisy', 'lookahead', 'montecarlo', 'search'];
// 正式验收固定 10 轮 × 40 个池内 seed = 400 局 / 档 / 机器人（规格 5.2 下限）。
// MAH_REPS 只用于本地开发自检；正式运行必须不带该环境变量，否则局数断言会如实标 ✗。
const REPS = Math.max(1, parseInt(process.env.MAH_REPS || '10', 10) || 10);
line(`   池内种子循环 ${REPS} 轮 × 40 seed = ${REPS * 40} 局 / 档 / 机器人${process.env.MAH_REPS ? '（开发自检模式，非交付输出）' : ''}`);
const tSim = Date.now();
const totalByMode = {};
for (const m of DIFF_MODES) totalByMode[m] = { n: 0, wins: 0 };
let allN = 0, allWins = 0;
for (const p of LEVEL2_PROFILES) {
  const key = 'L2-' + p.id;
  const levels = L2_LEVELS[p.id];
  let pooledN = 0, pooledWins = 0;
  const row = [];
  for (let mi = 0; mi < DIFF_MODES.length; mi++) {
    const mode = DIFF_MODES[mi];
    let n = 0, wins = 0;
    for (let rep = 0; rep < REPS; rep++) {
      for (let si = 0; si < levels.length; si++) {
        const { seed, data } = levels[si];
        const rngSeed = (seed ^ 0xabcdef ^ (mi * 0x9e3779b9) ^ (rep * 0x85ebca6b)) >>> 0;
        if (simulateRobot(data, makeRng(rngSeed), { mode }).win) wins++;
        n++;
      }
    }
    ok(n >= 400, `${key} ${mode} 局数 ≥400（实测 ${n}）`);
    totalByMode[mode].n += n; totalByMode[mode].wins += wins;
    pooledN += n; pooledWins += wins;
    allN += n; allWins += wins;
    row.push(mode + ' ' + pct(wins / n) + '(' + wins + ')');
    if (mode === 'random') ok(wins / n <= 0.001, `${key} random 通关率 ≤0.1%（实测 ${pct(wins / n)}）`);
  }
  const upper = wilsonUpper(pooledWins, pooledN);
  ok(upper <= 0.03, `${key} 每档通关率 95% Wilson 上界 ≤3%（实测 ${pct(upper)}， pooled ${pooledWins}/${pooledN}）`);
  line(`   ${key} N=${String(p.layers).padStart(2)} T=${String(p.types).padStart(2)} | ` + row.join(' | '));
  line(`        pooled 通关率 ${pct(pooledWins / pooledN)} · 95% Wilson 上界 ${pct(upper)} · 阈值 ≤3% ${upper <= 0.03 ? '✓' : '✗'}`);
}
line('   全档合计：');
for (const m of DIFF_MODES) {
  const t = totalByMode[m];
  ok(t.n >= 4000, `${m} 全档合计 ≥4000 局（实测 ${t.n}）`);
  line(`     ${m.padEnd(12)} ${String(t.n).padStart(5)} 局 · 通关 ${String(t.wins).padStart(5)} · 通关率 ${pct(t.wins / t.n)} · Wilson 上界 ${pct(wilsonUpper(t.wins, t.n))}`);
}
const allUpper = wilsonUpper(allWins, allN);
ok(allUpper <= 0.01, `全档合计通关率 95% Wilson 上界 ≤1%（实测 ${pct(allUpper)}， ${allWins}/${allN}）`);
line(`     合计 ${allN} 局 · 通关 ${allWins} · 通关率 ${pct(allWins / allN)} · 95% Wilson 上界 ${pct(allUpper)} · 阈值 ≤1% ${allUpper <= 0.01 ? '✓' : '✗'}`);
line(`   机器人仿真耗时 ${((Date.now() - tSim) / 1000).toFixed(1)}s`);

line('\n[11b] 4 个第一关档位 greedy 通关率 ≥95%（每档 400 局）');
for (const p of LEVEL1_PROFILES) {
  let wins = 0;
  for (let i = 0; i < 400; i++) {
    const seed = (7000 + i * 2654435761) >>> 0;
    const d = generateLevel(1, seed, { profile: p.id });
    if (simulateRobot(d, makeRng((seed ^ 0xabcdef) >>> 0), { mode: 'greedy' }).win) wins++;
  }
  const rate = wins / 400;
  ok(rate >= 0.95, `L1-${p.id} greedy 通关率 ≥95%（实测 ${pct(rate)}， ${wins}/400）`);
  line(`   L1-${p.id} ${p.layers} 层 / ${p.types} 种 / ${p.mainCount} 张 · greedy ${pct(rate)} (${wins}/400)`);
}

/* ---------------- [12] 抽取 / 重开 / 通关 / 存档（第 5.3 节） ---------------- */
line('\n[12] rollProfile / 100 次重开 / 通关流程 / 旧存档（第 5.3 节）');
const realInfo = console.info;
console.info = () => {}; // 屏蔽 engine 的每局复现日志，避免刷屏
try {
  for (const lv of [1, 2]) {
    let cur = 0, same = 0;
    for (let i = 0; i < 200; i++) {
      const n = rollProfile(lv, Math.random, cur);
      if (n === cur) same++;
      cur = n;
    }
    ok(same === 0, `L${lv} rollProfile 连续 200 次每次都 ≠ 上一次（重复 ${same}）`);
  }
  for (const lv of [1, 2]) {
    let cur = 0;
    const hits = {};
    let light = 0;
    for (let i = 0; i < 2000; i++) {
      const n = rollProfile(lv, Math.random, cur);
      hits[n] = 1;
      if (lv === 2 && n >= 8) light++;
      cur = n;
    }
    const expected = lv === 1 ? 4 : 10;
    ok(Object.keys(hits).length === expected, `L${lv} 抽 2000 次后 ${expected} 个档位都出现过（实测 ${Object.keys(hits).length}）`);
    if (lv === 2) {
      const share = light / 2000;
      ok(share >= 0.25 && share <= 0.35, `L2 轻量档占比 30%±5%（实测 ${pct(share)}）`);
    }
  }

  // 100 次连续重开本关：档位每次都变；seed 始终来自「当前档位」的分库
  {
    const g = new Game(null);
    g.startLevel(2, SEED_POOL['L2-0'][0]);
    let changed = 0, poolOk = 0;
    for (let i = 0; i < 100; i++) {
      const before = g.profile.l2;
      g.restartLevel(Math.random);
      if (g.profile.l2 !== before) changed++;
      const key = 'L2-' + g.profile.l2;
      if (SEED_POOL[key] && SEED_POOL[key].indexOf(g.seed) >= 0) poolOk++;
    }
    ok(changed === 100, `L2 连续 100 次「重开本关」档位每次都变化（实测 ${changed}/100）`);
    ok(poolOk === 100, `重开后 seed 只来自当前档位分库（实测 ${poolOk}/100）`);
    line(`   L2 100 次重开：档位变化 ${changed}/100 · seed 命中当前档位池 ${poolOk}/100`);
  }

  // RETRY_KEEPS_PROFILE=true：档位保持不变、seed 每次都变（第 1 关 seed 为随机源，可验证）
  {
    setRetryKeepsProfile(true);
    ok(RETRY_KEEPS_PROFILE === true, 'RETRY_KEEPS_PROFILE 是 ESM live binding，setter 生效');
    const g = new Game(null);
    g.startLevel(1, 12345);
    const before = { ...g.profile };
    let prevSeed = g.seed, seedChanged = 0, profileSame = 0;
    for (let i = 0; i < 100; i++) {
      g.restartLevel(Math.random);
      if (g.profile.l1 === before.l1 && g.profile.l2 === before.l2) profileSame++;
      if (g.seed !== prevSeed) seedChanged++;
      prevSeed = g.seed;
    }
    ok(profileSame === 100, `RETRY_KEEPS_PROFILE=true 时 100 次重开档位保持不变（实测 ${profileSame}/100）`);
    ok(seedChanged === 100, `RETRY_KEEPS_PROFILE=true 时 100 次重开 seed 每次都变化（实测 ${seedChanged}/100）`);
    setRetryKeepsProfile(false);
    ok(RETRY_KEEPS_PROFILE === false, '开关复位为 false');
    line(`   开关 true：档位保持 ${profileSame}/100 · seed 变化 ${seedChanged}/100`);
  }

  // 真实通关：沿 solution 逐张点击 → graduated / best / 写存档 level=1 → startNewRun
  {
    const g = new Game(null);
    g.profile.l1 = 0; g.profile.l2 = 0;
    g.startLevel(2, SEED_POOL['L2-0'][0]);
    let pickFail = 0;
    for (const id of g.solution) if (!g.pick(g.cards[id])) pickFail++;
    if (g.pendingMatch) g.flushResolve();
    ok(pickFail === 0 && g.status === 'win' && g.graduated === true && g.best === LEVEL_COUNT,
      `最后一关真实通关（点牌失败 ${pickFail} / status ${g.status} / graduated ${g.graduated} / best ${g.best}）`);
    const sv = makeSaveData(g);
    ok(sv.level === 1, `通关那一刻 persist 写 level=1（实测 ${sv.level}）`);
    ok(sv.best === LEVEL_COUNT, `best 保持 ${LEVEL_COUNT} 用于已毕业徽标（实测 ${sv.best}）`);
    ok(sv.p1 === 0 && sv.p2 === 0 && Number.isInteger(sv.p1) && Number.isInteger(sv.p2),
      `存档含整数 p1/p2（实测 ${sv.p1}/${sv.p2}）`);
    const before = { ...g.profile };
    g.startNewRun(Math.random);
    ok(g.level === 1, `startNewRun 从第 1 关开始（实测 level=${g.level}）`);
    ok(g.profile.l1 !== before.l1 && g.profile.l2 !== before.l2,
      `startNewRun 两关档位都 ≠ 之前（${before.l1}/${before.l2} → ${g.profile.l1}/${g.profile.l2}）`);
    ok(g.graduated === false, 'startNewRun 后 graduated 清零');
    line(`   通关存档 ${JSON.stringify(sv)} · startNewRun 档位 ${before.l1}/${before.l2} → ${g.profile.l1}/${g.profile.l2}`);
  }

  // 旧存档 / 越界字段 / preserveProfile（桌面异步存档不覆盖刚抽好的档位）
  {
    const g = new Game(null);
    applySaveToGame(g, { v: 2, level: 2, best: 2, sound: true, sfxVol: 1 });
    ok(g.level === 2 && g.best === 2 && g.profile.l1 === 0 && g.profile.l2 === 0,
      '旧存档（无 p1/p2）能正常读入，档位按缺省 0 处理');
    applySaveToGame(g, { v: 2, level: 1, best: 1, p1: 99, p2: -1 });
    ok(g.profile.l1 === 0 && g.profile.l2 === 0, '越界 p1/p2 按缺省档位 0 处理，不判非法');
    g.profile.l1 = 3; g.profile.l2 = 7;
    applySaveToGame(g, { v: 2, level: 2, best: 2, p1: 0, p2: 0 }, true);
    ok(g.profile.l1 === 3 && g.profile.l2 === 7,
      'preserveProfile=true 时桌面异步存档不覆盖 boot 刚抽好的档位');
    applySaveToGame(g, null);
    ok(g.level === 2, '空存档不改动游戏状态');
  }
} finally {
  console.info = realInfo;
}

/* ---------------- [13] 界面文案与源码一致性（第 2.5 / 3.2 / 3.3 / 4.2 节） ---------------- */
line('\n[13] 界面文案与源码一致性');
ok(/game\.graduated\s*\?\s*'开始新一轮'\s*:\s*'开始游戏'/.test(renderSrc),
  '标题页按钮「开始新一轮」判据 = game.graduated，与 case \'start\' 一致');
ok(/levelParams\(nextLv, Math\.random, nextLv <= 1 \? game\.profile\.l1 : game\.profile\.l2\)/.test(renderSrc),
  '「下一关」张数 / 层数 / 牌种数从下一关当前档位读取');
ok(!/下一关：\s*\d+\s*张/.test(renderSrc), 'render.js 里不存在硬编码的「下一关：N 张」文案');
ok(/push\('replay'[\s\S]{0,200}重玩本关/.test(renderSrc), '普通胜利面板提供「重玩本关」按钮');
ok(!/240 张|15 层·|16 种 · 15 层/.test(renderSrc), 'render.js 界面文案无旧版固定张数 / 层数');
ok(/case 'restart':\s*\n\s*case 'replay':/.test(mainSrc), 'main.js 中 restart / replay 共用同一分支');
// 本轮：三种重新开局操作全部收敛到 createNewGame()，不再各自实现随机生成
ok(!/game\.(startNewRun|restartLevel|startLevel)\(/.test(mainSrc),
  'main.js 所有新开局入口都不再直接调用旧版各自实现的生成方法');
ok(/function newGame\([\s\S]*?createNewGame\(\{/.test(mainSrc),
  'main.js 唯一的新局包装真实调用 createNewGame()');
ok(/case 'start':[\s\S]{0,600}?newGame\(game\.level, reason\)/.test(mainSrc),
  '应用重启后开始 / 标题页重新开始走统一入口');
ok(/case 'restart':[\s\S]{0,700}?newGame\(lv, reason\)/.test(mainSrc),
  '失败重开 / 暂停重开 / 重玩本关走统一入口');
ok(/case 'next':[\s\S]{0,200}?newGame\(/.test(mainSrc), '进入下一关走统一入口');
ok(/newGame\(game\.level, 'title_screen_restart'\)/.test(mainSrc), '键盘 r 重开走统一入口');
for (const r of GENERATION_REASONS) {
  ok(mainSrc.indexOf("'" + r + "'") >= 0, `main.js 明确区分 generationReason=${r}`);
}
ok(/applySave\(loadSave\(\)\)/.test(mainSrc) && /game\.level, reason\)/.test(mainSrc),
  '未通关退出后仍按存档 level 继续（3.4），但新局由统一入口生成');
ok(/game\.profile\.l1 = rollProfile\(1, Math\.random, game\.profile\.l1\)/.test(mainSrc)
  && /game\.profile\.l2 = rollProfile\(2, Math\.random, game\.profile\.l2\)/.test(mainSrc),
  'boot() 在 applySave 之后对 l1 / l2 都重抽，各自 ≠ 存档里的 p1 / p2');
ok(/persist\(true\)/.test(mainSrc) && /makeSaveData\(game\)/.test(mainSrc),
  '抽取后立即 persist(true)，存档由 makeSaveData 统一构造');
ok(/syncDesktopSave\(\(raw\) => applySave\(raw, true\)\)/.test(mainSrc),
  '桌面异步存档以 preserveProfile=true 读入，不覆盖 boot 抽好的档位');
ok(/q\.has\('lv'\)/.test(mainSrc), '保留 ?lv= 调试参数');
ok(/console\.info\(`\[mah\] level=/.test(engineSrc) && /profileId=/.test(engineSrc) && /seed=/.test(engineSrc),
  'engine 每局 console.info 打印 level / profileId / seed');
ok(/generateProfileLayout\(s, profile\)/.test(read('src/game/generator.js')),
  'generateLevel 带 profile 时走档位驱动布局');
ok(/pickPoolSeed\(lv, profile \? profile\.id : null\)/.test(read('src/game/generator.js')),
  'generateLevel 不传 seed 时只从当前档位池抽');
ok(/SEED_POOL\['L2-' \+ profileId\]|SEED_POOL\[key\]/.test(read('src/game/seed_pool.js')),
  'pickPoolSeed 按 L2-<id> 分库取值');
ok(/p1: game\.profile\.l1/.test(read('src/game/save_data.js'))
  && /p2: game\.profile\.l2/.test(read('src/game/save_data.js'))
  && /game\.graduated \? 1 : game\.level/.test(read('src/game/save_data.js')),
  'save_data.js：毕业写 level=1、best 保持、p1/p2 写入');
ok(!/^\s*\d+\s*张\s*·|下一关：\s*\d+/.test(dom), 'ES5 降级视图无硬编码张数 / 层数文案');

/* ---------------- [14] 统一生成入口 / 布局签名 / 最近三局（真实运行） ---------------- */
line('\n[14] 统一生成入口 / 布局签名 / 最近三局差异化（真实运行）');
{
  // SHA-256 与 node:crypto 对照（不是"函数可调用"式断言）
  const cases = ['', 'abc', 'MahLeMah', '0:1:2|3:4:5', '中文测试', 'x'.repeat(1000)];
  let shaOk = true;
  for (const s of cases) {
    if (sha256Hex(s) !== createHash('sha256').update(s, 'utf8').digest('hex')) shaOk = false;
  }
  ok(shaOk, '同步 SHA-256 与 node:crypto 在 6 组输入上逐字节一致');

  // 布局签名：同档位换 seed 不能冒充不同布局
  for (const lv of [1, 2]) {
    const d0 = generateLevel(lv, 1111, { profile: 0 });
    const d1 = generateLevel(lv, 2222, { profile: 0 });
    const d2 = generateLevel(lv, 1111, { profile: 1 });
    const s0 = calculateLayoutSignature(d0);
    const s1 = calculateLayoutSignature(d1);
    const s2 = calculateLayoutSignature(d2);
    ok(s0.geometrySignature === s1.geometrySignature,
      `L${lv} 同档位不同 seed 的几何签名相同（seed 不等于布局）`);
    ok(s0.geometrySignature !== s2.geometrySignature && s0.layoutSignature !== s2.layoutSignature,
      `L${lv} 不同档位的实际布局签名不同`);
    ok(s0.algorithm === SIGNATURE_ALGORITHM && s0.layoutSignature.length === 64,
      `L${lv} 布局签名是 64 位 SHA-256`);
    ok(calculateLayoutSignature(d0).layoutSignature === s0.layoutSignature,
      `L${lv} 相同牌局数据复算得到相同签名`);
    ok(s0.tileCount === d0.cards.length && s0.playableCount === d0.visible,
      `L${lv} 签名返回的牌数 / 可点牌数与实际牌局一致`);
  }

  ok(MAX_ATTEMPTS === 50 && HISTORY_LIMIT === 3 && GENERATION_REASONS.length === 4,
    '重试上限 50 / 历史窗口 3 / 4 种 generationReason');
  ok(sanitizeRecord({ gameId: 'x' }) === null && sanitizeRecord(null) === null,
    '损坏的历史记录被丢弃而不是抛异常');
  ok(sanitizeHistory([null, 1, 'x']).length === 0, '脏历史数组安全降级为空');
  ok(historyFor({ level1RecentGames: [{ gameId: 'bad' }] }, 2).length === 0,
    'L2 不读取 L1 的历史（关卡隔离）');
  {
    const recent = [
      { totalTiles: 24, layoutSignature: 'a'.repeat(64), geometrySignature: 'b'.repeat(64), seed: 1, gameId: 'g1' },
    ];
    const c = checkAgainstRecent(recent, {
      totalTiles: 30, layoutSignature: 'c'.repeat(64), geometrySignature: 'd'.repeat(64), seed: 2, gameId: 'g2',
    });
    ok(c.tileCountDifferent && c.layoutDifferent && c.geometryDifferent && c.seedFresh,
      'checkAgainstRecent 对不重复候选返回全 PASS');
    const c2 = checkAgainstRecent(recent, {
      totalTiles: 24, layoutSignature: 'a'.repeat(64), geometrySignature: 'b'.repeat(64), seed: 1, gameId: 'g1',
    });
    ok(!c2.tileCountDifferent && !c2.layoutDifferent && !c2.geometryDifferent && !c2.seedFresh,
      'checkAgainstRecent 对牌数/布局/seed 全重复的候选如实返回 FAIL');
  }

  // 统一入口：两关各自连续 6 局，滚动窗口同时检查牌数与几何
  for (const lv of [1, 2]) {
    const g = new Game(null);
    let save = { level1RecentGames: [], level2RecentGames: [] };
    let allOk = true;
    for (let i = 0; i < 6; i++) {
      const before = historyFor(save, lv);
      let r;
      try {
        r = createNewGame({
          level: lv, generationReason: GENERATION_REASONS[i % 4],
          game: g, save, rand: Math.random,
        });
      } catch (e) {
        allOk = false;
        break;
      }
      if (before.some((x) => x.totalTiles === r.record.totalTiles) ||
          before.some((x) => x.layoutSignature === r.record.layoutSignature) ||
          before.some((x) => x.geometrySignature === r.record.geometrySignature)) allOk = false;
      if (!validateLevel(r.data).ok || !verify(r.data)) allOk = false;
      if (r.game.meta.gameId !== r.record.gameId || r.meta.checks.tileCountCheck !== 'PASS' ||
          r.meta.checks.layoutCheck !== 'PASS' || r.meta.checks.historyCheck !== 'PASS') allOk = false;
      if (historyFor(r.nextSave, lv).length > HISTORY_LIMIT) allOk = false;
      save = r.nextSave;
    }
    ok(allOk, `L${lv} 连续 6 局统一入口：牌数 + 布局 + 几何均与最近三局不同，且全部通过校验`);
  }

  // 50 次上限失败路径：明确报错，绝不自动接受重复牌局
  {
    const g = new Game(null);
    const tiles = LEVEL1_PROFILES.map((p) => p.mainCount + p.queueCount);
    let threw = false;
    try {
      createNewGame({
        level: 1, generationReason: 'new_game', game: g,
        save: { level1RecentGames: [] }, previousTileCounts: tiles,
        maxAttempts: 3, rand: Math.random,
      });
    } catch (e) {
      threw = e instanceof GenerationFailureError;
      ok(threw && e.detail.reason === 'MAX_ATTEMPTS_EXCEEDED' && e.detail.failures.length === 3,
        '配置被占满时抛 GenerationFailureError 并逐次记录失败原因');
    }
    ok(threw, '生成失败时不自动接受重复牌局');
  }

  // 存档 v3 / 历史字段 / 调试元信息
  {
    const g = new Game(null);
    let save = { level1RecentGames: [], level2RecentGames: [] };
    for (let i = 0; i < 5; i++) {
      const r = createNewGame({ level: 1, generationReason: 'new_game', game: g, save, rand: Math.random });
      save = r.nextSave;
    }
    g.saveState = save;
    const d = makeSaveData(g);
    ok(d.v === 3 && d.level1RecentGames.length === 3 && d.level2RecentGames.length === 0,
      '存档 v3 只持久化每关最近三局元数据，两关隔离');
    ok(JSON.stringify(d).length < 4096, '存档体积有上界（不无限制增长）');
    const b = readBuildInfo();
    ok(!!b.buildVersion && !!b.gitCommit && !!b.sourceHash,
      'build_info 提供 buildVersion / gitCommit / sourceHash（HTML 由构建脚本注入真实值）');
  }
}

line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line('============================================================================');
if (fail) {
  line(' 说明：失败项按规格 5.2 的字面阈值判定，未放宽阈值、未改测试凑数。');
  line('       5.1 要求「池内每个种子至少一条强策略可通关」，5.2 同时要求「通关率 Wilson 上界 ≤3%」，');
  line('       在证书可解性设计（槽位峰值 ≤6、沿剥离顺序必然可通关）下两者互为矛盾；');
  line('       真实通关率与上界已逐档打印在 [11]，请据此决定是调整阈值还是调整难度模型。');
}
if (fail) process.exit(1);
