/**
 * 存档字段构造 / 读取（纯 JS，零 DOM）。
 *
 * v:3 新增 level1RecentGames / level2RecentGames（每关最近三局元数据）。
 * 兼容策略：v1 / v2 旧档没有这两个字段时按空历史处理，绝不判非法；
 * 损坏的历史条目由 recent_games.sanitizeHistory 逐条丢弃，不加载任何非法布局。
 *
 * 历史只存元数据（8+ 个短字段 × 3 条 × 2 关），不存牌面，存档体积有上界。
 */
import { historyFor, sanitizeHistory } from './recent_games.js';

export function makeSaveData(game) {
  var src = game && game.saveState && typeof game.saveState === 'object' ? game.saveState : {};
  return {
    v: 3,
    // 最后一关通关（graduated）那一刻就写 level=1；best 仍保持 2
    level: game.graduated ? 1 : game.level,
    best: Math.max(1, game.best),
    sound: game.soundOn,
    sfxVol: game.sfxVol,
    p1: game.profile.l1,
    p2: game.profile.l2,
    level1RecentGames: historyFor(src, 1),
    level2RecentGames: historyFor(src, 2),
  };
}

/** 旧存档没有 p1/p2 / 字段越界时一律按缺省档位 0 处理，绝不判非法 */
export function applySaveToGame(game, saved, preserveProfile = false) {
  if (!saved || typeof saved !== 'object') return;
  game.level = Math.max(1, saved.level || 1);
  game.best = Math.max(1, saved.best || 1);
  game.soundOn = saved.sound !== false;
  game.sfxVol = typeof saved.sfxVol === 'number' ? saved.sfxVol : 1;
  if (!preserveProfile) {
    const good = (v) => Number.isInteger(v) && v >= 0 && v <= 63;
    game.profile.l1 = good(saved.p1) ? saved.p1 : 0;
    game.profile.l2 = good(saved.p2) ? saved.p2 : 0;
    // 历史：损坏记录就地清洗后写回内存快照；桌面端异步回读（preserveProfile=true）
    // 不覆盖刚生成好的历史，避免把旧档里的历史盖到新局上。
    var snap = {};
    for (var k in saved) {
      if (Object.prototype.hasOwnProperty.call(saved, k)) snap[k] = saved[k];
    }
    snap.level1RecentGames = sanitizeHistory(saved.level1RecentGames);
    snap.level2RecentGames = sanitizeHistory(saved.level2RecentGames);
    game.saveState = snap;
  }
}
