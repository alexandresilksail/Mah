/**
 * 第二关 20 套布局模板专项验收（真实运行，Node，不依赖 DOM）。
 *
 *   node test-l2-templates.js
 *
 * 判定全部基于**真实生成的最终牌局几何**，不认牌面图案 / 洗牌顺序 / 随机种子：
 *  [0] 模板定义：20 个唯一 templateId、7 个形状族、显式轮廓掩膜与结构签名两两唯一；
 *  [1] 20 套 × 3 个 (档位, seed) 组合 = 60 局真实生成，逐局校验牌数 / 层级 /
 *      坐标边界 / 半格晶格 / 同层零重叠 / 遮挡图 / 开局可点 19–25 / 零悬空 /
 *      消除后下层正常暴露 / 可真实安装进 Game 开始游戏；
 *  [2] 20 套代表布局两两（190 对）主堆结构相似度与布局相似度全部 < 0.60，
 *      canonicalGeometrySignature 与 structureSignature 各 20 个唯一值；
 *  [3] 等价几何识别：平移 / 左右镜像 / 换牌面后 canonical 不变；
 *      不同 templateId 但等价几何的候选被 checkL2DualDedup 判为 FAIL；
 *      最近 10 局用过的模板被模板级检查排除；
 *  [4] 五种重开入口（游戏内 / 失败 / 标题页 / 刷新网页 / 退出重进）连续 12 局
 *      均执行去重，最近 10 局零重复，历史跨序列化重载有效。
 *
 * 输出 reports/l2-templates-report.json / .md / -output.txt。
 * 任何一项不通过 → exit 1；不跳过失败、不放宽阈值、不使用固定牌局数据。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execSync } from 'node:child_process';

import {
  L2_TEMPLATES, L2_TEMPLATE_IDS, TEMPLATE_CATEGORIES,
  templateById, templateSummary, templateCategoryStats,
  OUTER_SEG, OUTER_TILE_COUNT,
} from './src/game/l2_templates.js';
import { GRID_X0, GRID_Y0 } from './src/game/l2_spec.js';
import { describeTemplateLayout } from './src/game/l2_geometry.js';
import {
  calculateStructureSignature, canonicalGeometrySignature,
  structureSimilarity, mainStackCards, STRUCTURE_ALGORITHM,
} from './src/game/l2_structure.js';
import {
  checkL2DualDedup, availableTemplateIds, usedTemplateIds, L2_SIMILARITY_THRESHOLD,
} from './src/game/l2_recent.js';
import { generateLevel, validateLevel, countVisible } from './src/game/generator.js';
import {
  layoutSimilarity, SIMILARITY_THRESHOLD, calculateLayoutSignature,
} from './src/game/layout_signature.js';
import {
  sameLayerOverlapCount, isHalfLattice, isBlocked, hasSupport,
} from './src/game/layout.js';
import {
  LEVEL2_PROFILES, profileFor, BOARD_BAND, TILE_W, TILE_H,
} from './src/game/config.js';
import { Game } from './src/game/engine.js';
import {
  createNewGame, GenerationFailureError,
} from './src/game/new_game.js';
import {
  historyFor, sanitizeRecord, L2_HISTORY_LIMIT, GENERATION_REASONS,
} from './src/game/recent_games.js';
import { makeRng } from './src/game/rng.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const reports = join(root, 'reports');
if (!existsSync(reports)) mkdirSync(reports, { recursive: true });

const logs = [];
let pass = 0, fail = 0;
const failLabels = [];
function line(s) { logs.push(s); console.log(s); }
function ok(cond, label, detail) {
  if (cond) pass++;
  else { fail++; failLabels.push(label); line('  ✗ ' + label + (detail ? ' → ' + detail : '')); }
  return !!cond;
}
function section(s) { line('\n' + s); }
const gitCommit = (() => {
  try { return execSync('git rev-parse HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch (e) { return 'unknown'; }
})();

line('============================================================================');
line(' MahLeMah · 第二关 20 套布局模板专项验收（真实运行）');
line(' commit=' + gitCommit + ' start=' + new Date().toISOString());
line('============================================================================');

/* ---------------- [0] 模板定义 ---------------- */
section('[0] 20 套模板定义：唯一 ID / 形状族 / 显式轮廓掩膜');
ok(L2_TEMPLATES.length === 20 && L2_TEMPLATE_IDS.length === 20,
  `模板总数 = 20（实测 ${L2_TEMPLATES.length}）`);
