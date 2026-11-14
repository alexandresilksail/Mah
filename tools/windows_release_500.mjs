/**
 * Windows 桌面发布验收 · 500 局 Release 生成专项（只读源码，不修改游戏逻辑）。
 *
 *   node tools/windows_release_500.mjs
 *
 * 与 tools/stress_release.mjs 的区别：
 *   stress_release 的 realVerify 要求 certificate.ok / replayTypes(typeSeq).ok，
 *   与当前生成器「L2 不做可解性门槛、certificate 恒记峰值」的设计不匹配，
 *   因此其「证书/verify 0%」是工具口径，不代表生成失败。
 *   本脚本用项目既有的、test.js [3] 已验证的口径逐局复核：
 *     · generateLevel 是否抛错（异常退出）
 *     · validateLevel(d).ok（牌数 / 花色 / 几何 / 开局可点 / blocked 一致性）
 *     · 第二关生成后 d.fidelity.ok（checkFidelity 第一段）
 *     · verifyTemplateFidelity(...)（安装后 / 渲染前共用的第二段实现）
 *     · 牌数、坐标、悬空、开局可点范围、重复 ID 等布局异常
 *     · 20 套 templateId 与 10 档 profile 覆盖
 *     · 第一关同 seed 二次生成的确定性（冻结 / 无随机漂移）
 *
 * 输出：reports/windows-release-test-logs/500_game_validation.json + stdout 摘要。
 * 任何一项失败 → 汇总 FAIL 且 exit 1；不吞异常、不伪造样本。
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateLevel, validateLevel } from '../src/game/generator.js';
import { verifyTemplateFidelity } from '../src/game/l2_geometry.js';
import { L2_TEMPLATES } from '../src/game/l2_templates.js';
import { LEVEL2_PROFILES } from '../src/game/config.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outDir = join(root, 'reports', 'windows-release-test-logs');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const TOTAL = 500;
const problems = [];
const tplUse = {};
const profUse = {};
const sampleLayouts = [];
let generated = 0, threw = 0, validateBad = 0, fidelityBad = 0, recheckBad = 0;
let cardCountBad = 0, coordBad = 0, duplicateIdBad = 0, floatingBad = 0, visibleBad = 0;
let l1Games = 0, l2Games = 0, l1DeterminismBad = 0, l2Index = 0;
let visibleMin = 1e9, visibleMax = -1, l2VisibleMin = 1e9, l2VisibleMax = -1;
let cardsMin = 1e9, cardsMax = -1;

const t0 = Date.now();
for (let i = 0; i < TOTAL; i++) {
  const level = (i % 5 === 0) ? 1 : 2;          // 100 局 L1 + 400 局 L2
  // 用独立的 L2 计数器取样，避免 L1 插空造成 20 套 / 10 档覆盖缺角
  const tpl = L2_TEMPLATES[l2Index % L2_TEMPLATES.length];
  const prof = LEVEL2_PROFILES[l2Index % LEVEL2_PROFILES.length].id;
  const seed = (0x51ee0000 + i * 7919) >>> 0;
  const opts = level === 2 ? { profile: prof, templateId: tpl.templateId } : {};
  const tag = `#${i + 1} L${level} seed=${seed}` + (level === 2 ? ` tpl=${tpl.templateId} p${prof}` : '');

  let d;
  try {
    d = generateLevel(level, seed, opts);
  } catch (e) {
    threw++;
    problems.push(`${tag} 生成抛错: ${e && e.message}`);
    continue;
  }
  generated++;
  if (level === 1) l1Games++; else l2Games++;

  // 1) 生成正确性（项目既有 validateLevel 口径）
  let v;
  try { v = validateLevel(d); } catch (e) { v = { ok: false, issues: ['validateLevel 抛错: ' + (e && e.message)] }; }
  if (!v.ok) { validateBad++; problems.push(`${tag} validateLevel FAIL: ${JSON.stringify(v.issues.slice(0, 3))}`); }

  // 2) 牌数 / 坐标 / ID / 悬空 / 开局可点
  const cards = d.cards || [];
  cardsMin = Math.min(cardsMin, cards.length);
  cardsMax = Math.max(cardsMax, cards.length);
  if (!cards.length || cards.length !== cards.filter((c) => c.state === 'board').length) {
    cardCountBad++; problems.push(`${tag} 牌数异常: total=${cards.length}`);
  }
  const ids = new Set();
  for (const c of cards) {
    if (ids.has(c.id)) { duplicateIdBad++; problems.push(`${tag} 重复牌 id=${c.id}`); break; }
    ids.add(c.id);
    if (!Number.isFinite(c.x) || !Number.isFinite(c.y) || c.x < -100 || c.x > 820 || c.y < -100 || c.y > 1380) {
      coordBad++; problems.push(`${tag} 坐标越界 id=${c.id} (${c.x},${c.y})`); break;
    }
  }
  if ((d.floatingCount || 0) !== 0) { floatingBad++; problems.push(`${tag} 悬空牌=${d.floatingCount}`); }
  visibleMin = Math.min(visibleMin, d.visible);
  visibleMax = Math.max(visibleMax, d.visible);
  if (level === 2) {
    l2VisibleMin = Math.min(l2VisibleMin, d.visible);
    l2VisibleMax = Math.max(l2VisibleMax, d.visible);
    if (d.visible < 19 || d.visible > 25) {
      visibleBad++; problems.push(`${tag} 开局可点=${d.visible} 越界(19-25)`);
    }
  }

  if (level === 2) {
    // 3) 三段保真：生成后 + 安装/渲染共用的第二段实现
    if (!d.fidelity || !d.fidelity.ok) { fidelityBad++; problems.push(`${tag} checkFidelity FAIL: ${JSON.stringify(d.fidelity && d.fidelity.issues || []).slice(0, 160)}`); }
    let re;
    try { re = verifyTemplateFidelity(d.cards, d.templateId, d.profile, d.specFillRot); }
    catch (e) { re = { ok: false, issues: ['verifyTemplateFidelity 抛错: ' + (e && e.message)] }; }
    if (!re.ok) { recheckBad++; problems.push(`${tag} verifyTemplateFidelity FAIL: ${JSON.stringify(re.issues || []).slice(0, 160)}`); }
    tplUse[tpl.templateId] = (tplUse[tpl.templateId] || 0) + 1;
    profUse[prof] = (profUse[prof] || 0) + 1;
    l2Index++;
  } else {
    // 4) 第一关冻结：同 seed 二次生成逐牌坐标必须完全一致
    const d2 = generateLevel(level, seed, opts);
    const a = cards.map((c) => `${c.id}:${c.x}:${c.y}:${c.layer}`).join('|');
    const b = (d2.cards || []).map((c) => `${c.id}:${c.x}:${c.y}:${c.layer}`).join('|');
    if (a !== b) { l1DeterminismBad++; problems.push(`${tag} 第一关同 seed 二次生成不一致（冻结漂移）`); }
  }

  if (sampleLayouts.length < 5) sampleLayouts.push({ i: i + 1, level, seed, templateId: level === 2 ? tpl.templateId : null, profileId: level === 2 ? prof : null, cards: cards.length, visible: d.visible, fidelityOk: !!(d.fidelity && d.fidelity.ok) });
}

const tplCovered = Object.keys(tplUse).length;
const profCovered = Object.keys(profUse).length;
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
const totalBad = threw + validateBad + fidelityBad + recheckBad + cardCountBad + coordBad + duplicateIdBad + floatingBad + visibleBad + l1DeterminismBad;
const verdict = (generated === TOTAL && totalBad === 0 && tplCovered === 20 && profCovered === 10) ? 'PASS' : 'FAIL';

const report = {
  generatedAt: new Date().toISOString(),
  tool: 'node tools/windows_release_500.mjs',
  head: '8a0c434ad1e4a4da2b906a5744105aeac883144a',
  total: TOTAL, generated, elapsedSec: +elapsed,
  level1Games: l1Games, level2Games: l2Games,
  failures: { threw, validateBad, fidelityBad, recheckBad, cardCountBad, coordBad, duplicateIdBad, floatingBad, visibleBad, l1DeterminismBad, totalBad },
  coverage: { templates: tplCovered, templateUse: tplUse, profiles: profCovered, profileUse: profUse },
  ranges: { cardsMin, cardsMax, visibleMin, visibleMax, l2VisibleMin, l2VisibleMax },
  sampleLayouts,
  problemSamples: problems.slice(0, 20),
  problemCount: problems.length,
  verdict,
};

writeFileSync(join(outDir, '500_game_validation.json'), JSON.stringify(report, null, 2) + '\n');

console.log('============================================================================');
console.log(` Windows Release · ${TOTAL} 局生成专项  (HEAD ${report.head.slice(0, 7)})`);
console.log('============================================================================');
console.log(` 生成成功 ${generated}/${TOTAL} · 抛错 ${threw} · validateLevel 失败 ${validateBad}`);
console.log(` 三段保真：checkFidelity 失败 ${fidelityBad} · verifyTemplateFidelity 失败 ${recheckBad}`);
console.log(` 布局异常：牌数 ${cardCountBad} · 坐标 ${coordBad} · 重复ID ${duplicateIdBad} · 悬空 ${floatingBad} · 可点越界 ${visibleBad}`);
console.log(` 第一关冻结漂移 ${l1DeterminismBad} · L1 ${l1Games} 局 / L2 ${l2Games} 局`);
console.log(` 覆盖：模板 ${tplCovered}/20 · 档位 ${profCovered}/10 · 牌数 ${cardsMin}-${cardsMax} · 开局可点(全) ${visibleMin}-${visibleMax} / (L2) ${l2VisibleMin}-${l2VisibleMax}`);
console.log(` 异常样本 ${problems.length} 条${problems.length ? '（前 3 条）' : ''}`);
for (const p of problems.slice(0, 3)) console.log('   - ' + p);
console.log(` 耗时 ${elapsed}s · 判定 ${verdict}`);
console.log(` 报告：reports/windows-release-test-logs/500_game_validation.json`);
console.log('============================================================================');
if (verdict !== 'PASS') process.exit(1);
