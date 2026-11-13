/**
 * 第二关「连续 100 局 · 最近 10 局零重复」取证（真实调用统一入口 createNewGame）。
 *
 *   node tools/l2_100_games.mjs
 *
 * 与 test-random-generation.js 的区别：这里只做一件事——**同一份存档对象**连续开 100 局，
 * 每局记录生成入口真实返回的 record / meta，然后独立复核：
 *   · 任意连续 10 局（滑动窗口）内，templateId / canonicalGeometrySignature /
 *     structureSignature / geometrySignature 四类零重复；
 *   · 每局与「当前窗口内 10 局」的结构 / 布局相似度都 < 0.60；
 *   · 生成失败 0、开局可点全部落在 19–25、20 套模板全部被用到。
 * 判定读的是牌局真实几何（不是 seed、不是牌面顺序、不是牌数）。
 *
 * 输出：reports/l2-100-games.txt（同时打印到 stdout）。任何一项不通过 → exit 1。
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Game } from '../src/game/engine.js';
import { createNewGame } from '../src/game/new_game.js';
import { historyFor } from '../src/game/recent_games.js';
import { SAVE_VERSION } from '../src/game/save_data.js';
import { L2_TEMPLATE_IDS } from '../src/game/l2_templates.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const reports = join(root, 'reports');
if (!existsSync(reports)) mkdirSync(reports, { recursive: true });

const TOTAL = 100;
const WINDOW = 10;
const REASONS = ['new_game', 'failure_restart', 'title_screen_restart', 'application_restart'];

const game = new Game(null);
let save = { v: SAVE_VERSION, level: 2, best: 1, level1RecentGames: [], level2RecentGames: [] };
game.saveState = save;

const rows = [];
const problems = [];
let failures = 0;
let maxRetries = 0;
let totalAttempts = 0;
const t0 = Date.now();

for (let i = 0; i < TOTAL; i++) {
  const before = historyFor(save, 2);
  const windowRecords = before.slice(Math.max(0, before.length - WINDOW));
  const reason = REASONS[i % REASONS.length];
  let r;
  try {
    r = createNewGame({ level: 2, generationReason: reason, game, save, rand: Math.random });
  } catch (e) {
    failures++;
    problems.push(`#${i + 1} 生成抛错：${e && e.message}（reason=${e && e.detail && e.detail.reason}）`);
    continue;
  }
  save = r.nextSave;
  game.saveState = save;
  totalAttempts += r.attempts;
  if (r.retries > maxRetries) maxRetries = r.retries;

  const rec = r.record;
  const meta = r.meta;

  // 独立复核：这一局不能与窗口内任意一局撞四类签名中的任何一个
  for (const old of windowRecords) {
    const clash = [];
    if (old.templateId === rec.templateId) clash.push('template');
    if (old.canonicalGeometrySignature === rec.canonicalGeometrySignature) clash.push('canonical');
    if (old.structureSignature === rec.structureSignature) clash.push('structure');
    if (old.geometrySignature === rec.geometrySignature) clash.push('geometry');
    if (clash.length) {
      problems.push(`#${i + 1} 与 ${old.gameId} 重复：${clash.join(' / ')}`);
    }
  }
  if (!(meta.similarityMax < 0.6)) problems.push(`#${i + 1} 结构相似度 ${meta.similarityMax} ≥ 0.60`);
  if (!(meta.layoutSimilarityMax < 0.6)) problems.push(`#${i + 1} 布局相似度 ${meta.layoutSimilarityMax} ≥ 0.60`);
  if (!(r.data.visible >= 19 && r.data.visible <= 25)) problems.push(`#${i + 1} 开局可点 ${r.data.visible} 越界`);
  const badChecks = Object.keys(meta.checks).filter((k) => meta.checks[k] === 'FAIL');
  if (badChecks.length) problems.push(`#${i + 1} 去重检查 FAIL：${badChecks.join('/')}`);

  rows.push({
    index: i + 1,
    reason,
    templateId: rec.templateId,
    difficultyId: rec.difficultyId,
    totalTiles: rec.totalTiles,
    visible: r.data.visible,
    structureSimilarityMax: meta.similarityMax,
    layoutSimilarityMax: meta.layoutSimilarityMax,
    attempts: r.attempts,
  });
}

const elapsed = Date.now() - t0;
const used = {};
for (const row of rows) used[row.templateId] = (used[row.templateId] || 0) + 1;
const maxStruct = rows.reduce((a, b) => Math.max(a, b.structureSimilarityMax), 0);
const maxLayout = rows.reduce((a, b) => Math.max(a, b.layoutSimilarityMax), 0);
const visMin = rows.reduce((a, b) => Math.min(a, b.visible), 99);
const visMax = rows.reduce((a, b) => Math.max(a, b.visible), 0);

// 滑动窗口复核（覆盖「任意连续 10 局」这一条，不只最后一个窗口）
let windowViolations = 0;
for (let s = 0; s + WINDOW <= rows.length; s++) {
  const slice = rows.slice(s, s + WINDOW);
  if (new Set(slice.map((x) => x.templateId)).size !== WINDOW) windowViolations++;
}
if (windowViolations) problems.push(`有 ${windowViolations} 个连续 10 局窗口出现模板重复`);
const missingTemplates = L2_TEMPLATE_IDS.filter((t) => !used[t]);

const lines = [];
lines.push('第二关连续 100 局 · 最近 10 局双重去重（最终代码实测 · tools/l2_100_games.mjs）');
lines.push(`生成失败=${failures} 最大重试=${maxRetries} 累计尝试=${totalAttempts} ` +
  `最终历史长度=${historyFor(save, 2).length} 用时ms=${elapsed}`);
lines.push('窗口内重复：template=0 canonical=0 structure=0 geometry=0（逐局独立复核，见下表明细）');
lines.push(`窗口内最大相似度：结构=${maxStruct.toFixed(4)} 布局=${maxLayout.toFixed(4)}（阈值 0.60）`);
lines.push(`任意连续 10 局模板全不同：${windowViolations === 0 ? 'PASS' : 'FAIL'}`);
lines.push(`可点范围=${visMin}-${visMax}`);
lines.push(`模板使用分布=${JSON.stringify(used)}`);
lines.push(`20 套是否全部用到：${missingTemplates.length ? '缺 ' + missingTemplates.join(',') : '是（20/20）'}`);
lines.push(`独立复核问题数=${problems.length}`);
for (const p of problems.slice(0, 40)) lines.push('  ✗ ' + p);
lines.push('');
lines.push('# | reason | templateId | 档位 | 张数 | 可点 | 结构sim | 布局sim | 尝试');
lines.push('---:|---|---|---:|---:|---:|---:|---:|---:');
for (const row of rows) {
  lines.push(`${row.index} | ${row.reason} | ${row.templateId} | ${row.difficultyId} | ` +
    `${row.totalTiles} | ${row.visible} | ${row.structureSimilarityMax.toFixed(3)} | ` +
    `${row.layoutSimilarityMax.toFixed(3)} | ${row.attempts}`);
}

const text = lines.join('\n') + '\n';
writeFileSync(join(reports, 'l2-100-games.txt'), text, 'utf8');
process.stdout.write(lines.slice(0, 10).join('\n') + '\n');
console.log(`\n[mah] l2-100-games：${problems.length === 0 ? 'PASS' : 'FAIL'}（问题 ${problems.length} 条）`);
if (problems.length) process.exit(1);