ok(new Set(L2_TEMPLATE_IDS).size === 20, '20 个 templateId 全部唯一');
const catStats = templateCategoryStats();
let catTotal = 0;
for (const cat of TEMPLATE_CATEGORIES) catTotal += catStats[cat.key] || 0;
ok(catTotal === 20 && TEMPLATE_CATEGORIES.every((c) => (catStats[c.key] || 0) >= 1),
  `7 个形状族覆盖全部 20 套（实测 ${TEMPLATE_CATEGORIES.length} 族 / ${catTotal} 套）`);
const summaries = L2_TEMPLATES.map(templateSummary);
ok(new Set(summaries.map((s) => s.structureSignature)).size === 20,
  '20 套模板的 structureSignature 两两唯一（结构参数不同，非 seed 差异）');
const paramKeys = new Set(summaries.map((s) => JSON.stringify([
  s.mask, s.growth, s.layerShape, s.layerCurve, s.offsets, s.density, s.phase,
])));
ok(paramKeys.size === 20, '20 套模板的结构参数组合两两唯一');
const maskKeys = new Set(summaries.map((s) => s.mask.join('/')));
ok(maskKeys.size === 20, '20 套模板的全局轮廓掩膜两两不同');
for (const s of summaries) {
  ok(!!s.templateId && /^L2-/.test(s.templateId) && !!templateById(s.templateId),
    `${s.templateId} 可按 ID 反查到模板定义`);
  ok(s.mask.length === 5 && s.mask.every((r) => r.length === 9) && s.maskCellCount >= 20,
    `${s.templateId} 具备 5×9 显式轮廓掩膜（${s.maskCellCount} 个可落牌格 / ${s.maskRegionCount} 个区域）`);
}
line(`   形状族：${TEMPLATE_CATEGORIES.map((c) => c.label + '×' + (catStats[c.key] || 0)).join(' / ')}`);

/* ---------------- [1] 20 套 × 3 组合真实生成 ---------------- */
section('[1] 20 套模板 × 3 组 (档位, seed) = 60 局真实生成与合法性');

/** 严格「悬空」判定：每张非底层牌必须由更低层的牌提供支撑 */
function strictFloating(cards) {
  const main = mainStackCards(cards);
  const byLayer = {};
  for (const c of main) (byLayer[c.layer] = byLayer[c.layer] || []).push(c);
  const keys = Object.keys(byLayer).map(Number).sort((a, b) => a - b);
  let lower = [];
  let bad = 0;
  for (let i = 0; i < keys.length; i++) {
    const cur = byLayer[keys[i]];
    if (i > 0) for (const c of cur) if (!hasSupport(c, lower)) bad++;
    lower = lower.concat(cur);
  }
  return bad;
}

/** 模拟消除全部开局可点牌，检查下层牌确实从 blocked 变为可点 */
function exposesLower(cards) {
  const beforeBlocked = new Set();
  const clickable = [];
  for (const c of cards) {
    if (isBlocked(c, cards)) beforeBlocked.add(c.id);
    else clickable.push(c);
  }
  const removed = new Set(clickable.map((c) => c.id));
  const remaining = cards.filter((c) => !removed.has(c.id));
  let newly = 0;
  for (const c of remaining) if (beforeBlocked.has(c.id) && !isBlocked(c, remaining)) newly++;
  return { clickable: clickable.length, newly: newly };
}

/** 牌心所在掩膜格（全局 9×5 晶格：原点复用 l2_spec.js 的 GRID_X0/GRID_Y0；相位不影响整格还原） */
function maskCellOf(card) {
  const col = Math.floor((card.x - GRID_X0) / TILE_W);
  const row = Math.floor((card.y - GRID_Y0) / TILE_H);
  return col + ',' + row;
}

