/**
 * 1000 局随机生成压力测试（真实执行，报告来自实际运行结果）。
 * 覆盖第一关与第二关；第二关走 createNewGame 完整去重与几何校验链路。
 * 运行：node tests/random-1000.mjs
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const C = require(path.join(__dirname, '..', 'core', 'mah-core.js'));

const N = 1000;
const report = {
  generatedAt: new Date().toISOString(),
  totalGames: N,
  // 分组统计
  byLevel: {
    l1: { attempts: 0, success: 0, exception: 0, illegalTiles: 0, unreachable: 0 },
    l2: { attempts: 0, success: 0, exception: 0, illegalTiles: 0, unreachable: 0,
          templateConflict: 0, fidelityFail: 0 },
  },
  templateDistribution: {},      // templateId -> 出现次数
  seedReproduce: { tested: 0, pass: 0, fail: 0 },
  recentDedup: { checked: 0, duplicates: 0 },
  tileCountViolations: 0,
  exceptions: [],
  startedAt: Date.now(),
};

// 初始化模板分布
for (const tid of C.L2_TEMPLATE_IDS) report.templateDistribution[tid] = 0;

console.log(`开始 ${N} 局随机生成测试...`);

const recentWindow = [];
// 第二关历史窗口必须在多局之间【共享】，否则 createNewGame 看不到最近局，去重无从生效。
// 这与真实游戏一致：存档在页面间持久，第二关最近 10 局连续去重。
const sharedSave = { level1RecentGames: [], level2RecentGames: [] };

for (let i = 0; i < N; i++) {
  const level = (i % 2 === 0) ? 1 : 2;   // 交替，各 500 局
  const bucket = level === 1 ? report.byLevel.l1 : report.byLevel.l2;
  bucket.attempts++;

  try {
    if (level === 1) {
      const seed = (Math.random() * 0xffffffff) >>> 0;
      const d = C.generateLevel(1, seed, {});
      bucket.success++;
      // 非法牌：牌型不在注册表
      if (!d.cards.every(c => C.TYPE_BY_ID[c.type])) bucket.illegalTiles++;
      // 不可达牌：每种牌型张数为3的倍数（否则必有无法消除的牌）
      const counts = {};
      for (const c of d.cards) counts[c.type] = (counts[c.type] || 0) + 1;
      if (!Object.values(counts).every(n => n % 3 === 0)) bucket.unreachable++;
      if (d.cards.length % 3 !== 0) report.tileCountViolations++;
    } else {
      const g = new C.Game(null);
      // 共享 save：第二关历史窗口跨局持续，触发最近10局去重
      const r = C.createNewGame({
        level: 2,
        generationReason: 'new_game',
        game: g,
        save: sharedSave,
      });
      // 把新历史写回共享存档（与 pages/game 的 store.syncCoreHistory 等价）
      sharedSave.level2RecentGames = C.sanitizeHistory(r.nextSave.level2RecentGames, 2);
      bucket.success++;
      const tid = r.meta.templateId;
      if (tid && report.templateDistribution[tid] !== undefined) report.templateDistribution[tid]++;
      // 模板 ID 与实际渲染一致
      if (g.templateId !== tid) bucket.templateConflict++;
      // 几何保真
      const f = C.verifyTemplateFidelity(g.cards, tid, g.layoutProfile, g.specFillRot);
      if (!f.ok) bucket.fidelityFail++;
      // 非法牌 / 牌数
      if (!g.cards.every(c => C.TYPE_BY_ID[c.type])) bucket.illegalTiles++;
      if (g.cards.length % 3 !== 0) report.tileCountViolations++;
      // 历史窗口去重校验（本批次内维护一个滑动窗口）
      if (tid && recentWindow.slice(-10).indexOf(tid) >= 0) {
        report.recentDedup.duplicates++;
      }
      recentWindow.push(tid);
      if (recentWindow.length > 10) recentWindow.shift();
      report.recentDedup.checked++;
    }
  } catch (e) {
    bucket.exception++;
    if (report.exceptions.length < 20) {
      report.exceptions.push({ i, level, msg: String(e && e.message) });
    }
  }

  if ((i + 1) % 200 === 0) console.log(`  已完成 ${i + 1}/${N}...`);
}

/* ---- Seed 复现抽样（50 组） ---- */
console.log('Seed 复现性抽样验证...');
for (let k = 0; k < 50; k++) {
  const seed = (Math.random() * 0xffffffff) >>> 0;
  const lvl = k % 2 === 0 ? 1 : 2;
  try {
    let a, b;
    if (lvl === 1) {
      a = C.generateLevel(1, seed, {});
      b = C.generateLevel(1, seed, {});
    } else {
      const tid = C.L2_TEMPLATE_IDS[k % 20];
      a = C.generateLevel(2, seed, { profile: 3, templateId: tid });
      b = C.generateLevel(2, seed, { profile: 3, templateId: tid });
    }
    const sa = a.cards.map(c => c.type + ':' + c.x + ',' + c.y).join('|');
    const sb = b.cards.map(c => c.type + ':' + c.x + ',' + c.y).join('|');
    report.seedReproduce.tested++;
    if (sa === sb) report.seedReproduce.pass++;
    else report.seedReproduce.fail++;
  } catch (e) {
    report.seedReproduce.tested++;
    report.seedReproduce.fail++;
  }
}

report.elapsedMs = Date.now() - report.startedAt;
report.passed = (
  report.byLevel.l1.success === 500 &&
  report.byLevel.l2.success === 500 &&
  report.byLevel.l1.illegalTiles === 0 &&
  report.byLevel.l2.illegalTiles === 0 &&
  report.byLevel.l2.templateConflict === 0 &&
  report.byLevel.l2.fidelityFail === 0 &&
  report.tileCountViolations === 0 &&
  report.recentDedup.duplicates === 0 &&
  report.seedReproduce.fail === 0
);

// 写 JSON 报告
const reportPath = path.join(__dirname, '..', '..', 'reports', 'MINIPROGRAM_RANDOM_1000.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log('\n============================================================');
console.log('1000 局随机生成测试结果：');
console.log('  第一关：成功', report.byLevel.l1.success, '/ 500，异常', report.byLevel.l1.exception,
            '，非法牌', report.byLevel.l1.illegalTiles, '，不可达', report.byLevel.l1.unreachable);
console.log('  第二关：成功', report.byLevel.l2.success, '/ 500，异常', report.byLevel.l2.exception,
            '，模板不一致', report.byLevel.l2.templateConflict, '，保真失败', report.byLevel.l2.fidelityFail,
            '，非法牌', report.byLevel.l2.illegalTiles);
console.log('  模板分布覆盖:', Object.values(report.templateDistribution).filter(n=>n>0).length, '/ 20 套');
console.log('  最近10局布局重复:', report.recentDedup.duplicates);
console.log('  非法牌数总计:', report.byLevel.l1.illegalTiles + report.byLevel.l2.illegalTiles);
console.log('  不可达牌(第一关):', report.byLevel.l1.unreachable);
console.log('  牌数违规:', report.tileCountViolations);
console.log('  Seed 复现: ', report.seedReproduce.pass + '/' + report.seedReproduce.tested);
console.log('  耗时:', (report.elapsedMs/1000).toFixed(1) + 's');
console.log('  总判定:', report.passed ? 'PASS ✅' : 'FAIL ❌');
console.log('  报告:', reportPath);
console.log('============================================================');
process.exit(report.passed ? 0 : 1);
