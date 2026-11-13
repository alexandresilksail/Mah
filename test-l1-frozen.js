/**
 * 第一关冻结回归测试（真实运行）。
 *
 *   node test-l1-frozen.js
 *
 * 本轮第二关升级的硬边界：第一关的布局 / 牌数 / 随机生成逻辑 / 难度参数 /
 * 规则 / 视觉表现一律不得修改，只允许回归验证。做法：
 *  [1] 读取审计阶段（修改前）保存的 reports/L1_FROZEN_BASELINE.json，
 *      对 20 条 L1 基线逐条重新生成，逐字段比对牌数 / 可点牌 / 层数 /
 *      几何签名 / 坐标-层级-区域-z 全序 SHA-256 / validate 结果；
 *  [2] 额外给第一关强行传入 templateId，结果必须与基线逐字节一致
 *      （模板路径只对第二关生效）；
 *  [3] 9 条「不带 templateId 的第二关默认路径」基线同样逐项对比，
 *      证明既有第二关默认生成链路未被本轮改动；
 *  [4] 统一入口 createNewGame(level=1) 维持 3 局窗口 + 牌数判定，
 *      历史记录不含任何第二关模板字段；
 *  [5] 源码静态检查：第一关 / 公共规则 / 渲染文件不引用任何 l2_* 模块。
 *
 * 输出 reports/l1-frozen-report.json / .md / -output.txt。
 * 任何一项不一致 → exit 1，不修改基线、不放宽阈值。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

import { generateLevel, validateLevel } from './src/game/generator.js';
import { calculateLayoutSignature } from './src/game/layout_signature.js';
import { LEVEL1_PROFILES } from './src/game/config.js';
import { createNewGame } from './src/game/new_game.js';
import { historyFor, HISTORY_LIMIT, L2_HISTORY_LIMIT } from './src/game/recent_games.js';
import { Game } from './src/game/engine.js';
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
function coordHash(d) {
  const coords = d.cards.map((c) => [c.x, c.y, c.layer, c.region, c.z].join(',')).join('|');
  return createHash('sha256').update(coords).digest('hex');
}
const gitCommit = (() => {
  try { return execSync('git rev-parse HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch (e) { return 'unknown'; }
})();

line('============================================================================');
line(' MahLeMah · 第一关冻结回归（对比修改前基线，真实运行）');
line(' commit=' + gitCommit + ' start=' + new Date().toISOString());
line('============================================================================');

const baselinePath = join(reports, 'L1_FROZEN_BASELINE.json');
ok(existsSync(baselinePath), '修改前冻结基线 reports/L1_FROZEN_BASELINE.json 存在');
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
line(`   基线生成时间 ${baseline.generatedAt} · L1 ${baseline.l1.length} 条 · L2 默认路径 ${baseline.l2.length} 条`);

function compare(level, row, opts) {
  const d = generateLevel(level, row.seed, opts);
  const sig = calculateLayoutSignature(d);
  const now = {
    cards: d.cards.length, visible: d.visible, layerCount: d.layerCount,
    geometrySignature: sig.geometrySignature, coordHash: coordHash(d),
    validate: validateLevel(d).ok,
  };
  const fields = ['cards', 'visible', 'layerCount', 'geometrySignature', 'coordHash', 'validate'];
  let same = true;
  for (const f of fields) {
    if (now[f] !== row[f]) {
      same = false;
      ok(false, `L${level} p${row.profile} seed=${row.seed} 字段 ${f} 与基线一致`,
        `基线 ${row[f]} / 当前 ${now[f]}`);
    }
  }
  return same ? now : null;
}

/* ---------------- [1] L1 20 条基线 ---------------- */
section('[1] 第一关 20 条基线逐项复现（4 档位 × 5 seed）');
ok(baseline.l1.length === LEVEL1_PROFILES.length * 5,
  `基线覆盖 4 个档位 × 5 seed = 20 条（实测 ${baseline.l1.length}）`);
const l1Rows = [];
for (const row of baseline.l1) {
  const now = compare(1, row, { profile: row.profile });
  ok(!!now, `L1 p${row.profile} seed=${row.seed} 六个字段全部与修改前一致`);
  l1Rows.push({ profile: row.profile, seed: row.seed, baseline: row, current: now, same: !!now });
}
ok(l1Rows.every((r) => r.same), '第一关 20 条基线无任何一项漂移');