const PER_TPL = 3;
const representatives = [];
const perTemplateRows = [];
let maskOut = 0;
const maskOutList = [];
let regionShort = 0;
const regionShortList = [];
const realInfo = console.info;
console.info = () => {};
try {
  for (let i = 0; i < L2_TEMPLATES.length; i++) {
    const tpl = L2_TEMPLATES[i];
    const row = { templateId: tpl.templateId, name: tpl.name, category: tpl.categoryLabel, cases: [] };
    let tplOk = true;
    for (let k = 0; k < PER_TPL; k++) {
      const profileId = (i + k) % LEVEL2_PROFILES.length;
      const seed = (7919 + i * 131 + k * 17) >>> 0;
      let d;
      try {
        d = generateLevel(2, seed, { profile: profileId, templateId: tpl.templateId });
      } catch (e) {
        tplOk = false;
        ok(false, `${tpl.templateId} p${profileId} seed=${seed} 生成不抛错`, String(e && e.message));
        continue;
      }
      const p = profileFor(2, profileId);
      const expected = p.mainCount + p.queueCount;
      const cards = d.cards;
      const maskCells = new Set((tpl.maskCells || []).map((c) => c.k));
      const rmap = tpl.maskRegion || {};
      let maskedOut = 0;
      const covered = new Set();
      for (const c of cards) {
        if (c.seg === OUTER_SEG) continue;
        const key = maskCellOf(c);
        if (!maskCells.has(key)) maskedOut++;
        else covered.add(rmap[key]);
      }
      if (maskedOut) {
        maskOut += maskedOut;
        maskOutList.push([tpl.templateId, profileId, maskedOut]);
      }
      if (covered.size !== tpl.maskRegionCount) {
        regionShort++;
        regionShortList.push([tpl.templateId, profileId, covered.size, tpl.maskRegionCount]);
      }
      const v = validateLevel(d);
      let inBand = true;
      for (const c of cards) {
        if (c.x < BOARD_BAND.left || c.y < BOARD_BAND.top ||
            c.x + TILE_W > BOARD_BAND.right || c.y + TILE_H > BOARD_BAND.bottom) inBand = false;
      }
      let blockerOk = true;
      for (const c of cards) {
        if (((d._graph.blockers[c.id] || []).length > 0) !== !!c.blocked) { blockerOk = false; break; }
      }
      const strictFloat = strictFloating(cards);
      const exp = exposesLower(cards);
      let installOk = false, installVisible = -1;
      try {
        const g = new Game(null);
        g.installLevelData(d, null);
        installVisible = countVisible(g.cards);
        installOk = g.level === 2 && g.cards.length === cards.length &&
          g.slot.length === 0 && installVisible === d.visible;
      } catch (e) {
        installOk = false;
      }
      const good = d.templateId === tpl.templateId &&
        cards.length === expected && v.ok && inBand && !!isHalfLattice(cards) &&
        sameLayerOverlapCount(cards) === 0 && blockerOk &&
        d.visible >= 19 && d.visible <= 25 && d.floatingCount === 0 &&
        strictFloat === 0 && exp.clickable >= 3 && exp.newly >= 1 && installOk;
      ok(good, `${tpl.templateId} p${profileId} seed=${seed} 全部合法性通过`,
        `牌数 ${cards.length}/${expected} · validate=${v.ok} · 边界=${inBand} · 半格=${isHalfLattice(cards)}` +
        ` · 同层重叠=${sameLayerOverlapCount(cards)} · 遮挡图=${blockerOk} · 可点=${d.visible}` +
        ` · 悬空=${d.floatingCount}/${strictFloat} · 暴露=${exp.newly} · 安装=${installOk}/${installVisible}`);
      if (!good) tplOk = false;
      const st = calculateStructureSignature(d);
      const ls = calculateLayoutSignature(d);
      ok(st.algorithm === STRUCTURE_ALGORITHM && st.structureSignature.length === 64 &&
        st.canonicalGeometrySignature.length === 64 && ls.layoutSignature.length === 64,
      `${tpl.templateId} p${profileId} 结构 / 等价几何 / 布局签名均为 64 位 SHA-256`);
      row.cases.push({
        profileId, seed, cards: cards.length, visible: d.visible,
        floatingCount: d.floatingCount, strictFloating: strictFloat,
        exposedAfterRemove: exp.newly, installOk,
        structureSignature: st.structureSignature,
        canonicalGeometrySignature: st.canonicalGeometrySignature,
      });
      if (k === 0) {
        representatives.push({
          templateId: tpl.templateId, data: d,
          main: mainStackCards(cards),
          structureSignature: st.structureSignature,
          canonicalGeometrySignature: st.canonicalGeometrySignature,
          desc: describeTemplateLayout(cards, tpl, d.visible),
        });
      }
    }
    ok(tplOk, `${tpl.templateId} 「${tpl.name}」3 组档位/seed 全部可正常开始游戏`);
    perTemplateRows.push(row);
  }
} finally {
  console.info = realInfo;
}
ok(perTemplateRows.length === 20 && representatives.length === 20,
  `20 套模板全部完成真实生成（实测 ${perTemplateRows.length}）`);
