/**
 * 生命周期测试：首页→游戏→返回→切后台→恢复→重开→失败重开→结算再开。
 * 用纯逻辑模拟页面与 Game 实例的创建/销毁，验证「不复用旧 Seed / 无残留」。
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const C = require(path.join(__dirname, '..', 'core', 'mah-core.js'));

let pass = 0, fail = 0;
function ok(c, n, d) { if (c) pass++; else { fail++; console.log('  ✗', n, d||''); } }

/** 模拟一次「进入游戏页」的完整 session 创建（与 pages/game onLoad.newGame 等价） */
function enterGame(level, reason, save) {
  const g = new C.Game(null);
  g.saveState = {
    level1RecentGames: save.level1RecentGames,
    level2RecentGames: save.level2RecentGames,
  };
  const r = C.createNewGame({ level, generationReason: reason, game: g, save: g.saveState });
  save.level1RecentGames = C.sanitizeHistory(r.nextSave.level1RecentGames, 1);
  save.level2RecentGames = C.sanitizeHistory(r.nextSave.level2RecentGames, 2);
  return { g, r };
}

const save = { level1RecentGames: [], level2RecentGames: [] };

console.log('=== 生命周期测试 ===');

// 1. 首页进入游戏
let { g, r } = enterGame(1, 'title_screen_restart', save);
ok(g.cards.length > 0, '首页进入游戏：牌局已装载');
const seed1 = r.meta.seed;

// 2. 游戏中返回首页 → 再次进入（新 session，seed 必须不同）
({ g, r } = enterGame(1, 'title_screen_restart', save));
ok(r.meta.seed !== seed1, '返回首页再进入：使用新 Seed（不复用旧牌局）');
const seed2 = r.meta.seed;

// 3. 游戏中切后台→恢复：Game 实例保持，tick 推进安全（模拟 3 秒后恢复）
const beforePeek = g.remaining();
g.tick(16); g.tick(16); g.tick(3000); // 模拟大 dt（后台恢复钳制前）
ok(g.remaining() === beforePeek, '切后台恢复：牌局状态未被破坏');

// 4. 游戏中重新开始（new_game）
({ g, r } = enterGame(1, 'new_game', save));
ok(r.meta.seed !== seed2, '重新开始：换用新 Seed');

// 5. 失败后重开（failure_restart）
g.status = 'lose';
({ g, r } = enterGame(1, 'failure_restart', save));
ok(g.status === 'play' && r.meta.generationReason === 'failure_restart', '失败后重开：状态重置且原因正确');

// 6. 结算后再次开始（第二关胜利后再玩）
({ g, r } = enterGame(2, 'new_game', save));
g.status = 'win';
({ g, r } = enterGame(2, 'new_game', save));
ok(r.meta.templateId && save.level2RecentGames.length > 0, '结算后再开：第二关模板与新历史已记录');

// 7. 进程退出后重进（application_restart）：历史仍在，但新 seed
const saveBefore = JSON.parse(JSON.stringify(save));
({ g, r } = enterGame(2, 'application_restart', save));
ok(saveBefore.level2RecentGames.length > 0, '进程退出前历史已持久化');
ok(r.meta.generationReason === 'application_restart', '进程重进：原因正确记录');

console.log('\n============================================================');
console.log(`生命周期断言：通过 ${pass} 项，失败 ${fail} 项`);
console.log('============================================================');
process.exit(fail === 0 ? 0 : 1);