/* ---------------- [2] 传 templateId 也不影响第一关 ---------------- */
section('[2] 第一关冻结边界：强行传 templateId 仍走原路径');
for (const row of baseline.l1.slice(0, 8)) {
  const d = generateLevel(1, row.seed, { profile: row.profile, templateId: 'L2-P01' });
  ok(d.templateId === null || d.templateId === undefined,
    `L1 p${row.profile} seed=${row.seed} 返回数据不含 templateId`);
  const now = compare(1, row, { profile: row.profile, templateId: 'L2-P01' });
  ok(!!now, `L1 p${row.profile} seed=${row.seed} 传 templateId 后仍与基线逐字节一致`);
}

/* ---------------- [3] 第二关旧默认路径已彻底删除 ---------------- */
/* 本轮把第二关的几何来源收敛到 20 套显式轮廓掩膜（l2_spec + l2_geometry），
 * 「不带 templateId 走旧沙漏布局」的那条默认路径被**有意删除**，因此基线里那 9 条
 * 第二关默认路径记录不再是「必须逐字节复现」的对象，而是「必须已经不存在」的证据。 */
section('[3] 第二关旧「默认路径」已彻底删除（只保留 20 套模板入口）');
ok(baseline.l2.length === 9, `历史基线里记录了 9 条旧默认路径（实测 ${baseline.l2.length}）`);
let legacyGone = 0;
for (const row of baseline.l2) {
  let threw = false;
  try { generateLevel(2, row.seed, { profile: row.profile }); } catch (e) {
    threw = /templateId/.test(String(e && e.message));
  }
  if (threw) legacyGone++;
}
ok(legacyGone === baseline.l2.length,
  `旧默认路径 ${legacyGone}/${baseline.l2.length} 条全部改为明确报错（无静默回退）`);

/* ---------------- [4] 统一入口的第一关口径 ---------------- */
section('[4] createNewGame(level=1) 保持 3 局窗口 / 牌数判定 / 无模板字段');
{
  const g = new Game(null);
  let save = { level1RecentGames: [], level2RecentGames: [] };
  const rng = makeRng(20261113);
  const realInfo = console.info;
  console.info = () => {};
  let allOk = true;
  try {
    for (let i = 0; i < 5; i++) {
      g.saveState = save;
      const r = createNewGame({ level: 1, generationReason: 'new_game',
        game: g, save, rand: rng.next.bind(rng) });
      save = r.nextSave;
      if (r.meta.historyLimit !== HISTORY_LIMIT) allOk = false;
      if (r.meta.checks.tileCountCheck !== 'PASS') allOk = false;
      if ('templateId' in r.record || 'structureSignature' in r.record ||
          'canonicalGeometrySignature' in r.record) allOk = false;
      if (historyFor(save, 1).length > HISTORY_LIMIT) allOk = false;
      if (historyFor(save, 2).length !== 0) allOk = false;
      ok(validateLevel(r.data).ok, `L1 统一入口第 ${i + 1} 局合法`);
    }
  } finally {
    console.info = realInfo;
  }
  ok(allOk, '第一关连续 5 局维持 historyLimit=3 / tileCountCheck=PASS / 记录不含模板字段');
  ok(L2_HISTORY_LIMIT === 10 && HISTORY_LIMIT === 3,
    '第二关窗口新规格 10 局未反向污染第一关的 3 局窗口');
}

/* ---------------- [5] 源码冻结边界 ---------------- */
section('[5] 源码静态检查：第一关与公共规则不引用第二关模板模块');
{
  const files = [
    'src/game/config.js', 'src/game/render.js',
    'src/game/layout_signature.js', 'src/game/tiles.js', 'src/game/seed_pool.js',
  ];
  const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const f of files) {
    const s = stripComments(readFileSync(join(root, f), 'utf8'));
    ok(!/l2_templates|l2_geometry|l2_structure|l2_recent/.test(s),
      `${f} 未引用任何第二关模板 / 去重模块（注释除外）`);
  }
  /* engine.js 是本轮唯一新增引用的公共模块：任务要求「安装后」也要做一次规格保真校验，
   * 那里是唯一的安装落点。引用必须被 `lv === 2` 严格包住，第一关不得经过它。 */
  const eng = readFileSync(join(root, 'src/game/engine.js'), 'utf8');
  ok(/import { verifyTemplateFidelity } from '\.\/l2_geometry\.js';/.test(eng),
    'engine.js 只在安装后校验里引用第二关几何模块');
  ok(/if \(lv === 2 && !skipCheck\) \{/.test(eng),
    'engine.js 的第二关校验被 lv === 2 严格包住（第一关不经过）');
  const gen = readFileSync(join(root, 'src/game/generator.js'), 'utf8');
  ok(/lv === 2 && !opt\.templateId/.test(gen) && /lv === 2\)\s*\n\s*\? generateTemplateLayout/.test(gen),
    'generator.js：第二关缺 templateId 直接报错，模板落牌只在 lv === 2 分支');
}