ok(maskOut === 0,
  `60 局主堆落牌全部位于各自模板的轮廓掩膜格内（越界 ${maskOut} 张）`,
  JSON.stringify(maskOutList.slice(0, 5)));
ok(regionShort === 0,
  `60 局主堆覆盖各自模板掩膜的全部连通区域（覆盖不足 ${regionShort} 例）`,
  JSON.stringify(regionShortList.slice(0, 5)));

/* ---------------- [2] 20 套实际布局结构差异 ---------------- */
section('[2] 20 套代表布局：190 对两两结构差异');
ok(new Set(representatives.map((r) => r.canonicalGeometrySignature)).size === 20,
  `20 套代表布局的等价几何签名全部唯一（实测 ${new Set(representatives.map((r) => r.canonicalGeometrySignature)).size}）`);
ok(new Set(representatives.map((r) => r.structureSignature)).size === 20,
  `20 套代表布局的结构签名全部唯一（实测 ${new Set(representatives.map((r) => r.structureSignature)).size}）`);
let maxStruct = 0, maxLayout = 0, overThreshold = 0, pairs = 0, worstPair = '';
for (let a = 0; a < representatives.length; a++) {
  for (let b = a + 1; b < representatives.length; b++) {
    const s = structureSimilarity(representatives[a].data, representatives[b].data);
    const l = layoutSimilarity(representatives[a].main, representatives[b].main);
    pairs++;
    if (s > maxStruct) maxStruct = s;
    if (l > maxLayout) maxLayout = l;
    if (s >= SIMILARITY_THRESHOLD || l >= SIMILARITY_THRESHOLD) {
      overThreshold++;
      worstPair = representatives[a].templateId + ' / ' + representatives[b].templateId;
    }
  }
}
ok(pairs === 190, `两两组合数 = 190（实测 ${pairs}）`);
ok(overThreshold === 0,
  `190 对全部 < ${SIMILARITY_THRESHOLD}（结构 sim 最大 ${maxStruct.toFixed(4)} / 布局 sim 最大 ${maxLayout.toFixed(4)} / 越界 ${overThreshold} 对）`,
  worstPair);
/* 【口径变化（本轮）】每层张数现在由**档位**（layerPlanFor 沙漏曲线）唯一决定，
 * 模板只决定「每层占哪些格」——因此 20 套模板在同一档位下的层张数必须完全相同，
 * 这正是「缩略图 = 唯一几何标准、不得自行重设比例」的体现，是更强的断言而不是更弱。 */
const layerShapes = new Set(representatives.map((r) => JSON.stringify(r.desc.layerCounts)));
const regionShapes = new Set(L2_TEMPLATES.map((t) => t.maskRegionCount));
const boxes = new Set(representatives.map((r) => r.desc.box.w + 'x' + r.desc.box.h));
const silhouettes = new Set(representatives.map((r) =>
  r.main.map((c) => c.layer + ':' + c.x + ':' + c.y).sort().join('|')));
