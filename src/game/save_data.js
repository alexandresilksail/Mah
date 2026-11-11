/**
 * 存档字段构造 / 读取（纯 JS，零 DOM）—— 第 3、4 节。
 *
 * main.js 与 test.js 共用同一份实现，测试才能真实覆盖「通关写 level=1」
 * 与「旧存档缺 p1/p2 不判非法」，而不是只做源码正则检查。
 */
export function makeSaveData(game) {
  return {
    v: 2,
    // 第 3.1 节：最后一关通关（graduated）那一刻就写 level=1；best 仍保持 2
    level: game.graduated ? 1 : game.level,
    best: Math.max(1, game.best),
    sound: game.soundOn,
    sfxVol: game.sfxVol,
    p1: game.profile.l1,
    p2: game.profile.l2,
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
  }
}
