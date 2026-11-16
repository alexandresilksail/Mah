/**
 * 微信端本地存储服务 — 独立实现，使用 wx.getStorageSync / wx.setStorageSync。
 *
 * 契约（对应指令第十步）：
 *  · 存储结构带版本号（STORAGE_VERSION）与结构标识（SCHEMA_ID）；
 *  · 读取失败安全恢复到缺省值，绝不因坏档白屏；
 *  · 数据升级保留旧记录（合并而非覆盖）；
 *  · 只存游戏必要数据，不收集个人信息；
 *  · 完全离线，不依赖服务器。
 *
 * 最近牌局历史直接复用核心层 sanitizeHistory / appendHistory（两关独立窗口：
 * L1=3、L2=10），因此「最近 10 局第二关布局不重复」在小程序端同样成立。
 */

const STORAGE_KEY = 'mah_miniprogram_save';
const STORAGE_VERSION = 1;
const SCHEMA_ID = 'mah-miniprogram-save';

const Core = require('../core/mah-core.js');

export interface Settings {
  soundOn: boolean;
  musicOn: boolean;   // 首期默认关闭：5 首 BGM 版权未授权，不打包
  vibrateOn: boolean;
}
export interface RecentSession {
  sessionId: string;
  levelId: string;
  templateId: string | null;
  seed: string;
  difficultyId: string;
  totalTiles: number;
  createdAt: number;
  result?: 'win' | 'lose';
  durationMs?: number;
}
export interface SaveBlob {
  v: number;
  schema: string;
  settings: Settings;
  level1RecentGames: any[];
  level2RecentGames: any[];
  recentSessions: RecentSession[];
  wins: number;
  losses: number;
  bestLevel: number;
  profile: { l1: number; l2: number };
  updatedAt: number;
}

function defaults(): SaveBlob {
  return {
    v: STORAGE_VERSION,
    schema: SCHEMA_ID,
    settings: { soundOn: true, musicOn: false, vibrateOn: true },
    level1RecentGames: [],
    level2RecentGames: [],
    recentSessions: [],
    wins: 0,
    losses: 0,
    bestLevel: 1,
    profile: { l1: 0, l2: 0 },
    updatedAt: Date.now(),
  };
}

/** 读取：损坏 / 旧版本都安全恢复；旧字段逐项合并，不丢历史。 */
export function loadSave(): SaveBlob {
  const base = defaults();
  let raw: any = null;
  try {
    raw = wx.getStorageSync(STORAGE_KEY);
  } catch (e) {
    return base;
  }
  if (!raw || typeof raw !== 'object') return base;

  // 结构标识不符：保守处理，仅接纳可识别的字段
  if (raw.schema && raw.schema !== SCHEMA_ID) {
    base.settings = mergeSettings(raw.settings);
    return base;
  }

  base.settings = mergeSettings(raw.settings);
  // 清洗两关历史（复用核心白名单校验，坏记录丢弃，窗口不超）
  base.level1RecentGames = Core.sanitizeHistory(raw.level1RecentGames, 1);
  base.level2RecentGames = Core.sanitizeHistory(raw.level2RecentGames, 2);
  if (Array.isArray(raw.recentSessions)) {
    base.recentSessions = raw.recentSessions.slice(-20).filter((s: any) => s && typeof s === 'object');
  }
  base.wins = numOr(raw.wins, 0);
  base.losses = numOr(raw.losses, 0);
  base.bestLevel = Math.max(1, Math.min(2, numOr(raw.bestLevel, 1)));
  if (raw.profile && typeof raw.profile === 'object') {
    base.profile = { l1: numOr(raw.profile.l1, 0), l2: numOr(raw.profile.l2, 0) };
  }
  // 未来版本中本函数会按 raw.v 做升级迁移；此处 v===1，无需转换。
  base.v = STORAGE_VERSION;
  return base;
}

function mergeSettings(s: any): Settings {
  const d = defaults().settings;
  if (!s || typeof s !== 'object') return d;
  return {
    soundOn: typeof s.soundOn === 'boolean' ? s.soundOn : d.soundOn,
    // 版权未授权，任何旧值都不能把 BGM 打开
    musicOn: false,
    vibrateOn: typeof s.vibrateOn === 'boolean' ? s.vibrateOn : d.vibrateOn,
  };
}

function numOr(v: any, d: number): number {
  return typeof v === 'number' && isFinite(v) ? v : d;
}

/** 写入：整体原子替换。失败静默（存档失败不影响游戏）。 */
export function writeSave(save: SaveBlob): boolean {
  try {
    save.v = STORAGE_VERSION;
    save.schema = SCHEMA_ID;
    save.updatedAt = Date.now();
    wx.setStorageSync(STORAGE_KEY, save);
    return true;
  } catch (e) {
    return false;
  }
}

/** 追加一条最近牌局记录（保留最近 20 条）。 */
export function pushRecentSession(save: SaveBlob, s: RecentSession): SaveBlob {
  save.recentSessions.push(s);
  if (save.recentSessions.length > 20) {
    save.recentSessions = save.recentSessions.slice(-20);
  }
  return save;
}

/** 把核心 createNewGame 产出的 nextSave 里的两关历史同步进存档。 */
export function syncCoreHistory(save: SaveBlob, nextSave: any): SaveBlob {
  if (nextSave && typeof nextSave === 'object') {
    save.level1RecentGames = Core.sanitizeHistory(nextSave.level1RecentGames, 1);
    save.level2RecentGames = Core.sanitizeHistory(nextSave.level2RecentGames, 2);
  }
  return save;
}

export function clearSave(): void {
  try { wx.removeStorageSync(STORAGE_KEY); } catch (e) { /* ignore */ }
}