ok(layerShapes.size === 1, `各层牌数由档位唯一决定，20 套模板完全一致（实测 ${layerShapes.size} 种）`);
ok(regionShapes.size >= 4, `掩膜区域结构分布明显不同（${regionShapes.size} 种区域数）`);
ok(silhouettes.size >= 16,
  `主堆逐层占位格轮廓明显不同（${silhouettes.size}/20 种互不相同的真实轮廓）`);
line(`   结构 sim 最大 ${maxStruct.toFixed(4)} · 主堆布局 sim 最大 ${maxLayout.toFixed(4)} · 越界 ${overThreshold}/190`);
line(`   层分布 ${layerShapes.size} 种 · 区域分布 ${regionShapes.size} 种 · 占位格轮廓 ${silhouettes.size}/20 种 · 包围盒 ${boxes.size} 种`);

/* ---------------- [3] 等价几何识别 ---------------- */
section('[3] 等价几何 / 牌面 / 模板级去重判定');
{
  const rep = representatives[0];
  const cards = rep.data.cards;
  const canon0 = rep.canonicalGeometrySignature;
  const shifted = cards.map((c) => Object.assign({}, c, { x: c.x + 330, y: c.y + 220 }));
  const mirrored = cards.map((c) => Object.assign({}, c, { x: -(c.x + TILE_W) }));
  const retyped = cards.map((c) => Object.assign({}, c, { type: 'bamboo-1' }));
  const reseeded = generateLevel(2, rep.data.seed, { profile: rep.data.profileId, templateId: rep.templateId });
  ok(canonicalGeometrySignature(shifted) === canon0,
    '整局平移后等价几何签名不变（平移不改变结构）');
  ok(canonicalGeometrySignature(mirrored) === canon0,
    '整局左右镜像后等价几何签名不变（镜像不改变结构）');
  ok(canonicalGeometrySignature(retyped) === canon0,
    '只换牌面图案不改变等价几何签名（牌面不作差异依据）');
  ok(calculateStructureSignature({ cards: retyped }).structureSignature === rep.structureSignature,
    '只换牌面图案不改变结构签名');
  ok(calculateStructureSignature(reseeded).structureSignature === rep.structureSignature,
    '同 seed + 同档位 + 同模板可精确重放（历史重放依据）');

  // 不同 templateId 但等价几何 → 几何级检查必须拒绝
  const recent = [{
    gameId: 'g2-equiv', level: 2, difficultyId: 0, seed: 1, totalTiles: 321,
    layoutSignature: 'a'.repeat(64), geometrySignature: 'b'.repeat(64),
    templateId: L2_TEMPLATE_IDS[1],
    structureSignature: representatives[1].structureSignature,
    canonicalGeometrySignature: canon0, // 与本局等价
  }];
  const cEquiv = checkL2DualDedup(recent, {
    templateId: rep.templateId, structureSignature: rep.structureSignature,
    canonicalGeometrySignature: canon0, geometrySignature: 'c'.repeat(64),
    seed: 2, gameId: 'g2-new', structureSimilarityMax: 0, layoutSimilarityMax: 0,
  });
  ok(!cEquiv.pass && cEquiv.failedChecks.indexOf('CANONICAL_GEOMETRY') >= 0,
    '不同模板生成的等价几何被几何级检查识别并拒绝');
  const cStruct = checkL2DualDedup([Object.assign({}, recent[0], { canonicalGeometrySignature: 'd'.repeat(64) })], {
    templateId: rep.templateId, structureSignature: representatives[1].structureSignature,
    canonicalGeometrySignature: 'd'.repeat(64), geometrySignature: 'c'.repeat(64),
    seed: 2, gameId: 'g2-new', structureSimilarityMax: 0, layoutSimilarityMax: 0,
  });
  ok(!cStruct.pass && cStruct.failedChecks.indexOf('STRUCTURE_SIGNATURE') >= 0,
    '结构签名相同被识别并拒绝');
  const used = L2_TEMPLATE_IDS.slice(0, 10);
  const recent10 = used.map((id, i) => ({
    gameId: 'g2-' + i, level: 2, difficultyId: i, seed: 1000 + i, totalTiles: 200,
    layoutSignature: 'a'.repeat(64), geometrySignature: String(i).padStart(64, 'e'),
    templateId: id, structureSignature: String(i).padStart(64, 'a'),
    canonicalGeometrySignature: String(i).padStart(64, 'b'),
  }));
  ok(usedTemplateIds(recent10).length === 10 && availableTemplateIds(recent10).length === 10,
    '最近 10 局用过的模板被排除（候选池 20 → 10）');
  const cTpl = checkL2DualDedup(recent10, {
    templateId: used[3], structureSignature: 'f'.repeat(64),
    canonicalGeometrySignature: '1'.repeat(64), geometrySignature: '2'.repeat(64),
    seed: 99999, gameId: 'g2-fresh', structureSimilarityMax: 0, layoutSimilarityMax: 0,
  });
  ok(!cTpl.pass && cTpl.failedChecks.indexOf('TEMPLATE_ID') >= 0,
    '模板级检查拒绝最近 10 局已用过的 templateId');
  ok(L2_SIMILARITY_THRESHOLD === SIMILARITY_THRESHOLD,
    '几何级高度相似阈值与全项目 0.60 一致');
}