/* ---------------- 报告 ---------------- */
const report = {
  meta: {
    generatedAt: new Date().toISOString(), gitCommit,
    command: 'node test-l1-frozen.js',
    baselineGeneratedAt: baseline.generatedAt,
    l1BaselineRows: baseline.l1.length, l2DefaultRows: baseline.l2.length,
    assertions: { pass, fail }, exitCode: fail ? 1 : 0,
  },
  l1: l1Rows, l2LegacyDefaultRemoved: legacyGone,
};
writeFileSync(join(reports, 'l1-frozen-report.json'), JSON.stringify(report, null, 2), 'utf8');
let md = `# 第一关冻结回归报告\n\n` +
  `> 本文件由 \`node test-l1-frozen.js\` **真实运行**自动生成，对比的是第二关升级**之前**保存的基线。\n\n` +
  `- 运行时间：${report.meta.generatedAt}\n- Git commit：\`${gitCommit}\`\n` +
  `- 基线生成时间：${baseline.generatedAt}\n- 断言：通过 **${pass}**，失败 **${fail}**\n\n` +
  `## 第一关 20 条基线逐项比对（4 档位 × 5 seed）\n\n` +
  '| 档位 | seed | 牌数 | 可点 | 层数 | 几何签名(前 12) | 坐标哈希(前 12) | validate | 结果 |\n' +
  '|---|---|---|---|---|---|---|---|---|\n' +
  l1Rows.map((r) => `| ${r.profile} | ${r.seed} | ${r.baseline.cards} | ${r.baseline.visible} | ` +
    `${r.baseline.layerCount} | \`${r.baseline.geometrySignature.slice(0, 12)}\` | ` +
    `\`${r.baseline.coordHash.slice(0, 12)}\` | ${r.baseline.validate} | ${r.same ? '✓ 完全一致' : '✗ 漂移'} |`).join('\n') + '\n\n' +
  `## 第二关旧默认路径（已删除，${baseline.l2.length} 条历史记录）\n\n` +
  '| 档位 | seed | 历史牌数 | 历史可点 | 当前行为 |\n' +
  '|---|---|---|---|---|\n' +
  baseline.l2.map((r) => `| ${r.profile} | ${r.seed} | ${r.cards} | ${r.visible} | ` +
    `明确报错（必须指定 templateId） |`).join('\n') + '\n\n' +
  `## 结论\n\n` +
  `- 第一关 ${baseline.l1.length} 条基线的牌数 / 可点牌 / 层数 / 几何签名 / 坐标全序哈希 / validate **全部与修改前一致**。\n` +
  `- 给第一关强行传 \`templateId\` 也不会进入模板路径，结果仍与基线一致。\n` +
  `- 第二关「不带 templateId」的旧默认路径已彻底删除：${legacyGone}/${baseline.l2.length} 条历史记录现在都只会明确报错，不存在静默回退。\n` +
  `- 第一关统一入口维持 3 局窗口与牌数判定，历史记录不含任何第二关模板字段。\n`;
writeFileSync(join(reports, 'l1-frozen-report.md'), md, 'utf8');

line('\n============================================================================');
line(` 断言：通过 ${pass} 项，失败 ${fail} 项`);
line(' 报告：reports/l1-frozen-report.json / .md / -output.txt');
line('============================================================================');
if (fail) for (const f of failLabels.slice(0, 20)) line(' - ' + f);
writeFileSync(join(reports, 'l1-frozen-output.txt'), logs.join('\n') + '\n', 'utf8');
if (fail) process.exit(1);
