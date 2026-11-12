/**
 * 存档字段构造 / 读取（纯 JS，零 DOM）。
 *
 * v:3 —— 新增 level1RecentGames / level2RecentGames（每关最近五局元数据）；
 * v:4 —— 新增 music / musicVol（背景音乐开关与音量）与 musicMap（场景 → 文件名数组）。
 * 兼容策略：旧档缺任一字段时按缺省处理，绝不判非法；
 * 损坏的历史条目由 recent_games.sanitizeHistory 逐条丢弃，
 * 损坏的音乐映射由 music_store.sanitizeMusicMap 逐条丢弃，不加载任何非法数据。
 *
 * 历史只存元数据（12 个短字段 × 5 条 × 2 关），音乐只存文件名（≤24 首 × 6 场景），
 * 存档体积有上界（Rust 侧 64KB 上限 + musicMap 单独 4KB 上限）。
 */
import { historyFor, sanitizeHistory } from './recent_games.js';
import { sanitizeMusicMap } from './music_store.js';

export const SAVE_VERSION = 4;

export function makeSaveData(game) {
  var src = game && game.saveState && typeof game.saveState === 'object' ? game.saveState : {};
  return {
    v: SAVE_VERSION,
    // 最后一关通关（graduated）那一刻就写 level=1；best 仍保持 2
    level: game.graduated ? 1 : game.level,
    best: Math.max(1, game.best),
    sound: game.soundOn,
    sfxVol: game.sfxVol,
    music: game.musicOn !== false,
    musicVol: typeof game.musicVol === 'number' ? game.musicVol : 0.6,
    musicMap: sanitizeMusicMap(src.musicMap),
    p1: game.profile.l1,
    p2: game.profile.l2,
    level1RecentGames: historyFor(src, 1),
    level2RecentGames: historyFor(src, 2),
  };
}

/** 旧存档没有 p1/p2 / 音乐字段 / 字段越界时一律按缺省处理，绝不判非法 */
export function applySaveToGame(game, saved, preserveProfile = false) {
  if (!saved || typeof saved !== 'object') return;
  game.level = Math.max(1, saved.level || 1);
  game.best = Math.max(1, saved.best || 1);
  game.soundOn = saved.sound !== false;
  game.sfxVol = typeof saved.sfxVol === 'number' ? saved.sfxVol : 1;
  game.musicOn = saved.music !== false;
  game.musicVol = typeof saved.musicVol === 'number' ? saved.musicVol : 0.6;
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
    snap.musicMap = sanitizeMusicMap(saved.musicMap);
    game.saveState = snap;
  }
}