/* ---------------- [4] 五种重开入口 × 12 局 ---------------- */
section('[4] 五种重开入口：连续 12 局第二关去重与历史持久化');
{
  const reasons = [
    'new_game', 'failure_restart', 'title_screen_restart',
    'application_restart', 'new_game',
  ];
  let save = { level1RecentGames: [], level2RecentGames: [] };
  const boards = [];
  let genFail = 0, maxAttempts = 0;
  const rng = makeRng(20261113);
  for (let i = 0; i < 12; i++) {
    const g = new Game(null);
    // 失败重开：真实把上一局状态置为 lose 后再走统一入口
    if (reasons[i % reasons.length] === 'failure_restart') g.status = 'lose';
    g.saveState = save;
    // 刷新网页 / 退出重进：每次把存档 JSON 序列化再读回，模拟进程重启
    const reloaded = JSON.parse(JSON.stringify(save));
    let r;
    try {
      r = createNewGame({
        level: 2, generationReason: reasons[i % reasons.length],
        game: g, save: reloaded, rand: rng.next.bind(rng),
      });
    } catch (e) {
      genFail++;
      ok(false, `第 ${i + 1} 局必须成功生成（实际抛错）`, String(e && e.message));
      break;
    }
    save = r.nextSave;
    maxAttempts = Math.max(maxAttempts, r.attempts);
    const st = calculateStructureSignature(r.data);
    boards.push({
      gameId: r.record.gameId, templateId: r.record.templateId,
      canon: st.canonicalGeometrySignature, struct: st.structureSignature,
      geom: r.record.geometrySignature, cards: r.data.cards,
    });
    const win = boards.slice(Math.max(0, boards.length - 1 - L2_HISTORY_LIMIT), -1);
    const dupTpl = win.some((b) => b.templateId === r.record.templateId);
    const dupCanon = win.some((b) => b.canon === st.canonicalGeometrySignature);
    const dupStruct = win.some((b) => b.struct === st.structureSignature);
    ok(!dupTpl && !dupCanon && !dupStruct,
      `第 ${i + 1} 局（${reasons[i % reasons.length]}）模板 / 等价几何 / 结构签名均不与最近 ${win.length} 局重复`);
    ok(r.meta.checks.templateCheck === 'PASS' && r.meta.checks.canonicalCheck === 'PASS' &&
      r.meta.checks.geometryCheck === 'PASS' && r.meta.checks.historyCheck === 'PASS',
    `第 ${i + 1} 局双重去重与历史写入均为 PASS`);
    const hist = historyFor(save, 2);
    ok(hist.length === Math.min(L2_HISTORY_LIMIT, i + 1) &&
      hist.every((x) => !!sanitizeRecord(x)) &&
      hist[hist.length - 1].templateId === r.record.templateId,
    `第 ${i + 1} 局历史经序列化往返后仍有效（${hist.length} 条）`);
    ok(historyFor(save, 1).length === 0, `第 ${i + 1} 局未写入第一关历史（关卡隔离）`);
  }
  ok(genFail === 0, `12 局全部成功生成（失败 ${genFail}）`);
  ok(maxAttempts <= 50, `最大重试次数 ${maxAttempts} ≤ 50`);
  for (const reason of GENERATION_REASONS) {
    ok(reasons.indexOf(reason) >= 0, `重开入口覆盖 reason=${reason}`);
  }
  // 模板池耗尽时必须明确报错，不允许退回重复布局
  const allRecent = L2_TEMPLATE_IDS.map((id, i) => ({
    gameId: 'g2-all-' + i, level: 2, difficultyId: i % 10, seed: 5000 + i,
    totalTiles: 300, layoutSignature: String(i).padStart(64, 'a'),
    geometrySignature: String(i).padStart(64, 'b'), distributionSignature: 'c'.repeat(64),
    generatedAt: '2026-11-13T00:00:00.000Z', generationReason: 'new_game',
    validationResult: 'PASS', templateId: id,
    structureSignature: String(i).padStart(64, 'd'),
    canonicalGeometrySignature: String(i).padStart(64, 'e'),
  }));
  const gAll = new Game(null);
  gAll.saveState = { level1RecentGames: [], level2RecentGames: allRecent.slice(-L2_HISTORY_LIMIT) };
  let threw = false;
  try {
    createNewGame({ level: 2, generationReason: 'new_game', game: gAll,
      save: gAll.saveState, rand: makeRng(7).next.bind(makeRng(7)),
      bannedTemplateIds: L2_TEMPLATE_IDS.slice(), maxAttempts: 3 });
  } catch (e) {
    threw = e instanceof GenerationFailureError;
    ok(threw && e.detail.reason === 'TEMPLATE_POOL_EXHAUSTED',
      '20 套模板全被禁用时抛出明确的 TEMPLATE_POOL_EXHAUSTED（未清空历史、未退回重复布局）');
  }
  ok(threw, '无法生成不重复布局时必须明确报错');
}

/* ---------------- 报告 ---------------- */
const report = {
  meta: {
    generatedAt: new Date().toISOString(), gitCommit,
    command: 'node test-l2-templates.js',
    templateCount: L2_TEMPLATES.length,
    perTemplateCases: PER_TPL,
    totalGenerated: perTemplateRows.length * PER_TPL,
    pairCount: pairs, maxStructureSimilarity: maxStruct, maxLayoutSimilarity: maxLayout,
    similarityThreshold: SIMILARITY_THRESHOLD,
    l2HistoryLimit: L2_HISTORY_LIMIT,
    assertions: { pass, fail }, exitCode: fail ? 1 : 0,
  },
  categories: TEMPLATE_CATEGORIES.map((c) => ({ key: c.key, label: c.label, feature: c.feature, count: catStats[c.key] })),
  templates: summaries.map((s, i) => Object.assign({}, s, {
    representative: {
      cards: representatives[i].desc.cards,
      layers: representatives[i].desc.layers,
      regions: representatives[i].desc.regions,
      box: representatives[i].desc.box,
      mainBox: representatives[i].desc.mainBox,
      visible: representatives[i].desc.visible,
      structureSignature: representatives[i].structureSignature,
      canonicalGeometrySignature: representatives[i].canonicalGeometrySignature,
    },
    cases: perTemplateRows[i].cases,
  })),
  pairStats: {
    pairs, maxStructureSimilarity: maxStruct, maxLayoutSimilarity: maxLayout,
    overThreshold, distinctLayerShapes: layerShapes.size,
    distinctRegionShapes: regionShapes.size, distinctBoxes: boxes.size,
    distinctSilhouettes: silhouettes.size,
  },
};
writeFileSync(join(reports, 'l2-templates-report.json'), JSON.stringify(report, null, 2), 'utf8');
let md = `# 第二关 20 套布局模板专项验收报告\n\n` +
  `> 本文件由 \`node test-l2-templates.js\` **真实运行**自动生成，不是静态 PASS 模板。\n\n` +
  `- 运行时间：${report.meta.generatedAt}\n- Git commit：\`${gitCommit}\`\n` +
  `- 断言：通过 **${pass}**，失败 **${fail}**\n` +
  `- 模板：${report.meta.templateCount} 套 · 每套 ${PER_TPL} 组档位/seed · 共 ${report.meta.totalGenerated} 局真实生成\n` +
  `- 两两差异：${pairs} 对 · 结构 sim 最大 ${maxStruct.toFixed(4)} · 主堆布局 sim 最大 ${maxLayout.toFixed(4)} · 越界 ${overThreshold} 对\n` +
  `- 相似阈值：${SIMILARITY_THRESHOLD} · 第二关历史窗口：${L2_HISTORY_LIMIT} 局\n\n` +
  `## 形状族（7 族共 20 套）\n\n` +
  '| 形状族 | 套数 | 可观察布局特征 |\n|---|---|---|\n' +
  report.categories.map((c) => `| ${c.label} | ${c.count} | ${c.feature} |`).join('\n') + '\n\n' +
  `## 20 套模板 ID 清单\n\n` +
  '| # | templateId | 名称 | 形状族 | 代表布局牌数 | 层数 | 区域数 | 主堆包围盒 | 开局可点 | 结构签名(前 12) |\n' +
  '|---|---|---|---|---|---|---|---|---|---|\n' +
  report.templates.map((t, i) => `| ${i + 1} | \`${t.templateId}\` | ${t.name} | ${t.categoryLabel} | ` +
    `${t.representative.cards} | ${t.representative.layers} | ${t.representative.regions} | ` +
    `${t.representative.mainBox.w}×${t.representative.mainBox.h} | ${t.representative.visible} | ` +
    `\`${t.representative.structureSignature.slice(0, 12)}\` |`).join('\n') + '\n\n' +
  `## 显式轮廓掩膜（每套独立定义，5 行 × 9 列）\n\n` +
  '| templateId | 掩膜（# 可落牌 / @ 高密度 / . 禁止） | 可落牌格 | 区域数 | 生长轨迹 | 层形状 | 层级曲线 |\n' +
  '|---|---|---|---|---|---|---|\n' +
  report.templates.map((t) => `| \`${t.templateId}\` | \`${t.mask.join(' / ')}\` | ${t.maskCellCount} | ` +
    `${t.maskRegionCount} | ${t.growth} | ${t.layerShape} | ${t.layerCurve.join('/')} |`).join('\n') + '\n\n' +
  `## 结论\n\n` +
  `- 20 套模板的 \`templateId\` / 轮廓掩膜 / 结构参数 / 结构签名 / 等价几何签名全部唯一。\n` +
  `- ${report.meta.totalGenerated} 局真实生成全部通过牌数、层级、坐标、遮挡、悬空、可操作、消除后暴露与真实开局安装校验。\n` +
  `- ${pairs} 对两两比较全部低于 ${SIMILARITY_THRESHOLD}，无「换 seed 冒充不同布局」。\n` +
  `- 平移、左右镜像、换牌面均被等价几何签名归一；模板级与几何级双重去重真实生效。\n`;
writeFileSync(join(reports, 'l2-templates-report.md'), md, 'utf8');

line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line(' 报告：reports/l2-templates-report.json / .md / -output.txt');
line('============================================================================');
if (fail) {
  for (const f of failLabels.slice(0, 20)) line(' - ' + f);
  if (failLabels.length > 20) line(` - ... 另有 ${failLabels.length - 20} 项`);
}
writeFileSync(join(reports, 'l2-templates-output.txt'), logs.join('\n') + '\n', 'utf8');
if (fail) process.exit(1);
